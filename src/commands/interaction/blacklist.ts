import { SlashCommandBuilder, SlashCommandStringOption} from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel,PermissionFlagsBits } from "discord.js";
import db from "../../services/db";

const data = new SlashCommandBuilder()
	.setName('blacklist')
	.setDescription('blacklist a twitter user or a url');

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('type')
		.setDescription('twitter, telegram or url')
		.setRequired(true)
		.addChoices({
			name:'twitter',
			value:'twitter'
		},
		{
			name:"telegram",
			value:"telegram"
		},
		{
			name:"url",
			value:"url",
		},
		{	
			name:"youtube",
			value:"youtube"
		},
		);
	return option;
});

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('rl')
		.setDescription('the name or url to blacklist')
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

		const stringOptionType = interaction.options.getString('type');
		const stringOptionRL = interaction.options.getString('rl');

		let stringOptionReason = interaction.options.getString('reason');
		let reasonText =  ` with reason:\n${stringOptionReason}`
		if(!stringOptionReason) {
			stringOptionReason = null;
			reasonText = "";			
		}

		await db.q("REPLACE INTO url_warnlist VALUES(?,?,?)",[stringOptionRL,stringOptionType,stringOptionReason]).catch(e=>console.log(e));

		embed.setDescription(`Added ${stringOptionRL} (${stringOptionType}) to warning list${reasonText}`);

		await interaction.reply({embeds:[embed],ephemeral:true});

	},

};