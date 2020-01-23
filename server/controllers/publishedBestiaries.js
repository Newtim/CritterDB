
//Get mongoose model
var PublishedSkills = require('../models/publishedSkills');
var Comment = require('../models/comment');
var Creature = require('../models/creature');
var jwt = require("jsonwebtoken");
var config = require("../config");
var users = require("../controllers/users");
var creatures = require("../controllers/creatures");
var mongodb = require("mongodb");
var PAGE_SIZE = 10;
var MAX_PAGE = 20;

var authenticateSkillsByOwner = function(req, Skills, callback){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,config.secret,function(err,decoded){
            if(err)
                callback("Failed to authenticate token.");
            else{
                var SkillsOwnerId = Skills.owner._id || Skills.owner;
                if(decoded._doc._id != SkillsOwnerId)
                    callback("Not authorized for access.");
                else
                    callback(null);
            }
        });
    }
    else{
        callback("No token provided.");
    }
}

var getCurrentUserId = function(req, callback){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,config.secret,function(err,decoded){
            if(err)
                callback("Failed to authenticate token.");
            else{
                callback(null,decoded._doc._id);
            }
        });
    }
    else{
        callback("No token provided.");
    }
}

var populateOptions = [
    {
        path: 'owner',
        select: '_id username'
    },
    {
        path: 'comments',
        populate: {
            path: 'author',
            select: '_id username'
        }
    }
];

//Trims a Skills so that the returned document only includes key details
function getTrimmedSkills(Skills){
    var trimmed = {
        _id: Skills._id,
        name: Skills.name,
        description: Skills.description,
        owner: Skills.owner,
        numLikes: Skills.likes.length,
        numFavorites: Skills.favorites.length,
        numComments: Skills.comments.length
    };
    if(Skills.creatures)
        trimmed.numCreatures = Skills.creatures.length;
    return(trimmed);
}

function getTrimmedSkillsList(SkillsList){
    var trimmedList = [];
    for(var i=0;i<SkillsList.length;i++)
        trimmedList.push(getTrimmedSkills(SkillsList[i]));
    return(trimmedList);
}

exports.findById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    PublishedSkills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            //Do not authenticate by owner because this is public
            res.send(doc);
        }
        else{
            res.status(400).send("Skills not found.");
        }
    });
};

exports.findAll = function(req, res) {
    PublishedSkills.find({}, function(err, docs) {
        if(err){
            res.status(400).send(err.message);
        }
        else{
            res.send(docs);
        }
    });
};

exports.create = function(req, res) {
    //Handle the case where user sends an owner object instead of an owner id, since the field name
    //'owner' can be confusing.
    if(req.body && req.body.owner && req.body.owner._id)
        req.body.owner = req.body.owner._id;
    var publishedSkills = new PublishedSkills(req.body);
    authenticateSkillsByOwner(req, publishedSkills, function(err){
        if(err)
            res.status(400).send(err);
        else{
            publishedSkills.save(function (err, doc) {
                if(err) {
                    res.status(400).send(err.message);
                }
                else {
                    doc.populate(populateOptions, function(err) {
                        if(err)
                            res.status(400).send(err.message);
                        else{
                            res.send(doc);
                        }
                    });
                }
            });
        }
    });
}

//POST accepting:
//name
//description
// - The other fields are not mutable and cannot be changed by updating this data object.
exports.updateById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    PublishedSkills.findOne(query, function (err, existingDoc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(existingDoc){
            authenticateSkillsByOwner(req, existingDoc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    //Set fields that are mutable
                    if(req.body.name)
                        existingDoc.name = req.body.name;
                    if(req.body.description)
                        existingDoc.description = req.body.description;
                    existingDoc.save(function(err, doc) {
                        if(err)
                            res.status(400).send(err.message);
                        else{
                            res.send(existingDoc);
                        }
                    });
                }
            });
        }
        else{
            res.status(400).send("Skills not found.");
        }
    });
}

exports.deleteById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    PublishedSkills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateSkillsByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    PublishedSkills.findByIdAndRemove(query, function(err, doc, result){
                        if(err)
                            res.status(400).send(err.message);
                        else{
                            //Delete all creatures as well
                            var deleteQuery = {
                                publishedSkillsId: id
                            };
                            Creature.remove(deleteQuery).exec();
                            //Don't wait on creature deletion to return
                            res.send(doc);
                        }
                    });
                }
            });
        }
        else{
            res.status(400).send("Skills not found.");
        }
    });
}

var generateLikeForUserId = function(userId){
    var like = {
        'userId': userId
    };
    return(like);
}

