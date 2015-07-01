import zoster from '../lib/';
import caps from '../examples/simple.json';
import complex_caps from '../examples/complex.json';

describe("Zoster instance tests", () => {

  it("Test Zoster instance structure", (done) => {
    let z = zoster();
    if(z == null || z == undefined || typeof z != "object")
      throw new Error("Zoster function returns wrong object");
    
    let methods = [
      "get_devices","exit_error", "install_apk", 
      "is_package_installed", "stringify_params", "create_intent_url", 
      "is_intenturl_ok", "check_min_capabilities", "test", 
      "create_local_server_app", "create_local_server_test_site", 
      "run_cli", "run_server", "run"
    ];
    for(let key in methods) {
      let method = methods[key];
      if(z[method] == undefined && typeof z[method] != "function")
        throw new Error("Zoster instance missing method: "+method);
    }
    done();
  });

  it("Test port is setted", (done) => {
    let z = zoster({port:'1234'});
    if(z.port != '1234') 
      throw new Error("Fail setting port on constructor");
    done();
  });

  it("Test capabilities are null if not setted", (done) => {
    let caps = zoster().capabilities;
    if(caps != null) 
      throw new Error("Fail constructor to set null capabilities as defaulr");
    done();
  });
  
  it("Test capabilities are setted", (done) => {
    let z = zoster({capabilities:caps});
    if(z.capabilities != caps) 
      throw new Error("Fail setting capabilities on constructor");
    done();
  });

  it("Test stringify_params method", (done) => {
    let z = zoster();
    let params = [];
    if(z.stringify_params(params) != "")
      throw new Error("Fail stringify_params method(len=0)");
    
    params.push({name:"module", value:"zoster"});
    if(z.stringify_params(params) != "module=zoster") 
      throw new Error("Fail stringify_params method(len=1)");

    params.push({name:"author", value:"urucas"});
    if(z.stringify_params(params) != "module=zoster&author=urucas")
      throw new Error("Fail stringify_params method(len=2)");
    
    done();
  });

  it("Test create_intent_url method", (done) => {
    let z = zoster({capabilities:complex_caps});
    if(z.create_intent_url(complex_caps) != "intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end")
      throw new Error("Fail create_intent_url");
    done();
  });

  it("Test is_intenturl_ok method", (done) => {
    let z = zoster();
    let good_intent_url = "intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end";
    if(!z.is_intenturl_ok(good_intent_url))
      throw new Error("Fail is_intenturl_ok testing a good intent url");
    
    // missing ; between scheme value and package
    let bad_intent_url = "intent://zoster/hello?user=vruno#Intent;scheme=zosterpackage=com.urucas.zoster_testapp;end";
    if(z.is_intenturl_ok(bad_intent_url))
      throw new Error("Fail is_intenturl_ok testing a bad intenturl");
    done();
  });

  it("Test check_min_capabilities method", (done) => {
    let z = zoster();
    if(z.check_min_capabilities({}) == true)
      throw new Error("Fail check_min_capabilities, caps.pkg not setted and check_min_capabilities return true");
    
    if(z.check_min_capabilities({pkg:"com.urucas.zoster_testapp"}) == true)
      throw new Error("Fail check_min_capabilities, caps.scheme not setted and check_min_capabilities return true");

    if(z.check_min_capabilities({pkg:"com.urucas.zoster_testapp", scheme:"zoster"}) == true)
      throw new Error("Fail check_min_capabilities, caps.action not setted and check_min_capabilities return true");

    if(z.check_min_capabilities({pkg:"com.urucas.zoster_testapp", 
        intentURL:"intent://zoster/hello?user=vruno#Intent;scheme=zosterpackage=com.urucas.zoster_testapp;end"}
      ) == true)
      throw new Error("Fail check_min_capabilities, caps.intentURL is bad url and check_min_capabilities return true");

    done();
  })

  it("Test get_devices method return", (done) => {
    let z = zoster();
    try {
      let devices = z.get_devices();
      if(!Array.isArray(devices))
        throw new Error("Fail get_devices, returns wrong type(not array)");
        
    }catch(e){
      if(e.message != "NO available devices, please connect your android!")
        throw new Error("Fail get_devices, throwing un unkwown error");
    }
    done();
  })

  it("Test create_local_server_app creates app routes", (done) => {
    let z = zoster();
    let server = z.create_local_server_app();
    let express = server.__express__;
    let routes = express._router.stack;

    // check express static is created
    let flag = false;
    for(let i=0;i<routes.length;i++) {
      let route = routes[i];
      if(route.name == "serveStatic") flag = true;
    }
    if(!flag) throw new Error("Method create_local_server_app fails to create static route");

    // check main route is created
    flag = false;
    for(let i=0;i<routes.length;i++) {
      let route = routes[i].route;
      if(route == undefined) continue;
      if(route.path == "/") flag = true;
    }
    if(!flag) throw new Error("Method create_local_server_app fails to create main route");

    // check upload route is created
    flag = false;
    for(let i=0;i<routes.length;i++) {
      let route = routes[i].route;
      if(route == undefined) continue;
      if(route.path == "/upload") flag = true;
    }
    if(!flag) throw new Error("Method create_local_server_app fails to create upload route");

    done();
  })

  it("Test create_local_server_test_site creates local test route", (done) => {
    let z = zoster();

    try {
      let server = z.create_local_server_test_site();
    }catch(e) {
      if(e.message != "Capabilities undefined")
        throw new Error("Method create_local_server_test_site throw unkwown exception");
    }
    
    try {
      let server = z.create_local_server_test_site({});
    }catch(e) {
      if(e.message != "Capabilities intentURL undefined")
        throw new Error("Method create_local_server_test_site throw unkwown exception");
    }
    
    let caps_with_intenturl = caps;
    caps.intentURL = "intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end";
    
    // check test route is created when empty params
    let server = z.create_local_server_test_site(caps_with_intenturl);
    let express = server.__express__;
    let routes = express._router.stack;
    let flag = false;
    for(let i=0;i<routes.length;i++) {
      let route = routes[i].route;
      if(route == undefined) continue;
      if(route.path == "/test") flag = true;
    }
    if(!flag) 
      throw new Error("Method create_local_server_app fails to create test route without params");

    // check test route is created when added to existing server
    server = z.create_local_server_app();
    let server1 = z.create_local_server_test_site(caps_with_intenturl, server.__express__, server);
    express = server1.__express__;
    routes = express._router.stack;
    flag = false;
    for(let i=0;i<routes.length;i++) {
      let route = routes[i].route;
      if(route == undefined) continue;
      if(route.path == "/test") flag = true;
    }
    if(!flag) 
      throw new Error("Method create_local_server_app fails to create test route with params");

    done();  
  });
 
});
