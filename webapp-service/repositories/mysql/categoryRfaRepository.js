const { CategoryRfa, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class CategoryRfaRepository {
  constructor () {
    this._model = CategoryRfa;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
        this._primaryKey,
        'category_rfa_code',
        'category_rfa_name',
        'category_rfa_description',
        'created_date'
    ];
  }

  /**
   * Retrieve all Category RFAs.
   *
   * @param {Object} options - Options.
   * @param {string} [options.search] - Search term.
   * @param {Object} [options.sort] - Sort options.
   * @param {string} options.sort.value - Sort field.
   * @param {string} options.sort.sorting - Sort direction.
   * @param {Object} [options.page] - Pagination options.
   * @param {number} options.page.limit - Page size.
   * @param {number} options.page.number - Page number.
   *
   * @return {Promise<Object>} - Promise with count and rows.
   */
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

  /**
   * Retrieve one Category RFA by ID.
   *
   * @param {string} [id] - ID of Category RFA.
   *
   * @return {Promise<Object>} - Promise with one Category RFA.
   *
   * @throws {BadRequestError} - If id is empty.
   * @throws {NotFoundError} - If Category RFA not found.
   */
  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Category Rfa Required');

    const data = await this._model.findOne({ where: { unique_id: id } });

    if (!data) throw new NotFoundError('Category Rfa not found');

    return data;
  }

  /**
   * Add a new Category RFA to the database.
   *
   * @param {string} userId - ID of user who add the Category RFA.
   * @param {Object} params - Data to be added to the Category RFA.
   * @param {string} params.category_rfa_code - CategoryRfa code of the Category RFA.
   * @param {string} params.category_rfa_name - CategoryRfa name of the Category RFA.
   * @param {string} params.category_rfa_description - Description of the Category RFA.
   * @param {string} params.screen_id - Screen ID of the Category RFA.
   *
   * @return {Promise<Object>} - Promise with the new Category RFA.
   *
   * @throws {ConflictError} - If Category RFA code or Category RFA name is already existed.
   * @throws {UnprocessableEntityError} - If failed to add Category RFA.
   */
  async add (userId, params) {
    const {
      category_rfa_code: categoryRfaCode,
      category_rfa_name: categoryRfaName,
      category_rfa_description: categoryRfaDescription,
      screen_id: screenId
    } = params;

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_category_rfa(:userId, :categoryRfaCode, :categoryRfaName, :categoryRfaDescription, :screenId, :uniqueId);',
        {
          replacements: { userId, categoryRfaCode, categoryRfaName, categoryRfaDescription, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          category_rfa_id,
          category_rfa_name,
          category_rfa_code,
          category_rfa_description,
          created_by,
          created_date,
          unique_id
        } = results;

        const data = {
          category_rfa_id,
          category_rfa_name,
          category_rfa_code,
          category_rfa_description,
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
        throw new UnprocessableEntityError('Add Category RFA Failed');
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
      throw new UnprocessableEntityError('Add Category RFA Failed');
    }
  }

  /**
   * Check if Category RFA code or Category RFA name is already existed in the database.
   *
   * @param {string} categoryRfaCode - CategoryRfa code of the Category RFA.
   * @param {string} categoryRfaName - CategoryRfa name of the Category RFA.
   *
   * @return {Promise<number>} - Promise with the number of existing Category RFA.
   */
  async checkDuplicate (categoryRfaCode, categoryRfaName) {
    const check = await this._model.findAll({
			where: {
				[Op.or]: [
					{ category_rfa_code: categoryRfaCode.toUpperCase() },
					{ category_rfa_name: categoryRfaName },
				],
			}
    });

    return check.length;
  }

  /**
   * Check if Category RFA code or Category RFA name is already existed in the database,
   * excluding the given id.
   *
   * @param {string} id - Unique id of the Category RFA.
   * @param {string} categoryRfaCode - CategoryRfa code of the Category RFA.
   * @param {string} categoryRfaName - CategoryRfa name of the Category RFA.
   *
   * @return {Promise<number>} - Promise with the number of existing Category RFA.
   */
  async checkDuplicateEdit (id, categoryRfaCode, categoryRfaName) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { category_rfa_code: categoryRfaCode.toUpperCase() },
					{ category_rfa_name: categoryRfaName },
        ],
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  /**
   * Update an existing Category RFA in the database.
   *
   * @param {string} id - Unique id of the Category RFA to update.
   * @param {string} userId - ID of the user performing the update.
   * @param {Object} params - Data to update the Category RFA.
   * @param {string} params.category_rfa_code - New Category RFA code of the Category RFA.
   * @param {string} params.category_rfa_name - New Category RFA name of the Category RFA.
   * @param {string} params.category_rfa_description - New description of the Category RFA.
   *
   * @return {Promise<Object>} - Promise with the updated Category RFA.
   *
   * @throws {ConflictError} - If Category RFA code or Category RFA name is already existed.
   * @throws {UnprocessableEntityError} - If failed to update Category RFA.
   */
  async update (id, userId, params) {
    const {
      category_rfa_code: categoryRfaCode,
      category_rfa_name: categoryRfaName,
      category_rfa_description: categoryRfaDescription,
    } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_category_rfa(:userId, :categoryRfaCode, :categoryRfaName, :categoryRfaDescription, :uniqueId);',
        {
          replacements: { userId, categoryRfaCode, categoryRfaName, categoryRfaDescription, uniqueId: id },
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
        throw new UnprocessableEntityError('Update Category RFA Failed');
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
      throw new UnprocessableEntityError('Update Category RFA Failed');
    }
  }

  /**
   * Soft deletes Category RFAs from the database by setting is_active to '0'.
   *
   * @param {string} id - Comma-separated unique ids of the Category RFAs to delete.
   * @param {string} userId - ID of the user performing the deletion.
   *
   * @throws {UnprocessableEntityError} - If failed to delete Category RFAs.
   *
   * @return {Promise<Object>} - Promise with the result of the update operation.
   */
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
      throw new UnprocessableEntityError('Delete Category RFA Failed');
    }
  }
}

module.exports = new CategoryRfaRepository();
