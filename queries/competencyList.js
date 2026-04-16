import {getCollection} from "../imports/utils/collection";
import {Competency} from "../imports/contexts/Competency";
import {toTransform} from "./shared/toTransform";
import {output} from "./shared/output";

export const competencyListQuery = async ({ query = {}, options, type, format, path, settings }) => {
    const CompetencyCollection = getCollection(Competency.name)
    const docs = await CompetencyCollection.find(query, toTransform(options)).fetchAsync()
    return output({
        data: docs,
        format,
        type,
        path,
        title: `competencies_${Date.now()}`
    })
}
