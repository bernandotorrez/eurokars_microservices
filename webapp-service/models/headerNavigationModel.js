'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HeaderNavigation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here

      HeaderNavigation.belongsTo(models.HeaderNavigation, {
        foreignKey: 'parent_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'parent',
        scope: { is_active: '1' }
      });
    }
  };
  HeaderNavigation.init({
    header_navigation_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    parent_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    header_navigation_name: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    sort_number: {
      allowNull: false,
      type: DataTypes.TINYINT.UNSIGNED
    },
    url: {
      allowNull: true,
      type: DataTypes.STRING(100),
      defaultValue: '#'
    },
    remark: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    level: {
      allowNull: false,
      type: DataTypes.TINYINT.UNSIGNED
    },
    is_other_sidebar: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: '1 = Show in Section Other Sidebar, 0 = None'
    },
    screen_id: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    created_date: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updated_by: {
      allowNull: true,
      type: DataTypes.STRING(50)
    },
    updated_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
    unique_id: {
      allowNull: true,
      type: DataTypes.STRING(50)
    },
    is_active: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    }
  }, {
    sequelize,
    modelName: 'HeaderNavigation',
    tableName: 'ms_header_navigation',
    createdAt: 'created_date',
    underscored: true,
    timestamps: false,
    defaultScope: {
      where: {
        is_active: '1'
      }
    },
    scopes: {
      withoutTemplateFields: {
        attributes: { exclude: ['created_date', 'created_by', 'updated_date', 'updated_by', 'is_active'] }
      },
      active: {
        where: {
          is_active: '1'
        }
      },
      deleted: {
        where: {
          is_active: '0'
        }
      }
    }
  });
  return HeaderNavigation;
};
