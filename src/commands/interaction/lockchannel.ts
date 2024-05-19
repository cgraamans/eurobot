import { SlashCommandBuilder, SlashCommandStringOption,SlashCommandChannelOption,SlashCommandBooleanOption} from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel,PermissionFlagsBits,ChannelType } from "discord.js";
import db from "../../services/db";
import discord from "../../services/discord";

const data = new SlashCommandBuilder()
	.setName('lockchannel')
	.setDescription('allow only URLs to be posted to a channel');

data.addStringOption((option:SlashCommandStringOption)=>{

	option.setName('dir')
		.setDescription('Add/remove channel lock')
		.setRequired(true)
		.addChoices({
			name:'add',
			value:'add'
		})
		.addChoices({
			name:'remove',
			value:'remove'
		});

	return option;

});

data.addChannelOption((option:SlashCommandChannelOption)=>{
	option.setName('channel')
		.setDescription('Channel to lock/unlock')
		.setRequired(true)
	return option;
});

data.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const embed = new EmbedBuilder();
		embed.setColor(0x001489);

		const channelOption = interaction.options.getChannel('channel');

		if(!channelOption) return;
		if(!channelOption.id) return;
		
		let dir = 0;
		let action = `${channelOption.name} is unlocked.\n\nYou may resume talking.`;
		const dirOption = interaction.options.getString('dir');
		if(dirOption && dirOption === 'add') {
			dir = 1;
			action = `${channelOption.name} has been locked by ${interaction.user}.\n\nYou may only post links until the channel is unlocked.`;
		}

		await db.q("REPLACE INTO interaction_lockchannel (`channelId`,`username`,`active`) VALUES(?,?,?)",[channelOption.id,interaction.user.displayName,dir]).catch(e=>console.log(e));

		embed.setDescription(action);

		const chanToSend = discord.Client.channels.cache.get(channelOption.id);
		if(chanToSend && chanToSend.isTextBased()) {

			chanToSend.send({embeds:[embed]});

		}

		return;

	},

};