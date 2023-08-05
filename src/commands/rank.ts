import xp from "../models/xp"
import { SlashCommandBuilder } from "@discordjs/builders";
import {Eurobot} from "../../types"
import { CommandInteraction, EmbedBuilder } from "discord.js";
import tools from "../../src/tools";
const data = new SlashCommandBuilder()
	.setName('rank')
	.setDescription('Retrieves your rank from Forum Gotterfunken');

module.exports = {

	data: data,

	async execute(interaction:CommandInteraction) {

		if (!interaction.isChatInputCommand()) return;
		if(!interaction.guild) return;

		const ModelXP = new xp();

		const getRankList:Eurobot.Rank.Row[] = await ModelXP.getRankList(10);
		if(getRankList.length < 1) return;

		let embed = new EmbedBuilder();
		embed.setTitle(`FG Top 10 for this month`);

		let rankList:string = "";

		await tools.asyncForEach(getRankList, async (row:Eurobot.Rank.Row)=>{

			let rankName = "";
			const rankUser = await interaction.guild.members.fetch({force:true,user:row.user_id});
			
			if(rankUser) rankName = rankUser.user.username;
			rankList += `**${row.rank}** - **@${rankName}** (${row.xp} XP)\n`

			return;

		});

		embed.setDescription(`RANKINGS\n${rankList}`)

		await interaction.reply({embeds:[embed],ephemeral:true});

		return;
		
	},

};