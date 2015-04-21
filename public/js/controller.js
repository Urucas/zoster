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

  $scope.selectPlatform = function(plt) {
    $scope.platform = plt == 'ios' ? 'ios' : 'android';
  }
  
  $scope.config = {
    scheme : "raddios",
    host : "raddios",
    pkg: "com.raddios",
    action: "play",
    params : [{name:"rid", value:1}]
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
    console.log(data);
  });

}])
