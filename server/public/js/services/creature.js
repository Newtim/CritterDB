angular.module('myApp').factory("Creature", function($resource,$sce,CachedResourceAPI,CreatureData) {

	var CreatureAPI = new CachedResourceAPI("/api/creatures/:id");

	var shortFormAbilities = {
		"strength": "Str",
		"dexterity": "Dex",
		"constitution": "Con",
		"intelligence": "Int",
		"wisdom": "Wis",
		"charisma": "Cha"
	};

	var getAbilityModifier = function(abilityScore){
		return(Math.floor((abilityScore - 10.0)/2.0));
	}

	CreatureAPI.calculateCreatureDetails = function(creature){
		//displayed armor type
		if(creature.stats && creature.stats.armorType){
			if(creature.stats.armorType=="")
				creature.stats.armorTypeStr = "";
			else
				creature.stats.armorTypeStr = "("+creature.stats.armorType+")";
		}
		//ability modifiers
		if(creature.stats && creature.stats.abilityScores){
			creature.stats.abilityScoreModifiers = {};
			creature.stats.abilityScoreStrs = {};
			for(var key in creature.stats.abilityScores){
				if(creature.stats.abilityScores.hasOwnProperty(key)){
					creature.stats.abilityScoreModifiers[key] = getAbilityModifier(creature.stats.abilityScores[key]);
					var sign = "+";
					if(creature.stats.abilityScoreModifiers[key]<0)
						sign = "–";
					creature.stats.abilityScoreStrs[key] = creature.stats.abilityScores[key]+" ("+sign+Math.abs(creature.stats.abilityScoreModifiers[key])+")";
				}
			}
		}
		//hit points
		if(creature.stats && creature.stats.size && creature.stats.abilityScoreModifiers && creature.stats.numHitDie){
			if(!creature.stats.hitDieSize)
				creature.stats.hitDieSize = CreatureData.sizes[creature.stats.size].hitDieSize;
			creature.stats.extraHealthFromConstitution = creature.stats.abilityScoreModifiers["constitution"] * creature.stats.numHitDie;
			creature.stats.hitPoints = Math.floor(creature.stats.numHitDie * ((creature.stats.hitDieSize/2.0) + 0.5 + creature.stats.abilityScoreModifiers["constitution"]));
			var sign = "+";
			if(creature.stats.extraHealthFromConstitution<0)
				sign = "–";
			creature.stats.hitPointsStr = creature.stats.hitPoints + " " +
					"(" + creature.stats.numHitDie + "d" + creature.stats.hitDieSize + " " +
					sign + " " + Math.abs(creature.stats.extraHealthFromConstitution) + ")";
		}
		//make ability descriptions html safe so we can use italics and other markup
		if(creature.stats && creature.stats.additionalAbilities){
			for(var index in creature.stats.additionalAbilities){
				var ability = creature.stats.additionalAbilities[index];
				ability.descriptionHtml = $sce.trustAsHtml(ability.description);
			}
		}
		if(creature.stats && creature.stats.actions){
			for(var index in creature.stats.actions){
				var ability = creature.stats.actions[index];
				ability.descriptionHtml = $sce.trustAsHtml(ability.description);
			}
		}
		if(creature.stats && creature.stats.reactions){
			for(var index in creature.stats.reactions){
				var ability = creature.stats.reactions[index];
				ability.descriptionHtml = $sce.trustAsHtml(ability.description);
			}
		}
		if(creature.stats && creature.stats.legendaryActions){
			for(var index in creature.stats.legendaryActions){
				var ability = creature.stats.legendaryActions[index];
				ability.descriptionHtml = $sce.trustAsHtml(ability.description);
			}
		}
		//make legendary actions description html safe so we can use italics and other markup
		if(creature.stats && creature.stats.legendaryActionsDescription && creature.stats.legendaryActionsDescription.length > 0) {
			creature.stats.legendaryActionsDescriptionHtml = $sce.trustAsHtml(creature.stats.legendaryActionsDescription);
		}
		//make description html safe so we can use italics and other markup
		if(creature.flavor && creature.flavor.description!=undefined){
			creature.flavor.descriptionHtml = $sce.trustAsHtml(creature.flavor.description);
		}
		//saving throws
		if(creature.stats && creature.stats.savingThrows && creature.stats.abilityScoreModifiers && creature.stats.proficiencyBonus!=undefined){
			for(var index in creature.stats.savingThrows){
				var savingThrow = creature.stats.savingThrows[index];
				var mod = creature.stats.abilityScoreModifiers[savingThrow.ability];
				if(savingThrow.value != undefined)
					mod = savingThrow.value;
				else if(savingThrow.proficient)
					mod = mod + creature.stats.proficiencyBonus;
				savingThrow.modifier = mod;
				var sign = "+";
					if(mod<0)
						sign = "–";
				savingThrow.modifierStr = shortFormAbilities[savingThrow.ability]+" "+sign+Math.abs(mod);
			}
		}
		//skills
		if(creature.stats && creature.stats.skills && creature.stats.abilityScoreModifiers && creature.stats.proficiencyBonus!=undefined){
			for(var index in creature.stats.skills){
				var skill = creature.stats.skills[index];
				var ability = CreatureData.skills[skill.name] ? CreatureData.skills[skill.name].ability : "";
				var mod = creature.stats.abilityScoreModifiers[ability];
				if(skill.value != undefined)
					mod = skill.value;
				else if(skill.proficient)
					mod = mod + creature.stats.proficiencyBonus;
				skill.modifier = mod;
				var sign = "+";
					if(mod<0)
						sign = "–";
				skill.modifierStr = skill.name+" "+sign+Math.abs(mod);
			}
		}
		//passive perception
		if(creature.stats && creature.stats.senses && creature.stats.abilityScoreModifiers){
			var mod = creature.stats.abilityScoreModifiers.wisdom;
			if(creature.stats.skills){
				for(var index in creature.stats.skills){
					if(creature.stats.skills[index].name=="Perception")
					{
						mod = creature.stats.skills[index].modifier;
						break;
					}
				}
			}
			creature.stats.passivePerception = 10 + mod;
		}
		//challenge rating
		if(creature.stats && creature.stats.challengeRating!=undefined){
			if(creature.stats.challengeRating==0.125)
				creature.stats.challengeRatingStr = "1/8";
			else if(creature.stats.challengeRating==0.25)
				creature.stats.challengeRatingStr = "1/4";
			else if(creature.stats.challengeRating==0.5)
				creature.stats.challengeRatingStr = "1/2";
			else
				creature.stats.challengeRatingStr = creature.stats.challengeRating.toString();
		}
	}

	CreatureAPI.get = function(id, success, error){
		CachedResourceAPI.prototype.get.call(this, id, function(data){
			CreatureAPI.calculateCreatureDetails(data);
			if(success)
				success(data);
		}, error);
	}

	delete [CreatureAPI.getAll];

	CreatureAPI.create = function(data, success, error){
		CachedResourceAPI.prototype.create.call(this, data, function(data){
			CreatureAPI.calculateCreatureDetails(data);
			if(success)
				success(data);
		}, error);
	}

	CreatureAPI.update = function(id, data, success, error){
		CachedResourceAPI.prototype.update.call(this, id, data, function(data){
			CreatureAPI.calculateCreatureDetails(data);
			if(success)
				success(data);
		}, error);
	}

	var currentSkillsId = undefined;	//track the current Skills - clear cache if it changes, otherwise cache things. This way we have one Skills's worth of creatures cached but no more - don't want to use too much memory.
  var pagesAdded = {};
  function updateCurrentSkills(id,cache){
  	currentSkillsId = id;
  	pagesAdded = {};
  	cache.clear();
  }
  function isDataInCache(SkillsId,page){
  	return(currentSkillsId != undefined &&
  					SkillsId == currentSkillsId &&
  					pagesAdded[page]);
  }

  CreatureAPI.getAllForSkills = function(SkillsId, success, error){
  	if(!isDataInCache(SkillsId,1)){	//if Skills has changed, pull new data from server
  		updateCurrentSkills(SkillsId,this.cache);	//update current Skills
	    $resource("/api/bestiaries/:id/creatures").query({ 'id': SkillsId}, (function(data){
	    	pagesAdded[1] = true;
	    	for(var i=0;i<data.length;i++){
	    		this.cache.add(data[i]._id,data[i]);
	    		CreatureAPI.calculateCreatureDetails(data[i]);
	    	}
	    	if(success)
	    		success(data);
	    }).bind(this),error);
	  }
	  else {		//if Skills hasn't changed, get data from cache
	  	var allCreatures = this.cache.getAll();
	  	var SkillsCreatures = [];
	  	for(var i=0;i<allCreatures.length;i++){
	  		if(allCreatures[i].SkillsId == SkillsId)
	  			SkillsCreatures.push(allCreatures[i]);
	  	}
	  	setTimeout(function(){
	  		success(SkillsCreatures);
	  	});
	  }
  }

  CreatureAPI.getAllForPublishedSkills = function(publishedSkillsId, page, success, error){
  	if(!isDataInCache(publishedSkillsId,page)){	//if Skills has changed, pull new data from server
  		updateCurrentSkills(publishedSkillsId,this.cache);	//update current Skills
  		var query = {
  			'id': publishedSkillsId,
  			'page': page
  		};
	    $resource("/api/publishedbestiaries/:id/creatures/:page").query(query, (function(data){
	    	pagesAdded[page] = true;
	    	for(var i=0;i<data.length;i++){
	    		this.cache.add(data[i]._id,data[i]);
	    		CreatureAPI.calculateCreatureDetails(data[i]);
	    	}
	    	if(success)
	    		success(data);
	    }).bind(this),error);
	  }
	  else {		//if Skills hasn't changed, get data from cache
	  	var allCreatures = this.cache.getAll();
	  	var SkillsCreatures = [];
	  	for(var i=0;i<allCreatures.length;i++){
	  		if(allCreatures[i].publishedSkillsId == publishedSkillsId)
	  			SkillsCreatures.push(allCreatures[i]);
	  	}
	  	setTimeout(function(){
	  		success(SkillsCreatures);
	  	});
	  }
  }

  CreatureAPI.deleteAllForPublishedSkills = function(publishedSkillsId, success, error){
		var query = {
			'id': publishedSkillsId
		};
    $resource("/api/publishedbestiaries/:id/creatures").delete(query, (function(data){
    	if(publishedSkillsId==currentSkillsId)
    		pagesAdded = {};
    	if(success)
    		success(data);
    }).bind(this),error);
  }

  return CreatureAPI;
});
