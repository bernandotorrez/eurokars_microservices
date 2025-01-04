const { AuditTrailLogMasterDataModel, User } = require('../../models');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const { timeHis } = require('../../utils/globalFunction');

class AuditTrailLogMasterDataModelRepository {
  constructor () {
    this._model = AuditTrailLogMasterDataModel;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._includeModels = [
      {
        model: User.scope('withoutTemplateFields'),
        attributes: ['email', 'full_name'],
        as: 'user_created',
        required: true
      }
    ];
  }

  async add ({ oid, module, executionType }) {
    try {
      return await this._model.create({
        user_id: oid,
        module,
        execution_type: executionType,
        executed_at: timeHis()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Audit Trail Log Failed');
    }
  }
}

module.exports = new AuditTrailLogMasterDataModelRepository();
