// import { SlashCommandBuilder } from "@discordjs/builders";
// import discord from "../../services/discord";
// import google from "../../services/google";
// import {CalendarModel} from  "../../models/google";
// import {Eurobot} from "../../../types/index";
// import { EmbedBuilder, CommandInteraction } from "discord.js";

// const data = new SlashCommandBuilder()
// 	.setName('events')
// 	.setDescription('Get the Götterfunken events calendar');

// data.addStringOption(option => 
// 	option
// 		.setName('timespan')
// 		.setDescription('Number of days')
// 		.addChoices(
// 			{name:'today', value:'today'},
// 			{name:'tomorrow', value:'tomorrow'},
// 			{name:'7 days', value:'7d'},
// 			{name:'14 days', value:'14d'},
// 		)
// );

// module.exports = {

// 	data: data,

// 	async execute(interaction:CommandInteraction) {

		
// 		if (!interaction.isChatInputCommand()) return;

// 		const { commandName } = interaction;

// 		const model = new CalendarModel();

// 		// keyword
// 		let timespan = "7d"
// 		const stringOption = interaction.options.getString('timespan');
// 		if(stringOption) timespan = stringOption;

// 		const span:Eurobot.Calendar.Span = model.textToUnixTimeRange(timespan);
// 		let items:any[] = await google.Calendar(span.range)

// 		items = items.filter(item=>item.start.dateTime)

// 		const calendar = model.toStringCalendar(items,span)

// 		const calendarDescription:string = `Calendar for ${span.human}\n\n`;

// 		const embed = new EmbedBuilder()
// 			.setTitle(`🇪🇺 Eurobot Events`)
// 			.setDescription(calendarDescription + calendar)
// 			.setColor(0x001489);

// 		interaction.reply({embeds:[embed]});

// 		return;

// 	},
// };