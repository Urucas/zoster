<img src="https://raw.githubusercontent.com/Urucas/zoster/master/logo.png" />
# Zoster [![Build Status](https://travis-ci.org/Urucas/zoster.svg?branch=master)](https://travis-ci.org/Urucas/zoster)

Zoster is a simple way to automate deep linking url testing on Android, by simply setting a few capabilities and maybe writting some code. 

**Why?**

Testing that deep linking url works has always the same premise; open a website > click on a link > wait for an application to open > if it opens everything is ok. Zoster use a preseted appium test to automate this premise and test this for you.

**How?**

Let's use an example. Following [Android Developer Guide](https://developer.android.com/guide/components/intents-common.html#Browser) we create an intent url, ```intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end``` 
to use with our example android app.
To use this example with Zoster, we create the following capabilities:
```json
{
  "name": "zoster test",
  "intentURL" : "intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end",
  "pkg" : "com.urucas.zoster_testapp",
  "test_site": "http://labs.urucas.com/zoster"
}
```
Wait, I dont have a site to test... yet. No worries, you can set```"test_site":"local"``` in capabilities and Zoster will create a temporary server with your browsable intent url on an ```<a>``` element to click. 

Next, we run zoster:
```bash
zoster --test ./caps/zoster_testapp.json
```
This simple test will check you have the link on the site provided, click on it and evaluate that your application opens.

**What if dont just want to test my application opens after clicking on my browsable intent, I also want to test my application did some magic stuff ?**

Inception is here. Zoster let you include your own appium test to run after the application opens, this way you can test the full flow of your browsable intent. 
```json
{
  "name": "zoster test with inception",
  "intentURL" : "intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end",
  "pkg" : "com.urucas.zoster_testapp",
  "test_site": "http://labs.urucas.com/zoster",
  "inception": {
    "name" : "check_name",
    "path" : "./inception/test_name.js"
  }
}
```
and the inception test```(./inception/test_name.js)``` will look something like this,
```javascript
// appium code
test_name = function(caps, driver, success, error) {
  var params = caps.params[0];
  var text_should_be = "Hello "+params.value+"!";
  driver.elementById("com.urucas.zoster_testapp:id/textView", function(err, el) {
    if(err) return error(err);
    el.text(function(err, text){
      if(err) return error(err);
      if(text_should_be == text) {
        success();
      }else{
        error(new Error("Test fails"));
      }
    });
  });
}
module.exports["check_name"] = test_name;
```
Now, you have checked that your browsable intent has opened your app and also checked that the android application did some magic stuff.  

# Install
```bash
npm install -g zoster
zoster --test [path_to_capabilities]
```
**or**
```bash
git clone https://github.com/Urucas/zoster.git && cd zoster
npm install
npm start -- --test [path_to_capabilities]
```

# Requirements
* Appium
* ADB
