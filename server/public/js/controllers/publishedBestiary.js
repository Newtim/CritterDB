
var publishedSkillsCtrl = function ($scope,Skills,bestiaries,owner,$routeParams,PublishedSkills,PublishedSkillsCreaturePager,PublishedSkillsPager,UserPublishedSkillsPager,SearchPublishedSkillsPager,CreatureFilter,CreatureAPI,CreatureClipboard,$mdMedia,$mdDialog,Auth,$location,Skills,Creature,$window,Mongo) {
	$scope.Skills = Skills;
	$scope.bestiaries = bestiaries;
	$scope.owner = owner;
	$scope.commentEdits = {};
	if(bestiaries && bestiaries.length>0){
		if($routeParams.userId)
			$scope.SkillsPager = new UserPublishedSkillsPager($routeParams.userId,bestiaries,2);
		else if(!$routeParams.SkillsType)
			$scope.SkillsPager = new SearchPublishedSkillsPager(bestiaries,1);
		else
			$scope.SkillsPager = new PublishedSkillsPager($routeParams.SkillsType,bestiaries,2);
	}
	if($routeParams.SkillsType && PublishedSkills.listConstants[$routeParams.SkillsType])
		$scope.SkillsType = PublishedSkills.listConstants[$routeParams.SkillsType].name;

	$scope.Skills.creaturesLoading = true;

	//Recursively loads all creatures
	function loadNextPage(){
		$scope.SkillsCreaturePager.loadNextPage(loadNextPage);
	}

	var loadCreatures = function(){
		if($scope.Skills._id){
			Creature.getAllForPublishedSkills($scope.Skills._id,1,function(data){
				$scope.Skills.creaturesLoading = false;
				$scope.Skills.creatures = data;
				$scope.SkillsCreaturePager = new PublishedSkillsCreaturePager($scope.Skills._id,$scope.Skills.creatures,2);
				loadNextPage();
				if(!$scope.$$phase)
					$scope.$digest();
			});
		}
	}
	loadCreatures();

	$scope.canInteract = function(){
		return(Auth.user!=null);
	}

	$scope.getStatBlockSize = function(index){
		if($scope.Skills.creatures && $scope.Skills.creatures.length>24){
			return("mini");
		}
		else
			return("");
	}

	$scope.creatureFilter = new CreatureFilter();
	$scope.SkillsListTypes = function(){
		var SkillsListTypes = [];
		for(var key in PublishedSkills.listConstants){
			if (PublishedSkills.listConstants.hasOwnProperty(key)){
				if(!PublishedSkills.listConstants[key].loginRequired || $scope.canInteract()){
					var listType = angular.copy(PublishedSkills.listConstants[key]);
					SkillsListTypes.push(listType);
				}
			}
		}
		return(SkillsListTypes);
	}();
	$scope.getCurrentSkillsListType = function(){
		return(PublishedSkills.listConstants[$routeParams.SkillsType]);
	}

	var creatureApiOptions = {
		copy: Auth.isLoggedIn(),
		share: ($scope.Skills.owner && Auth.user && $scope.Skills.owner._id == Auth.user._id),
		export:true
	}
	$scope.creatureApi = new CreatureAPI(creatureApiOptions);

	$scope.CreatureClipboard = CreatureClipboard;

	$scope.getPublishedSkillsListPath = function(){
		return("/#/publishedSkills/list/recent");
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

	$scope.goToSearchPage = function(){
		$location.path("/publishedSkills/search");
	}

	$scope.SkillsSortFunction = function(Skills) {
		if($routeParams.SkillsType=="popular")
			return(Skills.popularity);
		else
			return(-1*parseInt("0x"+Skills._id));
	}

	$scope.goBack = function(){
		$window.history.back();
	}

	$scope.editPublishedSkills = function(ev){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
    $mdDialog.show({
      controller: publishSkillsCtrl,
      templateUrl: '/assets/partials/publishedSkills/edit.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
      	'baseSkills': undefined,
      	'publishedSkills': $scope.Skills
      },
      fullscreen: useFullScreen
    }).then(function(updatedSkills){
    	$scope.Skills.name = updatedSkills.name;
    	$scope.Skills.description = updatedSkills.description;
    });
	}

	$scope.deletePublishedSkills = function(ev){
    var confirm = $mdDialog.confirm()
			.title("Confirm Deletion")
			.textContent("This published Skills will be permanently deleted. Would you like to proceed?")
			.ariaLabel("Confirm Delete")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");
		$mdDialog.show(confirm).then(function() {
			PublishedSkills.delete($scope.Skills._id);
			//Don't wait for delete to actually finish so that the UI feels more responsive.
			$location.url("/Skills/list");
		});
	}

	var copyCreaturesToSkills = function(createdSkills){
		var copiedCount = 0;
		var totalToCopy = $scope.Skills.creatures.length;
		var finishedCreatingCreature = function(){
			copiedCount = copiedCount + 1;
			if(copiedCount==totalToCopy){
				$location.url("/Skills/view/"+createdSkills._id);
			}
		}
		for(var i=0;i<$scope.Skills.creatures.length;i++){
			var newCreature = angular.copy($scope.Skills.creatures[i]);
			newCreature._id = undefined;
			newCreature.SkillsId = createdSkills._id;
			newCreature.publishedSkillsId = undefined;
			Creature.create(newCreature,finishedCreatingCreature,finishedCreatingCreature);
		}
	}

	$scope.copySkills = function(){
		var newSkills = Skills.generateNewSkills(Auth.user._id);
		newSkills.name = $scope.Skills.name;
		newSkills.description = $scope.Skills.description;
		Skills.create(newSkills,function(data){
			copyCreaturesToSkills(data);
		},function(err){
			console.log("error: "+err);
		});
	}

	$scope.printSkills = function(){
		$window.print();
	}

	$scope.isOwner = function(){
		return(Auth.user && Auth.user._id == $scope.Skills.owner._id);
	}

	$scope.isOwnerOfComment = function(comment){
		return(Auth.user && Auth.user._id == comment.author._id);
	}

	$scope.isLiked = function(){
		if($scope.Skills.likes){
			for(var i=0;i<$scope.Skills.likes.length;i++){
				if($scope.Skills.likes[i].userId == Auth.user._id)
					return true;
			}
		}
		return false;
	}

	$scope.toggleLike = function(){
		if($scope.isLiked())
			PublishedSkills.unlike($scope.Skills._id,function(data){
				$scope.Skills.likes = data.likes;
			});
		else
			PublishedSkills.like($scope.Skills._id,function(data){
				$scope.Skills.likes = data.likes;
			});
	}

	$scope.isFavorite = function(){
		if($scope.Skills.favorites){
			for(var i=0;i<$scope.Skills.favorites.length;i++){
				if($scope.Skills.favorites[i].userId == Auth.user._id)
					return true;
			}
		}
		return false;
	}

	$scope.toggleFavorite = function(){
		if($scope.isFavorite())
			PublishedSkills.unfavorite($scope.Skills._id,function(data){
				$scope.Skills.favorites = data.favorites;
			});
		else
			PublishedSkills.favorite($scope.Skills._id,function(data){
				$scope.Skills.favorites = data.favorites;
			});
	}

	function resetNewComment(){
		$scope.newComment = {
			text: ""
		}
	}
	resetNewComment();
	$scope.postComment = function(){
		if($scope.newComment.text.length>0){
			$scope.newComment.author = Auth.user._id;
			$scope.postingComment = true;
			PublishedSkills.addComment($scope.Skills._id,$scope.newComment,function(data){
				resetNewComment();
				$scope.Skills.comments = data.comments;
				$scope.postingComment = false;
			},function(err){
				$scope.postingComment = false;
			});
		}
	}

	function resetCommentEdits(comment){
		if($scope.commentEdits[comment._id])
			delete $scope.commentEdits[comment._id];
	}

	$scope.editComment = function(comment){
		$scope.commentEdits[comment._id] = {
			text: comment.text
		}
	}

	$scope.cancelCommentEdits = function(comment){
		resetCommentEdits(comment);
	}

	$scope.saveCommentEdits = function(comment){
		//Take effect immediately before we actually talk to the server
		comment.text = $scope.commentEdits[comment._id].text;
		resetCommentEdits(comment);
		PublishedSkills.updateComment($scope.Skills._id,comment._id,comment,function(data){
			$scope.Skills.comments = data.comments;
		});
	}

	$scope.deleteComment = function(ev,id){
		var confirm = $mdDialog.confirm()
			.title("Confirm Deletion")
			.textContent("This comment will be permanently deleted. Would you like to proceed?")
			.ariaLabel("Confirm Delete")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");
		$mdDialog.show(confirm).then(function() {
			PublishedSkills.deleteComment($scope.Skills._id,id,function(data){
				$scope.Skills.comments = data.comments;
			});
		});
	}

	$scope.getCommentsHeader = function(){
		if($scope.Skills && $scope.Skills.comments){
			var header = $scope.Skills.comments.length + " comment";
			if($scope.Skills.comments.length != 1)
				header = header + "s";
			return(header);
		}
		else
			return "0 comments";
	}

	$scope.search = {
		name: ""
	}
	$scope.searching = false;

	$scope.runSearch = function(){
		var searchCopy = angular.copy($scope.search);
		$scope.searching = true;
		PublishedSkills.search(searchCopy,1,function(data){
			$scope.searching = false;
			$scope.bestiaries = data;
			$scope.SkillsPager = new SearchPublishedSkillsPager(searchCopy,$scope.bestiaries,2);
		});
	}

	$scope.getCreationDate = Mongo.getTimestamp;

};

