var express = require('express');
var moment = require('moment-timezone');
var app = express();
var Discord = require('discord.js');
var bot = new Discord.Client({autoReconnect:true});

bot.login(process.env.TOKEN);

var listeningTo = {'324360777970483209' : -1}; // Auto-active in channel
var messages = {};

bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.user.username, bot.user.id);
});

bot.on('message', function(message) {

    console.log(message.author.username + " - " + message.author.id + " - " + message.channel.id + " - " + message.content);
    var channelID = message.channel.id.toString();
    if (!message.author.bot) {
      if (message.content.trim() === "(´･ω･`)" && !(channelID in listeningTo)) {
        listeningTo[channelID] = parseInt(message.id.toString().substr(message.id.toString().length - 9));
        message.channel.send("(´･ω･`)");
      }
      else if (channelID in listeningTo) {
        switch (message.content){
          /*
          case "ping" :
            message.reply("pong");
            break;
          */
          case "Your emails are freaking me out." :
          case "You’re an annoyance." :
          case "Please don’t send any more emails.":
            delete listeningTo[channelID];
            message.channel.send("(´；ω；`)");
            break;
          default :
            // Delete old message
            message.delete();
            // Make new message!
            var newmessage = "";
            var lines = message.content.split('\n');
            var greenTexting = false;
            var banned = false;
            var textToAdd;
            for(var i = 0; i < lines.length; i++){
              textToAdd = lines[i].trim();
              if (bannable(textToAdd)) {
                banned = true;
              }
              var reg = /^>>(\d+)$/g;
              var match = reg.exec(textToAdd);
              var roll = Math.floor(Math.random() * 3) + 1;
              if (match){
                if (parseInt(match[1]) in messages){
                  textToAdd = "\`" + textToAdd + "\n\n" + messages[parseInt(match[1])].replace(/<:.*:\d*>/g, "\`$&\`") + " \`\n";
                }
              }
              else if (textToAdd.startsWith(">")){
                if (!greenTexting) {
                  textToAdd = "\`\`\`css\n" + textToAdd;
                  greenTexting = true;
                }

                var emote = /([\s\S]*)(<:.*:\d*>)/g;
                var emoteMatch = emote.exec(textToAdd);
                if (emoteMatch){
                  textToAdd = emoteMatch[1] + "\`\`\`" + emoteMatch[2];
                  greenTexting = false;
                }
              } else if (greenTexting) {
                  textToAdd = "\`\`\`\n" + textToAdd;
                  greenTexting = false;
                }
              else if (roll === 1) {
                textToAdd += " (´･ω･`)";
              }
              newmessage += textToAdd + "\n";
            }

            if (greenTexting) {
              newmessage += "\`\`\`\n";
            }

            var timestamp = moment().tz("Pacific/Auckland").format("MM/DD/YY (ddd)HH:mm:ss");

            if (listeningTo[channelID] === -1) {
              listeningTo[channelID] = parseInt(message.id.toString().substr(message.id.toString().length - 9));
            }

            var id = listeningTo[channelID] + parseInt(message.id.toString().substr(message.id.toString().length - 4));
            listeningTo[channelID] = id;

            newmessage = "**Anonymous** *" + timestamp + " No. " + id + " >* " + "\n\n" + newmessage;

            if (banned) {
              newmessage = newmessage + "\`\`\`diff\n- (USER WAS BANNED FOR THIS POST)\n\`\`\`";
            }

            // Get attachments
            var attachments = message.attachments.array();
            if (attachments.length !== 0) {
              var attachment = attachments[0];
              var url = attachment.url;
              var name = attachment.filename;
              if (bannable(attachment.filename) && !banned){
                newmessage = newmessage + "\`\`\`diff\n- (USER WAS BANNED FOR THIS POST)\n\`\`\`";
              }
              newmessage = newmessage + "File: " + attachment.filename + " (" + formatBytes(attachment.filesize) + ", " + attachment.width + "x" + attachment.height + ")" + "\n";
              message.channel.send(wrapMessage(newmessage), {
                  file: attachment.url
              });
            } else {
              message.channel.send(wrapMessage(newmessage));
            }

            // Save this message for referencing
            messages[id] = message.content;
        }
      }
    }
});

function bannable(message){
  var badWords = ['anime', 'cp', 'yuri',
                  'hentai', 'waifu',
                  'sugoi', 'ecchi', 'yaoi'];
  for (var i = 0; i < badWords.length; i++) {
    if (message.toLowerCase().indexOf(badWords[i]) !== -1) {
      return true;
    }
  }

  return false;
}

function wrapMessage(message) {
  return "=========================\n" + message + "\n=========================";
}

function formatBytes(bytes) {
   if(bytes === 0) return '0 Bytes';
   var k = 1000,
       dm = 0,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
