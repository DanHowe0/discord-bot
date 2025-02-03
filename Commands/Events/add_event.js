const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, ChannelType } = require('discord.js');
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
                    .setMaxLength(500))
        
        .addChannelOption(option => 
            option  .setName("channel")
                    .setDescription("Which channel will the event be in?")
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildVoice)
                    .addChannelTypes(ChannelType.GuildStageVoice))
        
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
        const channel = interaction.options.getChannel("channel")
        const date = interaction.options.getInteger('date');

        const event_manager = new GuildScheduledEventManager(interaction.guild)

        if (channel.type === ChannelType.GuildVoice) {
            entType = GuildScheduledEventEntityType.GuildVoice;
        } else if (channel.type === ChannelType.GuildStageVoice) {
            entType = GuildScheduledEventEntityType.StageInstance;
        }

        guildEvent = await event_manager.create({
            name: title,
            scheduledStartTime: date*1000,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: entType,
            description: subject + "\n\n" + description,
            channel: channel.id,
            image: null,
            reason: `User ${interaction.user.username} Created Event for server ${interaction.guild.name}`
        });

        eventEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("# " + title)
        .setURL(link.url)
        .setDescription(subject)
        .addFields(
            { name: "Description", value: description},
            { name: "When?", value: `<t:${date}:F>`}
        )
        //.setImage(`attachment://${title}.png`);
        
        let conn;
        try {
            conn = await interaction.client.pool.getConnection();

            const server_res = await conn.query("SELECT 'Event Channel' FROM 'Servers' WHERE 'Server ID' == (?)", [interaction.guild.id])

            print(server_res)

		    embedlink = await interaction.reply({ 
                embeds: [ eventEmbed ]
            });

        
            const insert_res = await conn.query("INSERT INTO Events (Title, Subject, Date, Description, Link, Host, Channel, Server, Status, Embed) value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [title, subject, date, description, guildEvent.id, interaction.user.id, channel.id, interaction.guild.id, 1, embedlink.url]);          
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
	},
};