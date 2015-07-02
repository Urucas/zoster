import child from 'child_process';
import colors from 'colors';
(() => {
  let examples = {
    "simple with apk": "./examples/simple_with_apk.json",
    "simple": "./examples/simple.json",
    "simple local": "./examples/simple_local.json",
    "simple with inception": "./examples/simple_with_inception.json",
    "full": "./examples/complex.json"
  };

  let spawnSync = child.spawnSync;
  let cli   = "npm"
  let params = ["start", "--", "--test"];
  for(let key in examples) {
    let test_params = params.slice(0);
        test_params.push(examples[key]);
        
    console.log("Example test > ".cyan+key.cyan);
    let child = spawnSync(cli, test_params);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
      return;
    }
    let stdout = child.stdout.toString();
    if(/TEST\s+OK/.test(stdout)) {
      console.log(stdout.replace("TEST OK\n", "")+"TEST OK".green+"\n");
      continue;
    }
    console.log(stdout.red);
    process.exit(1);
  }
})();


