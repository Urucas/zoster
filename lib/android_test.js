import wd from 'wd'
import { sleep } from 'asyncbox'

async function runTest (caps) {
  let browser = wd.promiseChainRemote('localhost', caps.port)
  let adb = caps.adb
  let webViewXPath = '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.webkit.WebView[1]/android.view.View[1]'
  let log = (msg) => {
    if (caps.log) {
      caps.log(msg)
    }
  }

  browser.on('status', (info) => {
    if (caps.log && caps.verbose) {
      log(info)
    }
  })
  browser.on('command', (meth, path, data) => {
    if (caps.log && caps.verbose) {
      log([meth, path, data].join(' '))
    }
  })

  let remoteTest = async (caps) => {
    log('Searching for intent url link')
    let els = await browser.elementsByTagName('a')
    console.log(els)
    /*
    isIntentLink(els,
      // success
      (el) => {
        intentClick(browser, el)
      },
      // error
      (err) => {
        error(caps, err.toString())
      })
    })
    */
  }

  let isIntentLink = (els, cb, errCb) => {
    var len = els.length
    if (len === 0) {
      errCb('Intent url link not found')
      return
    }
    let el = els.splice(0, 1)[0]
    el.getAttribute('href', (err, attr) => {
      if (err) {
        return errCb(err)
      }
      if (attr === null) {
        isIntentLink(els, cb, errCb)
        return
      }
      if (attr === caps.intentURL) {
        cb(el)
        return
      } else {
        isIntentLink(els, cb, errCb)
      }
    })
  }

  let isApplicationRunning = (caps) => {
    setTimeout(_ => {
      log(`Checking if (${caps.pkg}) application is running`)
      if (adb.isAppRunning(caps.pkg)) {
        if (caps.inception) {
          runInception(caps)
        } else {
          adb.closeApp(caps.pkg)
          browser.quit()
          caps.cb(true)
        }
      } else {
        browser.quit()
        caps.cb(false, {error: 'Application didnt open'})
      }
    }, 3000)
  }

  let runInception = (caps) => {
    log('Running inception')
    let inception = caps.inception.test
    inception(caps, browser,
    // success
    () => {
      adb.closeApp(caps.pkg)
      browser.quit()
      caps.cb(true)
    },
    // error
    (err) => {
      adb.closeApp(caps.pkg)
      browser.quit()
      caps.cb(false, {error: err.message})
    })
  }

  let error = (caps, err) => {
    if (err) {
      console.log(err)
    }
    browser.quit()
    caps.cb(false, {error: err})
  }

  let localTest = async (caps) => {
    browser.elementByLinkText('Open app', (err, el) => {
      log('Clicking on element')
      if (err) {
        return error(caps, err)
      }
      intentClick(browser, el)
    })
  }

  let pressAction = (driver, coords) => {
    let action = new wd.TouchAction(driver)
    action.press({x: coords.x, y: coords.y}).wait(10).release()
    return action
  }

  let intentClick = (driver, el) => {
    let elCoords
    // get element location
    driver.getLocation(el, (err, coords) => {
      if (err) {
        return error(err)
      }
      elCoords = coords
      driver.context('NATIVE_APP', (err) => {
        if (err) {
          return error(err)
        }
        driver.elementByXPath(webViewXPath, (err, el) => {
          if (err) {
            return error(err)
          }
          driver.getLocation(el, (err, coords) => {
            if (err) {
              return error(err)
            }
            let action = pressAction(driver, {x: elCoords.x, y: (coords.y + elCoords.y)})
            action.perform((err) => {
              if (err) {
                return error(err)
              }
              isApplicationRunning(caps)
            })
          })
        })
      })
    })
  }
  let appiumCaps = {browserName: 'browser', deviceName: 'Android', platformName: 'Android'}
  await browser.init(appiumCaps)
  await sleep(5000)
  await browser.get(caps.url)
  if (caps.local) {
    await localTest(caps)
  } else {
    await remoteTest(caps)
  }
}

export default async function test (caps) {
  await runTest(caps)
  /*
  let intentFixScript = (intentURL) => {
    let script = 'var els=document.querySelectorAll(\'[href="{$intentURL}"]\') for(var i in els){ try{ els[i].setAttribute("onclick","window.open(\'{$intentURL}\')")}catch(e){}}'
    return script.replace(/\{\$intentURL\}/ig, intentURL)
  }
  */
}
