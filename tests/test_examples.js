import child from 'child_process'
import colors from 'colors' // eslint-disable-line
(_ => {
  let examples = {
    'simple with apk': './examples/simple_with_apk.json',
    'simple': './examples/simple.json',
    'simple local': './examples/simple_local.json',
    'simple with inception': './examples/simple_with_inception.json',
    'full': './examples/complex.json'
  }

  let spawnSync = child.spawnSync
  let cli = 'npm'
  let params = ['start', '--', '--test']
  for (let key in examples) {
    let testParams = params.slice(0)
    testParams.push(examples[key])
    console.log('Example test > '.cyan + key.cyan)
    let child = spawnSync(cli, testParams)
    if (child.stderr && child.stderr.toString() !== '') {
      throw new Error(' ' + child.stderr)
    }
    let stdout = child.stdout.toString()
    if (/TEST\s+OK/.test(stdout)) {
      console.log(stdout.replace('TEST OK\n', '') + 'TEST OK'.green + '\n')
      continue
    }
    console.log(stdout.red)
    process.exit(1)
  }
})()
