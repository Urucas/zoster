var socket = io();


angular.module('SchemeApp', [])

.filter('stringify', function() {
  return function(params) {
    var strParams = [];
    for(k in params) {
      if(params[k].name == "" || params[k].name == undefined) continue;
      strParams.push(params[k].name+"="+params[k].value);
    }
    return strParams.join('&');
  }
})

.controller('SchemeController', ['$scope', function($scope) {

  $q = jQuery.noConflict();

  $scope.platforms = ['android', 'ios'];
  $scope.platform  = 'android';
  $scope.logs = [];
  $scope.testing = true;
  $scope.console = false;
  $scope.testStatus = 0;

  var settings = {
    size: 20,
    bgColor: false,
    speed: 5,
    className: "pri",
    color: "#337ab7"
  }
  var priloader = new Priloader("priloader", settings);

  $scope.selectPlatform = function(plt) {
    $scope.platform = plt == 'ios' ? 'ios' : 'android';
  }
  
  $scope.config = {
    scheme : "",
    host : "",
    pkg: "",
    action: "",
    params : [],
    apk_upload: false,
    wait4sdkEvent: false,
    test_site: "local"
  };

  $scope.exampleConfig = {
    scheme : "zoster",
    host : "zoster",
    pkg: "com.urucas.zoster_testapp",
    action: "hello",
    params : [{name:"user", value:"vruno"}],
    apk_upload: false,
    wait4sdkEvent: false,
    test_site: "local"
  };

  $scope.exampleRaddiosConfig = {
    scheme : "raddios",
    host : "raddios",
    pkg: "com.raddios",
    action: "play",
    params : [{name:"rid", value:"1"}],
    apk_upload: false,
    wait4sdkEvent: false,
    test_site: "http://labs.urucas.com/raddios/"
  }
  
  $scope.useExample = function(){
    $scope.config = $scope.exampleRaddiosConfig;
  }

  $scope.addParam = function() {
    $scope.config.params.push({name:"", value:""});
  }

  $scope.removeParam = function(i) {
    $scope.config.params.splice(i,1);
  }

  $scope.test = function() {
    if(!$scope.validate()) {
      return;
    }
    $scope.testing = true;
    $scope.console = true;
    $scope.testStatus = 0;
      
    $scope.config.intentURL = $q("#intentURL").text();
    $scope.logs = [];

    priloader.start();

    $scope.schemeTest = function() {
      socket.emit("test", $scope.config);
    }

    if($scope.config.apk_upload) {
      $q("#upload-form").ajaxSubmit({
        success: function(response) {
          $scope.schemeTest(); 
        }
      });
    }else {
      $scope.schemeTest();
    }

   
  }

  $scope.error = "";
  $scope.validate = function() {
    
    console.log($scope.config);
    var config = angular.copy($scope.config);

    if($scope.platform == 'ios') {
      return false;
    }

    if(config.scheme == "") {
      $q("#scheme").popover('show');
      return false;
    }

    if($scope.config.host == "") {
      $q("#host").popover('show');
      return false;
    }

    if($scope.config.pkg == "") {
      $q("#package").popover('show');
      return false;
    }
    
    $scope.config.test_site = 
      $scope.config.test_site == "" ? "local" : $scope.config.test_site;
    if($scope.config.test_site != "local") {
      var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
      var regex = new RegExp(expression);
      if(!regex.test($scope.config.test_site)) {
        $q("#test_site").popover('show');
        return false;
      }
    }

    return true;
  }

  socket.on("log", function(data){
    $scope.$apply(function(){
      $scope.logs.push(data);
    });
  });

  socket.on("available for testing", function(){
    priloader.stop();
    $scope.$apply(function(){
      $scope.testing = false;
      $scope.testStatus = 0;
    });
  });

  socket.on("test ok", function() {
    priloader.stop();
    $scope.$apply(function(){
      $scope.testing = false;
      $scope.testStatus = 1;
    });
  });
  
  socket.on("test failed", function() {
    priloader.stop();
    $scope.$apply(function(){
      $scope.testing = false;
      $scope.testStatus = -1;
    });
  });

}]);

