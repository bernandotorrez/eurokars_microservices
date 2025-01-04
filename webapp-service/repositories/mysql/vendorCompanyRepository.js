const { VendorCompany, Vendor, VendorBankBeneficiary, Company, Bank, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class VendorCompanyRepository {
  constructor () {
    this._model = VendorCompany;
    this._vendorModel = Vendor;
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
      'vendor_name',
      'address',
      'phone',
      'contact_person',
      'email',
      'tax_id',
      '$vendor_company.company.company_name$',
      '$vendor_company.company.company_code$',
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
        model: VendorCompany.scope('withoutTemplateFields'),
        as: 'vendor_company',
        include: {
          model: Company.scope('withoutTemplateFields'),
          as: 'company',
          required: true
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
    if (id === '') throw new BadRequestError('ID Vendor Required');

    const querySql = {};

    querySql.where = { [this._vendorPrimaryKey]: id };
    querySql.include = this._vendorIncludeModels;

    const vendorCompany = await this._vendorModel.findOne(querySql);

    if (!vendorCompany) throw new NotFoundError('Vendor not found');

    return vendorCompany;
  }

  async getOneVendor (id = '') {
    if (id === '') throw new BadRequestError('Vendor Required');

    const querySql = {};

    querySql.where = { [this._vendorPrimaryKey]: id };
    querySql.include = this._vendorIncludeModels;

    const vendorCompany = await this._vendorModel.findOne(querySql);

    if (!vendorCompany) throw new NotFoundError('Vendor not found');

    return vendorCompany;
  }

  async add (userId, params) {
    const { company_id: arraycompanyId, vendor_id: vendorId, screen_id: screenId } = params;

    const splitcompanyId = arraycompanyId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const companyId of splitcompanyId) {
      const checkDuplicate = await this.checkDuplicate(companyId, vendorId);

      const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

      if (checkDuplicate >= 1) {
        arrayDuplicated.push(companyId);
      } else {
        try {
          await this._model.create({
            [this._primaryKey]: generateId[0][0].generated_id,
            company_id: companyId,
            vendor_id: vendorId,
            created_by: userId,
            created_date: timeHis(),
            unique_id: uuidv4().toString()
          });

          arraySuccess.push(companyId);
        } catch (error) {
          arrayFailed.push(companyId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (companyId, vendorId) {
    const check = await this._model.findAll({
      where: {
        company_id: companyId,
        vendor_id: vendorId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, companyId, vendorId) {
    const check = await this._model.findAll({
      where: {
        company_id: companyId,
        vendor_id: vendorId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (vendorId, userId, params) {
    // Check Data if Exist
    await this.getOneVendor(vendorId);

    const { company_id: companyId, screen_id: screenId } = params;
    const { insert, remove } = companyId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const companyId of splitInsert) {
        const checkDuplicate = await this.checkDuplicate(companyId, vendorId);

        const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

        if (checkDuplicate >= 1) {
          arrayDuplicated.push(companyId);
        } else {
          try {
            await this._model.create({
              [this._primaryKey]: generateId[0][0].generated_id,
              company_id: companyId,
              vendor_id: vendorId,
              created_by: userId,
              created_date: timeHis(),
              unique_id: uuidv4().toString()
            });

            arraySuccess.push(companyId);
          } catch (error) {
            arrayFailed.push(companyId);
          }
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const companyId of splitRemove) {
        try {
          const update = await this._model.update({
            is_active: '0',
            updated_by: userId,
            updated_date: timeHis()
          },
          {
            where: {
              company_id: companyId,
              vendor_id: vendorId,
              is_active: '1'
            }
          });

          if (update[0] === 1) {
            arraySuccess.push(companyId);
          } else {
            arrayFailed.push(companyId);
          }
        } catch (error) {
          arrayFailed.push(companyId);
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
      throw new UnprocessableEntityError('Delete Vendor Company Failed');
    }
  }
}

module.exports = new VendorCompanyRepository();
