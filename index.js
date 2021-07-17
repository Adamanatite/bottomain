//Dependencies and client
const {
  token,
  prefix,
  report_channel_id,
} = require('./botconfig.json');
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client({
  disableEveryone: true
})

//Get all commands from file
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Discord.Collection();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

//Log in
client.once("ready", () => {
  console.log(`${client.user.username} is online!`)
  client.user.setActivity('twitch.tv/doggomain', {
    type: 'WATCHING'
  })
});

//Message event
client.on("message", message => {
  if (message.author.bot) return;
  //Check message is a report
  if (message.channel.type == "dm") {
    if (message.content.toLowerCase().startsWith("report: ")) {
      //Get report channel from ID
      const report = client.channels.fetch(report_channel_id).then(
        (report_channel) => {
          const report = new Discord.MessageEmbed()
            // Set the title of the field
            .setTitle(`Report from ${message.author.tag}`)
            // Set the thumbnail to users profile pic
            .setThumbnail(`${message.author.displayAvatarURL()}`)
            // Set the color of the embed
            .setColor('#ff0000')
            // Set the main content of the embed
            .setDescription(`${message.content.trim().slice(8)}`)
            // Set a footer
            .setFooter("Server report")
            // Set the timestamp
            .setTimestamp();
          return report_channel.send(report);
          //Log any errors
        }, (error) => {
          console.error(error);
        });
      //Send confirmation to the user
      return message.channel.send(`Your report has been sent!`);

    }
  } else if (message.content.startsWith(prefix)) {
    //Trim command prefix and make arguments lowercase
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (!client.commands.has(cmd)) return;

    //Execute corresponding command file or report error
    try {
      client.commands.get(cmd).execute(message, args)
    } catch (error) {
      console.error(error)
      message.reply("There was an issue executing that command");
    }
    //If mentioned, tell the user the bot prefix
  } else if (message.mentions.has(client.user.id) && !(message.mentions.everyone)) {
    return message.channel.send(`Hey ${message.author}! (My prefix is ${prefix})`)
  }

});
//Login
client.login(token);