//don't load controller until we've gotten the data from the server
publishedSkillsCtrl.resolve = {
	Skills: ['PublishedSkills','$q','$route','Auth',function(PublishedSkills, $q, $route, Auth){
			if($route.current.params.SkillsId){
				var deferred = $q.defer();
				Auth.executeOnLogin(function(){
					PublishedSkills.get($route.current.params.SkillsId,function(data) {
						deferred.resolve(data);
					}, function(errorData) {
						deferred.reject();
					});
				});
				return deferred.promise;
			}
			else
				return {};
		}],
	bestiaries: ['PublishedSkills','$q','$route','Auth',function(PublishedSkills, $q, $route, Auth){
			if($route.current.params.SkillsType){
				var deferred = $q.defer();
				Auth.executeOnLogin(function(){
					var type = $route.current.params.SkillsType;
					if(PublishedSkills.listConstants[type]){
						var retrievalFunction = PublishedSkills.listConstants[type].retrievalFunction;
						var page = $route.current.params.page || 1;
						retrievalFunction(page,function(data) {
							deferred.resolve(data);
						}, function(errorData) {
							deferred.reject();
						});
					}
					else
						deferred.reject();
				});
				return deferred.promise;
			}
			else if($route.current.params.userId){
				var deferred = $q.defer();
				var page = $route.current.params.page || 1;
				PublishedSkills.getByUser($route.current.params.userId,page,function(data) {
					deferred.resolve(data);
				}, function(errorData) {
					deferred.reject();
				});
				return deferred.promise;
			}
			else
				return undefined;
		}],
	owner: ['User','$q','$route','Auth',function(User, $q, $route, Auth){
			if($route.current.params.userId){
				var deferred = $q.defer();
				Auth.executeOnLogin(function(){
					var userId = $route.current.params.userId;
					User.getPublic(userId,function(data) {
						deferred.resolve(data);
					}, function(errorData) {
						deferred.reject();
					});
				});
				return deferred.promise;
			}
			else
				return undefined;
		}]
}

angular.module('myApp').controller('publishedSkillsCtrl',publishedSkillsCtrl);
