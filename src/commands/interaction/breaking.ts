import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel } from "discord.js";
import {Eurobot} from "../../../types/index.d.js";

const data = new SlashCommandBuilder()
	.setName('breaking')
	.setDescription('Sign up for Breaking News');

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const user = await interaction.guild.members.fetch(interaction.user.id);
		if(interaction.guild.id !== "257838262943481857") return;
		
		if(!user.roles.cache.get("581605959990771725")) {

			user.roles.add("581605959990771725");
			const general = interaction.guild.channels.cache.get("257838262943481857") as TextChannel;

			if(general) {
				await general.send(`Welcome to Forum Gotterfunken, <@${user.id}>!`);
			}

		}

		return;
	
	},

};