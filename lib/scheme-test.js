import wd from 'wd';
import assert from 'assert';

export default function test(config) {
  let browser = wd.remote('localhost', config.port);
  let adb = config.adb;

  let log = (msg) => {
    if(config.logger) config.logger(msg);
  }

  browser.on('status', (info) => {
    if(config.logger) config.logger(info);
  });
  
  browser.on('command', (meth, path, data) => {
    if(config.logger) config.logger(
      [meth, path, data].join(" ")
    );
  });

  let isApplicationRunning = (config) => {
    setTimeout( () => {
      log("Checking if ("+config.pkg+") application is running");
      if(adb.isAppRunning(config.pkg)) {
        adb.closeApp(config.pkg);
        config.cb(true);
      }else {
        config.cb(false, {error:"Application didnt open"});
      }
      browser.quit();
    }, 3000);
  }

  let error = (config, err) => {
    config.cb(false, {error: err});
    browser.quit();
  }

  let localTest = (config) => {
    browser.elementByLinkText('Open app', (err, el) => {
      log("Clicking on element");
      browser.clickElement(el, (err) => {
        isApplicationRunning(config);
      });
    });
  }

  let remoteTest = (config) => {
    log("Searching for intent url link"); 
    browser.elementsByTagName('a', (err, els) => {
      isIntentLink(els, 
      // success
      (el) => {
        browser.execute(intentFixScript(config.intentURL), (err) => {
          if(err) {
            error(config, err.toString());
            return;
          }
          browser.clickElement(el, (err) => {
            if(err) {
              error(config, err.toString());
              return;
            }
            isApplicationRunning(config);
          });
        });
      }, 
      // error
      (err) => {
        error(config, err.toString());
      });
    });
  }

  let isIntentLink = (els, cb, errCb) => {
    var len = els.length;
    if(len == 0) {
      errCb("Intent url link not found");
      return;
    }
    let el = els.splice(0,1)[0];
    el.getAttribute("href", (err, attr) => {
      if(err) return errCb(err);
      if(attr == null) {
        isIntentLink(els, cb, errCb);
        return;
      }
      if(attr == config.intentURL) {
        cb(el);
        return;
      }else{
        isIntentLink(els, cb, errCb);
      }
    });
  }

  let intentFixScript = (intentURL) => {
    let script = 'document.querySelectorAll(\'[href="{$intentURL}"]\')[0].setAttribute("onclick","window.open(\'{$intentURL}\')")';
    return script.replace(/\{\$intentURL\}/ig, intentURL);
  }

  browser.init(
  {browserName:'Chrome',deviceName:'Android',platformName: 'Android'}, 
  () => {
    log("Opening url: "+config.url);
    browser.get(config.url, () => {
      if(config.local) {
        localTest(config);  
      }else{
        remoteTest(config);
      }
    });
  });
}

