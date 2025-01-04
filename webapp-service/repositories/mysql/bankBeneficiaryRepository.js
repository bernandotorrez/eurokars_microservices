const { BankBeneficiary, Bank } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class BankBeneficiaryRepository {
  constructor () {
    this._model = BankBeneficiary;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'bank_id',
      'beneficiary_name',
      'account_number',
      '$bank.bank$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: Bank.scope('withoutTemplateFields'),
        as: 'bank',
        required: true
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
    if (id === '') throw new BadRequestError('ID Bank Beneficiary Required');

    const querySql = {};

    querySql.where = { [this._primaryKey]: id };
    querySql.include = this._includeModels;

    const branch = await this._model.findOne(querySql);

    if (!branch) throw new NotFoundError('Bank Beneficiary not found');

    return branch;
  }

  async add (params) {
    const {
      bank_id: idBank,
      beneficiary_name: beneficiaryName,
      account_number: accountNumber
    } = params;

    const checkDuplicate = await this.checkDuplicate(idBank, beneficiaryName);
    const checkDuplicateAccountNumber = await this.checkDuplicateAccountNumber(accountNumber);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');
    if (checkDuplicateAccountNumber >= 1) throw new ConflictError('Account Number Duplicated');

    try {
      return await this._model.create({
        [this._primaryKey]: uuidv4().toString(),
        bank_id: idBank,
        beneficiary_name: beneficiaryName,
        account_number: accountNumber,
        created_date: timeHis()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Bank Beneficiary Failed');
    }
  }

  async checkDuplicate (idBank, beneficiaryName) {
    const check = await this._model.findAll({
      where: {
        bank_id: idBank,
        beneficiary_name: beneficiaryName
      }
    });

    return check.length;
  }

  async checkDuplicateAccountNumber (accountNumber) {
    const checkAccountNumber = await this._model.findAll({
      where: {
        account_number: accountNumber
      }
    });

    return checkAccountNumber.length;
  }

  async checkDuplicateEdit (id, idBank, beneficiaryName) {
    const check = await this._model.findAll({
      where: {
        bank_id: idBank,
        beneficiary_name: beneficiaryName,
        [this._primaryKey]: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async checkDuplicateAccountNumberEdit (id, accountNumber) {
    const checkAccountNumber = await this._model.findAll({
      where: {
        account_number: accountNumber,
        [this._primaryKey]: {
          [Op.ne]: id
        }
      }
    });

    return checkAccountNumber.length;
  }

  async update (id, params) {
    // Check Data if Exist
    await this.getOne(id);

    const {
      bank_id: idBank,
      beneficiary_name: beneficiaryName,
      account_number: accountNumber
    } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, idBank, beneficiaryName);
    const checkDuplicateAccountNumber = await this.checkDuplicateAccountNumberEdit(id, accountNumber);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');
    if (checkDuplicateAccountNumber >= 1) throw new ConflictError('Account Number Duplicated');

    try {
      return await this._model.update(
        {
          bank_id: idBank,
          beneficiary_name: beneficiaryName,
          account_number: accountNumber,
          updated_date: timeHis()
        },
        {
          where: {
            [this._primaryKey]: id
          }
        }
      );
    } catch (error) {
      throw new UnprocessableEntityError('Update Bank Beneficiary Failed');
    }
  }

  async delete (id) {
    // await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update(
        {
          is_active: '0',
          deleted_date: timeHis()
        },
        {
          where: {
            [this._primaryKey]: {
              [Op.in]: arrayId
            }
          }
        }
      );
    } catch (error) {
      throw new UnprocessableEntityError('Delete Bank Beneficiary Failed');
    }
  }
}

module.exports = new BankBeneficiaryRepository();
