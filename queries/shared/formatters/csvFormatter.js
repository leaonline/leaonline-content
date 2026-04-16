export const csvFormatter = ({data, fields}) => {
    const {separator, newline, needsQuotes, empty, addQuotes} = RFC4180
    const header = `${fields.join(separator)}${newline}`
    const body = data
        .map(doc => {
            let row = ''
            for (const field of fields) {
                let value = (doc[field] ?? empty).toString().trim()
                if (needsQuotes(value)) {
                    value = addQuotes(value)
                }
                row += `${value}${separator}`
            }
            return row
        })
        .join(separator)

    return `${header}${body}`
}


/**
 * The default values and helper functions for the RFC4180 standard.
 * @private
 * @type {object}
 */
const RFC4180 = {
    separator: ',',
    newline: '\r\n',
    empty: '',
    isEmpty: (x) => x === RFC4180.empty,
    needsQuotes: (s) => /[;,"\r\n]/.test(s),
    addQuotes: (s) => `"${s.replace(/"/g, '""')}"`,
};