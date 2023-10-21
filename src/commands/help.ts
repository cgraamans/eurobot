import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import discord from "../services/discord";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get help!'),
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;

		const emoji = interaction.guild.emojis.cache.random();

		let embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Help`)
			.setColor(0x001489)
			.setFooter({text:`Find me on https://twitter.com/eunewsbot`, iconURL:"https://twitter.com/eunewsbot"})
			.setDescription(`
			
**WHAT IS EUROBOT**

Eurobot functions as the provider and publication of news and information for Forum Gotterfunken. 

**Commands**
\`\`\`
	
	/help - this help
	/ping - test the bot

	/topics - get current topics
	/news - get hot subreddit news
	/latest - latest subreddit news

	/calendar - list calendar entries
	/events - list events

	/country - list countries
	/country <country name> - add/remove country.

\`\`\`

**Functions**:

- News 4x a day

\`\`\`4 times a day Eurobot will provide news from approved FGNet subreddits.\`\`\`

- EU Calendar events

\`\`\`At 7 AM and 1900 AM CEST Eurobot will provide a calendar listing of EU events\`\`\`

- Twitter integration & XP System

\`\`\`- If 3 or more users react to a link with the loveEU emoji it is published to the #articles channel and tweeted via https://twitter.com/eunewsbot. Users receive 1 XP per heart emoji. Users who published tweeted articles receive 3 XP\`\`\`


`);

		await interaction.reply({embeds:[embed],ephemeral:true});
		
	},
};