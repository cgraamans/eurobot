import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import discord from "../../services/discord";

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

**What is Forum Gotterfunken**

Forum Gotterfunken is an EU-OSINT Server on Discord. EU-OSINT stands for European Union - Open Source Intelligence. We aim to provide up to date news and information regarding events in and around the EU from a European Perspective.

Please read the #introduction and adhere to the #rules, say hello in #introduce-yourself and come hang out in #general. 

For serious EU and geopolitical news visit the "Serious Effort" category channels like #serious-effort and #geopolitics.

**Roles**

\`\`\`
	/country - list countries
	/country <country name> - add/remove country role.

	/EUGroup - list European Parliamentary Groups you can support
	/EUGroup <parliamentary group name> - add/remove group role
\`\`\`

Note: 
Since this is an EU server, EU countries are represented with roles. Non-EU citizens are of course welcome and can join an European Parliamentary Group or add the non-eu country role.

**Special Commands**
\`\`\`
	/help - this help

	/news - get hot subreddit news
	/latest - latest subreddit news
	/calendar - list calendar entries
\`\`\`

**Functions**:

Eurobot does more than just respond to commands. Eurobot...

- talks about the news 4x a day
\`\`\`4 times a day Eurobot will provide news from approved subreddits.\`\`\`

- provides EU Calendar events
\`\`\`At 7 AM and 1900 AM CEST Eurobot will provide a calendar listing of EU events\`\`\`

- is on Social Media!
\`\`\`News is collected in #news and subsequently tweeted, tooted and telegrammed.
Check it out:
- https://twitter.com/eunewsbot
- https://mas.to/@eunews
- https://t.me/euintnews
\`\`\`

Also, Eurobot...

- collects news from other servers and puts them into #announcements
- redirects news from trusted users to the #geopolitics forum threads
- replaces broken twitter embeds with an alternative

And finally...

If you have any questions, contact Big Sn0r. :)`);

		await interaction.reply({embeds:[embed],ephemeral:true});
		
	},
};