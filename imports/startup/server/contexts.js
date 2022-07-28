import { AlphaLevel } from '../../contexts/AlphaLevel'
import { Assets } from '../../contexts/Assets'
import { Competency } from '../../contexts/Competency'
import { CompetencyCategory } from '../../contexts/CompetencyCategory'
import { Dimension } from '../../contexts/Dimension'
import { Field } from '../../contexts/Field'
import { Level } from '../../contexts/Level'
import { MediaLib } from '../../contexts/MediaLib'
import { TestCycle } from '../../contexts/TestCycle'
import { Thresholds } from '../../contexts/Thresholds'
import { Unit } from '../../contexts/Unit'
import { UnitSet } from '../../contexts/UnitSet'
import { registerContext } from '../../api/context/registerContext'
import { createInitContext } from '../../api/context/createInitContext'
import { initCollection } from '../../api/context/initCollection'
import { initMethods } from '../../api/context/initMethods'
import { initPublications } from '../../api/context/initPublications'
import { initRoutes } from '../../api/context/initRoutes'

const initContext = createInitContext([
  initCollection,
  initMethods,
  initPublications,
  initRoutes,
  registerContext
])

// editable contexts will be decorated,
// punched through the factories
// and then added to the ServiceRegistry
;[
  AlphaLevel,
  Assets,
  Competency,
  CompetencyCategory,
  Dimension,
  Field,
  Level,
  MediaLib,
  TestCycle,
  Thresholds,
  Unit,
  UnitSet
].forEach(context => initContext(context))
