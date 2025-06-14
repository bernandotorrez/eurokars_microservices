const { Department, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class DepartmentRepository {
  constructor () {
    this._model = Department;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [this._primaryKey, 'department_name', 'department_code', 'created_date'];
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
          querySql.offset = number === 0 ? 0 : parseInt((number * limit) - limit);
        }
      } else {
        querySql.limit = this._limit;
        querySql.offset = this._number;
      }

      // search
      if (search !== '' && typeof search !== 'undefined') {
        querySql.where = {
          [Op.or]: this._searchFields.map(field => ({
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

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Department Required');

    const data = await this._model.findOne({ where: { unique_id: id } });

    if (!data) throw new NotFoundError('Department not found');

    return data;
  }

  async add (userId, params) {
    const { department_name: departmentName, department_code: departmentCode, screen_id: screenId } = params;

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_department(:userId, :departmentName, :departmentCode, :screenId, :uniqueId);',
        {
          replacements: { userId, departmentName, departmentCode, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          department_id,
          department_name,
          department_code,
          created_by,
          created_date,
          uniqueId
        } = results;

        const data = {
          department_id,
          department_name,
          department_code,
          created_by,
          created_date,
          uniqueId
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
        throw new UnprocessableEntityError('Add Department Failed');
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
      throw new UnprocessableEntityError('Add Department Failed');
    }
  }

  async checkDuplicate (departmentName, departmentCode) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { department_name: departmentName },
          { department_code: departmentCode }
        ]
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, departmentName, departmentCode) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { department_name: departmentName },
          { department_code: departmentCode }
        ],
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

    const { department_name: departmentName, department_code: departmentCode } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_department(:userId, :departmentName, :departmentCode, :uniqueId);',
        {
          replacements: { userId, departmentName, departmentCode, uniqueId: id },
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
        throw new UnprocessableEntityError('Update Department Failed');
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
      throw new UnprocessableEntityError('Update Department Failed');
    }
  }

  async delete (id, userId) {
    // Check Data if Exist
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
      throw new UnprocessableEntityError('Delete Department Failed');
    }
  }
}

module.exports = new DepartmentRepository();
