
//Get mongoose Creature model
var Creature = require('../models/creature');
var Skills = require('../models/Skills');
var PublishedSkills = require('../models/publishedSkills');
var jwt = require("jsonwebtoken");
var config = require("../config");
exports.PAGE_SIZE = 25;

var authenticateSkillsByOwner = function(req, Skills, callback){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,config.secret,function(err,decoded){
            if(err)
                callback("Failed to authenticate token.");
            else{
                if(decoded._doc._id != Skills.ownerId)
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

var authenticatePublishedSkillsByOwner = function(req, publishedSkills, callback){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,config.secret,function(err,decoded){
            if(err)
                callback("Failed to authenticate token.");
            else{
                var ownerId = publishedSkills.owner._id || publishedSkills.owner;
                if(decoded._doc._id != ownerId)
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

var authenticateCreatureBySkills = function(req, creature, callback){
    if(creature.SkillsId && creature.publishedSkillsId){
        setTimeout(function () {
            callback("Creature cannot be in multiple bestiaries.")
        });
    }
    else if(creature.SkillsId){
        var query = {'_id':creature.SkillsId};
        Skills.findOne(query, function(err, doc){
            if(err)
                callback(err.message);
            else if(doc)
                authenticateSkillsByOwner(req, doc, callback);
            else
                callback("Skills not found.");
        });
    }
    else if(creature.publishedSkillsId){
        var query = {'_id':creature.publishedSkillsId};
        PublishedSkills.findOne(query, function(err, doc){
            if(err)
                callback(err.message);
            else if(doc)
                authenticatePublishedSkillsByOwner(req, doc, callback);
            else
                callback("Published Skills not found.");
        });
    }
    else{
        setTimeout(function() {
            callback(err.message)
        });
    }
}

var authenticateViewCreatureAccess = function(req, creature, callback) {
    if (creature.sharing && creature.sharing.linkSharingEnabled) {
        setTimeout(function() {
            callback(null)
        });
    } else {
        authenticateCreatureBySkills(req, creature, callback);
    }
}

exports.findById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    Creature.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateViewCreatureAccess(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else
                    res.send(doc);
            });
        }
        else{
            res.status(400).send("Creature not found");
        }
    });
};

exports.findAll = function(req, res) {
    Creature.find({}, function(err, docs) {
        if(err){
            res.status(400).send(err.message);
        }
        else{
            res.send(docs);
        }
    });
};

exports.create = function(req, res) {
    var creature = new Creature(req.body);

    authenticateCreatureBySkills(req, creature, function(err){
        if(err) {
            res.status(400).send(err);
        }
        else{
            creature.save(function (err, doc) {
                if(err) {
                    res.status(400).send(err.message);
                }
                else {
                    res.send(doc);
                }
            });
        }
    });
}

exports.updateById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};
    var creature = new Creature(req.body);
    var options = {
        upsert: true,       //creates if not found
        new: true           //retrieves new object from database and returns that as doc
    }

    Creature.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateCreatureBySkills(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    Creature.findOneAndUpdate(query, creature, options, function(err, doc){
                        if(err){
                            res.status(400).send(err.message);
                        }
                        else if(doc){
                            res.send(doc);
                        }
                    });
                }
            });
        }
        else{
            res.status(400).send("Creature not found");
        }
    });
}

exports.deleteById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    Creature.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateCreatureBySkills(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    Creature.findByIdAndRemove(query, function(err, doc, result){
                        if(err){
                            res.status(400).send(err.message);
                        }
                        else{
                            res.send(doc);
                        }
                    });
                }
            });
        }
        else{
            res.status(400).send("Creature not found");
        }
    });
}
