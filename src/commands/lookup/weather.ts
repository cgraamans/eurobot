import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel } from "discord.js";

import WeatherModel from "../../models/weather";

const data = new SlashCommandBuilder()
	.setName('weather')
	.setDescription('Country of residence');

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('place')
		.setDescription('Place name')
		.setRequired(true);
	return option;

});

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const embed = new EmbedBuilder();
		embed.setColor(0x001489);

		const stringOption = interaction.options.getString('place');

		const model = new WeatherModel();
		const result = await model.getCity(stringOption).catch((e:any)=>{console.log(e)});
		if(!result) return;

		embed.setTitle("Eurobot Weather Report");
		embed.setDescription(result)

		await interaction.reply({embeds:[embed]});

		return;
	
	},

};