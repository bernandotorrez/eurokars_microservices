'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Company.init({
    screen_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(10)
    },
    max_digit: {
      allowNull: false,
      type: DataTypes.INTEGER(10)
    },
    cnt_date: {
      allowNull: true,
      type: DataTypes.STRING(8)
    },
    cnt_date_fmt: {
      allowNull: true,
      type: DataTypes.STRING(8)
    },
    ptn_prefix: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    ptn_suffix: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    curr_value: {
      allowNull: true,
      type: DataTypes.STRING(15)
    },
    max_value: {
      allowNull: true,
      type: DataTypes.STRING(15)
    },
    min_value: {
      allowNull: true,
      type: DataTypes.STRING(15)
    },
    seq_flg: {
      allowNull: false,
      type: DataTypes.INTEGER(10)
    },
    seq_nm: {
      allowNull: true,
      type: DataTypes.STRING(30)
    },
    note: {
      allowNull: true,
      type: DataTypes.STRING(100)
    },
    category_cd: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    ins_ts: {
      allowNull: true,
      type: DataTypes.DATE
    },
    ins_usr_id: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    upd_cntr: {
      allowNull: false,
      type: DataTypes.INTEGER(10)
    },
    upd_ts: {
      allowNull: true,
      type: DataTypes.DATE
    },
    upd_usr_id: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    key_elm: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    c_cnt_ptn: {
      allowNull: false,
      type: DataTypes.STRING(10)
    },
    digit: {
      allowNull: true,
      type: DataTypes.INTEGER(10)
    }
  }, {
    sequelize,
    modelName: 'CounterNumber',
    tableName: 'ms_counter_number',
    createdAt: 'ins_ts',
    underscored: true,
    timestamps: false,
    defaultScope: {},
    scopes: {
      withoutTemplateFields: {
        attributes: { exclude: ['ins_ts', 'ins_usr_id', 'upd_ts', 'upd_usr_id'] }
      }
    }
  });
  return Company;
};
