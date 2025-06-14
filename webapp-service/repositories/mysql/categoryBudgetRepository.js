const {
  CategoryBudget,
  Budget,
  CompanyDetail,
  Department,
  Company,
  Brand,
  Branch,
  BusinessLine,
  SubBusinessLineOne,
  SubBusinessLineTwo,
  Coa,
  SubCoa,
  sequelize
} = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis, formatToFourDigits } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class CategoryBudgetRepository {
  constructor() {
    this._model = CategoryBudget;
    this._budgetModel = Budget;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'budget_id',
      'sub_coa_id',
      'business_line_id',
      'sub_business_line_1_id',
      'sub_business_line_2_id',
      'category_budget_code',
      'category_budget_name',
      'total_category_budget',
      'total_opening_category_budget',
      'remaining_submit',
      'remaining_actual',
      '$budget.budget_code$',
      '$budget.company_detail_id$',
      '$budget.total_budget$',
      '$budget.year$',
      '$budget.detail_company.department.department_code$',
      '$budget.detail_company.department.department_name$',
      '$budget.detail_company.company.company_code$',
      '$budget.detail_company.company.company_name$',
      '$budget.detail_company.brand.brand_name$',
      '$budget.detail_company.branch.branch_name$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: BusinessLine.scope('withoutTemplateFields'),
        as: 'business_line',
        required: true,
      },
      {
        model: SubBusinessLineOne.scope('withoutTemplateFields'),
        as: 'sub_business_line_1',
        required: true,
      },
      {
        model: SubBusinessLineTwo.scope('withoutTemplateFields'),
        as: 'sub_business_line_2',
        required: true,
      },
      {
        model: SubCoa.scope('withoutTemplateFields'),
        as: 'sub_coa',
        required: true,
        include: [
          {
            model: Coa.scope('withoutTemplateFields'),
            as: 'coa',
            required: true
          }
        ]
      },
      {
        model: Budget.scope('withoutTemplateFields'),
        as: 'budget',
        required: true,
        include: [
        {
          model: CompanyDetail.scope('withoutTemplateFields'),
          as: 'company_detail',
          required: true,
          include: [
            {
              model: Company.scope('withoutTemplateFields'),
              as: 'company',
              required: true
            },
            {
              model: Brand.scope('withoutTemplateFields'),
              as: 'brand',
              required: true
            },
            {
              model: Branch.scope('withoutTemplateFields'),
              as: 'branch',
              required: true
            },
            {
              model: Department.scope('withoutTemplateFields'),
              as: 'department',
              required: true
            }
          ]
        }
      ]
    }];
  }

  async getAll({ search, sort, page, year, companyId, departmentId }) {
    if (!year) throw new BadRequestError('Year is required');
    if (year.length != 4) throw new BadRequestError('Year must be 4 digits');

    const querySql = {};

    // Sorting logic
    if (sort && sort.value && sort.sorting) {
      const sortField = sort.value;
      const sortDirection = sort.sorting.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (this._searchFields.includes(sortField)) {
        if (sortField.startsWith('$')) {
          const cleanField = sortField.replace(/\$/g, '').split('.'); // Remove '$' and split by '.'
          querySql.order = [[...cleanField, sortDirection]];
        } else {
          querySql.order = [[sortField, sortDirection]];
        }
      } else {
        querySql.order = [[this._primaryKey, this._sort]];
      }
    } else {
      querySql.order = [[this._primaryKey, this._sort]];
    }

    // Pagination logic
    if (search !== 'all') {
      if (page !== '' && typeof page !== 'undefined') {
        let { limit, number } = page;
        limit = limit ? parseInt(limit) : this._limit;
        number = number ? parseInt(number) : this._number;

        if (limit !== '' && typeof limit !== 'undefined') {
          querySql.limit = limit;
        }

        if (number !== '' && typeof number !== 'undefined') {
          querySql.offset = number === 0 ? 0 : parseInt((number * limit) - limit);
        }
      } else {
        querySql.limit = this._limit;
        querySql.offset = this._number;
      }
    }

    // Gabungan query WHERE menggunakan Op.and
    if (!querySql.where) querySql.where = {}; // Pastikan where tidak undefined
    const conditions = [];

    // Search logic
    if (search !== '' && typeof search !== 'undefined') {
      conditions.push({
        [Op.or]: this._searchFields.map(field => ({
          [field]: { [Op.substring]: search }
        }))
      });
    }

    // Filter berdasarkan tahun
    if (year !== '' && typeof year !== 'undefined') {
      if (year.length !== 4) throw new BadRequestError('Year must be 4 digits');
      conditions.push({ '$budget.year$': year });
    }

    // Filter berdasarkan company_id
    if (companyId !== '' && typeof companyId !== 'undefined') {
      conditions.push({ '$budget.company_detail.company_id$': companyId });
    }

    // Filter berdasarkan department_id
    if (departmentId !== '' && typeof departmentId !== 'undefined') {
      conditions.push({ '$budget.company_detail.department_id$': departmentId });
    }

    // Jika ada kondisi, gabungkan dengan Op.and
    if (conditions.length > 0) {
      querySql.where = { [Op.and]: conditions };
    }

    // Include related models
    querySql.include = this._includeModels;

    // Fetch data
    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getAllByBudgetId(budgetId = '') {
    if (budgetId === '') throw new BadRequestError('ID Budget Required');

    const querySql = {};

    querySql.where = { budget_id: budgetId };
    querySql.include = this._includeModels;

    const budget = await this._model.findAndCountAll(querySql);

    if (!budget) throw new NotFoundError('Category Budget not found');

    const totalBudget = await this.getTotalBudgetByBudgetId(budgetId);

    return {
      total_budget: totalBudget.totalBudget,
      remaining_submit: totalBudget.remainingSubmit,
      remaining_actual: totalBudget.remainingActual,
      ...budget,
    };
  }

  async getTotalBudgetByBudgetId(budgetId) {
    const totalBudget = await CategoryBudget.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_category_budget')), 'total_budget'],
        [sequelize.fn('SUM', sequelize.col('remaining_submit')), 'remaining_submit'],
        [sequelize.fn('SUM', sequelize.col('remaining_actual')), 'remaining_actual'],
      ],
      where: {
        is_active: '1',
        budget_id: budgetId
      },
      raw: true
    });

    return {
      totalBudget: totalBudget?.total_budget || 0,
      remainingSubmit: totalBudget?.remaining_submit || 0,
      remainingActual: totalBudget?.remaining_actual || 0
    }
  }

  async getOne(id = '') {
    if (id === '') throw new BadRequestError('ID Category Budget Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const budget = await this._model.findOne(querySql);

    if (!budget) throw new NotFoundError('Category Budget not found');

    return budget;
  }

  async add(userId, params) {
    const {
      budget_id: budgetId,
      sub_coa_id: subCoaId,
      business_line_id: businessLineId,
      sub_business_line_1_id: subBusinessLineOneId,
      sub_business_line_2_id: subBusinessLineTwoId,
      category_budget_name: categoryBudgetName,
      total_category_budget: totalCategoryBudget,
      opex_capex: opexCapex,
      screen_id: screenId
    } = params;

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        `CALL sp_add_ms_category_budget(:userId, :budgetId, :subCoaId, :businessLineId, :subBusinessLineOneId, :subBusinessLineTwoId,
          :categoryBudgetName, :totalCategoryBudget, :opexCapex, :screenId, :uniqueId);`,
        {
          replacements: { userId, budgetId, subCoaId, businessLineId, subBusinessLineOneId, subBusinessLineTwoId,
            categoryBudgetName, totalCategoryBudget, opexCapex, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          category_budget_id,
          budget_id, sub_coa_id, business_line_id, sub_business_line_1_id,
          sub_business_line_2_id, category_budget_code, category_budget_name,
          total_category_budget, total_opening_category_budget, remaining_submit, remaining_actual, opex_capex,
          created_by, created_date, unique_id
        } = results;

        const data = {
          category_budget_id,
          budget_id, sub_coa_id, business_line_id, sub_business_line_1_id,
          sub_business_line_2_id, category_budget_code, category_budget_name,
          total_category_budget, total_opening_category_budget, remaining_submit, remaining_actual, opex_capex,
          created_by,
          created_date,
          unique_id
        };

        // Handle error codes
        if (return_code !== 200) {
          if (return_code === 409) {
            throw new ConflictError(return_message);
          } else if (return_code === 404) {
            throw new NotFoundError(return_message);
          } else if (return_code === 400) {
            throw new BadRequestError(return_message);
          } else {
            throw new UnprocessableEntityError(return_message);
          }
        }

        // Return the data
        return data;
      } else {
        throw new UnprocessableEntityError('Add Category Budget Failed');
      }
    } catch (error) {
      // Re-throw custom errors
      if (error instanceof ConflictError ||
          error instanceof BadRequestError ||
          error instanceof NotFoundError ||
          error instanceof UnprocessableEntityError) {
        throw error;
      }
      // For any other errors
      console.error('Error details:', error);
      throw new UnprocessableEntityError('Add Category Budget Failed');
    }
  }

  async generateCategoryBudgetCode(budgetId) {
    const budgetData = await this._budgetModel.findOne({
      where: {
        budget_id: budgetId
      },
      include: [{
        model: CompanyDetail.scope('withoutTemplateFields'),
        as: 'company_detail',
        required: true,
        include: [
          {
            model: Company.scope('withoutTemplateFields'),
            as: 'company',
            required: true
          },
          {
            model: Brand.scope('withoutTemplateFields'),
            as: 'brand',
            required: true
          },
          {
            model: Branch.scope('withoutTemplateFields'),
            as: 'branch',
            required: true
          },
          {
            model: Department.scope('withoutTemplateFields'),
            as: 'department',
            required: true
          }
        ]
      }]
    });

    if (!budgetData) throw new NotFoundError('Category Budget not found');

    const count = await this._model
    .scope('all')
    .count({
      where: {
        budget_id: budgetId
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
      ]
    });

    const budgetCode = `B-${budgetData.company_detail.company.company_code}-${budgetData.company_detail.department.department_code}-${budgetData.year.substring(2, 4)}-${formatToFourDigits(count+1)}`;

    return budgetCode;
  }

  async generateCategoryBudgetCodeEdit(id, budgetId) {
    const budgetData = await this._budgetModel.findOne({
      where: {
        budget_id: budgetId
      },
      include: [{
        model: CompanyDetail.scope('withoutTemplateFields'),
        as: 'company_detail',
        required: true,
        include: [
          {
            model: Company.scope('withoutTemplateFields'),
            as: 'company',
            required: true
          },
          {
            model: Brand.scope('withoutTemplateFields'),
            as: 'brand',
            required: true
          },
          {
            model: Branch.scope('withoutTemplateFields'),
            as: 'branch',
            required: true
          },
          {
            model: Department.scope('withoutTemplateFields'),
            as: 'department',
            required: true
          }
        ]
      }]
    });

    if (!budgetData) throw new NotFoundError('Category Budget not found');

    const count = await this._model
    .scope('all')
    .count({
      where: {
        budget_id: budgetId,
        [Op.not]: { category_budget_id: id }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
      ]
    });

    const budgetCode = `B-${budgetData.company_detail.company.company_code}-${budgetData.company_detail.department.department_code}-${budgetData.year.substring(2, 4)}-${formatToFourDigits(count+1)}`;

    return budgetCode;
  }

  async checkDuplicate({
    budget_id: budgetId,
    sub_coa_id: subCoaId,
    business_line_id: businessLineId,
    sub_business_line_1_id: subBusinessLineOneId,
    sub_business_line_2_id: subBusinessLineTwoId,
    category_budget_name: categoryBudgetName,
  }) {
    const check = await this._model.findAll({
      where: {
        budget_id: budgetId,
        sub_coa_id: subCoaId,
        business_line_id: businessLineId,
        sub_business_line_1_id: subBusinessLineOneId,
        sub_business_line_2_id: subBusinessLineTwoId,
        category_budget_name: categoryBudgetName,
      }
    });

    return check.length;
  }

  async checkDuplicateEdit({
    id,
    budget_id: budgetId,
    sub_coa_id: subCoaId,
    business_line_id: businessLineId,
    sub_business_line_1_id: subBusinessLineOneId,
    sub_business_line_2_id: subBusinessLineTwoId,
    category_budget_name: categoryBudgetName,
  }) {
    const check = await this._model.findAll({
      where: {
        budget_id: budgetId,
        sub_coa_id: subCoaId,
        business_line_id: businessLineId,
        sub_business_line_1_id: subBusinessLineOneId,
        sub_business_line_2_id: subBusinessLineTwoId,
        category_budget_name: categoryBudgetName,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update(id, userId, params) {
    const {
      budget_id: budgetId,
      sub_coa_id: subCoaId,
      business_line_id: businessLineId,
      sub_business_line_1_id: subBusinessLineOneId,
      sub_business_line_2_id: subBusinessLineTwoId,
      category_budget_name: categoryBudgetName,
      total_category_budget: totalCategoryBudget,
      opex_capex: opexCapex,
    } = params;

    // TODO: nanti tambahkan pengecekan apakah category budget sudah ada di transaksi apa belum
    // Kalau sudah berarti ga bisa di update sama sekali
    // const countTransaction = 0;

    // if (countTransaction > 0) throw new UnprocessableEntityError(`Category Budget already used in Transaction`);

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        `CALL sp_update_ms_category_budget(:userId, :budgetId, :subCoaId, :businessLineId, :subBusinessLineOneId, :subBusinessLineTwoId,
          :categoryBudgetName, :totalCategoryBudget, :opexCapex, :uniqueId);`,
        {
          replacements: { userId, budgetId, subCoaId, businessLineId, subBusinessLineOneId, subBusinessLineTwoId,
            categoryBudgetName, totalCategoryBudget, opexCapex, uniqueId: id },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          unique_id
        } = results;

        // Handle error codes
        if (return_code !== 200) {
          if (return_code === 409) {
            throw new ConflictError(return_message);
          } else if (return_code === 404) {
            throw new NotFoundError(return_message);
          } else if (return_code === 400) {
            throw new BadRequestError(return_message);
          } else {
            throw new UnprocessableEntityError(return_message);
          }
        }

        // Return the data
        return unique_id;
      } else {
        throw new UnprocessableEntityError('Update Category Budget Failed');
      }
    } catch (error) {
      // Re-throw custom errors
      if (error instanceof ConflictError ||
          error instanceof BadRequestError ||
          error instanceof NotFoundError ||
          error instanceof UnprocessableEntityError) {
        throw error;
      }
      // For any other errors
      console.error('Error details:', error);
      throw new UnprocessableEntityError('Update Category Budget Failed');
    }
  }

  async delete(id, userId) {
    // await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        is_active: '0',
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Delete Category Budget Failed');
    }
  }
}

module.exports = new CategoryBudgetRepository();
