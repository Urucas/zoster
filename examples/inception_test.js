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
