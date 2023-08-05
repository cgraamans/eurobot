import xp from "../models/xp"
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";

const data = new SlashCommandBuilder()
	.setName('xp')
	.setDescription('Retrieves your xp from Forum Gotterfunken');

module.exports = {

	data: data,

	async execute(interaction:CommandInteraction) {

		if (!interaction.isChatInputCommand()) return;
		if(!interaction.guild) return;

		const ModelXP = new xp();

		// const rank = await ModelXP.getRanking(interaction.user.id)
		const getTotal = await ModelXP.getTotal(interaction.user.id);

		let TOTAL = 0;
		if(getTotal && getTotal.length > 0 && getTotal[0].xp) {
			TOTAL = getTotal[0].xp;
		}

		let embed = new EmbedBuilder();
		embed.setTitle(`${interaction.user.username}`);
		embed.setDescription(`TOTAL XP: **${TOTAL}**`)

		await interaction.reply({embeds:[embed],ephemeral:true});

		return;
		
	},

};