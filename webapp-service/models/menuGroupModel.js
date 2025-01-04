'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      MenuGroup.hasMany(models.MenuMenuGroup, {
        foreignKey: 'menu_group_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'menu_menu_group',
        scope: { is_active: '1' }
      });
    }
  };
  MenuGroup.init({
    menu_group_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    menu_group_code: {
      allowNull: false,
      type: DataTypes.STRING(10),
      comment: 'Example : ADM01'
    },
    menu_group_name: {
      allowNull: false,
      type: DataTypes.STRING(50),
      comment: 'Example : Admin'
    },
    menu_group_description: {
      allowNull: false,
      type: DataTypes.STRING(200),
      comment: 'Example : Menu Group for Administrator'
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
    modelName: 'MenuGroup',
    tableName: 'ms_menu_group',
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
  return MenuGroup;
};
