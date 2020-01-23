angular.module('myApp').factory("PublishedSkills", ["CachedResourceAPI", "Creature", "$resource", function(CachedResourceAPI,Creature,$resource) {

  var PublishedSkillsAPI = new CachedResourceAPI("/api/publishedbestiaries/:id");

	delete [PublishedSkillsAPI.getAll];

	PublishedSkillsAPI.like = function(id, success, error){
		$resource("/api/publishedbestiaries/:id/likes").save({'id':id},"",(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

	PublishedSkillsAPI.unlike = function(id, success, error){
		$resource("/api/publishedbestiaries/:id/likes").delete({'id':id},(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

	PublishedSkillsAPI.favorite = function(id, success, error){
		$resource("/api/publishedbestiaries/:id/favorites").save({'id':id},"",(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

	PublishedSkillsAPI.unfavorite = function(id, success, error){
		$resource("/api/publishedbestiaries/:id/favorites").delete({'id':id},(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

  PublishedSkillsAPI.getPopular = function(page,success, error){
    $resource("/api/publishedbestiaries/popular/:page").query({ 'page': page}, function(data){
    	//don't cache as we are not getting all data fields from this request
      if(success)
        success(data);
    },error);
  }

	PublishedSkillsAPI.getRecent = function(page,success, error){
    $resource("/api/publishedbestiaries/recent/:page").query({ 'page': page}, function(data){
    	//don't cache as we are not getting all data fields from this request
      if(success)
        success(data);
    },error);
  }

	PublishedSkillsAPI.getFavorites = function(page,success, error){
    $resource("/api/publishedbestiaries/favorites/:page").query({ 'page': page}, function(data){
    	//don't cache as we are not getting all data fields from this request
      if(success)
        success(data);
    },error);
  }

	PublishedSkillsAPI.getOwned = function(page,success, error){
    $resource("/api/publishedbestiaries/owned/:page").query({ 'page': page}, function(data){
      //don't cache as we are not getting all data fields from this request
      if(success)
        success(data);
    },error);
  }

  PublishedSkillsAPI.search = function(search,page,success, error){
  	var resourceOptions = {
      'save': {
      	method:'POST',
      	isArray: true
      }
		};
    $resource("/api/publishedbestiaries/search/:page",{},resourceOptions).save({ 'page': page},search, function(data){
      //don't cache as we are not getting all data fields from this request
      if(success)
        success(data);
    },error);
  }

  PublishedSkillsAPI.getByUser = function(userId,page,success, error){
    $resource("/api/users/:userId/publishedbestiaries/:page").query({ 'userId': userId, 'page': page}, function(data){
      //don't cache as we are not getting all data fields from this request
      if(success)
        success(data);
    },error);
  }

	PublishedSkillsAPI.addComment = function(SkillsId, comment, success, error){
		$resource("/api/publishedbestiaries/:id/comments").save({'id':SkillsId},comment,(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

	PublishedSkillsAPI.updateComment = function(SkillsId, commentId, comment, success, error){
		var queryParams = {
			id: SkillsId,
			commentId: commentId
		};
		var resourceOptions = {
      'update': { method:'PUT' }
		};
		$resource("/api/publishedbestiaries/:id/comments/:commentId",{},resourceOptions).update(queryParams,comment,(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

	PublishedSkillsAPI.deleteComment = function(SkillsId, commentId, success, error){
		var queryParams = {
			id: SkillsId,
			commentId: commentId
		};
		$resource("/api/publishedbestiaries/:id/comments/:commentId").delete(queryParams,(function(data){
      if(success)
        success(data);
    }).bind(this),error);
	}

	PublishedSkillsAPI.getMostPopular = function(success, error){
		var resourceOptions = {
      'query': {
      	method:'GET',
      	isArray: false
      }
		};
    $resource("/api/publishedbestiaries/mostpopular",{},resourceOptions).query({}, success,error);
  }

  PublishedSkillsAPI.listConstants = {
		popular: {
			type: "popular",
			retrievalFunction: PublishedSkillsAPI.getPopular,
			name: 'Popular',
			path: "/#/publishedSkills/list/popular"
		},
		recent: {
			type: "recent",
			retrievalFunction: PublishedSkillsAPI.getRecent,
			name: 'Recent',
			path: "/#/publishedSkills/list/recent"
		},
		favorites: {
			type: "favorites",
			retrievalFunction: PublishedSkillsAPI.getFavorites,
			name: 'My Favorites',
			path: "/#/publishedSkills/list/favorites",
			loginRequired: true
		},
		owned: {
			type: "owned",
			retrievalFunction: PublishedSkillsAPI.getOwned,
			name: 'My Bestiaries',
			path: "/#/publishedSkills/list/owned",
			loginRequired: true
		}
	};

  return PublishedSkillsAPI;
}]);
