const {
  UserCompanyDetail,
  CompanyDetail,
  User,
  Company,
  Brand,
  Branch,
  Department,
  Division,
  sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserCompanyDetailRepository {
  constructor () {
    this._model = UserCompanyDetail;
    this._userModel = User;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._userPrimaryKey = this._userModel.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._userSortBy = this._userPrimaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'company_detail_id',
      'user_id',
      '$company_detail.company_id$',
      '$company_detail.brand_id$',
      '$company_detail.branch_id$',
      '$company_detail.department_id$',
      '$company_detail.division_id$',
      '$company_detail.company.company_name$',
      '$company_detail.company.company_code$',
      '$company_detail.brand.brand_name$',
      '$company_detail.branch.branch_name$',
      '$company_detail.department.department_name$',
      '$company_detail.department.department_code$',
      '$company_detail.division.division_name$',
      '$user.first_name$',
      '$user.last_name$',
      '$user.full_name$',
      'created_date'
    ];
    this._userSearchFields = [
      this._userPrimaryKey,
      'email',
      'first_name',
      'last_name',
      'full_name',
      '$user_company_detail.company_detail.company.company_name$',
      '$user_company_detail.company_detail.company.company_code$',
      '$user_company_detail.company_detail.brand.brand_name$',
      '$user_company_detail.company_detail.branch.branch_name$',
      '$user_company_detail.company_detail.department.department_name$',
      '$user_company_detail.company_detail.department.department_code$',
      '$user_company_detail.company_detail.division.division_name$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: CompanyDetail.scope('withoutTemplateFields'),
        as: 'company_detail',
        required: true
      },
      {
        model: User.scope('withoutTemplateFields'),
        attributes: ['email', 'full_name'],
        as: 'user',
        required: true
      }
    ];
    this._userIncludeModels = [
      {
        model: UserCompanyDetail.scope('withoutTemplateFields'),
        as: 'user_company_detail',
        include: {
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
            },
            {
              model: Division.scope('withoutTemplateFields'),
              as: 'division',
              required: true
            },
          ]
        }
      }
    ];
  }

  async getAll ({ search, sort, page }) {
    const querySql = {};

    // Sorting logic
    if (sort && sort.value && sort.sorting) {
      const sortField = sort.value;
      const sortDirection = sort.sorting.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (this._userSearchFields.includes(sortField)) {
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
          [this._userPrimaryKey, this._sort]
        ];
      }
    } else {
      // Default sorting
      querySql.order = [
        [this._userPrimaryKey, this._sort]
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
          [Op.or]: this._userSearchFields.map((field) => ({
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

    querySql.distinct = true;
    querySql.col = this._userPrimaryKey;
    querySql.include = this._userIncludeModels;
    querySql.subQuery = false;

    const data = await this._userModel.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID User Company Detail Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userCompanyDetail = await this._userModel.findOne(querySql);

    if (!userCompanyDetail) throw new NotFoundError('User Company Detail not found');

    return userCompanyDetail;
  }

  async getOneUser (id = '') {
    if (id === '') throw new BadRequestError('User Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userCompanyDetail = await this._userModel.findOne(querySql);

    if (!userCompanyDetail) throw new NotFoundError('User not found');

    return userCompanyDetail;
  }

  async add (oid, params) {
    const { company_detail_id: arrayCompanyDetailId, user_id: userId, screen_id: screenId } = params;

    const splitcompanyDetailId = arrayCompanyDetailId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const companyDetailId of splitcompanyDetailId) {
      // Call SP
      const [results] = await sequelize.query(
        'CALL sp_add_ms_user_company_detail(:oid, :userId, :companyDetailId, :screenId, :uniqueId);',
        {
          replacements: { oid, userId, companyDetailId, screenId, uniqueId: uuidv4().toString() },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message
        } = results;

        // Handle error codes
        if (return_code !== 200) {
          if (return_code === 409) {
            arrayDuplicated.push(companyDetailId);
          } else if (return_code === 404) {
            arrayFailed.push(companyDetailId);
          } else if (return_code === 400) {
            arrayFailed.push(companyDetailId);
          } else {
            arrayFailed.push(companyDetailId);
          }
        } else {
          // Return the data
          arraySuccess.push(companyDetailId);
        }
      } else {
        arrayFailed.push(companyDetailId);
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (companyDetailId, userId) {
    const check = await this._model.findAll({
      where: {
        company_detail_id: companyDetailId,
        user_id: userId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, companyDetailId, userId) {
    const check = await this._model.findAll({
      where: {
        company_detail_id: companyDetailId,
        user_id: userId,
        [this._primaryKey]: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (userId, oid, params) {
    const { company_detail_id: companyDetailId, screen_id: screenId } = params;
    const { insert, remove } = companyDetailId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const companyDetailId of splitInsert) {
        // Call SP
        const [results] = await sequelize.query(
          'CALL sp_add_ms_user_company_detail(:oid, :userId, :companyDetailId, :screenId, :uniqueId);',
          {
            replacements: { oid, userId, companyDetailId, screenId, uniqueId: uuidv4().toString() },
            type: sequelize.QueryTypes.RAW
          }
        );

        // Check if results exist
        if (results) {
          const {
            return_code,
            return_message
          } = results;

          // Handle error codes
          if (return_code !== 200) {
            if (return_code === 409) {
              arrayDuplicated.push(companyDetailId);
            } else if (return_code === 404) {
              arrayFailed.push(companyDetailId);
            } else if (return_code === 400) {
              arrayFailed.push(companyDetailId);
            } else {
              arrayFailed.push(companyDetailId);
            }
          } else {
            // Return the data
            arraySuccess.push(companyDetailId);
          }
        } else {
          arrayFailed.push(companyDetailId);
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const companyDetailId of splitRemove) {
        try {
          const [results] = await sequelize.query(
            'CALL sp_update_ms_user_company_detail(:oid, :userId, :companyDetailId);',
            {
              replacements: { oid, userId, companyDetailId },
              type: sequelize.QueryTypes.RAW
            }
          );

          // Check if results exist
          if (results) {
            const {
              return_code,
              return_message
            } = results;

            // Handle error codes
            if (return_code !== 200) {
              if (return_code === 409) {
                arrayDuplicated.push(companyDetailId);
              } else if (return_code === 404) {
                arrayFailed.push(companyDetailId);
              } else if (return_code === 400) {
                arrayFailed.push(companyDetailId);
              } else {
                arrayFailed.push(companyDetailId);
              }
            } else {
              // Return the data
              arraySuccess.push(companyDetailId);
            }
          } else {
            arrayFailed.push(companyDetailId);
          }
        } catch (error) {
          arrayFailed.push(companyDetailId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
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
      throw new UnprocessableEntityError('Delete User Company Detail Failed');
    }
  }
}

module.exports = new UserCompanyDetailRepository();
