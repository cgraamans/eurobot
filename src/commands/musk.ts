import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('musk')
		.setDescription('show the current elon musk forecast'),
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;

		const emoji = interaction.guild.emojis.cache.random();

		const muskMood = ['sad', 'angry', 'confused', 'cloudy', 'dejected', 'ebullient', 'contemplative', 'quiet', 'extra confused', 'reactionary', 'stormy', 'windy','exacerbated','enerved','buoyant','nosey','trolling'];
		
		let embed = new EmbedBuilder()
			.setTitle(`Elon Musk Mood Forecast`)
			.setColor(0xFFCC00)
			.setDescription(`Elon Musk is currently ${muskMood[Math.floor(Math.random() * (muskMood.length -1))]}\n\n${emoji}`);

		await interaction.reply({embeds:[embed]});

		return;

	},

};