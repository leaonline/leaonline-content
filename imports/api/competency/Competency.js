import { Competency } from 'meteor/leaonline:interfaces/Competency'
import { defineRemoveMethod, defineUpdateMethod } from '../factories/defineCRUDMethods'
import { defineAllPublication } from '../factories/definePublication'

Competency.methods.update = defineUpdateMethod({ name: Competency.name, schema: Competency.schema })
Competency.methods.remove = defineRemoveMethod({ name: Competency.name })
Competency.publications.all = defineAllPublication({ name: Competency.name })

export { Competency }
