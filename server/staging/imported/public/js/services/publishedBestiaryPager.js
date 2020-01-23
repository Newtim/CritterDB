angular.module('myApp').factory("PublishedSkillsPager", function(PublishedSkills) {

  var PublishedSkillsPager = function(listType,startingData,startingNextPage){
    if(PublishedSkills.listConstants[listType])
  	 this.retrievalFunction = PublishedSkills.listConstants[listType].retrievalFunction;
  	this.bestiaries = startingData || [];
  	this.nextPage = startingNextPage || 1;
  	this.busy = false;
  }
  PublishedSkillsPager.prototype.loadNextPage = function() {
  	if(!this.busy){
  		this.busy = true;
      if(this.retrievalFunction){
    		this.retrievalFunction(this.nextPage,function(data){
    			if(data.length>0){	//if we are receiving no more data remain busy so we don't repeat request
  	  			for(var i=0;i<data.length;i++)
  	  				this.bestiaries.push(data[i]);
  	  			this.nextPage = this.nextPage + 1;
  	  			this.busy = false;
  	  		}
    		}.bind(this));	//on error do nothing and remain busy so we don't repeat the faulty request
      }
  	}
  }

  return PublishedSkillsPager;
});
