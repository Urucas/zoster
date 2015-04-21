import child_process from 'child_process';

export default class ADB {
 
  constructor() {
    this.device = [];
    this.selected_device;
  }

  devices() {
      
    let child = child_process.spawnSync("adb", ["devices"]);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
    }

    let output = child.stdout.toString();
    let match_devices = output.match(/[\w\d]+\s+device\n/ig);
      
    if(!match_devices.length) return this.device;
      
    match_devices = match_devices[0].split(/\n/);
    for(let i in match_devices) {
      if(match_devices[i] == "") continue;
      if(!/device/ig.test(match_devices[i])) continue;
      this.device.push(match_devices[i].replace(/\tdevice/ig, ""));
    }
    
    this.selected_device = this.device[0];
    return this.device;
  }

  selectDevice(device) {
    this.selected_device = device;
  }
  
  isPackageInstalled(_package_) {
    
    let child = child_process.spawnSync("adb", ["-s", this.selected_device, "shell" ,"pm", "list", "packages", "|", "grep", _package_]);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
    }

    let output = child.stdout.toString();
        output = output.replace(/[\n\t\s]*/ig, "");
    
    return output == "package:"+_package_ ? true : false;
  }

};
