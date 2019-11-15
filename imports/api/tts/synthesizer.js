import path from 'path'
import { spawn } from 'child_process'

export const Synthesizer = {}

const projectDir = process.cwd()
const basePath = '/assets/app/bash'
const scriptPath = 'synthesize.sh'

Synthesizer.run = function ({ text, hash, voice, speed, pitch }, cb) {
  const args = [text, hash]
  if (voice) args.push(voice)
  if (speed) args.push(speed)
  if (pitch) args.push(pitch)

  const script = spawn('bash', [path.join(projectDir, basePath, scriptPath)].concat(args))
  let result, error

  script.stdout.on('data', function (data) {
    const dataStr = data && data.toString()
    result = dataStr && dataStr.trim()
  })

  script.stderr.on('data', function (data) {
    error = new Error(data)
  })

  script.on('close', (code) => {
    cb(error, result)
  })
}
