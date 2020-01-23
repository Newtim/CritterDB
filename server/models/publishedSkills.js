var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
var Skill = require('./skill');
var Like = require('./like');
var Favorite = require('./favorite');
var Comment = require('./comment');

var PublishedSkillsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
    description: {
      type: String
    },
    owner: {  //I wish we could call this 'ownerId' and then autopopulate a field called 'owner' but we can't
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: {
        select: '_id username'  //only get public fields
      }
    },
    likes: [Like.schema],
    favorites: [Favorite.schema],
    comments: [Comment.schema],
    popularity: {
      type: Number,
      default: 0
    }
  });
PublishedSkillSchema.plugin(autopopulate);

module.exports = mongoose.model('PublishedSkills',PublishedSkillsSchema);
