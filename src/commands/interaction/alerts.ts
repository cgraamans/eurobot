import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel } from "discord.js";
import discord from "../../services/discord";
import {Eurobot} from "../../../types/index";

const data = new SlashCommandBuilder()
	.setName('alerts')
	.setDescription('Register with Eurobot for news @alerts!');

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const user = interaction.guild.members.cache.get(interaction.member.user.id);
		const alertRole = interaction.guild.roles.cache.get("1177406198031593482")

		const embed = new EmbedBuilder();
		embed.setColor(0x001489);
		embed.setTitle("Forum Gotterfunken Alerts");

		let reply = `You are unsubscribed from ${alertRole}`;

		if(interaction.guild.id === "257838262943481857" && user.roles.cache.get("581605959990771725")) {

			if(!user.roles.cache.get(alertRole.id)) {

				user.roles.add(alertRole);
				reply = `You are subscribed to ${alertRole}.\n\nNote: ${alertRole} is made to inform you of interesting articles, news and discussions through a ping when they happen in chat. You may ping this role to alert users of news stories and news.\n\n**No memes, no flooding.**. Abuse will be dealt with harshly.`;
			
			} else {

				user.roles.remove(alertRole);

			}

		} else {

			reply = `You need to /register or set your /country to use this command.`;

		}
		embed.setDescription(reply);

		await interaction.reply({embeds:[embed],ephemeral:true});

		return;

	},

};