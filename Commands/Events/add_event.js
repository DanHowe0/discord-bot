const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
require('dotenv').config();
const mariadb = require("mariadb");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_event')
		.setDescription('Create a new event for the server')
        .addStringOption(option => 
            option  .setName("title")
                    .setDescription("The title of the event")
                    .setRequired(true)
                    .addChoices(
                        { name: "Game Night", value: "Game Night"},
                        { name: "Movie Night", value: "Movie Night"}
                    ))

        .addStringOption(option => 
            option  .setName("subject")
                    .setDescription("What Game/Movie will be Played/Watched?")
                    .setRequired(true)
                    .setMaxLength(50))
        
        .addStringOption(option => 
            option  .setName("description")
                    .setDescription("A brief description of the event")
                    .setRequired(true)
                    .setMaxLength(200))
        
        .addIntegerOption(option => 
            option  .setName("date")
                    .setDescription("The date in unix (use hammer time bot or website)")
                    .setRequired(true)
                    .setMinValue(Math.floor(new Date().getTime() / 1000))
        )

        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),
	async execute(interaction) {
        const title = interaction.options.getString('title');
        const subject = interaction.options.getString('subject');
        const description = interaction.options.getString('description');
        const date = interaction.options.getInteger('date');

        //const title_img = new AttachmentBuilder(`././imgs/${title}.png`);


        eventEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        //.setURL(URL of the created event)
        .setAuthor({name: title})
        .setDescription(subject)
        .addFields(
            { name: "Description", value: description},
            { name: "When?", value: `<t:${date}:F>`}
        )
        //.setImage(`attachment://${title}.png`);

		await interaction.reply({ 
            embeds: [ eventEmbed ]
         });
	},
};