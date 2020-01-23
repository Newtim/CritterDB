
var SkillsCtrl = function ($scope, Creature, Skills, Skills, $location, bestiaries, Auth, $mdDialog, $mdMedia, CreatureClipboard, $mdToast, CreatureFilter, CreatureAPI, $cookies, $window) {
	$scope.bestiaries = bestiaries;
	$scope.Skills = Skills;

	$scope.Skills.creaturesLoading = true;
	var loadCreatures = function(){
		if($scope.Skills._id){
			Creature.getAllForSkills($scope.Skills._id,function(data){
				$scope.Skills.creaturesLoading = false;
				$scope.Skills.creatures = data;
			});
		}
	}
	loadCreatures();

	$scope.unsavedSkills = {
		_id: Skills._id,
		name: Skills.name+"",
		description: Skills.description+""
	};

	var VIEW_MODE_COOKIE = "Skills-view-mode";
	$scope.view = {
		modes: [
			{
				id: "fallingColumns",
				tooltip: "Falling Columns Mode",
				icon: "view_column"
			},
			{
				id: "previewList",
				tooltip: "List & Preview Mode",
				icon: "view_list"
			}
		],
		current: ($cookies.get(VIEW_MODE_COOKIE) || "previewList"),
		changeTo: function(id){
			$scope.view.current = id;
			$cookies.put(VIEW_MODE_COOKIE,id);
		}
	}

	$scope.preview = {
		creature: undefined
	}

	$scope.creatureFilter = new CreatureFilter();

	$scope.creatureApi = new CreatureAPI();
	//Override delete feature so we can immediately splice creature rather than waiting for server
	$scope.creatureApi.delete = function(ev,creature){
		var confirm = $mdDialog.confirm()
			.title("Confirm Deletion")
			.textContent("This creature will be permanently deleted. Would you like to proceed?")
			.ariaLabel("Confirm Delete")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");
		$mdDialog.show(confirm).then(function() {
			Creature.delete(creature._id);
			//Don't wait for delete to actually finish so that the UI feels more responsive.
			var index = $scope.Skills.creatures.indexOf(creature);
			if(index!=-1)
				$scope.Skills.creatures.splice(index,1);
			if($scope.preview.creature && $scope.preview.creature._id == creature._id)
				$scope.preview.creature = undefined;
		});
	}

	$scope.addCreature = function(){
		$location.url("/Skills/add/"+$scope.Skills._id);
	}

	$scope.goToSkills = function(id){
		$location.url("/Skills/view/"+id);
	}

	$scope.createSkills = function(){
		var newSkills = Skills.generateNewSkills(Auth.user._id);
		Skills.create(newSkills,function(data){
			$scope.goToSkills(data._id);
		},function(err){
			console.log("error: "+err);
		});
	}

	$scope.deleteSkills = function(ev,Skills){
		var confirm = $mdDialog.confirm()
			.title("Confirm Deletion")
			.textContent("This collection will be permanently deleted. Would you like to proceed?")
			.ariaLabel("Confirm Delete")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");
		$mdDialog.show(confirm).then(function() {
			Skills.delete(Skills._id);
			//Don't wait for delete to actually finish so that the UI feels more responsive.
			var index = $scope.bestiaries.indexOf(Skills);
			if(index!=-1)
				$scope.bestiaries.splice(index,1);
		});
	}

	$scope.printSkills = function(ev,Skills){
		$window.print();
	}

	$scope.publishSkills = function(ev,Skills){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
    $mdDialog.show({
      controller: publishSkillsCtrl,
      templateUrl: '/assets/partials/Skills/publish-Skills.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
      	'baseSkills': Skills,
      	'publishedSkills': undefined
      },
      fullscreen: useFullScreen
    });
	}

	$scope.doesSkillsNeedEdits = function(Skills){
		return(Skills.name==Skills.newSkillsModel.name || Skills.description==Skills.newSkillsModel.description);
	}

	$scope.getSkillsListPath = function(){
		return("/#/Skills/list");
	}

	$scope.getSkillsPath = function(Skills){
		return("/#/Skills/view/"+Skills._id);
	}

	$scope.cancelSave = function(){
		$scope.unsavedSkills = $scope.Skills;
	}

	$scope.saveSkillsInfo = function(){
		if($scope.unsavedSkills._id){
			Skills.update($scope.unsavedSkills._id,$scope.unsavedSkills,function(data){
				$scope.Skills.name = data.name;
				$scope.Skills.description = data.description;
			},function(err){
				console.log("error: "+err);
			});
		}
	}

	$scope.CreatureClipboard = CreatureClipboard;

	$scope.pasteClipboard = function(){
		var creatures = CreatureClipboard.getAll();
		var copiedCount = 0;
		var totalToCopy = creatures.length;
		var finishedCopy = function(){
			copiedCount = copiedCount + 1;
			if(copiedCount==totalToCopy){
				loadCreatures();
				$mdToast.show(
					$mdToast.simple()
						.textContent(totalToCopy + " creatures pasted.")
						.position("bottom right")
						.hideDelay(2000)
				);
			}
		}
		for(var i=0;i<creatures.length;i++){
			var newCreature = angular.copy(creatures[i]);
			newCreature._id = undefined;
			newCreature.publishedSkillsId = undefined;
			newCreature.SkillsId = $scope.Skills._id;
			Creature.create(newCreature,finishedCopy,finishedCopy);
		}
	}
};
SkillsCtrl.$inject = ["$scope", "Creature", "Skills", "Skills", "$location", "bestiaries", "Auth", "$mdDialog", "$mdMedia", "CreatureClipboard", "$mdToast", "CreatureFilter", "CreatureAPI", "$cookies", "$window"];

//don't load controller until we've gotten the data from the server
SkillsCtrl.resolve = {
			Skills: ['Skills','$q','$route','Auth','$location',function(Skills, $q, $route, Auth, $location){
				if($route.current.params.SkillsId){
					var deferred = $q.defer();
					Auth.executeOnLogin(function(){
						if(!Auth.isLoggedIn()){
							$location.path('/login');
							deferred.reject();
						}
						else{
							Skills.get($route.current.params.SkillsId,function(data) {
								deferred.resolve(data);
								//save that Skills was active, but no need to do it until after resolving
								data.lastActive = new Date();
								Skills.update(data._id,data);
							}, function(errorData) {
								deferred.reject();
							});
						}
					});
					return deferred.promise;
				}
				else
					return {};
			}],
			bestiaries: ['Skills','$q','$route','Auth','$location',function(Skills, $q, $route, Auth, $location){
				if($route.current.params.SkillsId==undefined){
					var deferred = $q.defer();
					Auth.executeOnLogin(function(){
						if(!Auth.isLoggedIn()){
							$location.path('/login');
							deferred.reject();
						}
						else{
							Skills.getAllForUser(Auth.user._id,function(data) {
								deferred.resolve(data);
							}, function(errorData) {
								deferred.reject();
							});
						}
					});
					return deferred.promise;
				}
				else
					return [];
			}]
		}

angular.module('myApp').controller('SkillsCtrl',SkillsCtrl);
