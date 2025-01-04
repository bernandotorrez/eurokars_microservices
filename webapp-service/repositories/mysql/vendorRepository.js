const { Vendor, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class VendorRepository {
  constructor () {
    this._model = Vendor;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'vendor_id',
      '$vendor.vendor_name$',
      '$vendor.address$',
      '$vendor.phone$',
      '$vendor.telephone$',
      '$vendor.contact_person$',
      '$vendor.email$',
      '$vendor.fax$',
      '$vendor.postal_code$',
      '$vendor.tax_id$',
      '$vendor.identity_number$',
      '$vendor.is_national$',
      '$vendor.is_company$',
      'created_date'
    ];
    this._includeModels = [];
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

    // querySql.distinct = true;
    // querySql.col = this._primaryKey;
    // querySql.include = this._includeModels;

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Vendor Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const vendor = await this._model.findOne(querySql);

    if (!vendor) throw new NotFoundError('Vendor not found');

    return vendor;
  }

  async add (userId, params) {
    const {
      vendor_name: vendorName,
      address,
      phone,
      telephone,
      contact_person: contactPerson,
      email,
      fax,
      postal_code: postalCode,
      tax_id: taxId,
      identity_number: identityNumber,
      is_national: isNational,
      is_company: isCompany,
      screen_id: screenId
    } = params;

    const checkDuplicate = await this.checkDuplicate(vendorName);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        vendor_name: vendorName,
        address,
        phone,
        telephone,
        contact_person: contactPerson,
        email,
        fax,
        postal_code: postalCode,
        tax_id: taxId,
        identity_number: identityNumber,
        is_national: isNational,
        is_company: isCompany,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Vendor Failed');
    }
  }

  async checkDuplicate (vendorName) {
    const check = await this._model.findAll({
      where: {
        vendor_name: vendorName
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, vendorName) {
    const check = await this._model.findAll({
      where: {
        vendor_name: vendorName,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (id, userId, params) {
    // Check Data if Exist
    // await this.getOne(id);

    const {
      vendor_name: vendorName,
      address,
      phone,
      telephone,
      contact_person: contactPerson,
      email,
      fax,
      postal_code: postalCode,
      tax_id: taxId,
      identity_number: identityNumber,
      is_national: isNational,
      is_company: isCompany
    } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, vendorName);

    if (checkDuplicate >= 1) throw new ConflictError('Vendor already Created');

    try {
      return await this._model.update({
        vendor_name: vendorName,
        address,
        phone,
        telephone,
        contact_person: contactPerson,
        email,
        fax,
        postal_code: postalCode,
        tax_id: taxId,
        identity_number: identityNumber,
        is_national: isNational,
        is_company: isCompany,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update Vendor Failed');
    }
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
      throw new UnprocessableEntityError('Delete Vendor Failed');
    }
  }
}

module.exports = new VendorRepository();
