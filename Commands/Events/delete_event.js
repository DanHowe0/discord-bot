const { SlashCommandBuilder, GuildScheduledEvent, GuildScheduledEventManager, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete_event')
		.setDescription('Deletes an event from the server')
        .addStringOption(option => 
            option  .setName("link")
                    .setDescription("The link of the event to be deleted")
                    .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
	async execute(interaction) {
		guildEvent = new GuildScheduledEventManager()
        guildEvent.fetch(interaction.options.getString("link"))
	},
};