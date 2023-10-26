import { SlashCommandBuilder, } from "@discordjs/builders";
import discord from "../../services/discord";
import google from "../../services/google";
import {CalendarModel} from  "../../models/google";
import {Eurobot} from "../../../types/index";
import { EmbedBuilder } from "discord.js";

const data = new SlashCommandBuilder()
	.setName('calendar')
	.setDescription('Get the Götterfunken calendar');

data.addStringOption(option => 
	option
		.setName('timespan')
		.setDescription('Number of days')
		.addChoices(
			{name:'today', value:'today'},
			{name:'tomorrow', value:'tomorrow'},
			{name:'7 days', value:'7d'},
			{name:'14 days', value:'14d'},
		)
);

module.exports = {

	data: data,

	async execute(interaction:any) {

		const model = new CalendarModel();

		let timespan = "7d"
		const stringOption = interaction.options.getString('timespan');
		if(stringOption) timespan = stringOption;

		const span:Eurobot.Calendar.Span = model.textToUnixTimeRange(timespan);
		const items = await google.Calendar(span.range).catch(e=>{console.log(e)});
        if(!items || items.length < 1) return;

		const calendar = model.toStringCalendar(items,span)

		let calendarDescription:string = `Calendar for ${span.human}\n\n`;

		const embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Calendar`)
			.setDescription(calendarDescription + calendar)
			.setColor(0x001489)
			.setFooter({text:'You can find our calendar here: https://bit.ly/30uIhtL'});

		interaction.reply({embeds:[embed]});

		return;

	},
};