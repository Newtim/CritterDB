
var homePageCtrl = function ($scope,selectedSkills,SkillsList,PublishedSkills,CreatureClipboard,$location,Creature) {
	$scope.selectedSkills = selectedSkills;
	$scope.SkillsList = SkillsList;

	$scope.selectedSkills.creaturesLoading = true;
	var loadCreatures = function(){
		if($scope.selectedSkills._id){
			Creature.getAllForPublishedSkills($scope.selectedSkills._id,1,function(data){
				$scope.selectedSkills.creaturesLoading = false;
				$scope.selectedSkills.creatures = data;
				if(!$scope.$$phase)
					$scope.$digest();
			});
		}
	}
	loadCreatures();

	$scope.CreatureClipboard = CreatureClipboard;

	$scope.goToSearchPage = function(){
		$location.path("/publishedSkills/search");
	}

	$scope.getSkillsPath = function(Skills){
		if(Skills)
			return("/#/publishedSkills/view/"+Skills._id);
		else
			return("");
	}

	$scope.getUserSkillsListPath = function(user){
		if(user)
			return("/#/user/"+user._id+"/publishedbestiaries");
		else
			return("");
	}

	$scope.SkillsSortFunction = function(Skills) {
		return(-1*parseInt("0x"+Skills._id));
	}
};
homePageCtrl.$inject = ["$scope", "selectedSkills", "SkillsList", "PublishedSkills", "CreatureClipboard", "$location", "Creature"];

//don't load controller until we've gotten the data from the server
homePageCtrl.resolve = {
	selectedSkills: ['PublishedSkills','$q','$route','Auth',function(PublishedSkills, $q, $route, Auth){
			var deferred = $q.defer();
			Auth.executeOnLogin(function(){
				PublishedSkills.getMostPopular(function(data) {
					deferred.resolve(data);
				}, function(errorData) {
					deferred.reject();
				});
			});
			return deferred.promise;
		}],
	SkillsList: ['PublishedSkills','$q','$route','Auth',function(PublishedSkills, $q, $route, Auth){
			var deferred = $q.defer();
			Auth.executeOnLogin(function(){
				PublishedSkills.getRecent(1,function(data) {
					deferred.resolve(data);
				}, function(errorData) {
					deferred.reject();
				});
			});
			return deferred.promise;
		}]
}

angular.module('myApp').controller('homePageCtrl',homePageCtrl);
