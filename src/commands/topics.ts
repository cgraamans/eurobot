import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('topics')
		.setDescription('show active topic threads'),
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;

		const emoji = interaction.guild.emojis.cache.random();

		let threadList:string[] = [];
		interaction.guild.channels.cache.forEach(channel=>{
			
			if(channel.isThread()) {

				threadList.push(`<#${channel.id}>`);

			}
		
		});
		
		let embed = new EmbedBuilder()
			.setTitle(`${interaction.guild.name}`)
			.setColor(0xFFCC00)
			.setDescription(`${emoji}\n\n` + (threadList.length > 0 ? threadList.join(`\n`) : "No threads found"));

		await interaction.reply({embeds:[embed],ephemeral:true});

		return;

	},

};