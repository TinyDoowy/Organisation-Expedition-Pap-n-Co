const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectID,
	trainer : String,
	userId : String,
	messageId : String,
	roleId : String,
	channelId : String,
	channelVocalId : String,
	collectorId : String,
	time: Date
});

module.exports = mongoose.model("Report", reportSchema);