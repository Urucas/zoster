<img src="https://raw.githubusercontent.com/Urucas/zoster/master/logo.png" />
# Zoster 
Url deeplinking automate testing for Android

# Install
```bash
git clone https://github.com/Urucas/zoster.git && cd zoster
npm install

// run zoster desktop application
npm start
// run zoster in your browser
npm run server
// run a test directly from cli
npm start -- --test [path_to_capabilities]
```
**or**
```bash
npm install -g zoster

// run zoster desktop application
zoster
// run zoster in your browser
zoster --neutron
// run a test directly from cli
zoster --test [path_to_capabilities]
```


# Requirements
* Appium

**Android**
* ADB

#Usage
```Zoster``` is a simple deeplink automation module. When running ```Zoster```, a desktop application(or local server) will open with a set of fields(host, params,...) where you can define a browsable intent url to be generated and testted by this module.

As an example we'll use a simple Android application that shows a "Hello, {$yourname}", where {$yourname} is passed via the browsable intent. 

Choosing **zoster** as scheme host and following [Android Developer Guide](https://developer.android.com/guide/components/intents-common.html#Browser) our final browsable intent url will be:

**intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end**

Now, we'll fill the fields on the ```Zoster``` app, to create the intent url, like: 
<img src="https://raw.githubusercontent.com/Urucas/zoster/master/screen1.png" />

Click on the AndroidManifest.xml blue button to check the generated intent URL is correct;
<img src="https://raw.githubusercontent.com/Urucas/zoster/master/screen3.png" />

We can test the click on this ```intent browsable link``` locally or in your own server by settting the **URL site test**. When setting ```local``` as the **URL site test** value, a temporary site will be created with a link to the intent URL.

Once all the fields are filled, you can run the test, executing a set of actions:
* Check you have an android connected via USB (There's no ```SIMULATOR``` support. yet)
* Check the application is installed, if you set the .apk field, zoster will install it.
* Check you have ```appium``` running. In case you forgot to run it; ```appium &```
* Run the test; 
  1. Open the URL Site test
  2. Looks for the intent url link
  3. Clicks on that link
  4. Checks if your android application is opened
  

If everythin goes right, the test will pass. Letting you know your intent url in your site and your android application are both well implemented.
  
Check out this video of **Zoster** running on an Nexus 5 using the example;
<a href="http://www.youtube.com/watch?feature=player_embedded&v=jUOdHj5Io_A
" target="_blank"><img src="http://img.youtube.com/vi/jUOdHj5Io_A/0.jpg" 
alt="IMAGE ALT TEXT HERE" width="600" height="480" border="10" /></a>

