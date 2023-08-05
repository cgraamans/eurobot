import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel } from "discord.js";
import discord from "../services/discord";
import {Eurobot} from "../../types/index";

const data = new SlashCommandBuilder()
	.setName('country')
	.setDescription('Country of residence');

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('country')
		.setDescription('Country Name');
	return option;

});

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const embed = new EmbedBuilder();
		embed.setColor(0x001489);

		const stringOption = interaction.options.getString('country');
		if(!stringOption) {

			let description:string[] = [];
			
			const countries = discord.Config.Countries.filter(x=>!x.isAlias);
			countries.forEach(country=>{

				const role = interaction.guild.roles.cache.find(role=>role.id === country.role_id);
				if(role) {
				
					description.push(`${country.emoji} ${country.alias}`);
				
				}
			
			});

			embed.setDescription(description.length > 0 ? description.join(`\n`) : 'This server does not support countries.');
			embed.setTitle("Available countries");

			await interaction.reply({embeds:[embed],ephemeral:true});

			return;

		}

		const countryObjs = discord.Config.Countries.filter(c=>c.alias.toLowerCase() === stringOption.toLowerCase());
		if(countryObjs.length < 1) {

			embed.setDescription(`Country not found.`);

			await interaction.reply({embeds:[embed],ephemeral:true});

			return;

		}

		
		let countryObj:Eurobot.Roles.Country;
		let role:Role;

		countryObjs.forEach(cObj=>{
			
			const guildRole = interaction.guild.roles.cache.get(cObj.role_id);
			if(guildRole) {
				role = guildRole;
				countryObj = cObj;
			}

		});

		if(!role || !countryObj) {

			embed.setDescription(`Country role not found.`);

			await interaction.reply({embeds:[embed],ephemeral:true});

			return;

		}

		const user = interaction.guild.members.cache.get(interaction.member.user.id);
		let direction = `Added`;

		if(user.roles.cache.get(role.id)) {

			user.roles.remove(role);
			direction = `Removed`;
		
		} else {

			user.roles.add(role);
		
		}

		if(interaction.guild.id === "257838262943481857" && !user.roles.cache.get("581605959990771725")) {

			user.roles.add("581605959990771725");
			const general = interaction.guild.channels.cache.get("257838262943481857") as TextChannel;

			if(general) {
				general.send(`Welcome to Forum Gotterfunken, <@${user.id}>!`);
			}

		}

		embed.setDescription(`**${direction}**\n${countryObj.emoji} ${countryObj.alias}`);

		await interaction.reply({embeds:[embed],ephemeral:true});

		return;
	
	},

};