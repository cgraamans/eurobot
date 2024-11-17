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
			.setDescription(`**EUROBOT**

Eurobot functions as a bot which moderates and publishes news and information for Forum Gotterfunken.

**What is Forum Gotterfunken**

https://discord.com/servers/forum-gotterfunken-257838262943481857

\`\`\`
Forum Gotterfunken is an EU-OSINT Server on Discord. EU-OSINT stands for European Union - Open Source Intelligence. We aim to provide up to date news and information regarding events in and around the EU from a European Perspective.

Please read the #introduction and adhere to the #rules, say hello in #introduce-yourself, visit #serious-effort and the EU News and Geopolitics categories for serious political discussions and come hang out in #general-effort or #low-effort for a casual chat.
\`\`\`

**You can follow Eurobot on...**
- https://twitter.com/eunewsbot  
- https://mas.to/@eunews  
- https://t.me/euintnews  
- https://bsky.app/profile/eurobot.bsky.social

**Roles?**

\`\`\`
For roles and functions please refer to the /roles command.
\`\`\`

**How does Eurobot work?**

Eurobot is written in NodeTS with Discord.js. Please refer to the Eurobot Github at https://github.com/cgraamans/eurobot.

If you have any questions, contact sn0r. :)`);

		await interaction.reply({embeds:[embed],ephemeral:true});
		
	},
};