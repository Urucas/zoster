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

  $scope.selectPlatform = function(plt) {
    $scope.platform = plt == 'ios' ? 'ios' : 'android';
  }
  
  $scope.scheme = "";
  $scope.host = "";
  $scope.package = "";
  $scope.action = "";

  $scope.params = [];

  $scope.addParam = function() {
    $scope.params.push({name:"", value:""});
    console.table($scope.params);
  }

  $scope.removeParam = function(i) {
    $scope.params.splice(i,1);
  }

  $scope.test = function() {
    
  }

  $scope.error = "";
  $scope.validate = function() {
    
    if($scope.platform == 'ios') {
      return;
    }

    if($scope.scheme == "") {
      $q("#scheme").popover('show');
      return; 
    }

    if($scope.host == "") {
      $q("#host").popover('show');
      return;
    }

    if($scope.package == "") {
      $q("#package").popover('show');
      return;
    }
  }

}])
