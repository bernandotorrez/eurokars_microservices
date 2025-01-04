'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuditTrailLogMasterDataModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here

      AuditTrailLogMasterDataModel.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user_created',
        scope: { is_active: '1' }
      });
    }
  };
  AuditTrailLogMasterDataModel.init({
    audit_trail_log_master_data_id: {
      type: DataTypes.INTEGER.UNSIGNED, // Unsigned integer type
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    module: {
      allowNull: false,
      type: DataTypes.STRING(150)
    },
    execution_type: {
      allowNull: true,
      type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE')
    },
    executed_at: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'AuditTrailLogMasterDataModel',
    tableName: 'ad_trail_log_master_data',
    createdAt: 'executed_at',
    underscored: true,
    timestamps: false,
    scopes: {
      withoutTemplateFields: {
        attributes: { exclude: ['executed_at'] }
      }
    }
  });
  return AuditTrailLogMasterDataModel;
};
