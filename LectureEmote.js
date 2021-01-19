const Discord = require("discord.js");
var logger = require('winston');
var auth = require('./auth.json');
const ReportPap = require("./models/reports.js");

const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/Reports',{ useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);



module.exports.check = async (bot, msg) => {

    return new Promise(resolve => {
        var ranArray = [];
        var index = 0;
        msg.channel.messages.fetch(auth.messageFouille).then((message) => {
        message.reactions.cache.map((tabEmote) => tabEmote.users.fetch(msg.author.id).then(async (tabUsers) =>{ 
            var verif = tabUsers.map(ok => ok.id);
            if (verif.indexOf(msg.author.id)>=0){
                ranArray.push(1);
            }else{
                ranArray.push(0);
            }

            if (index>=3){
                resolve(ranArray);}

            index++;
        }))
    });
});
}
       

