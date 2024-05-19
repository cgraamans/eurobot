import { SlashCommandBuilder, SlashCommandStringOption} from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel,PermissionFlagsBits } from "discord.js";
import db from "../../services/db";

const data = new SlashCommandBuilder()
	.setName('warnlist')
	.setDescription('warnlist a @twitter username or a url');

data.addStringOption((option:SlashCommandStringOption)=>{

	option.setName('dir')
		.setDescription('add/subtract')
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

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('rl')
		.setDescription('@twitterUser/link')
		.setRequired(true);
	return option;
});

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('reason')
		.setDescription('Reason to blacklist')
	return option;
});

data.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

module.exports = {
	data: data,
	async execute(interaction:CommandInteraction) {

		if(!interaction.guild) return;
		if (!interaction.isChatInputCommand()) return;

		const embed = new EmbedBuilder();
		embed.setColor(0x001489);

		const stringOptionDirection = interaction.options.getString('dir');
		let stringOptionRL = interaction.options.getString('rl');

		let stringOptionReason = interaction.options.getString('reason');
		let reasonText =  ` with reason:\n${stringOptionReason}`
		if(!stringOptionReason) {
			stringOptionReason = null;
			reasonText = "";			
		}

		let type = 'url';

		if(stringOptionRL.startsWith('@')) {
			type = 'twitter';
			stringOptionRL = stringOptionRL.substring(1);
		}

		let direction = 'Added';
		let dir = 1;
		if(stringOptionDirection ==='remove') {
			
			direction = 'Removed';
			dir = 0;
		}

		await db.q("REPLACE INTO interaction_warnlist(`rl`,`type`,`reason`,`username`,`active`) VALUES(?,?,?,?,?)",[stringOptionRL,type,stringOptionReason,interaction.user.displayName,dir]).catch(e=>console.log(e));

		embed.setDescription(`Blacklist: ${direction} ${stringOptionRL} (${type}) ${reasonText}`);

		await interaction.reply({embeds:[embed],ephemeral:true});

	},

};