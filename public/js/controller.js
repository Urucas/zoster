angular.module('SchemeApp', [])

.controller('SchemeController', ['$scope', function($scope) {

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

  $scope.test = function() {
    alert("TODO");
  }

}])
