import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel } from "discord.js";
import discord from "../../services/discord";
import {Eurobot} from "../../../types/index";

const data = new SlashCommandBuilder()
	.setName('group')
	.setDescription('Choose your European Parliamentary Group role');

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('group')
		.setDescription('Political group');
	return option;

});

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const embed = new EmbedBuilder();
		embed.setColor(0x001489);

		// NO OPTIONAL GROUP - PRINT HELP
		const stringOption = interaction.options.getString('group');
		if(!stringOption) {

			let description:string[] = [];
			
			const groups = discord.Config.EPGroups.filter(x=>!x.isAlias);
			groups.forEach(group=>{

				const role = interaction.guild.roles.cache.find(role=>role.id === group.role_id);
				if(role) {
				
					description.push(`${group.emoji} ${group.name} (${group.description})`);
				
				}
			
			});

			embed.setDescription(`Choose your political affiliation by your European Parliamentary group:\n${(description.length > 0 ? description.join(`\n`) : '\nThis server does not support EP Groups.')}`);
			embed.setTitle("Available European Groups");

			await interaction.reply({embeds:[embed],ephemeral:true});

			return;

		}

		const groupObjs = discord.Config.EPGroups.filter(c=>c.name.toLowerCase() === stringOption.toLowerCase());

		// NOT FOUND
		if(groupObjs.length < 1) {

			embed.setDescription(`EU Group not found. Type /group to see them all.`);

			await interaction.reply({embeds:[embed],ephemeral:true});

			return;

		}
		
		let EPGroupObj:Eurobot.Roles.EPGroup;
		let role:Role;

		groupObjs.forEach(gObj=>{
			
			const guildRole = interaction.guild.roles.cache.get(gObj.role_id);
			if(guildRole) {
				role = guildRole;
				EPGroupObj = gObj;
			}

		});

		// if Role doesn't exist
		if(!role || !EPGroupObj) {

			embed.setDescription(`EU Group role not found. Contact Admin.`);

			await interaction.reply({embeds:[embed],ephemeral:true});

			return;

		}

		const user = interaction.guild.members.cache.get(interaction.member.user.id);
		let direction = `Added`;

		// Add roles
		if(user.roles.cache.get(role.id)) {

			user.roles.remove(role);
			direction = `Removed`;
		
		} else {

			user.roles.add(role);
		
		}

		// Post welcome to General
		if(interaction.guild.id === "257838262943481857" && !user.roles.cache.get("581605959990771725")) {

			user.roles.add("581605959990771725");
			const general = interaction.guild.channels.cache.get("257838262943481857") as TextChannel;

			if(general) {
				await general.send(`Welcome to Forum Gotterfunken, ${EPGroupObj.emoji}<@${user.id}>!`);
			}

		}

		// Reply with success
		embed.setDescription(`**${direction}**\n${EPGroupObj.emoji} ${EPGroupObj.name}`);
		await interaction.reply({embeds:[embed],ephemeral:true});

		return;
	
	},

};