import { SlashCommandBuilder, SlashCommandStringOption, } from "@discordjs/builders";
import { EmbedBuilder, CommandInteraction, Role, TextChannel,PermissionFlagsBits } from "discord.js";
import db from "../../services/db";

const data = new SlashCommandBuilder()
	.setName('removelisting')
	.setDescription('remove entry from blacklist');

data.addStringOption((option:SlashCommandStringOption)=>{
	option.setName('rl')
		.setDescription('the name or url to delist')
		.setRequired(true);
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

		const stringOptionRL = interaction.options.getString('rl');

		const resDelete = await db.q("DELETE FROM url_warnlist WHERE rl = ?",[stringOptionRL]).catch(e=>console.log(e));

		if(resDelete.affectedRows > 0) {
			embed.setDescription(`Removed ${stringOptionRL} from warning list`);
		}

		await interaction.reply({embeds:[embed],ephemeral:true});

	},

};