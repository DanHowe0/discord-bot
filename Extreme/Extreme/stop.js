const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the Bot Gracefully')
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		await interaction.reply("Bye Bye :wave:")
		console.log("Closing DB Connection")
		interaction.client.pool.end();
		console.log("Exiting :(")
		process.exit(1);
	},
};