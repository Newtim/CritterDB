angular.module('myApp').factory("Skills", function($resource,$sce,CachedResourceAPI) {

  var SkillsAPI = new CachedResourceAPI("/api/bestiaries/:id");

  var currentUserId = undefined;  //track the current user - only pull all user bestiaries from server if the user has changed
  SkillsAPI.getAllForUser = function(userId, success, error){
    if(currentUserId==undefined || currentUserId != userId){
      currentUserId = userId;   //update current user
      $resource("/api/users/:id/bestiaries").query({ 'id': userId}, (function(data){
        for(var i=0;i<data.length;i++)
          this.cache.add(data[i]._id,data[i]);
        if(success)
          success(data);
      }).bind(this),error);
    }
    else {
      var allBestiaries = this.cache.getAll();
      var userBestiaries = [];
      for(var i=0;i<allBestiaries.length;i++){
        if(allBestiaries[i].ownerId == userId)
          userBestiaries.push(allBestiaries[i]);
      }
      setTimeout(function(){
        success(userBestiaries);
      });
    }
  }

  SkillsAPI.newSkillsModel = {
    name: 'New Critter Collection',
    description: ''
  };
  SkillsAPI.generateNewSkills = function(userId){
    if(!userId){
      throw "Parameter userId not found";
      return undefined;
    }
    else{
      var newSkills = angular.copy(SkillsAPI.newSkillsModel);
      newSkills.ownerId = userId;
      return(newSkills);
    }
  }

  return SkillsAPI;
});
