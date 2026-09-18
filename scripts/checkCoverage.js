const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const summaryPath = path.join(root, '.coverage', 'summary.txt')
const lcovPath = path.join(root, '.coverage', 'lcov.info')

const thresholds = {
  Statements: 93.19,
  Branches: 88.47,
  Functions: 86.81,
  Lines: 93.43
}

const explicitlyUninstrumented = new Set([
  '.settingsschema.js',
  'imports/startup/server/token.js',
  'queries/itemsList.js'
])

const normalizePath = source => {
  const relative = path.isAbsolute(source) ? path.relative(root, source) : source
  return relative.split(path.sep).join('/')
}

const isTestSource = source =>
  /(^|\/)tests(?:\/|$)/.test(source) || /\.tests?\.js$/.test(source)

const readCoverageFile = file => {
  try {
    return fs.readFileSync(file, 'utf8')
  }
  catch {
    console.error(`Coverage report missing: ${path.relative(root, file)}`)
    process.exit(1)
  }
}

const listJavaScript = directory => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => {
    const source = path.join(directory, entry.name)

    if (entry.isDirectory()) return listJavaScript(source)
    return entry.isFile() && entry.name.endsWith('.js')
      ? [normalizePath(source)]
      : []
  })

const summary = readCoverageFile(summaryPath)
const lcov = readCoverageFile(lcovPath)
const failures = []
const actual = {}

for (const [metric, threshold] of Object.entries(thresholds)) {
  const match = summary.match(new RegExp(`^${metric}\\s*:\\s*([0-9.]+)%`, 'm'))

  if (!match) {
    failures.push(`Could not read ${metric.toLowerCase()} from the coverage summary`)
    continue
  }

  actual[metric] = Number(match[1])
  if (actual[metric] < threshold) {
    failures.push(`${metric} fell from ${threshold}% to ${actual[metric]}%`)
  }
}

const coveredSources = new Set(
  [...lcov.matchAll(/^SF:(.+)$/gm)].map(match => normalizePath(match[1].trim()))
)
const coveredTestSources = [...coveredSources].filter(isTestSource)

if (coveredTestSources.length > 0) {
  failures.push(`Test sources were instrumented:\n${coveredTestSources.join('\n')}`)
}

const rootJavaScript = fs.readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
  .map(entry => entry.name)
const runtimeSources = [
  ...rootJavaScript,
  ...['imports', 'queries', 'server']
    .flatMap(directory => listJavaScript(path.join(root, directory)))
].filter(source => !isTestSource(source))
const unaccountedSources = runtimeSources.filter(source =>
  !coveredSources.has(source) && !explicitlyUninstrumented.has(source)
)

if (unaccountedSources.length > 0) {
  failures.push(`Runtime sources are absent from LCOV and not classified:\n${unaccountedSources.join('\n')}`)
}

if (failures.length > 0) {
  console.error(failures.join('\n\n'))
  process.exit(1)
}

const result = Object.entries(actual)
  .map(([metric, percentage]) => `${metric.toLowerCase()} ${percentage}%`)
  .join(', ')

console.log(`Coverage ratchet passed: ${result}`)
