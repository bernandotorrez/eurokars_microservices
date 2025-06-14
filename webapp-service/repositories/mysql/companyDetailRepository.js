const {
    CompanyDetail,
    Company,
    Brand,
    Branch,
    Department,
    Division,
    sequelize
} = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class CompanyDetailRepository {
  constructor () {
    this._model = CompanyDetail;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      '$company.company_name$',
      '$company.company_code$',
      '$brand.brand_name$',
      '$branch.branch_name$',
      '$department.department_name$',
      '$division.division_name$',
      'created_date'
    ];
    this._includeModels = [
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
      },
      {
        model: Division.scope('withoutTemplateFields'),
        as: 'division',
        required: true
      },
    ];
  }

  async getAll ({ search, sort, page }) {
    const querySql = {};

    // Sorting logic
    if (sort && sort.value && sort.sorting) {
      const sortField = sort.value;
      const sortDirection = sort.sorting.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (this._searchFields.includes(sortField)) {
        // Handle sorting with related fields
        if (sortField.startsWith('$')) {
          const cleanField = sortField.replace(/\$/g, '').split('.'); // Remove '$' and split by '.'
          querySql.order = [
            [...cleanField, sortDirection]
          ];
        } else {
          // Handle direct sorting on the main model
          querySql.order = [
            [sortField, sortDirection]
          ];
        }
      } else {
        // Fallback to default sorting
        querySql.order = [
          [this._primaryKey, this._sort]
        ];
      }
    } else {
      // Default sorting
      querySql.order = [
        [this._primaryKey, this._sort]
      ];
    }

    // pagination
    if (search !== 'all') {
      if (page !== '' && typeof page !== 'undefined') {
        let { limit, number } = page;
        limit = limit ? parseInt(limit) : this._limit;
        number = number ? parseInt(number) : this._number;

        if (limit !== '' && typeof limit !== 'undefined') {
          querySql.limit = limit;
        }

        if (number !== '' && typeof number !== 'undefined') {
          querySql.offset = number === 0 ? 0 : parseInt(number * limit - limit);
        }
      } else {
        querySql.limit = this._limit;
        querySql.offset = this._number;
      }

      // search
      if (search !== '' && typeof search !== 'undefined') {
        querySql.where = {
          [Op.or]: this._searchFields.map((field) => ({
            [field]: {
              [Op.substring]: search
            }
          }))
        };
      }
    }

    // const count = await this._model.count({
    //   attributes: [
    //     [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
    //   ]
    // });

    querySql.include = this._includeModels;

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Company Detail Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const companyDetail = await this._model.findOne(querySql);

    if (!companyDetail) throw new NotFoundError('Company Detail not found');

    return companyDetail;
  }

  async add (userId, params) {
    const {
        company_id: companyId,
        brand_id: brandId,
        branch_id: branchId,
        department_id: departmentId,
        division_id: divisionId,
        screen_id: screenId
    } = params;

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_company_detail(:userId, :companyId, :brandId, :branchId, :departmentId, :divisionId, :screenId, :uniqueId);',
        {
          replacements: { userId, companyId, brandId, branchId, departmentId, divisionId, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          company_detail_id,
          company_id,
          brand_id,
          branch_id,
          department_id,
          division_id,
          created_by,
          created_date,
          unique_id
        } = results;

        const data = {
          company_detail_id,
          company_id,
          brand_id,
          branch_id,
          department_id,
          division_id,
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
        throw new UnprocessableEntityError('Add Company Detail Failed');
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
      throw new UnprocessableEntityError('Add Company Detail Failed');
    }
  }

  async checkDuplicate ({ companyId, brandId, branchId, departmentId, divisionId }) {
    const check = await this._model.findAll({
      where: {
        company_id: companyId,
        brand_id: brandId,
        branch_id: branchId,
        department_id: departmentId,
        division_id: divisionId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit ({ id, companyId, brandId, branchId, departmentId, divisionId }) {
    const check = await this._model.findAll({
      where: {
        company_id: companyId,
        brand_id: brandId,
        branch_id: branchId,
        department_id: departmentId,
        division_id: divisionId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (id, userId, params) {
    const {
        company_id: companyId,
        brand_id: brandId,
        branch_id: branchId,
        department_id: departmentId,
        division_id: divisionId,
    } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_company_detail(:userId, :companyId, :brandId, :branchId, :departmentId, :divisionId, :uniqueId);',
        {
          replacements: { userId, companyId, brandId, branchId, departmentId, divisionId, uniqueId: id },
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
        throw new UnprocessableEntityError('Update Company Detail Failed');
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
      throw new UnprocessableEntityError('Update Company Detail Failed');
    }
  }

  async getByCompany(companyId) {
    const brands = await Brand.scope('withoutTemplateFields').findAndCountAll({
      include: [{
        model: this._model, // CompanyDetail
        as: 'company_detail',
        where: {
          company_id: companyId,
          is_active: '1'
        },
        attributes: [], // no need to select anything from CompanyDetail
        required: true
    }],
  });

  return brands;
}

  async getByCompanyAndBrand (companyId, brandId) {
    const branches = await Branch.scope('withoutTemplateFields').findAndCountAll({
        include: [{
          model: this._model, // CompanyDetail
          as: 'company_detail',
          where: {
            company_id: companyId,
            brand_id: brandId,
            is_active: '1'
          },
          attributes: [], // no need to select anything from CompanyDetail
          required: true
      }],
    });

    return branches;
  }

  async getByCompanyAndBrandAndBranch (companyId, brandId, branchId) {
    const department = await Department.scope('withoutTemplateFields').findAndCountAll({
        include: [{
          model: this._model, // CompanyDetail
          as: 'company_detail',
          where: {
            company_id: companyId,
            brand_id: brandId,
            branch_id: branchId,
            is_active: '1'
          },
          attributes: [], // no need to select anything from CompanyDetail
          required: true
      }],
    });

    return department;
  }

  async delete (id, userId) {
    // await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        is_active: '0',
        updated_by: userId,
        updated_date: timeHis()
      },
      {
        where: {
          unique_id: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Delete Company Detail Failed');
    }
  }
}

module.exports = new CompanyDetailRepository();
