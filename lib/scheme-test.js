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
    browser.get(config.url, () => {
      browser.elementByLinkText('Open app', (err, el) => {
        log("Clicking on "+config.intentURL);
        browser.clickElement(el, () => {
          setTimeout( () => {
            log("Checking if ("+config.pkg+") application is running");
            if(adb.isAppRunning(config.pkg)) {
              adb.closeApp(config.pkg);
              config.cb(true);
            }else {
              config.cb(false);
            }
            browser.quit();
          }, 5000);
        });
      });
    });
  });
}

