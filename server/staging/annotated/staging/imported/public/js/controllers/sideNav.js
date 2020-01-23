var sideNavCtrl = function ($scope,SideNav) {

  $scope.close = SideNav.close;
  $scope.open = SideNav.open;
  $scope.toggle = SideNav.toggle;
  $scope.toggleExclusive = SideNav.toggleExclusive;
  $scope.isOpen = SideNav.isOpen;
};
sideNavCtrl.$inject = ["$scope", "SideNav"];

angular.module('myApp').controller('sideNavCtrl',sideNavCtrl);