//Creates a like for the current user, if one does not already exist in the list of likes
exports.createLike = function(req, res) {
    var SkillsId = req.params.id;
    var query = {'_id':SkillsId};
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var like = generateLikeForUserId(currentUserId);
            var update = {
                $addToSet: { 
                    likes: like
                },
                $inc: {
                    popularity: 1
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else{
                        res.send(doc);
                    }
                });
        }
    });
}

//Deletes a like for the current user, if one exists
exports.deleteLike = function(req, res) {
    var SkillsId = req.params.id;
    var query = {'_id':SkillsId};
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var update = {
                $pull: {
                    likes: {
                        userId: currentUserId
                    }
                },
                $inc: {
                    popularity: -1
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else{
                        res.send(doc);
                    }
                });
        }
    });
}

var generateFavoriteForUserId = function(userId){
    var favorite = {
        'userId': userId
    };
    return(favorite);
}

//Creates a favorite for the current user, if one does not already exist in the list of favorites
exports.createFavorite = function(req, res) {
    var SkillsId = req.params.id;
    var query = {'_id':SkillsId};
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var favorite = generateFavoriteForUserId(currentUserId);
            var update = {
                $addToSet: { 
                    favorites: favorite
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else{
                        res.send(doc);
                    }
                });
        }
    });
}

//Deletes a favorite for the current user, if one exists
exports.deleteFavorite = function(req, res) {
    var SkillsId = req.params.id;
    var query = {'_id':SkillsId};
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var update = {
                $pull: {
                    favorites: {
                        userId: currentUserId
                    }
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else{
                        res.send(doc);
                    }
                });
        }
    });
}

exports.findRecent = function(req, res) {
    var page = Math.min(req.params.page || 1, MAX_PAGE);
    var sort = {
        _id: -1
    };
    PublishedSkills.find().
        sort(sort).
        skip(PAGE_SIZE * (page-1)).
        limit(PAGE_SIZE).
        exec(function (err, docs) {
            if(err){
                res.status(400).send(err.message);
            }
            else{
                var trimmedBestiaries = getTrimmedSkillsList(docs); //trim docs of creatures, comments, etc to improve speeds
                res.send(trimmedBestiaries);
            }
        });
}

exports.findPopular = function(req, res) {
    var page = Math.min(req.params.page || 1, MAX_PAGE);
    var sort = {
        popularity: -1
    };
    PublishedSkills.find().
        sort(sort).
        skip(PAGE_SIZE * (page-1)).
        limit(PAGE_SIZE).
        exec(function (err, docs) {
            if(err){
                res.status(400).send(err.message);
            }
            else{
                var trimmedBestiaries = getTrimmedSkillsList(docs); //trim docs of creatures, comments, etc to improve speeds
                res.send(trimmedBestiaries);
            }
        });
}

exports.findFavorites = function(req, res) {
    var page = req.params.page || 1;
    var sort = {
        _id: -1
    };
    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var query = {
                favorites: {
                    $elemMatch: {
                        userId: currentUserId
                    }
                }
            };
            PublishedSkills.find(query).
                sort(sort).
                skip(PAGE_SIZE * (page-1)).
                limit(PAGE_SIZE).
                exec(function (err, docs) {
                    if(err){
                        res.status(400).send(err.message);
                    }
                    else{
                        var trimmedBestiaries = getTrimmedSkillsList(docs); //trim docs of creatures, comments, etc to improve speeds
                        res.send(trimmedBestiaries);
                    }
                });
        }
    });
}

exports.findOwned = function(req, res) {
    var page = req.params.page || 1;
    var sort = {
        _id: -1
    };
    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var query = {
                owner: currentUserId
            };
            PublishedSkills.find(query).
                sort(sort).
                skip(PAGE_SIZE * (page-1)).
                limit(PAGE_SIZE).
                exec(function (err, docs) {
                    if(err){
                        res.status(400).send(err.message);
                    }
                    else{
                        var trimmedBestiaries = getTrimmedSkillsList(docs); //trim docs of creatures, comments, etc to improve speeds
                        res.send(trimmedBestiaries);
                    }
                });
        }
    });
}

exports.findByOwner = function(req, res) {
    var page = req.params.page || 1;
    var sort = {
        _id: -1
    };
    var query = {
        owner: req.params.id
    };
    PublishedSkills.find(query).
        sort(sort).
        skip(PAGE_SIZE * (page-1)).
        limit(PAGE_SIZE).
        exec(function (err, docs) {
            if(err){
                res.status(400).send(err.message);
            }
            else{
                var trimmedBestiaries = getTrimmedSkillsList(docs); //trim docs of creatures, comments, etc to improve speeds
                res.send(trimmedBestiaries);
            }
        });
}

