const {
  VendorCompany,
  Vendor,
  VendorBankBeneficiary,
  Company,
  Bank,
  VendorCompanyDepartment,
  Department,
  sequelize
} = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class VendorCompanyDepartmentRepository {
  constructor () {
    this._model = VendorCompanyDepartment;
    this._vendorModel = VendorCompany;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._vendorPrimaryKey = this._vendorModel.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._vendorSortBy = this._vendorPrimaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'vendor_id',
      'company_id',
      '$vendor.vendor_name$',
      '$vendor.vendor_bank_beneficiary.beneficiary_name$',
      '$vendor.vendor_bank_beneficiary.account_number$',
      '$vendor.vendor_bank_beneficiary.bank.bank_name$',
      '$vendor.vendor_bank_beneficiary.bank.local_code$',
      '$vendor.vendor_bank_beneficiary.bank.swift_code$',
      '$company.company_name$',
      '$company.company_code$',
      'created_date'
    ];
    this._vendorSearchFields = [
      this._vendorPrimaryKey,
      'vendor_id',
      'company_id',
      '$vendor.vendor_name$',
      '$vendor.address$',
      '$vendor.telephone$',
      '$vendor.phone$',
      '$vendor.contact_person$',
      '$vendor.email$',
      '$vendor.tax_id$',
      '$vendor.identity_number$',
      '$company.company_name$',
      '$company.company_code$',
      '$vendor_company_department.department.department_name$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: Vendor.scope('withoutTemplateFields'),
        as: 'vendor',
        required: true,
        include: [{
          model: VendorBankBeneficiary.scope('withoutTemplateFields'),
          as: 'vendor_bank_beneficiary',
          required: true,
          include: [{
            model: Bank.scope('withoutTemplateFields'),
            as: 'bank',
            required: true
          }]
        }]
      },
      {
        model: Company.scope('withoutTemplateFields'),
        as: 'company',
        required: true
      }
    ];
    this._vendorIncludeModels = [
      {
        model: Vendor.scope('withoutTemplateFields'),
        as: 'vendor',
        attributes: ['vendor_id', 'vendor_name', 'address', 'telephone', 'email'],
        required: true
      },
      {
        model: Company.scope('withoutTemplateFields'),
        as: 'company',
        required: true
      },
      {
        model: VendorCompanyDepartment.scope('withoutTemplateFields'),
        as: 'vendor_company_department',
        include: {
          model: Department.scope('withoutTemplateFields'),
          as: 'department'
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

      if (this._vendorSearchFields.includes(sortField)) {
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
          [this._vendorPrimaryKey, this._sort]
        ];
      }
    } else {
      // Default sorting
      querySql.order = [
        [this._vendorPrimaryKey, this._sort]
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
          [Op.or]: this._vendorSearchFields.map((field) => ({
            [field]: {
              [Op.substring]: search
            }
          }))
        };
      }
    }

    querySql.distinct = true;
    querySql.col = this._vendorPrimaryKey;
    querySql.include = this._vendorIncludeModels;
    querySql.subQuery = false;

    const data = await this._vendorModel.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Vendor Company Department Required');

    const querySql = {};

    querySql.where = { [this._vendorPrimaryKey]: id };
    querySql.include = this._vendorIncludeModels;

    const vendorCompanyDepartment = await this._vendorModel.findOne(querySql);

    if (!vendorCompanyDepartment) throw new NotFoundError('Vendor Company Department not found');

    return vendorCompanyDepartment;
  }

  async add (userId, params) {
    const {
      department_id: arraydepartmentId,
      vendor_company_id: vendorCompanyId,
      screen_id: screenId
    } = params;

    const splitdepartmentId = arraydepartmentId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const departmentId of splitdepartmentId) {
      // Call SP
      const [results] = await sequelize.query(
        'CALL sp_add_ms_vendor_company_department(:userId, :vendorCompanyId, :departmentId, :screenId, :uniqueId);',
        {
          replacements: { userId, vendorCompanyId, departmentId, screenId, uniqueId: uuidv4().toString() },
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
            arrayDuplicated.push(departmentId);
          } else if (return_code === 404) {
            arrayFailed.push(departmentId);
          } else if (return_code === 400) {
            arrayFailed.push(departmentId);
          } else {
            arrayFailed.push(departmentId);
          }
        } else {
          // Return the data
          arraySuccess.push(departmentId);
        }
      } else {
        arrayFailed.push(departmentId);
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (departmentId, vendorCompanyId) {
    const check = await this._model.findAll({
      where: {
        vendor_company_id: vendorCompanyId,
        department_id: departmentId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, departmentId, vendorCompanyId) {
    const check = await this._model.findAll({
      where: {
        vendor_company_id: vendorCompanyId,
        department_id: departmentId,
        [this._primaryKey]: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (vendorCompanyId, userId, params) {
    const { department_id: departmentId, screen_id: screenId } = params;
    const { insert, remove } = departmentId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const departmentId of splitInsert) {
        // Call SP
        const [results] = await sequelize.query(
          'CALL sp_add_ms_vendor_company_department(:userId, :vendorCompanyId, :departmentId, :screenId, :uniqueId);',
          {
            replacements: { userId, vendorCompanyId, departmentId, screenId, uniqueId: uuidv4().toString() },
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
              arrayDuplicated.push(departmentId);
            } else if (return_code === 404) {
              arrayFailed.push(departmentId);
            } else if (return_code === 400) {
              arrayFailed.push(departmentId);
            } else {
              arrayFailed.push(departmentId);
            }
          } else {
            // Return the data
            arraySuccess.push(departmentId);
          }

        } else {
          arrayFailed.push(departmentId);
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const departmentId of splitRemove) {
        try {
          const [results] = await sequelize.query(
            'CALL sp_update_ms_vendor_company_department(:userId, :vendorCompanyId, :departmentId);',
            {
              replacements: { userId, vendorCompanyId, departmentId },
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
                arrayDuplicated.push(departmentId);
              } else if (return_code === 404) {
                arrayFailed.push(departmentId);
              } else if (return_code === 400) {
                arrayFailed.push(departmentId);
              } else {
                arrayFailed.push(departmentId);
              }
            } else {
              // Return the data
              arraySuccess.push(departmentId);
            }
          } else {
            arrayFailed.push(departmentId);
          }
        } catch (error) {
          arrayFailed.push(departmentId);
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
      throw new UnprocessableEntityError('Delete Vendor Company Department Failed');
    }
  }
}

module.exports = new VendorCompanyDepartmentRepository();
