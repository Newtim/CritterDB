angular.module('myApp').factory("SearchPublishedSkillsPager", function(PublishedSkills,PublishedSkillsPager) {

  var SearchPublishedSkillsPager = function(search,startingData,startingNextPage){
    PublishedSkillsPager.call(this,"",startingData,startingNextPage);
    this.retrievalFunction = function(page,callback) {
      PublishedSkills.search(search,page,callback);
    }
  }
  
  SearchPublishedSkillsPager.prototype = PublishedSkillsPager.prototype;

  return SearchPublishedSkillsPager;
});
