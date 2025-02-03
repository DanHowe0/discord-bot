// Initialize dotenv
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mariadb = require("mariadb");


// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Create a pool connection
client.pool = mariadb.createPool({
    host: process.env.DB_HOST, // DB Host
    port: process.env.DB_PORT, // DB Port
    user: process.env.DB_USER, // DB User
    password: process.env.DB_PASS, // DB Password
    database: process.env.DB_NAME, // DB Name
    connectionLimit: 5 // Maximum number of connections
});



// Function to test the connection
async function testConnection() {
    let conn;
    try {
        conn = await client.pool.getConnection();
        console.log("Successfully connected to the MariaDB database!");
    } catch (err) {
        console.error("Error connecting to the database:", err);
    } finally {
        if (conn) conn.end(); // Release connection back to pool
    }
}

// Call the test connection function
testConnection();

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);
const extremeFoldersPath = path.join(__dirname, 'Extreme');
const extremeCommandFolders = fs.readdirSync(extremeFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

for (const extremeFolder of extremeCommandFolders) {
	const extremeCommandsPath = path.join(extremeFoldersPath, extremeFolder);
	const extremeCommandFiles = fs.readdirSync(extremeCommandsPath).filter(file => file.endsWith('.js'));

	for (const file of extremeCommandFiles) {
		const extremeFilePath = path.join(extremeCommandsPath, file);
		const command = require(extremeFilePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${extremeFilePath} is missing a required "data" or "execute" property.`);
		}
	}
}


client.on('ready', async () => {
 	console.log(`Logged in as ${client.user.tag}!`);
 	console.log('successfully finished startup')
	let conn;
	try {
		conn = await client.pool.getConnection();
		console.log("adding offline guilds to the database")
		guilds = client.guilds.cache.map(guild => guild.id)
		for (guild in guilds) {
			const res = await conn.query("INSERT INTO `Servers` (ServerID) VALUES (?) ON DUPLICATE KEY UPDATE  ServerID = VALUES(ServerID);", guilds[guild]);
			console.log("Guild " + guilds[guild] + " added!")
		}
	} catch (err) {
		throw err;
	} finally {
		if (conn) conn.end();
	}
	
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.on(Events.GuildCreate, async guild => {
	let conn;
        try {
            conn = await client.pool.getConnection();
            const res = await conn.query("INSERT INTO `Servers` (ServerID) VALUES (?) ON DUPLICATE KEY UPDATE  ServerID = VALUES(ServerID);", [guild.id]);
			console.log("Joined Server ", guild.id)          
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
})

// Log In our bot
client.login(process.env.TOKEN);