exports.createComment = function(req, res) {
    var SkillsId = req.params.id;
    var query = {'_id':SkillsId};
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }
    var comment = new Comment(req.body);

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else if(currentUserId != comment.author)
            res.status(400).send("Not authorized for that action.");
        else{
            var update = {
                $addToSet: { 
                    comments: comment
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else{
                        res.send(doc);
                    }
                });
        }
    });
}

exports.updateCommentById = function(req, res) {
    var SkillsId = req.params.id;
    var commentId = req.params.commentId;
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var query = {
                _id: SkillsId,
                comments: {
                    $elemMatch: {
                        author: currentUserId,      //make sure the author is editing it, not someone else
                        _id: commentId
                    }
                }
            };
            var update = {
                $set: {
                    'comments.$.text': req.body.text    //update only mutable fields
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else if(doc){
                        res.send(doc);
                    }
                    else {
                        res.status(400).send("Document not found");
                    }
                });
        }
    });
}

exports.deleteCommentById = function(req, res) {
    var SkillsId = req.params.id;
    var commentId = req.params.commentId;
    var query = {'_id':SkillsId};
    var options = {
        new: true           //retrieves new object from database and returns that as doc
    }

    getCurrentUserId(req, function(err,currentUserId){
        if(err)
            res.status(400).send(err);
        else{
            var update = {
                $pull: {
                    comments: {
                        author: currentUserId,      //make sure the author is deleting it, not someone else
                        _id: commentId
                    }
                }
            };
            PublishedSkills.findOneAndUpdate(query, update, options)
                .populate(populateOptions)
                .exec(function (err, doc) {
                    if(err)
                        res.status(400).send(err.message);
                    else{
                        res.send(doc);
                    }
                });
        }
    });
}

exports.search = function(req, res) {
    var page = req.params.page || 1;
    var sort = {
        _id: -1
    };
    var query = {
    };
    if(req.body.name){
        query.name = {
            $regex: new RegExp(req.body.name,"i")
        };
    }
    if(req.body.author){
        query.author = req.body.author;
    }
    console.log("query: "+JSON.stringify(query));
    PublishedSkills.find(query).
        sort(sort).
        skip(PAGE_SIZE * (page-1)).
        limit(PAGE_SIZE).
        exec(function (err, docs) {
            if(err){
                res.status(400).send(err.message);
            }
            else{
                var trimmedBestiaries = getTrimmedSkillsList(docs); //trim docs of creatures, comments, etc to improve speeds
                res.send(trimmedBestiaries);
            }
        });
}

exports.findMostPopular = function(req, res) {
    var age = req.query.age || 2628000000;   //max age in milliseconds. default is 1 week.
    var page = Math.min(req.params.page || 1, MAX_PAGE);
    var sort = {
        popularity: -1
    };
    //Build mongo ObjectID to represent minimum object ID allowed, as ObjectId's beginning bytes are a timestamp
    var oldestDate = new Date(new Date().getTime() - age);
    var timestamp = Math.floor(oldestDate.getTime() / 1000);
    var hex = timestamp.toString(16) + "0000000000000000";
    var objIdMin = new mongodb.ObjectId(hex);
    var query = {
        _id: {
            $gt: objIdMin
        }
    };
    PublishedSkills.find(query).
        sort(sort).
        limit(1).
        exec(function (err, docs) {
            if(err){
                res.status(400).send(err.message);
            }
            else{
                if(docs.length>0)
                    res.send(docs[0]);
                else
                    res.send("");
            }
        });
}

exports.findCreaturesBySkills = function(req, res) {
    var page = req.params.page;
    var id = req.params.id;
    var sort = {
        name: 1
    };
    const query = Object.assign({},req.query);
    if(query.name) {
        query.name = {
            $regex: new RegExp(query.name, "i")
        };
    }
    query.publishedSkillsId = id;
    Creature.find(query).
        sort(sort).
        skip(creatures.PAGE_SIZE * (page-1)).
        limit(creatures.PAGE_SIZE).
        exec(function(err, docs){
            if(err)
                res.status(400).send(err.message);
            else{
                res.send(docs);
            }
        });
};

exports.deleteCreaturesBySkills = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    PublishedSkills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateSkillsByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    var deleteQuery = {
                        publishedSkillsId: id
                    };
                    Creature.remove(deleteQuery).exec(function(err, docs){
                        if(err)
                            res.status(400).send(err.message);
                        else{
                            res.send(docs);
                        }
                    });
                }
            });
        }
        else{
            res.status(400).send("Skills not found.");
        }
    });
};