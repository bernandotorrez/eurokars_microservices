const { Budget, CompanyDetail, Department, Company, Brand, Branch, CategoryBudget, Configuration, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis, formatToFourDigits } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class BudgetRepository {
  constructor() {
    this._model = Budget;
    this._detailCompanyModel = CompanyDetail;
    this._categoryBudgetModel = CategoryBudget;
    this._configurationModel = Configuration;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'budget_code',
      'company_detail_id',
      'year',
      '$company_detail.department.department_code$',
      '$company_detail.department.department_name$',
      '$company_detail.company.company_code$',
      '$company_detail.company.company_name$',
      '$company_detail.brand.brand_name$',
      '$company_detail.branch.branch_name$',
      'created_date'
    ];
    this._sortingFields = [
      'budget_code',
      'company_detail_id',
      'year',
      'total_budget',
      'total_remaining_submit',
      'total_remaining_actual',
      'count_category_budget',
      '$company_detail.department.department_code$',
      '$company_detail.department.department_name$',
      '$company_detail.company.company_code$',
      '$company_detail.company.company_name$',
      '$company_detail.brand.brand_name$',
      '$company_detail.branch.branch_name$',
    ],
    this._includeModels = [{
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

      if (this._sortingFields.includes(sortField)) {
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
    if (search !== '' && typeof search !== 'undefined' && search !== 'all') {
      conditions.push({
        [Op.or]: this._searchFields.map(field => ({
          [field]: { [Op.substring]: search }
        }))
      });
    }

    // Filter berdasarkan tahun
    if (year !== '' && typeof year !== 'undefined') {
      if (year.length !== 4) throw new BadRequestError('Year must be 4 digits');
      conditions.push({ year });
    }

    // Filter berdasarkan company_id
    if (companyId !== '' && typeof companyId !== 'undefined') {
      conditions.push({ '$company_detail.company_id$': companyId });
    }

    // Filter berdasarkan department_id
    if (departmentId !== '' && typeof departmentId !== 'undefined') {
      conditions.push({ '$company_detail.department_id$': departmentId });
    }

    // Jika ada kondisi, gabungkan dengan Op.and
    if (conditions.length > 0) {
      querySql.where = { [Op.and]: conditions };
    }

    // Penambahan Attribute custom
    querySql.attributes = {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM ms_category_budget
            WHERE
              ms_category_budget.budget_id = ${this._model.name}.budget_id
              AND ms_category_budget.is_active = '1'
          )`),
          'count_category_budget'
        ],
        [
          sequelize.literal(`(
            SELECT SUM(ms_category_budget.total_category_budget)
            FROM ms_category_budget
            WHERE
              ms_category_budget.budget_id = ${this._model.name}.budget_id
              AND ms_category_budget.is_active = '1'
          )`),
          'total_budget'
        ],
        [
          sequelize.literal(`(
            SELECT SUM(ms_category_budget.remaining_submit)
            FROM ms_category_budget
            WHERE
              ms_category_budget.budget_id = ${this._model.name}.budget_id
              AND ms_category_budget.is_active = '1'
          )`),
          'total_remaining_submit'
        ],
        [
          sequelize.literal(`(
            SELECT SUM(ms_category_budget.remaining_actual)
            FROM ms_category_budget
            WHERE
              ms_category_budget.budget_id = ${this._model.name}.budget_id
              AND ms_category_budget.is_active = '1'
          )`),
          'total_remaining_actual'
        ]
      ]
    };

    const totalBudget = await this.getTotalBudgetPerYear(year, companyId, departmentId);

    // Include related models
    querySql.include = this._includeModels;

    // Fetch data
    const data = await this._model.findAndCountAll(querySql);

    return {
      total_budget_per_year: totalBudget.totalBudget,
      total_remaining_submit_per_year: totalBudget.remainingSubmit,
      total_remaining_actual_per_year: totalBudget.remainingActual,
      count: data.count,
      rows: data.rows
    };
  }

  async getTotalBudgetPerYear(year, companyId, departmentId) {
    const queryWhereYear = {};
    if (year !== '' && typeof year !== 'undefined') {
      if (year.length !== 4) throw new BadRequestError('Year must be 4 digits');
      queryWhereYear.where = { year };
    }

    // Filter berdasarkan company_id
    const queryWhereCompany = {};
    if (companyId !== '' && typeof companyId !== 'undefined') {
      queryWhereCompany.where = { company_id: companyId };
    }

    // Filter berdasarkan department_id
    const queryWhereDepartment = {};
    if (departmentId !== '' && typeof departmentId !== 'undefined') {
      queryWhereDepartment.where = { department_id: departmentId };
    }

    const totalBudget = await CategoryBudget.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_category_budget')), 'total_budget_per_year'],
        [sequelize.fn('SUM', sequelize.col('remaining_submit')), 'total_remaining_submit_per_year'],
        [sequelize.fn('SUM', sequelize.col('remaining_actual')), 'total_remaining_actual_per_year'],
      ],
      include: [{
        model: Budget.scope('withoutTemplateFields'),
        as: 'budget',
        required: true,
        ...queryWhereYear,
        attributes: [],
        include: [
          {
            model: CompanyDetail.scope('withoutTemplateFields'),
            as: 'company_detail',
            required: true,
            attributes: [],
            include: [
              {
                model: Company.scope('withoutTemplateFields'),
                as: 'company',
                required: true,
                attributes: [],
                ...queryWhereCompany
              },
              {
                model: Department.scope('withoutTemplateFields'),
                as: 'department',
                required: true,
                attributes: [],
                ...queryWhereDepartment
              }
            ]
          }
        ]
      }],
      where: {
        is_active: '1'
      },
      raw: true
    });

    return {
      totalBudget: totalBudget?.total_budget_per_year || 0,
      remainingSubmit: totalBudget?.total_remaining_submit_per_year || 0,
      remainingActual: totalBudget?.total_remaining_actual_per_year || 0
    }
  }

  async getOne(id = '') {
    if (id === '') throw new BadRequestError('ID Budget Required');

    // Check if Budget have Category Budget
    const count = await sequelize.query(`SELECT COUNT(mb.budget_id) as count_category_budget
      FROM ms_budget mb
      INNER JOIN ms_category_budget mcb ON mcb.budget_id = mb.budget_id
      WHERE mb.unique_id = :id
      AND mcb.is_active = '1';`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const budget = await this._model.findOne(querySql);

    if (!budget) throw new NotFoundError('Budget not found');

    budget.setDataValue('is_update_able', parseInt(count[0]['count_category_budget']) === 0);

    return budget;
  }

  async add(userId, params) {
    const {
      company_detail_id: companyDetailId,
      year,
      screen_id: screenId
    } = params;

    // TODO: nanti tambahkan pengecekan apakah category budget sudah ada di transaksi apa belum
    // Kalau sudah berarti ga bisa di update sama sekali
    // const countTransaction = 0;

    // if (countTransaction > 0) throw new UnprocessableEntityError(`Budget already used in Transaction`);

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_budget(:userId, :companyDetailId, :year, :screenId, :uniqueId);',
        {
          replacements: { userId, companyDetailId, year, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          budget_id,
          budget_code,
          company_detail_id,
          year,
          created_by,
          created_date,
          unique_id
        } = results;

        const data = {
          budget_id,
          budget_code,
          company_detail_id,
          year,
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
        throw new UnprocessableEntityError('Add Budget Failed');
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
      throw new UnprocessableEntityError('Add Budget Failed');
    }
  }

  // Add Bulk Insert
  async addBulk(userId, params) {
    const {
      screen_id: screenId,
      items
    } = params;

    if (!items || items.length === 0 || !Array.isArray(items)) throw new BadRequestError('Invalid Input: Must be a non-empty array');

    let transaction;

    try {
      transaction = await sequelize.transaction();

      const successResults = [];
      const failedResults = [];

      for (const item of items) {
        // Call the stored procedure for each item
        const [result] = await sequelize.query(
          'CALL sp_add_ms_budget(:userId, :companyDetailId, :year, :screenId, :uniqueId);',
          {
            replacements: {
              userId,
              companyDetailId: item.company_detail_id,
              year: item.year,
              screenId,
              uniqueId: uuidv4().toString()
            },
            type: sequelize.QueryTypes.RAW
          }
        );

        // Store the result (assuming the procedure returns the inserted ID)
        if (result) {
          const {
            return_code,
            return_message,
            unique_id
          } = result;

          // Handle error codes
          if (return_code == 200) successResults.push({ company_detail_id: item.company_detail_id, year: item.year, unique_id })
          else failedResults.push({ company_detail_id: item.company_detail_id, year: item.year, unique_id })
        }
      }

      await transaction.commit();

      // Return the data
      return { success: successResults, failed: failedResults };
    } catch (error) {
      // Rollback transaction if exists
      if (transaction) await transaction.rollback();

      // Re-throw custom errors
      if (error instanceof ConflictError ||
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnprocessableEntityError) {
        throw error;
      }
      // For any other errors
      console.error('Error details:', error);
      throw new UnprocessableEntityError('Add Budget Failed');
    }
  }

  async generateBudgetCode(companyDetailId, year) {
    const companyDetailData = await this._detailCompanyModel.findOne({
      where: {
        company_detail_id: companyDetailId
      },
      include: [
        {
          model: Company.scope('withoutTemplateFields'),
          as: 'company',
          required: true
        }
      ]
    });

    if (!companyDetailData) throw new NotFoundError('Company Detail not found');

    const count = await this._model
    .scope('all')
    .count({
      where: {
        company_detail_id: companyDetailId,
        year
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
      ]
    });

    const budgetCode = `B-${companyDetailData.company.company_code}-${year.substring(2, 4)}-${formatToFourDigits(count+1)}`;

    return budgetCode;
  }

  async generateBudgetCodeEdit(companyDetailId, year) {
    const companyDetailData = await this._detailCompanyModel.findOne({
      where: {
        company_detail_id: companyDetailId
      },
      include: [
        {
          model: Company.scope('withoutTemplateFields'),
          as: 'company',
          required: true
        }
      ]
    });

    if (!companyDetailData) throw new NotFoundError('Company Detail not found');

    const count = await this._model
    .scope('all')
    .count({
      where: {
        company_detail_id: companyDetailId,
        year,
        [Op.not]: { company_detail_id: companyDetailId }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
      ]
    });

    const budgetCode = `B-${companyDetailData.company.company_code}-${year.substring(2, 4)}-${formatToFourDigits(count+1)}`;

    return budgetCode;
  }

  async checkDuplicate(companyDetailId, year) {
    const check = await this._model.findAll({
      where: {
        company_detail_id: companyDetailId,
        year
      }
    });

    return check.length;
  }

  async checkDuplicateEdit(id, companyDetailId, year) {
    const check = await this._model.findAll({
      where: {
        company_detail_id: companyDetailId,
        year,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update(id, userId, params) {
    const {
      company_detail_id: companyDetailId,
      total_budget: totalBudget,
      year
    } = params;

    // TODO: nanti tambahkan pengecekan apakah category budget sudah ada di transaksi apa belum
    // Kalau sudah berarti ga bisa di update sama sekali
    const countTransaction = 0;

    if (countTransaction > 0) throw new UnprocessableEntityError(`Budget already used in Transaction`);

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_budget(:userId, :companyDetailId, :year, :uniqueId);',
        {
          replacements: { userId, companyDetailId, year, uniqueId: id },
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
        throw new UnprocessableEntityError('Update Budget Failed');
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
      throw new UnprocessableEntityError('Update Budget Failed');
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
      throw new UnprocessableEntityError('Delete Budget Failed');
    }
  }

  async getDistinctYear() {
    const years = await sequelize.query(`SELECT DISTINCT(year) FROM ${this._model.tableName} WHERE is_active = '1'`, {
      type: sequelize.QueryTypes.SELECT,
    });

    const data = await years.map(year => year.year);

    return data;
  }

  async getInsertYear() {
    const configurationName = 'open_insert_master_budget_for_next_year';

    const dataConfiguration = await this._configurationModel.findOne({
      where: {
        configuration_name: configurationName
      }
    })

    const currentYear = new Date().getFullYear();

    const year = [currentYear]

    if (dataConfiguration) {
      if (dataConfiguration.status == '1') {
        year.push(parseInt(currentYear+1))
      }
    }

    return year;
  }
}

module.exports = new BudgetRepository();
