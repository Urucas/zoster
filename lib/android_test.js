import wd from 'wd';
import assert from 'assert';

export default function test(config) {
  let browser = wd.remote('localhost', config.port);
  let adb = config.adb;
  let webViewXPath = '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.webkit.WebView[1]/android.view.View[1]';

  let log = (msg) => {
    if(config.logger) config.logger(msg);
  }

  browser.on('status', (info) => {
    if(config.logger && config.verbose) config.logger(info);
  });
  
  browser.on('command', (meth, path, data) => {
    if(config.logger && config.verbose) config.logger([meth, path, data].join(" "));
  });

  let isApplicationRunning = (config) => {
    setTimeout( () => {
      log("Checking if ("+config.pkg+") application is running");
      if(adb.isAppRunning(config.pkg)) {
        if(config.inception) {
          run_inception(config);
        }else{
          adb.closeApp(config.pkg);
          browser.quit();
          config.cb(true);
        }
      }else {
        browser.quit();
        config.cb(false, {error:"Application didnt open"});
      }
    }, 3000);
  }

  let run_inception = (config) => {
    log("Running inception");
    let inception = config.inception.test;
    inception(config, browser,
    // success
    () => {
      adb.closeApp(config.pkg);
      browser.quit();
      config.cb(true);
    },
    // error
    (err) => {
      adb.closeApp(config.pkg);
      browser.quit();
      config.cb(false, {error:err.message});
    });
  }

  let error = (config, err) => {
    browser.quit();
    config.cb(false, {error: err});
  }

  let localTest = (config) => {
    browser.elementByLinkText('Open app', (err, el) => {
      log("Clicking on element");
      intentClick(browser, el);
    });
  }

  let pressAction = (driver, coords) => {
    let action = new wd.TouchAction(driver);
        action.press({x:coords.x,y:coords.y}).wait(10).release()
    return action;
  }

  let intentClick = (driver, el) => {
    let elCoords;
    // get element location
    driver.getLocation(el, (err, coords) => {
      if(err) return error(err);
      elCoords = coords;
      driver.context('NATIVE_APP', (err) => {
        if(err) return error(err);
        driver.elementByXPath(webViewXPath, (err, el) => {
          if(err) return error(err);
          driver.getLocation(el, (err, coords) => {
            if(err) return error(err);
            let action = pressAction(driver, {x: elCoords.x, y: (coords.y + elCoords.y)});
            action.perform( (err) => {
              if(err) return error(err);
              isApplicationRunning(config);
            });
          });
        });
      });
    });
  }

  let remoteTest = (config) => {
    log("Searching for intent url link"); 
    browser.elementsByTagName('a', (err, els) => {
      isIntentLink(els, 
      // success
      (el) => { 
        intentClick(browser, el);
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
    let script = 'var els=document.querySelectorAll(\'[href="{$intentURL}"]\'); for(var i in els){ try{ els[i].setAttribute("onclick","window.open(\'{$intentURL}\')");}catch(e){}}';
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

