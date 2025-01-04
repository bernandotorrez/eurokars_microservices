'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      RolePermission.belongsTo(models.MenuGroup, {
        foreignKey: 'menu_group_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'menu_group',
        scope: { is_active: '1' }
      });

      RolePermission.belongsTo(models.HeaderNavigation, {
        foreignKey: 'header_navigation_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'header_navigation',
        scope: { is_active: '1' }
      });

      RolePermission.belongsTo(models.Role, {
        foreignKey: 'role_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'role',
        scope: { is_active: '1' }
      });
    }
  };
  RolePermission.init({
    role_permission_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    menu_group_id: {
      allowNull: false,
      type: DataTypes.STRING(50),
      references: {
        model: 'MenuGroup',
        key: 'menu_group_id'
      }
    },
    header_navigation_id: {
      allowNull: false,
      type: DataTypes.STRING(50),
      references: {
        model: 'HeaderNavigation',
        key: 'header_navigation_id'
      }
    },
    role_id: {
      allowNull: false,
      type: DataTypes.STRING(50),
      references: {
        model: 'Role',
        key: 'role_id'
      }
    },
    can_view: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to VIEW | 1 = Can, 0 = Can\'t'
    },
    can_add: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to ADD | 1 = Can, 0 = Can\'t'
    },
    can_edit: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to EDIT | 1 = Can, 0 = Can\'t'
    },
    can_delete: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to DELETE | 1 = Can, 0 = Can\'t'
    },
    can_send: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to SEND APPROVAL | 1 = Can, 0 = Can\'t'
    },
    can_approve: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to APPROVED | 1 = Can, 0 = Can\'t'
    },
    can_reject: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to REJECT | 1 = Can, 0 = Can\'t'
    },
    can_reject: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to REJECT | 1 = Can, 0 = Can\'t'
    },
    can_report: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to REPORT | 1 = Can, 0 = Can\'t'
    },
    can_cancel: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: 'Is User Able to CANCEL | 1 = Can, 0 = Can\'t'
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
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    }
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'ms_role_permission',
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
  return RolePermission;
};
