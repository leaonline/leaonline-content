import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'

UnitSet.routes.all.run = function () {
  const { fields } = this.data()
  // if no fields are given, we assume, that this is a call from
  // the diagnostics app, which is not linked to any fields
  if (!fields || fields.length === 0) {
    return UnitSet.collection().find({
      $or: [
        { field: { $exists: false } }, // field does not exist
        { field: null } // field has been removed
      ]
    }).fetch()
  }

  return UnitSet.collection().find({ field: { $in: fields } }).fetch()
}

export { UnitSet }
