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
    size: 30,
    bgColor: false,
    speed: 3,
    className: "pri",
    color: "#337ab7"
  }
  var priloader = new Priloader("priloader", settings);

  $scope.selectPlatform = function(plt) {
    $scope.platform = plt == 'ios' ? 'ios' : 'android';
  }
  
  $scope.config = {
    scheme : "raddios",
    host : "raddios",
    pkg: "com.raddios",
    action: "play",
    params : [{name:"rid", value:1}],
  };
  
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
    priloader.start();

    $scope.config.intentURL = $q("#intentURL").text();
    
    $scope.logs = [];
    socket.emit("test", $scope.config);
  }

  $scope.error = "";
  $scope.validate = function() {
    
    if($scope.platform == 'ios') {
      return false;
    }

    if($scope.config.scheme == "") {
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

}])
