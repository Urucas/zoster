import wd from 'wd';
import assert from 'assert';

export default function test(config) {
  let browser = wd.remote('localhost', config.port);
  let adb = config.adb;

  function log(msg) {
    if(config.logger) config.logger(msg);
  }

  browser.on('status', (info) => {
    // if(config.logger) config.logger(info);
  });

  browser.on('command', (meth, path, data) => {
    /*
    if(config.logger) config.logger(
      [meth, path, data].join(" ")
    );
    */
  });

  browser.init({
    browserName: 'Chrome',
    deviceName: 'Android',
//    platformVersion: '5.0',
    platformName: 'Android'
  }, () => {
    log("Opening url: "+config.url);
    browser.get(config.url, () => {
      if(config.local) {
        browser.elementByLinkText('Open app', (err, el) => {
          log("Clicking on element");
          browser.clickElement(el, () => {
            setTimeout( () => {
              log("Checking if ("+config.pkg+") application is running");
              if(adb.isAppRunning(config.pkg)) {
                if(!config.wait4sdkEvent) 
                  adb.closeApp(config.pkg);
                config.cb(true);
              }else {
                config.cb(false);
              }
              browser.quit();
            }, 3000);
          });
        });
      }else{
        log("Searching for intent url link");
        browser.elementsByTagName('a', (err, els) => {
          let len = els.length;
          let i = 0;
          let isIntent = (els, cb, errCb) => {
            if(i >= len) {
              errCb("Intent url link not found");
              return;
            }
            let el = els[i];
            i++;
            el.getAttribute("href", (err, attr) => {
              if(err) return errCb(err);
              if(attr == null) {
                isIntent(els, cb, errCb);
                return;
              }
              if(attr == config.intentURL) {
                cb(el);
                return;
              }else{
                isIntent(els, cb, errCb);
              }
            });
          }
          isIntent(els, (el) => {
            log("Clicking on element");
            let execFixScript = [
              'document.querySelectorAll(\'',
              '[href="' + config.intentURL +'"]',
              '\')[0]',
              '.setAttribute("onclick","window.open(\'',
              config.intentURL,
              '\')")'
            ].join('');
            browser.execute(execFixScript, (err) => {
              browser.clickElement(el, (err) => {
                if(err != null) {
                  config.cb(false);
                  browser.quit();
                  return;
                }
                setTimeout( () => {
                  log("Checking if ("+config.pkg+") application is running");
                  if(adb.isAppRunning(config.pkg)) {
                    adb.closeApp(config.pkg);
                    config.cb(true);
                  }else{
                    config.cb(false);
                  }
                  browser.quit();
                }, 3000);
              });
            })
          }, (err) => {
            config.cb(false);
            browser.quit();
          });
        });
      }
    });
  });
}

