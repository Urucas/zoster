import wd from 'wd';
import assert from 'assert';

export default function test(config) {
  let browser = wd.remote('localhost', config.port);
  let adb = config.adb;

  browser.on('status', (info) => {
    // if(config.logger) config.logger(info);
  });

  browser.on('command', (meth, path, data) => {
    if(config.logger) config.logger(
      [meth, path, data].join(" ")
    );
  });

  browser.init({
    browserName: 'Chrome',
    deviceName: 'Android',
    platformName: 'Android',
    platformVersion: '4.3'
  }, () => {
    browser.get(config.url, () => {
      browser.elementByLinkText('Open app', (err, el) => {
        browser.clickElement(el, () => {
          setTimeout( () => {
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

