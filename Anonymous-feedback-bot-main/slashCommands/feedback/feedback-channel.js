const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder() //create new slash cmd
    .setName('feedback-channel') //slash cmd name
    .setDescription('Set the Feedback channel') //description of the slash cmd
    .addChannelOption(channel =>  //make an option for user to select channel
        channel
        .setName('channel') //the option name
        .setDescription('Feedback channel') //option description
    ),
    async execute(client, interaction) {
        let feedbackChannel = interaction.options.getChannel('channel') //get the channel that user selected in option

        let channelEmbed = new MessageEmbed()
        .setAuthor('Feedback Settings >> Channels', interaction.guild.iconURL()) //the author in the embed, show the text and guild icon
        .setDescription(`${interaction.user}, you have successfully set the anonymous feedback channel to ${feedbackChannel}`) //description, show the success message for setting the feedback channel
        db.set(`feedbackChannels_${interaction.guild.id}`, feedbackChannel.id) //set the feedback channel of guild to the channel that user selected and set the db to channel ID
        interaction.reply({ embeds: [channelEmbed], ephemeral: true })


    }
}