import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel } from "discord.js";
import discord from "../../services/discord";
import {Eurobot} from "../../../types/index";

const data = new SlashCommandBuilder()
	.setName('register')
	.setDescription('Register with Eurobot');

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const user = interaction.guild.members.cache.get(interaction.member.user.id);
		if(interaction.guild.id === "257838262943481857" && !user.roles.cache.get("581605959990771725")) {

			user.roles.add("581605959990771725");
			const general = interaction.guild.channels.cache.get("257838262943481857") as TextChannel;

			if(general) {
				general.send(`Welcome to Forum Gotterfunken, <@${user.id}>!`);
			}

		}

		return;
	
	},

};