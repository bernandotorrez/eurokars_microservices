const {
  User,
  UserStatusApp,
  StatusApp,
  UserDivision,
  Division,
  Department,
  UserLoginHistory,
  UserSession,
  UserCompanyDetail,
  CompanyDetail,
  Company,
  Brand,
  Branch,
  UserMenuGroup,
  MenuGroup,
  MenuMenuGroup,
  HeaderNavigation
} = require('../../models');
const { v4: uuidv4 } = require('uuid');

const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const BadRequestError = require('../../exceptions/BadRequestError');
const NotFoundError = require('../../exceptions/NotFoundError');

const {
  timeHis
} = require('../../utils/globalFunction');

class UserRepository {
  constructor () {
    this._model = User;
    this._modelLoginHistory = UserLoginHistory;
    this._modelUserSession = UserSession;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [this._primaryKey, 'email', 'first_name', 'last_name', 'full_name', 'created_date'];
    this._includeModels = [
      {
        model: UserStatusApp.scope('withoutTemplateFields'),
        as: 'user_status_app',
        required: false,
        include: {
          model: StatusApp.scope('withoutTemplateFields'),
          as: 'status_app',
          required: false
        }
      },
      {
        model: UserDivision.scope('withoutTemplateFields'),
        as: 'user_division',
        required: false,
        include: {
          model: Division.scope('withoutTemplateFields'),
          as: 'division',
          required: false,
          include: {
            model: Department.scope('withoutTemplateFields'),
            as: 'department',
            required: false
          }
        }
      },
      {
        model: UserCompanyDetail.scope('withoutTemplateFields'),
        as: 'user_company_detail',
        required: false,
        include: {
          model: CompanyDetail.scope('withoutTemplateFields'),
          as: 'company_detail',
          required: false,
          include: [
            {
              model: Company.scope('withoutTemplateFields'),
              as: 'company',
              required: false
            },
            {
              model: Brand.scope('withoutTemplateFields'),
              as: 'brand',
              required: false
            },
            {
              model: Branch.scope('withoutTemplateFields'),
              as: 'branch',
              required: false
            },
            {
              model: Department.scope('withoutTemplateFields'),
              as: 'department',
              required: false
            },
            {
              model: Division.scope('withoutTemplateFields'),
              as: 'division',
              required: false
            },
          ]
        }
      },
      {
        model: UserMenuGroup.scope('withoutTemplateFields'),
        as: 'user_menu_group',
        required: false,
        include: {
          model: MenuGroup.scope('withoutTemplateFields'),
          as: 'menu_group',
          required: false,
          include: {
            model: MenuMenuGroup.scope('withoutTemplateFields'),
            as: 'menu_menu_group',
            required: false,
            include: {
              model: HeaderNavigation.scope('withoutTemplateFields'),
              as: 'header_navigation',
              required: false,
            }
          }
        }
      }
    ];
    this._userSessioIncludeModel = [
      {
        model: User.scope('withoutTemplateFields'),
        as: 'user',
        attributes: ['user_id', 'email', 'full_name'],
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
    querySql.distinct = true;
    querySql.col = this._primaryKey;
    querySql.include = this._includeModels;

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async registerSSO ({
    uniqueId,
    mail,
    givenName,
    surname,
    displayName,
    ipAddr,
    logoutUri,
    jobTitle,
    browser,
    os,
    device,
    type,
    token
  }) {
    // Register

    const user = await this._model.findOne({ where: { [this._primaryKey]: uniqueId } });

    if (!user) {
      const insert = await this._model.create({
        [this._primaryKey]: uniqueId,
        email: mail,
        first_name: givenName,
        last_name: surname,
        full_name: displayName,
        created_by: uniqueId,
        created_date: timeHis(),
        logout_uri: logoutUri,
        job_title: jobTitle || '-'
      });

      await this._modelLoginHistory.create({
        user_login_history_id: uuidv4().toString(),
        user_id: uniqueId,
        last_ip_address: ipAddr,
        last_login_at: timeHis()
      });

      await this._modelUserSession.create({
        user_session_id: uuidv4().toString(),
        user_id: uniqueId,
        token,
        device,
        device_browser: browser,
        device_os: os,
        device_type: type
      });

      if (!insert) throw new UnprocessableEntityError('Failed insert data');
    } else {
      await this.getById(uniqueId);

      await this._model.update({
        logout_uri: logoutUri,
        job_title: jobTitle || '-'
      }, {
        where: {
          [this._primaryKey]: uniqueId
        }
      });

      await this._modelLoginHistory.create({
        user_login_history_id: uuidv4().toString(),
        user_id: uniqueId,
        last_ip_address: ipAddr,
        last_login_at: timeHis()
      });

      await this._modelUserSession.create({
        user_session_id: uuidv4().toString(),
        user_id: uniqueId,
        token,
        device,
        device_browser: browser,
        device_os: os,
        device_type: type
      });
    }

    return user;
  }

  async getById (id) {
    if (id === '') throw new BadRequestError('ID User Required');

    const querySql = {};

    querySql.where = {
      [this._primaryKey]: id
    };
    querySql.include = this._includeModels;

    const user = await this._model.findOne(querySql);

    if (!user) throw new NotFoundError('User not found');

    return user;
  }

  async logout (deviceToken) {
    if (deviceToken === '') throw new BadRequestError('Device Token Required');

    return await this._modelUserSession.update({
      is_active: '0',
      logout_date: timeHis()
    }, {
      where: {
        token: deviceToken
      }
    });
  }

  async getDevice (id) {
    if (id === '') throw new BadRequestError('ID User Required');

    const querySql = {};

    querySql.where = { [this._primaryKey]: id };
    querySql.include = this._userSessioIncludeModel;

    const userDevices = await this._modelUserSession.findAndCountAll(querySql);

    if (!userDevices) throw new NotFoundError('User not found');

    return userDevices;
  }

  async getDeviceByToken (token) {
    if (token === '') throw new BadRequestError('Device Token Required');

    const userDevice = await this._modelUserSession.findOne({ where: { token } });

    return userDevice;
  }

  async revokeDevice (deviceToken) {
    if (deviceToken === '') throw new BadRequestError('Device Token Required');

    await this.getDeviceByToken(deviceToken);

    return await this._modelUserSession.update({
      is_active: '0',
      logout_date: timeHis()
    }, {
      where: {
        token: deviceToken
      }
    });
  }
}

module.exports = new UserRepository();
