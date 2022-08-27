const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

const config = require('../../config.json'); //find the config.json file
const prefix = config.prefix; //get the prefix from config.json

module.exports = {
    data: new SlashCommandBuilder() //create a new slash cmd
    .setName('feedback') //Sets the name of the slash cmd
    .setDescription('Send an Anonymous Feedback Message'), //Sets the description of the slash cmd
    async execute(client, interaction) {
        if(interaction.guild) {
            let channelData = db.get(`feedbackChannels_${interaction.guild.id}`) //get the db of the feedback channel in current guild

        let inGuild = new MessageEmbed() //create a new embed message
        .setAuthor('Feedback Settings >> Waiting...', interaction.guild.iconURL()) //text & guild icon for the author in embed
        .setDescription(`Hey ${interaction.user}, I sent you a direct message! Reply back to my DM with your feedback and I'll anonymously post it to ${interaction.guild}.`)
        interaction.reply({ embeds: [inGuild], ephemeral: true }) //send the embed & only user can see it on server (not DM)

        let sendDM = new MessageEmbed()
        .setAuthor(`${interaction.guild} >> Waiting for your feedback...`, interaction.guild.iconURL()) //text & guild icon for the author in embed
        .setDescription(`${interaction.user}, please type your feedback below and sent it to me as a message`)
        .addField(`Feedback Channel`, `<#${channelData}>`) //display the feedback channel, get from db
        interaction.user.send({ embeds: [sendDM] }).then(msg => { //send the embed to interacting user's DM, then...
            const filter = i => i.author.id == interaction.user.id //create a filter for the awaitMessage function
            msg.channel.awaitMessages({
                filter, //apply the filter, await message from user DM
                max: 1,
                time: 5 * 60000,
                errors: ['time']
            }).then(messages => {
                let msg1 = messages.first().content //the content that awaitMessage function received

                if(msg1.toLowerCase() == (prefix + 'cancel')) { //if the message received is prefix + cancel, for example: c!cancel
                    let cancelEmbed = new MessageEmbed()
                    .setTitle('Feedback >> Cancelled')
                    .setDescription(`${interaction.user}, cancelled feedback process successfully!`) //show the cancelled messages
                    interaction.user.send({ embeds: [cancelEmbed] }) //then send this embed to user's DM
                } else {
                    let waitingMessage = new MessageEmbed()
                    .setAuthor(`${interaction.guild} >> Feedback Sent!`, interaction.guild.iconURL())
                    .setDescription(`${interaction.user}, your feedback has sent to <#${channelData}> successfully!`)
                    interaction.user.send({ embeds: [waitingMessage] })

                    let postMessage = new MessageEmbed() //the embed send to channel
                    .setAuthor(`Anonymous Feedback`, interaction.guild.iconURL())
                    .setDescription(msg1)
                    .setFooter(`Type "/feedback" to send a feedback message`)
                    .setTimestamp()
                    client.channels.cache.get(channelData).send({ embeds: [postMessage] });
                    }
                }); // only enable on servers
            })

        } else {
            interaction.user.send({ content: `The **/feedback** command can only be used in a server! Please try again there.` });
        }
    }
}