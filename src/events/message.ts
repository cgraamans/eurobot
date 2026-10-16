import * as T from "../../types/index.d.js";

import {Message,EmbedBuilder, TextChannel, MessageType, ChannelType} from "discord.js";

import discord from "../services/discord.js";
import db from "../services/db.js";

import { getTreaties } from "../models/https.js";

module.exports = {

	name: 'messageCreate',

	//
	// Main Execution Function
	//
	async execute(message:Message) {

		// ignore if no author
		if (!message.author) return;

		//
		// CHANNELS IN GUILDS ONLY
		//
		if(message.channel && message.guild) {

			if(!message.member) return;

			// Channel processing
			//
			// Check channel list and act on message in channel if in list.
			const isChan: T.ChannelConfig | undefined = discord.ChannelConfig.find((o:T.ChannelConfig)=>o.channel === message.channel.id);
			if(isChan) {
				if(isChan.type === "ignore") return;
				if(isChan.type === "broadcast") {

					if (message.content.includes("https://")) {

						const isDuplicate = await db.query("SELECT * FROM discord_broadcast_log WHERE text = ?",[message.content])
					
						console.log(message.content, isDuplicate);
						if(isDuplicate.length > 0) return;



					}

				}
			}

			// Introduction Channel
			//
			// Automatically register and welcome to general if they speak in the introduce-yourself channel.
			if(message.guild.id === "257838262943481857" && !message.member.roles.cache.get("581605959990771725") && message.channel.id === "1063966888201293974") {

				message.member.roles.add("581605959990771725");
				const general = message.guild.channels.cache.get("257838262943481857") as TextChannel;

				if(general) {

					await general.send(`Welcome to Forum Gotterfunken, <@${message.member.id}>!`);

				}

			}
				
			//
			// Reply Redirect
			//
			// IF reply and IF https in parent and IF mentioned channel and IF mentioned channel is forum -> copy to forum
			if(message.type === MessageType.Reply) {

				if(message.mentions.channels.size > 0) {

					const parentMsg = await message.fetchReference();
					if(!parentMsg.content.includes("https://")) return;

					const hasRole = message.member.roles.cache.some(role => ['Registered'].includes(role.name));
					if(!hasRole) return;

					if(message.author.bot) return; // ignore if user is a bot

					message.mentions.channels.each(async channelMentioned=>{
	
						await channelMentioned.fetch();
						if(channelMentioned.type !== ChannelType.GuildText) return;
	
						let channelMentionSend = parentMsg.content;
						if(!parentMsg.author.bot) {
							channelMentionSend = `By ${parentMsg.author.toString()} in ${message.channel.toString()}\n${parentMsg.content}`;
						}

						await channelMentioned.send(channelMentionSend);
	
						return;

					});
	
					return;
	
				}

			}



			// const result = discord.ChannelConfig.find((config: { channel: string }) => config.channel === message.channel.id);



			// .includes(message.channel.id);
			// // get channel data from config
			// const DiscordChannelData = await db.getConnectionQuery("SELECT * FROM channels WHERE channel_id = ?",[message.channel.id]);


			// //
			// // Ignore Channels
			// //
			// const ignoreChannel = discord.Config.Channels.filter(channel=>channel.category === "Ignore" && channel.channel_id === message.channel.id)
			// if(ignoreChannel.length > 0) return;

			// //
			// // Ignore everyones and heres
			// // 
			// if(message.mentions.everyone) return;

			// //
			// // Tweet Channels
			// //
			// const tweetChannels = discord.Config.Channels.filter(channel=>channel.category === "Twitter" && channel.channel_id === message.channel.id);
			// if(tweetChannels.length > 0) {
				
			// 	if (message.content.includes("https://")) {

			// 		await db.q("INSERT INTO log_articles SET ?",[{
			// 			user_id:message.author.id,
			// 			text:message.content
			// 		}]);

			// 		const hasRole = message.member?.roles.cache.some(role => ['Admin','Moderator','Trusted','Eurobot','Sponsor','Booster'].includes(role.name)) ?? false;
			// 		if(!hasRole) return;

			// 		const ModelArticle = new ArticleModel();
			// 		const post = await ModelArticle.post(message)
			// 			.catch(e=>{console.log(e)});

			// 	} else {

			// 		console.log(`DELETE [${message.content} by ${message.author}]`);
			// 		if(message.deletable) await message.delete();

			// 	}

			// 	return;

			// }


			//
			// TEU, TFEU LOOKUP
			// 
			const treaty = message.content.toLowerCase().match(/((\d+|\d+\.\d+) (tfeu|teu))/gm);
			if(treaty) {

				const treatyObj = await getTreaties(treaty);

				if(treatyObj && treatyObj.article && treatyObj.articleLink && treatyObj.articleLink) {

					let embed = new EmbedBuilder()
						.setTitle(treatyObj.title)
						.setColor(0xFFCC00)
						.setDescription(`**${treatyObj.article}**\n\n${treatyObj.articleText}\n\n${treatyObj.articleLink}`);

					await message.reply({embeds:[embed]});

				}

			}

			//
			// Brain
			//
			const clientUser = discord.Client.user;
			if(clientUser && (message.mentions.has(clientUser) || message.content.toLowerCase().includes(clientUser.username.toLowerCase()))) {

				if(message.author.id === clientUser.id) return;

				// Do not reply to messages that are replying to me if I posted a link
				if(message.type === MessageType.Reply && message.reference?.messageId) {
					const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
					if(repliedTo.content.toLowerCase().includes("https://") && repliedTo.author.id === clientUser.id) return;
				}

				// for random across multiple servers
				// const emoji = Discord.Client.guilds.cache.random().emojis.cache.random();

				// for random from this server

				const emoji = message.guild.emojis.cache.random();

				if(Math.random() > 0.45) {

					if(!emoji) return;
					await message.react(emoji);

				} else {

					const commentString = discord.ResponseConfig[Math.floor(Math.random()*discord.ResponseConfig.length)];

					let comment:string;
					// comment order
					if(Math.random() < 0.5) {
						comment =  `${commentString.response} ${emoji ? emoji : ""}`;
					} else {
						comment = `${emoji ? emoji : ""} ${commentString.response}`;
					}

					if(Math.random() < 0.66) {
						await message.reply(comment);
					} else {
						await (message.channel as TextChannel).send(comment);
					}

				}

			}
			// 	const model = new DiscordModel();


			// 	// TODO
			// 	// if(["are you", "is"])

			// 	if(Math.random() < 0.45) {

			// 		// respond
			// 		const comment = await model.comment(message,{emoji:emoji})

			// 		// reply type
			// 		if(!message.channel) {
			// 			await message.reply(comment);
			// 			return;
			// 		}

			// 		if(Math.random() < 0.66) {
			// 			await message.reply(comment);
			// 		} else {
			// 			await (message.channel as TextChannel).send(comment);
			// 		}

			// 	} else {

			// 		// react with emoji
			// 		await message.react(emoji);

			// 	}

			// 	return;
				
			// }

			// // EU flag React [loveEU]
			// if(message.content.toLowerCase().includes("🇪🇺")) {

			// 	if(message.author.id === discord.Client.user.id) return;

			// 	const emoji = message.guild.emojis.cache.random();
			// 	message.react(emoji);

			// 	return;

			// }

			// // keyword react
			// if(message.content.toLowerCase().includes("uschi") || message.content.toLowerCase().includes("metsola") || message.content.toLowerCase().includes("costa")) {

			// 	if(message.author.id === discord.Client.user.id) return;

			// 	const emoji = message.guild.emojis.cache.random();
			// 	message.react(emoji);

			// 	return;

			// }

			// // FREUDE React
			// if(message.content.toLowerCase().match(/freude[!?]*$/gm)) {

			// 	if(message.author.id === discord.Client.user.id) return;

			// 	const emoji = message.guild.emojis.cache.random();
			// 	await (message.channel as TextChannel).send(`SCHÖNER ${emoji}`);

			// 	return;

			// }

			// // GOTTERFUNKEN React
			// if(message.content.toLowerCase().endsWith("gotterfunken") || message.content.toLowerCase().endsWith("götterfunken")) {

			// 	if(message.author.id === discord.Client.user.id) return;

			// 	const emoji = message.guild.emojis.cache.random();
			// 	await (message.channel as TextChannel).send(`TOCHTER ${emoji}`);

			// 	return;

			// }

			// // GOTTERFUNKEN React
			// if(message.content === "AUS") {

			// 	if(message.author.id === discord.Client.user.id) return;

			// 	const emoji = message.guild.emojis.cache.random();
			// 	const emoji2 = message.guild.emojis.cache.random();

			// 	await (message.channel as TextChannel).send(`ELYSIUM ${emoji}`);
			// 	await (message.channel as TextChannel).send(`${emoji2}`);

			// 	return;

			// }

		}

		return;

	},

};