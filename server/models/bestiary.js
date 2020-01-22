var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

var SkillsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
    description: {
      type: String
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: false
    },
    lastActive: {
      type: Date
    }
  });
SkillsSchema.plugin(autopopulate);

module.exports = mongoose.model('Skills',SkillsSchema);
