import NewsModel from "../../models/news";
import { SlashCommandBuilder } from "@discordjs/builders";
import {Eurobot} from "../../../types"
import { CommandInteraction } from "discord.js";

const data = new SlashCommandBuilder()
	.setName('latest')
	.setDescription('Retrieves news from the Forum Gotterfunken subreddits');

data.addStringOption(option => 
	option
	.setName('source')
	.setDescription('News Source')
	.addChoices(
		{name:'/r/EUNews', value:'EUNews'},
		{name:'/r/EuropeanArmy', value:'EuropeanArmy'},
		{name:'/r/EuropeanFederalists', value:'EuropeanFederalists'},
		{name:'/r/EuropeanCulture', value:'EuropeanCulture'},
		{name:'/r/EuropeanUnion', value:'EuropeanUnion'},
		{name:'/r/EUSpace', value:'EUSpace'},
		{name:'/r/EUTech', value:'EUTech'},
		{name:'/r/Yurop', value:'Yurop'}
	)

);

module.exports = {

	data: data,

	async execute(interaction:CommandInteraction) {

		if (!interaction.isChatInputCommand()) return;
		if(!interaction.guild) return;

		const news = new NewsModel();

		let newsObj:Eurobot.News.Obj = {keyword:"eunews"};

		// keyword
		let stringOption = interaction.options.getString('source');
		if(stringOption) newsObj.keyword = stringOption

		// row from db
		const keywordObjRow = await news.getKeywordObjRow(newsObj.keyword);
		if(!keywordObjRow) {
			await interaction.reply({content:`Unknown source for ${newsObj.keyword}, sorry.`,ephemeral:true});
			return;
		}
		newsObj.row = keywordObjRow;

		// get news
		newsObj = await news.get(newsObj,"new");
		if(newsObj.subreddit.length < 1 && newsObj.twitter.length < 1) {
			await interaction.reply({content:`No news for ${newsObj.keyword}, sorry.`,ephemeral:true});
			return;
		}

		const embed = news.toRich(newsObj);

		await interaction.reply({embeds:[embed],ephemeral:true});

		return;
		
	},

};