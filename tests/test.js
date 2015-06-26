import zoster from '../lib/';
import caps from '../caps/zoster_testapp.json';

describe("Zoster instance tests", () => {

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
    let z = zoster({capabilities:caps});
    if(z.create_intent_url(caps) != "intent://zoster/hello?user=vruno#Intent;scheme=zoster;package=com.urucas.zoster_testapp;end")
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

 
});
