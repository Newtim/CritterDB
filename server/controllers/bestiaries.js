
//Get mongoose model
var Skills = require('../models/Skills');
var Creature = require('../models/creature');
var jwt = require("jsonwebtoken");
var config = require("../config");

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

exports.findById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    Skills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateSkillsByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else
                    res.send(doc);
            });
        }
        else{
            res.status(400).send("Skills not found.");
        }
    });
};

exports.findAll = function(req, res) {
    Skills.find({}, function(err, docs) {
        if(err){
            res.status(400).send(err.message);
        }
        else{
            res.send(docs);
        }
    });
};

exports.create = function(req, res) {
    var Skills = new Skills(req.body);

    authenticateSkillsByOwner(req, Skills, function(err){
        if(err)
            res.status(400).send(err);
        else{
            Skills.save(function (err, doc) {
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
    var creature = new Skills(req.body);
    var options = {
        upsert: true,       //creates if not found
        new: true           //retrieves new object from database and returns that as doc
    }

    Skills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateSkillsByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    Skills.findOneAndUpdate(query, creature, options,function(err, doc){
                        if(err)
                            res.status(400).send(err.message);
                        else
                            res.send(doc);
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

    Skills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateSkillsByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    Skills.findByIdAndRemove(query, function(err, doc, result){
                        if(err)
                            res.status(400).send(err.message);
                        else{
                            //Delete all creatures as well
                            var deleteQuery = {
                                SkillsId: id
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

exports.findCreaturesBySkills = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    Skills.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.message);
        }
        else if(doc){
            authenticateSkillsByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    const creaturesQuery = Object.assign({},req.query);
                    if(creaturesQuery.name) {
                        creaturesQuery.name = {
                            $regex: new RegExp(creaturesQuery.name, "i")
                        };
                    }
                    creaturesQuery.SkillsId = doc._id;
                    Creature.find(creaturesQuery,
                        function(err, docs){
                            if(err)
                                res.status(400).send(err.message);
                            else
                                res.send(docs);
                        }
                    );
                }
            });
        }
        else{
            res.status(400).send("Skills not found");
        }
    });
};
