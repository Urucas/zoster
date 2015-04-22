import wd from 'wd';
import assert from 'assert';

export default function test(config) {
  let browser = wd.remote('localhost', config.port);
  let adb = config.adb;

  browser.on('status', (info) => {
    console.log(info);
  });

  browser.on('command', (meth, path, data) => {
    console.log(' > ' + meth, path, data || '');
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
          let _alert_ = driver.switchTo().alert();
          _alert_.accept();
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

