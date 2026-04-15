// import { Unit } from '../imports/contexts/Unit'
// import { getCollection } from '../imports/utils/collection'
// import { toTransform } from './shared/toTransform'
// import { toArray } from '../imports/utils/toArray'
//
// export const itemsListQuery = async ({ query, options, format = 'json', settings = {} }) => {
//   const { skipFailures = false, silent = false, interval = 100 } = settings
//
//   const UnitCollection = getCollection(Unit.name)
//   const transform = toTransform(options)
//   const units = await UnitCollection.find(query, transform).fetchAsync()
//
//   // for each unit we need to extend the task pages to extract the items, which can be multiple per page and unit
//   // we therefore iterare over the units and extract the items, which we will then become a flat list of objects
//   const results = []
//   const errors = []
//
//   for (const unit of units) {
//     const { _id: unitId, shortCode, pages } = unit
//     const [field, unitSetCode, unitCode] = shortCode.split('_')
//
//     for (let i = 0; i < pages.length; i++) {
//       const page = pages[i]
//       const { content } = page
//       const items = []
//
//       for (const entry of content) {
//         const { type, subtype, value } = entry
//         if (type !== 'item') continue
//
//         for (const score of value.scoring) {
//           const item = constructEntry({
//             unitId,
//             unitSetCode,
//             unitCode,
//             field,
//             page: i,
//             type
//           })
//         }
//       }
//     }
//   }
// }
//
// const constructEntry = ({ unitId, unitSetCode, unitCode, field, page, type, subtype, value, score }) => {
//   const { competency, target, requires, correctResponse } = score
//   const competencies = toArray(competency)
//   const correctResponses = toArray(correctResponse)
//   const item = { unitId, field, unitSetCode, unitCode, page, type, subtype, value, competencies, correctResponses }
//
//   if (subtype === 'cloze') {
//     item.value = value.text
//   }
//   if (subtype === 'choice') {
//     item.value = value.choices
//   }
// }
