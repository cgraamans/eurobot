import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import discord from "../../services/discord";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roles')
		.setDescription('show the roles and functions available via Eurobot.'),
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;

		const emoji = interaction.guild.emojis.cache.random();

		let embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Roles`)
			.setColor(0x001489)
			.setFooter({text:`Find me on https://twitter.com/eunewsbot`, iconURL:"https://twitter.com/eunewsbot"})
			.setDescription(`Below you will find the list of available roles and commands for Eurobot and Forum Gotterfunken. 
			
			By being here and accessing these roles and commands you agree to adhere to our rules and follow the instructions of the moderators. For more information see #about-us.

**New users**

\`\`\`
/country - list the available countries you can get a role for
/country <country name> - add/remove country role and register as a new user
/register - register as an unaffiliated new user
/roles - DM available roles
/help - DM help
\`\`\`

**Registered users**

\`\`\`
/group - list the available roles of the European Parliamentary groups you support
/group <parliamentary group name> - add/remove group role
/news - get hot subreddit news
/latest - latest subreddit news
/calendar - list calendar entries
/weather <city> - get weather of city
/alerts - subscribe to news alerts
\`\`\`

**Administrative functions**

\`\`\`
/warnlist <add/remove> <rl> - blacklist a source (@twitterUser or url)
/lockchannel <channel> - make eurobot delete/or allow any posts except for urls in a channel
\`\`\``);

		await interaction.reply({embeds:[embed],ephemeral:true});
		
	},
};