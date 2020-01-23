angular.module('myApp').factory("UserPublishedSkillsPager", function(PublishedSkills,PublishedSkillsPager) {


  var UserPublishedSkillsPager = function(userId,startingData,startingNextPage){
    PublishedSkillsPager.call(this,"",startingData,startingNextPage);
    this.retrievalFunction = function(page,callback) {
      PublishedSkills.getByUser(userId,page,callback);
    }
  }
  
  UserPublishedSkillsPager.prototype = PublishedSkillsPager.prototype;

  return UserPublishedSkillsPager;
});
