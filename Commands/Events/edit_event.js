const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_event')
		.setDescription('Edits an event'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};