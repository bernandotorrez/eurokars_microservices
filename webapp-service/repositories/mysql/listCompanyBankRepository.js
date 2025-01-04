const { ListCompanyBank, Company, CompanyBankBeneficiary, Bank, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class ListCompanyBankRepository {
  constructor () {
    this._model = ListCompanyBank;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'company_id',
      'company_id_bank_beneficiary',
      '$company.company$',
      '$company.company_short$',
      '$company.npwp$',
      '$company_bank_beneficiary.beneficiary_name$',
      '$company_bank_beneficiary.account_number$',
      '$company_bank_beneficiary.bank.bank$',
      '$company_bank_beneficiary.bank.local_code$',
      '$company_bank_beneficiary.bank.swift_code$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: Company.scope('withoutTemplateFields'),
        as: 'company',
        required: true
      },
      {
        model: CompanyBankBeneficiary.scope('withoutTemplateFields'),
        as: 'company_bank_beneficiary',
        required: true,
        include: [{
          model: Bank.scope('withoutTemplateFields'),
          as: 'bank',
          required: true
        }]
      }
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
    if (id === '') throw new BadRequestError('ID List Company Bank Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const listCompanyBank = await this._model.findOne(querySql);

    if (!listCompanyBank) throw new NotFoundError('List Company Bank not found');

    return listCompanyBank;
  }

  async add (userId, params) {
    const {
      company_id: companyId,
      company_id_bank_beneficiary: companyIdBankBeneficiary,
      screen_id: screenId
    } = params;

    const checkDuplicate = await this.checkDuplicate(companyId, companyIdBankBeneficiary);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        company_id: companyId,
        company_id_bank_beneficiary: companyIdBankBeneficiary,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add List Company Bank Failed');
    }
  }

  async checkDuplicate (companyId, companyIdBankBeneficiary) {
    const check = await this._model.findAll({
      where: {
        company_id: companyId,
        company_id_bank_beneficiary: companyIdBankBeneficiary
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, companyId, companyIdBankBeneficiary) {
    const check = await this._model.findAll({
      where: {
        company_id: companyId,
        company_id_bank_beneficiary: companyIdBankBeneficiary,
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

    const { company_id: companyId, company_id_bank_beneficiary: companyIdBankBeneficiary } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, companyId, companyIdBankBeneficiary);

    if (checkDuplicate >= 1) throw new ConflictError('List Company Bank already Created');

    try {
      return await this._model.update({
        company_id: companyId,
        company_id_bank_beneficiary: companyIdBankBeneficiary,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update List Company Bank Failed');
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
      throw new UnprocessableEntityError('Delete List Company Bank Failed');
    }
  }
}

module.exports = new ListCompanyBankRepository();
