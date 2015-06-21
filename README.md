# Zoster <img src="https://raw.githubusercontent.com/Urucas/zoster/master/logo.png" />
Url deeplinking automate testing for Android

# Install
```bash
git clone https://github.com/Urucas/zoster.git && cd zoster
npm install

npm start
// or run electron less, directly in your browser
npm run server
```
**or**
```bash
npm install -g zoster
zoster
// run electron less
zoster --neutron
```

# Requirements
* Appium

**Android**
* ADB

#Usage
**Zoster** is a simple deeplink automation package with a predefined appium test. You can test that clicking in a link on your site opens a defined package, this way you check that the correct link is generated in your site and also test that the application you defined is opened after clicking on that link. If you dont have a site to test, you can set the test site to "local" and a temporary site will be created on your localhost with the defined intent params. 

When running **Zoster**, a desktop application will open with a set of fields(host, params,...) to define the intent url to generate, your android application package name, an .apk field to update your application before the tests runs. 

As an example we'll use a simple Android application that shows a "Hello, {$yourname}", where {$yourname} is passed via the browsable intent. You can check this .apk inside the example [folder](https://github.com/Urucas/zoster/tree/master/example) or the [source code](https://github.com/Urucas/zoster-testapp)

Choosing **zoster** as scheme host and following [Android Developer Guide](https://developer.android.com/guide/components/intents-common.html#Browser) our final intent url will be:

**intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end**

Now, we'll fill the fields on the Zoster app, to create the intent url, like: 
<img src="https://raw.githubusercontent.com/Urucas/zoster/master/screen1.png" />

Click on the AndroidManifest.xml blue button to check this is correct;
<img src="https://raw.githubusercontent.com/Urucas/zoster/master/screen3.png" />

We can test the click on this ```intent browsable link``` locally or in your own server by settting the **URL site test**. Setting the ```local``` value, **Zoster** will create a temporary url with this link that will be clicked on our appium test. 

Once, all the fields are filled, you can run the test. An this will in this actions:
* Check you have an android connected via USB (There's no SIMULATOR support. yet)
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

That's all folks!

#TODO
* Write documentation
* Implement Android SDK to test a complete flow.
* Port to iOS
