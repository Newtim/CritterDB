var publishSkillsCtrl = function ($scope,$mdDialog,baseSkills,publishedSkills,Auth,PublishedSkills,$location,Creature) {

	$scope.publishedSkills = (publishedSkills ? angular.copy(publishedSkills) : 
		{
			'name': baseSkills.name,
			'description': baseSkills.description,
			'owner': Auth.user,
			'creatures': []				//define later upon creation
		});

	$scope.newSkills = {
		"_id": "NEW_Skills",
		"name": "PUBLISH NEW Skills"
	};
	$scope.ownedPublishedBestiaries = [$scope.newSkills];
	$scope.selectedSkills = publishedSkills || $scope.newSkills;

	//Recursively gets all pages of owned bestiaries
	function getOwnedPublishedBestiaries(page){
		if(Auth.user && !publishedSkills){
			PublishedSkills.getByUser(Auth.user._id,page,function(data){
				if(data && data.length > 0){
					for(var i=0;i<data.length;i++){
						$scope.ownedPublishedBestiaries.push(data[i]);
					}
					getOwnedPublishedBestiaries(page + 1);
				}
			});
		}
	}
	getOwnedPublishedBestiaries(1);

	$scope.$watch("selectedSkills",function(newValue,oldValue){
		if(oldValue!=newValue){
			if(newValue==$scope.newSkills){
				$scope.publishedSkills.name = baseSkills.name;
				$scope.publishedSkills.description = baseSkills.description;
				$scope.publishedSkills._id = undefined;
			}
			else{
				$scope.publishedSkills = $scope.selectedSkills;
			}
		}
	},true);

	function goToPublishedSkills(id){
		$location.url("/publishedSkills/view/"+id);
	}

	function createCreaturesForSkills(baseSkills,publishedSkills,success,failure){
		Creature.getAllForSkills(baseSkills._id,function(data){
			var createdCreatures = [];
			if(data.length > 0){
				var createdCreatureCount = 0;
				var totalCreaturesToCreate = data.length;
				var finishedCreatingCreature = function(){
					createdCreatureCount = createdCreatureCount + 1;
					if(createdCreatureCount == totalCreaturesToCreate){
						success(createdCreatures);
					}
				}
				for(var i=0;i<baseSkills.creatures.length;i++){
					var newCreature = angular.copy(baseSkills.creatures[i]);
					newCreature._id = undefined;
					newCreature.SkillsId = undefined;
					newCreature.publishedSkillsId = publishedSkills._id;
					Creature.create(newCreature,finishedCreatingCreature,finishedCreatingCreature);
				}
			}
			else
				success(createdCreatures);
		},function(err){
			failure(err);
		});
	}

	function publishSkills(baseSkills,publicSkills,success,failure){
		if(publicSkills._id){	//just update existing Skills
			PublishedSkills.update(publicSkills._id,publicSkills,function(data){
				var publishedSkills = data;
				Creature.deleteAllForPublishedSkills(publishedSkills._id,function(data){
					createCreaturesForSkills(baseSkills,publishedSkills,function(data){
						success(publishedSkills);
					},function(err){
						failure(err);
					});
				},function(err){
					failure(err);
				});
			},function(err){
				failure(err);
			});
		}
		else{	//make new Skills
			PublishedSkills.create(publicSkills,function(data){
				var publishedSkills = data;
				createCreaturesForSkills(baseSkills,publishedSkills,function(data){
					success(publishedSkills);
				},function(err){
					failure(err);
				});
			},function(err){
				failure(err);
			});
		}
	}

	$scope.publish = function(ev){
		var confirm = $mdDialog.confirm()
			.title("Confirm Ownership")
			.textContent("Please confirm that the published content is legally yours to share and is not copyrighted or otherwise legally protected in a way that would prevent its publishing on this site.")
			.ariaLabel("Confirm Publish")
			.targetEvent(ev)
			.ok("Confirm")
			.cancel("Cancel");
		$mdDialog.show(confirm).then(function() {
			publishSkills(baseSkills,$scope.publishedSkills,function(data){
				goToPublishedSkills(data._id);
				$mdDialog.cancel();
			},function(err){
				console.error("Error publishing Skills: "+err);
			});
		});

	}

	//updates, closes dialog, and gives the data to the resolved promise
	$scope.update = function(){
		PublishedSkills.update($scope.publishedSkills._id,$scope.publishedSkills,function(data){
				$mdDialog.hide(data);
			},function(err){
				console.log("error: "+err);
			});
	}

	$scope.cancel = function() {
    $mdDialog.cancel();
  };

};
publishSkillsCtrl.$inject = ["$scope", "$mdDialog", "baseSkills", "publishedSkills", "Auth", "PublishedSkills", "$location", "Creature"];

angular.module('myApp').controller('publishSkillsCtrl',publishSkillsCtrl);
