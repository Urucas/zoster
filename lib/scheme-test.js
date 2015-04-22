import wd from 'wd';
import assert from 'assert';

export default function test(config) {
  let browser = wd.remote('localhost', config.port);
  
  console.log(config.url);
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
        setTimeout( () => {
          browser.clickElement(el, () => {
            // browser.quit();  
          });
        }, 5000);
        setTimeout( () => {
          browser.clickElement(el, () => {
            // browser.quit();  
          });
        }, 10000);

      });
    });
    
  });
}

