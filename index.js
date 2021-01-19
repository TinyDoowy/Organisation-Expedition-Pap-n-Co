const Discord = require("discord.js");
var logger = require('winston');
var auth = require('./auth.json');
const ReportPap = require("./models/reports.js");
var emote = require('./LectureEmote.js');
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/Reports',{ useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client();
bot.login(auth.token);
bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});


//Les deux préfixes défini pour le bot de combat
const prefixAvec = "expédition";
const prefixSans = "expedition";
const prefixEnd = "end session";
const prefixKill = "kill";
const prefixBye = "bye";

const prefixRaid = "raid";

const prefixFouille = "je fouille";

const tabGalvagon = ["Galvagla","Hydragon","Hydragla"];
const tabGalvagla = ["Galvagon","Hydragon","Hydragla"];
const tabHydragon = ["Galvagon","Galvagla","Hydragla"];
const tabHydragla = ["Galvagon","Galvagla","Hydragon"];

const prefixClean = "blanco";

let tempMessage;
let linkPokemon;

bot.on('message', async function (message, user) {

    petitMessage = message.content.toLowerCase();
    //const role = message.guild.roles.get(auth.roleDynamax); // Replace with Updates ID
 
    // arrête la lecture du message si l'auteur est le bot.
if (message.author.bot) return;

if (message.channel.parent==auth.categorieMonche){
    if(petitMessage.startsWith(prefixClean)&&(message.member.roles.cache.has(auth.roleStaff)||message.member.roles.cache.has(auth.roleMonche))&&(!message.member.roles.cache.has(auth.roleMuteMonche))) {
        message.delete();

        const argsNumber = message.content.split(' ').slice(1); // All arguments behind the command name with the prefix
        const quantite = argsNumber.join(' '); // Amount of messages which should be deleted

        if (!quantite) return message.reply(" vous n'avez pas saisi de valeur à chercher.").then(msg => msg.delete({ timeout: 5000 }));
        if (isNaN(quantite)) return message.reply(" le paramètre que vous avez saisi n'est pas un nombre.").then(msg => msg.delete({ timeout: 5000 }));
        if (quantite>100) return message.reply(" le nombre de message à effacer est trop grand.").then(msg => msg.delete({ timeout: 5000 }));

        const fetched = await message.channel.messages.fetch({ limit: quantite });
        const notPinned = await fetched.filter(fetchedMsg => !fetchedMsg.pinned);
        await message.channel.bulkDelete(notPinned);
    }
}


if (message.channel.id==auth.salonFossile){
    if(petitMessage.startsWith(prefixFouille)&&message.member.roles.cache.has(auth.roleAvantFouille)&&!message.member.roles.cache.has(auth.roleApresFouille)){
        await setTimeout(function() {message.delete()}, 10);

        emoteFossiles = await emote.check(bot, message);
        console.log("tabTemp0 : "+emoteFossiles[0]);
        console.log("tabTemp1 : "+emoteFossiles[1]);
        console.log("tabTemp2 : "+emoteFossiles[2]);
        console.log("tabTemp2 : "+emoteFossiles[3]);

        var totalFossiles = (emoteFossiles[0]*1)+(emoteFossiles[1]*2)+(emoteFossiles[2]*4)+(emoteFossiles[3]*8);

        console.log("totalFossiles : "+totalFossiles);

        var quelFossile = Math.floor(totalFossiles%4);
        var autreFossile = Math.floor((Math.random()*3));

        switch (quelFossile) {
            case 0 :
                console.log("Galvagon");
                console.log(tabGalvagon[autreFossile]);
                await message.channel.send("Bravo <@"+message.author.id+"> ! Ta fouille t'a permis de remporter Galvagon et "+tabGalvagon[autreFossile]+" !").then(async pourPin => {pourPin.pin();});
            break;
            case 1 :
                console.log("Galvagla");
                console.log(tabGalvagla[autreFossile]);
                await message.channel.send("Bravo <@"+message.author.id+"> ! Ta fouille t'a permis de remporter Galvagla et "+tabGalvagla[autreFossile]+" !").then(async pourPin => {pourPin.pin();});
            break;
            case 2 : 
                console.log("Hydragon");
                console.log(tabHydragon[autreFossile]);
                await message.channel.send("Bravo <@"+message.author.id+"> ! Ta fouille t'a permis de remporter Hydragon et "+tabHydragon[autreFossile]+" !").then(async pourPin => {pourPin.pin();});
            break;
            case 3 : 
                console.log("Hydragla");
                console.log(tabHydragla[autreFossile]);
                await message.channel.send("Bravo <@"+message.author.id+"> ! Ta fouille t'a permis de remporter Hydragla et "+tabHydragla[autreFossile]+" !").then(async pourPin => {pourPin.pin();});
            break;
            default : break;
        }


        await message.guild.members.fetch(message.author.id).then((auteurRaid) => {
                        auteurRaid.roles.add(auth.roleApresFouille);})
        return;

    }else if(petitMessage.startsWith(prefixFouille)&&message.member.roles.cache.has(auth.roleApresFouille)){
        await setTimeout(function() {message.delete()}, 10);
        await message.channel.send("Désolé <@"+message.author.id+"> ! Mais tu as déjà effectué ta fouille !")
        return;
    }else{return;}
}


if (petitMessage.startsWith(prefixRaid)&&message.member.roles.cache.has(auth.roleStaff) ) {
    await setTimeout(function() {message.delete()}, 100);
    var emoteRaid = ":grey_question:";
    const infoRaid = await message.content.split(' ').slice(1);

    if (!infoRaid[0]) return message.reply(" vous n'avez pas saisi d'emote à afficher.").then(msg => msg.delete({ timeout: 5000 }));

    var str = infoRaid[0];
    var one = str.split(":");
    var two = one[2];
    if(two)
        {var res = two.slice(0, 18);}
    else{var res = infoRaid[0]}

    if (!infoRaid[1]) return message.reply(" vous n'avez pas saisi de nombre d'étoiles à afficher.").then(msg => msg.delete({ timeout: 5000 }));
    if (isNaN(infoRaid[1])) return message.reply(" le paramètre que vous avez saisi n'est pas un nombre d'étoiles.").then(msg => msg.delete({ timeout: 5000 }));

    if(infoRaid[1]==1)
        {emoteRaid = ":star:";}
    else if(infoRaid[1]==2)
        {emoteRaid = ":star: :star:";}
    else if(infoRaid[1]==3)
        {emoteRaid = ":star: :star: :star:";}
    else if(infoRaid[1]==4)
        {emoteRaid = ":star: :star: :star: :star:";}
    else if(infoRaid[1]==5)
        {emoteRaid = ":star: :star: :star: :star: :star:";}

    message.guild.channels.cache.get(auth.salonRaid).send(infoRaid[0]+" "+emoteRaid).then(async sentClue => {await sentClue.react(res);});
    return;
}


if (petitMessage.startsWith(prefixKill)&&message.member.roles.cache.has(auth.roleStaff)&&message.channel.id==auth.channelInfos){
        
        await setTimeout(function() {message.delete()}, 10);
        console.log("coucou");

        const taggedUser = message.mentions.users.first();

        if (!taggedUser) return message.author.send("Vous n'avez pas saisi de pseudo à chercher.").then(msg => msg.delete({ timeout: 10000 }));
        if (isNaN(taggedUser)) return message.author.send("Le paramètre que vous avez saisi n'est pas un pseudo.").then(msg => msg.delete({ timeout: 10000 }));

        const NicknameOut = await bot.users.fetch(taggedUser.id);

        var ficheFin = await ReportPap.findOne({userId: NicknameOut.id});

        // si pas de fiche existante, on créé la fiche
        if (!ficheFin) { 
            return message.author.send("Désolé ! Mais "+NicknameOut.username+" n'a pas d'expédition en cours !").then(msg => msg.delete({ timeout: 15000 }));
        }

            const fetchedChannelVocal = message.guild.channels.cache.get(ficheFin.channelVocalId).delete();
            const fetchedChannel = message.guild.channels.cache.get(ficheFin.channelId).delete();
            const fetchedRole = message.guild.roles.cache.get(ficheFin.roleId).delete();
            const InitChannel = message.guild.channels.cache.get(auth.channelInfos);
            console.log(InitChannel);
            await InitChannel.messages.cache.get(ficheFin.messageId).delete();

            await ReportPap.deleteOne({ userId: NicknameOut.id })

            //await ReportPap.findOneAndUpdate({ userId: NicknameOut.id }, { trainer:0,messageId:0,roleId:0,channelId:0,channelVocalId:0,collectorId:0,time:Date() });
};



if (petitMessage.startsWith(prefixBye)){
    var ficheCmd = await ReportPap.findOne({ userId: message.author.id });
        // si pas de fiche existante, on stop
        if (!ficheCmd) { 
            return;
             }

    if((message.channel.id==ficheCmd.channelId||message.channel.id==auth.channelInfos)&&(message.author.id==ficheCmd.userId||message.author.id==auth.roleStaff)){

        await setTimeout(function() {message.delete()}, 10);
        const taggedUser = message.mentions.users.first();

        if (!taggedUser) return message.author.send("Vous n'avez pas saisi de pseudo à chercher.").then(msg => msg.delete({ timeout: 10000 }));
        if (isNaN(taggedUser)) return message.author.send("Le paramètre que vous avez saisi n'est pas un pseudo.").then(msg => msg.delete({ timeout: 10000 }));

        const NicknameOut = await bot.users.fetch(taggedUser.id);
        const fetchedRole = message.guild.roles.cache.get(ficheCmd.roleId);

        const msg = await message.guild.channels.cache.get(auth.channelInfos).messages.fetch(ficheCmd.messageId);
        msg.reactions.resolve(auth.emoteDynamax).users.remove(NicknameOut.id);

        await message.guild.members.fetch(NicknameOut.id).then((personKicked) => {
                    personKicked.roles.remove(fetchedRole);})
    
    };
};



if (petitMessage.startsWith(prefixEnd)){
    var ficheCmd = await ReportPap.findOne({ userId: message.author.id }, 'channelId' );

        // si pas de fiche existante, on créé la fiche
        if (!ficheCmd) { 
            return;
             }


    if(message.channel.id==ficheCmd.channelId||message.channel.id==auth.channelInfos){

        await setTimeout(function() {message.delete()}, 10);

    var ficheFin = await ReportPap.findOne({userId: message.author.id});

            const fetchedChannelVocal = message.guild.channels.cache.get(ficheFin.channelVocalId).delete();
            const fetchedChannel = message.guild.channels.cache.get(ficheFin.channelId).delete();
            const fetchedRole = message.guild.roles.cache.get(ficheFin.roleId).delete();
            const InitChannel = message.guild.channels.cache.get(auth.channelInfos);
            await InitChannel.messages.cache.get(ficheFin.messageId).delete();


            await ReportPap.deleteOne({ userId: message.author.id })

    
    };
};

if (message.channel.id==auth.channelInfos){
    // effacer les messages qui contiennent la commande
    if (petitMessage.startsWith(prefixAvec)||petitMessage.startsWith(prefixSans)){
        message.delete();

        //const commandExtra = petitMessage.slice(prefixSans.length+1);
        const argsPoke = petitMessage.split(' ');
        const Pokemon = argsPoke[1];
        switch (Pokemon){
            case "artikodin" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930412/a0f70e9d3313673afa213313d2864bfa.png/show';break;
            case "électhor" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930416/c32de00fb237ab8ad869e42fb497bbd9.png/show';break;
            case "electhor" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930416/c32de00fb237ab8ad869e42fb497bbd9.png/show';break;
            case "sulfura" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930418/749c8f5f2ef71af7dadd5f8eab845e35.png/show';break;
            case "mewtwo" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930420/99bfb5c1b810d40117f88bd84f3c908f.png/show';break;
            case "raikou" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930422/affb68413c53364e01aafd7c8b51a293.png/show';break;
            case "entei" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930424/4d97d1f2b1d516f62f18e24089a193e7.png/show';break;
            case "suicune" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930425/f286cfbb1c2e7555b84dba694468e472.png/show';break;
            case "lugia" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930427/459b0ae341152efb91321c653a002185.png/show';break;
            case "ho-oh" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930432/e2f7d61509b1a2905d4400c42846b51b.png/show';break;
            case "latias" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930441/dbb86a02587409036f59e57e343f42b2.png/show';break;
            case "latios" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930445/9609c77642192997fe4a4f05502b21bf.png/show';break;
            case "kyogre" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930458/b410eeadc108ed90098ed462ea00b07e.png/show';break;
            case "groudon" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930453/97f7fac368d20f0e5d1f78c62aa4b266.png/show';break;
            case "rayquaza" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930464/a97ff2efb8b297127664c6b2a17a8913.png/show';break;
            case "créhelf" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930473/53b943609c1fea238d1aa5f623a0a581.png/show';break;
            case "crehelf" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930473/53b943609c1fea238d1aa5f623a0a581.png/show';break;
            case "créfollet" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930481/4b70aa5211f65eb8a224b0aed2ddf4a4.png/show';break;
            case "crefollet" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930481/4b70aa5211f65eb8a224b0aed2ddf4a4.png/show';break;
            case "créfadet" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930484/5dce8c97bcf8689d09e647d87d05defc.png/show';break;
            case "crefadet" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930484/5dce8c97bcf8689d09e647d87d05defc.png/show';break;
            case "dialga" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930518/05eb3c2a7cb23db6ff54ced7dc4e4024.png/show';break;
            case "palkia" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930524/d23fe446f1d87b82ad66f11933d80294.png/show';break;
            case "heatran" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930489/37e37291bc33727c2cffeb3d8e00225a.png/show';break;
            case "giratina" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930536/89dc88560ee62c64a4636daa7fe69cbb.png/show';break;
            case "cresselia" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930487/2f7217560c1684f04d3bac049ae33da9.png/show';break;
            case "boréas" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930563/8d64d79098bbab4cb03dd9bc331fae77.png/show';break;
            case "boreas" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930563/8d64d79098bbab4cb03dd9bc331fae77.png/show';break;
            case "fulguris" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930557/a05cecfbfecc724dd15a252d35d28a60.png/show';break;
            case "démétéros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "demétéros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "démetéros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "déméteros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "demetéros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "démeteros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "deméteros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "demeteros" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930566/c4379b78592649a08091563bee1e5835.png/show';break;
            case "reshiram" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930569/c91db212920960ce18cba005814e15ab.png/show';break;
            case "zekrom" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930574/79964c460a0f5bbe72d5ea85a0f7b3f2.png/show';break;
            case "kyurem" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930580/2c2174c2f26fd6278583d7a4a6e86295.png/show';break;
            case "xerneas" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930586/3344dd7654d2556ea8c0cd2d1733abd5.png/show';break;
            case "yveltal" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930588/7b34100f991faae0df97d9ee87a5b2ef.png/show';break;
            case "zygarde" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930589/c3d5c45a629047e5c7dfed573f5e56e4.png/show';break;
            case "tokorico" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930592/368d627dea8a8302a7a55bdfa59f6240.png/show';break;
            case "tokopiyon" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930594/ab137a9e89cf604990a45cbfad3d2937.png/show';break;
            case "tokotoro" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930599/c6f8b587cb5d2a9270fa9fb58b6a9dfe.png/show';break;
            case "tokopisco" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930606/b45ef3877009e62bdbe4de7eaf387703.png/show';break;
            case "solgaleo" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930611/ab5d8010f5231316a0f1363e189b08ee.png/show';break;
            case "lunala" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/3930618/c0a085b4f57640cb02c43d7961295645.png/show';break;
            case "zéroïd" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217830/b453c19be69989f6980303e50a00051e.png/show';break;
            case "zéroid" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217830/b453c19be69989f6980303e50a00051e.png/show';break;
            case "zeroïd" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217830/b453c19be69989f6980303e50a00051e.png/show';break;
            case "zeroid" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217830/b453c19be69989f6980303e50a00051e.png/show';break;
            case "mouscoto" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217886/d3de646a0e69a940be5f874548aef5a6.png/show';break;
            case "cancrelove" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217815/09053cbe1cbe38dad0a6928eedbb0a05.png/show';break;
            case "câblifère" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217831/e7cb81b54183e7167675ce4bfb01662a.png/show';break;
            case "câblifere" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217831/e7cb81b54183e7167675ce4bfb01662a.png/show';break;
            case "cablifère" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217831/e7cb81b54183e7167675ce4bfb01662a.png/show';break;
            case "cablifere" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217831/e7cb81b54183e7167675ce4bfb01662a.png/show';break;
            case "bamboiselle" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217890/b271dcc659375f494552ac1687733b63.png/show';break;
            case "katagami" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217850/e9994ab4c2dc3c4641f15becbe2ec579.png/show';break;
            case "engloutyran" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217891/c4855e22257bacf772e10d89608f015d.png/show';break;
            case "necrozma" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/4036959/1fe5c592c7d9e404a7a7ee0c98043e31.png/show';break;
            case "ama-ama" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217854/2c5551f557b9e047baf5e7c9e6f403ee.png/show';break;
            case "pierroteknik" : Pokemonname = Pokemon.toUpperCase(); console.log(Pokemonname); linkPokemon = 'https://img.game8.jp/2217849/b49e7d05844c7ef9719d02ca627a9684.png/show';break;
            default : Pokemonname = "MYSTÈRE"; console.log(Pokemonname); linkPokemon = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-180px-Question_mark_alternate.svg.png";break;}

        var fiche = await ReportPap.findOne({userId: message.author.id});

        // si pas de fiche existante, on créé la fiche
        if (!fiche) { 
            await create(message);
        }

        // Create a new role with data and a reason
        let tempRole = await message.guild.roles.create({
            data: {
            name: 'expédition-'+message.author.username,
            color: 'WHITE',
                },
            permissionOverwrites: [{deny:['MENTION_EVERYONE']}],
            reason: "Voici le rôle de l'expédition proposé par : "+message.author.username,
        })

        // Create a new channel with permission overwrites
        let tempChannel = await message.guild.channels.create('expédition-'+message.author.username, {
            type: 'text',
            parent: auth.Categorie,
            permissionOverwrites: [
                {
                id: tempRole,
                allow: ['VIEW_CHANNEL','READ_MESSAGE_HISTORY','SEND_MESSAGES']
                    },
                {
                id: auth.roleEveryone,
                deny: ['VIEW_CHANNEL','READ_MESSAGE_HISTORY','SEND_MESSAGES']
                    },
                  ],
                })

        // Create a new channel with permission overwrites
        let tempChannelVocal = await message.guild.channels.create('expédition-'+message.author.username, {
            type: 'voice',
            parent: auth.Categorie,
            permissionOverwrites: [
                {
                id: tempRole,
                allow: ['VIEW_CHANNEL','READ_MESSAGE_HISTORY','SEND_MESSAGES']
                    },
                {
                id: auth.roleEveryone,
                deny: ['VIEW_CHANNEL','READ_MESSAGE_HISTORY','SEND_MESSAGES']
                    },
                  ],
                })

        //update la fiche de l'autheur.
        await ReportPap.findOneAndUpdate({ userId: message.author.id }, { trainer: message.author.username, roleId: tempRole, channelId: tempChannel, channelVocalId: tempChannelVocal, time:Date() });
        var ficheUpdate = await ReportPap.findOne({userId: message.author.id});
        console.log ('fiche de l utlisateur update: '+ficheUpdate);


        const messageAnnonce = `Salut <@`+message.author.id+`>, voici tes salons pour l'organisation de ton Expédition Dynamax.
Comment fonctionne le salon : à chaque fois que quelqu'un rejoindra ton expédition, un message sera posté sur le salon.
(*il n'y a pour le moment pas de limite au nombre de personnes qui rejoignent le salon*)

Vous avez à votre disposition un salon vocal qui s'appelle <#`+tempChannelVocal+`>.
                    
Enfin, une fois votre session terminée, il te suffira (à toi uniquement) de taper la commande :
__\`\`end session\`\`__
Ce qui aura pour effet, de supprimer tes salons, le rôle qui lui sont associé et ton annonce dans le salon <#`+auth.channelInfos+`>.

Si vous souhaitez continuer votre expédition mais qu'une personne n'en a plus besoin, vous pouvez lui retirer les accès en tapant la commande :
__\`\`bye @tagLaPersonne\`\`__

Merci d'avoir choisi nos services pour organiser des Expédition Dynamax.
Nous vous souhaitons bonne chance avec le légendaire __**`+Pokemonname+`**__!`

        const imageAnnonce = linkPokemon;

        await setTimeout(async function() {
            await message.guild.channels.cache.get(tempChannel.id).send(messageAnnonce).then(async pourPin => {
            await pourPin.pin();});
        }, 100)
        await setTimeout(async function() {
            await message.guild.channels.cache.get(tempChannel.id).send(imageAnnonce).then(async pourPin => {
            await pourPin.pin();});
        }, 200)
        await setTimeout(async function() {
            const fetched = await message.guild.channels.cache.get(tempChannel.id).messages.fetch({ limit: 5 });
            const notPinned = await fetched.filter(fetchedMsg => !fetchedMsg.pinned);
            await message.guild.channels.cache.get(tempChannel.id).bulkDelete(notPinned);
        }, 1000)

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Annonce d'une Expédition Dynamax __"+Pokemonname+"__")
            .setAuthor("Proposé par : "+message.author.username)
            .setDescription(message.author.username+` vous invite à rejoindre son expédition Dynamax.

                    Pour rejoindre il suffit de réagir à ce message ! <:GM:655756814763294750>
                    Attention, pas plus de 4 réactions sur la même annonce !

                                `)
                .setThumbnail(message.author.avatarURL())
                .setImage(linkPokemon);


        await message.channel.send(exampleEmbed).then(async sentClue => {
            await sentClue.react(auth.emoteDynamax);

            await ReportPap.findOneAndUpdate({ userId: message.author.id }, { messageId: sentClue, time:Date() });});

            await message.guild.members.fetch(message.author.id).then((auteurRaid) => {
                    auteurRaid.roles.add(tempRole);})

        const filter = (reaction, user) => {
        return (reaction.emoji.id === auth.emoteDynamax && user.id!=auth.roleBot);
        };

        var ficheCollect = await ReportPap.findOne({userId: message.author.id});


        const fetchedMessageId = message.guild.channels.cache.get(auth.channelInfos).messages.cache.get(ficheCollect.messageId);

        const tempCollector = fetchedMessageId.createReactionCollector(filter, { dispose: true });
        console.log(tempCollector);

        tempCollector.on('collect', async (reaction, participant) => {
            console.log(`Collected ${reaction.emoji.name} from ${participant.tag}`);
            fetchedMessageId.guild.members.fetch(participant).then(async (ajoutPpl) => {
            var ficheRoleCollect = await ReportPap.findOne({userId: message.author.id});
            ajoutPpl.roles.add(ficheRoleCollect.roleId);

        const messageDepart = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Un·e nouveau·elle Dresseur·euse se prépare au combat !")
            .setAuthor("Proposé par : "+message.author.username)
            .setDescription("<@"+message.author.id + ">, un·e dresseur·euse vient de rejoindre ton expédition !\rBienvenue à toi, <@"+participant+"> !")
                .setThumbnail(participant.avatarURL());

            //const messageDepart = "<@"+message.author.id + ">, un dresseur·euse vient de rejoindre ton expédition ! Bienvenue <@"+participant+"> !";
            console.log(fetchedMessageId.guild.channels.cache.get(ficheRoleCollect.channelId).send(messageDepart));
            }); 
        });


        tempCollector.on('remove', async (reaction, participant) => {
            console.log(`Removed ${reaction.emoji.name} from ${participant.tag}`);
            fetchedMessageId.guild.members.fetch(participant).then(async (removePpl) => {
            var ficheRoleCollect = await ReportPap.findOne({userId: message.author.id});
            removePpl.roles.remove(ficheRoleCollect.roleId);

        /*const messageDepart = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Un·e nouveau·elle Dresseur·euse se prépare au combat !")
            .setAuthor("Proposé par : "+message.author.username)
            .setDescription("<@"+message.author.id + ">, un·e dresseur·euse vient de rejoindre ton expédition !\rBienvenue à toi, <@"+participant+"> !")
                .setThumbnail(participant.avatarURL());*/

            //console.log(fetchedMessageId.guild.channels.cache.get(ficheRoleCollect.channelId).send(messageDepart));
            }); 
        });
    //fin du if de la nouvelle commande ne pas toucher
    }
}
//fin du bot.on ne pas toucher
})


function create(message) {
    
    const reportPap = new ReportPap({
    _id : mongoose.Types.ObjectId(),
    userId : message.author.id,
    messageId : 0,
    roleId : 0,
    channelId : 0,
    channelVocalId : 0,
    collectorId : 0,
    time: Date()
    });

reportPap.save().then(result => console.log(result)).catch(err => console.log(err));

}
