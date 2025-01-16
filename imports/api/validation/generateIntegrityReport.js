import {ContextRegistry} from '../config/ContextRegistry'
import { Dimension } from '../../../../lib/corelib/contexts/Dimension'
import { Level } from '../../../../lib/corelib/contexts/Level'
import { Field } from '../../../../lib/corelib/contexts/Field'

class Reporter {
  constructor (ctx) {
    this.ctx = ctx
    this.size = ctx.collection().find().count()
    this.uncovered = {
      count: 0,
      docs: []
    }
    this.missing = {
      count: 0,
      docs: []
    }
  }
}

export const generateIntegrityReport = () => {
  const report = {}
  const createCtxReport = (ctx) => {
    const reporter = new Reporter(ctx)
    report[ctx.name] = reporter

  }

  const fieldDocsCursor = Field.collection().find()
}
