const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event_setup')
		.setDescription('Sets up the event channels and ping roles'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};