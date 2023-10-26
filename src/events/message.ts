import discord from "../services/discord";
import {Message,EmbedBuilder, TextChannel, BaseMessageOptions, User, MessageReaction, ChannelType,MessageType} from "discord.js";
import ArticleModel from "../models/articles";
import DiscordModel from "../models/discord";
import Tools from '../tools';
import {Eurobot} from "../../types/index.d";
import db from "../services/db";

module.exports = {

	name: 'messageCreate',
	async execute(message:Message) {

		// Routing
		if(discord.Config.Routes) {

			let channelId:string;
			if(message.webhookId) channelId = message.channelId;
			if(message.channel && message.channel.id) channelId = message.channel.id;

			if(!channelId) return;
			if(!message.guild) return;
			
			let routing = discord.Config.Routes.filter(route=>route.from === channelId)
			if(routing.length > 0) {

				const embed:EmbedBuilder | string = new EmbedBuilder()

				embed.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL()})
					.setColor(0x003399)
					.setFooter({text:`Via: Forum Götterfunken`, iconURL:`https://discord.gg/M2MnDyU`})
					.setDescription(message.content);

				const messageAttachment = message.attachments.size > 0 ? message.attachments.first().url : null;
				if(messageAttachment) embed.setImage(messageAttachment);

				let routedMessage:BaseMessageOptions = {};
				if(message.content.startsWith("https://")) routedMessage.content = message.content;

				routedMessage.embeds = [embed];

				routing = routing.filter(route=>route.isActive > 0);
				await Tools.asyncForEach(routing, async (route:Eurobot.Route)=>{
					const channel = discord.Client.channels.cache.get(route.to) as TextChannel;
					if(channel) await channel.send(routedMessage);

					console.log(`< ROUTING [${message.channel.id}]`);

					return;

				});

			}

		}

		// Channel specific functions
		if(message.channel) {

			// Ignore Channel
			const ignoreChannel = discord.Config.Channels.filter(channel=>channel.category === "Ignore" && channel.channel_id === message.channel.id)
			if(ignoreChannel.length > 0) return;

			// TWEET CHANNEL
			const tweetChannels = discord.Config.Channels.filter(channel=>channel.category === "Twitter" && channel.channel_id === message.channel.id);
			if(tweetChannels.length > 0) {
				
				if (message.content.includes("https://")) {

					await db.q("INSERT INTO log_articles SET ?",[{
						user_id:message.author.id,
						text:message.content
					}]);

					const hasRole = message.member.roles.cache.some(role => ['Admin','Moderator','Trusted','Eurobot','Sponsor','Booster'].includes(role.name));
					if(!hasRole) return;

					const ModelArticle = new ArticleModel();
					const post = await ModelArticle.post(message)
						.catch(e=>{console.log(e)});

				} else {

					console.log(`DELETE [${message.content} by ${message.author}]`);
					if(message.deletable) await message.delete();

				}

				return;

			}

			//Warnlist
			if(message.content.includes('https://')) {

				let type = "url"
				let root = "";
				let splitIndex = 2;

				let splitMsg = message.content.split(" ");
				splitMsg.forEach(s=>{

					if(s.startsWith("https://")){

						const twitterMatch = s.match(/^https:\/\/(www\.)?((twitter)|(fxtwitter)|(vxtwitter)|(fixupx)|(x))(\.com)\/\w*\/status\/[0-9]*/gm);
						if(twitterMatch) {
							type = "twitter";
							splitIndex = 3;
						}

						root = s.split('/')[splitIndex];

						if(root.startsWith("www.") && splitIndex === 2) {
							const rootD = root.split(".");
							rootD.splice(0,1);
							root = rootD.join(".");
						}

					}

				});
				const hasBlock = await db.q("SELECT rl, reason FROM url_warnlist WHERE type = ? AND rl = ?",[type,root]).catch(e=>console.log(e));
				if(hasBlock && hasBlock.length > 0) {

					let blockText = `${type==="twitter"?"@":""}${root} has been flagged as being an unreliable source of information. Please find alternate sources.`;

					if(hasBlock[0].reason) {
						blockText = hasBlock[0].reason;
					}

					await message.reply({embeds:[{
						title:"WARNING",
						description:blockText,
						color:15105570
					}]});

					// await message.delete();

					return;

				}

			}


			//Twitter fixes
			//
			// Regex:
			// https:\/\/(www\.)?((twitter)|(x))(\.com)\/\w*\/status\/[0-9]*
			// (twitter|x)(\.com)
			if(message.content.match(/https:\/\/(www\.)?((twitter)|(x))(\.com)\/\w*\/status\/[0-9]*/gm)) {

				const cleaned = message.content.replace(/(twitter|x)(\.com)/gm,"fxtwitter.com");
				await message.reply({content:cleaned,flags:[4096]});
				return;

			}

			// Reply redirect
			// IF reply and IF https in parent and IF mentioned channel and IF mentioned channel is forum -> copy to forum
			if(message.type === MessageType.Reply) {

				if(message.mentions.channels.size > 0) {

					const parentMsg = await message.fetchReference();
					if(!parentMsg.content.includes("https://")) return;

					const hasRole = message.member.roles.cache.some(role => ['Admin','Moderator','Trusted','Eurobot','Sponsor','Booster'].includes(role.name));
					if(!hasRole) return;

					message.mentions.channels.each(async channelMentioned=>{
	
						await channelMentioned.fetch();
						if(!channelMentioned.isTextBased()) return;
						if(!channelMentioned.isThread()) return;
	
						await channelMentioned.send(`By ${parentMsg.author.toString()} in ${message.channel.toString()}\n${parentMsg.content}`);
	
						return;

					});
	
					return;
	
				}

			}

			// Brain
			if(message.mentions.has(discord.Client.user) || message.content.toLowerCase().includes(discord.Client.user.username.toLowerCase())) {

				if(message.author.id === discord.Client.user.id) return;

				const model = new DiscordModel();

				// for random across multiple servers
				// const emoji = Discord.Client.guilds.cache.random().emojis.cache.random();

				// for random from this server
				const emoji = message.guild.emojis.cache.random();

				// TODO
				// if(["are you", "is"])

				if(Math.random() < 0.45) {

					// respond
					const comment = await model.comment(message,{emoji:emoji})

					// reply type
					if(!message.channel) {
						await message.reply(comment);
						return;
					}

					if(Math.random() < 0.66) {
						await message.reply(comment);
					} else {
						await (message.channel  as TextChannel).send(comment);
					}

				} else {

					// react with emoji
					await message.react(emoji);

				}

				return;
				
			}

			// EU flag React [loveEU]
			if(message.content.toLowerCase().includes("🇪🇺")) {

				if(message.author.id === discord.Client.user.id) return;

				const emoji = message.guild.emojis.cache.random();
				message.react(emoji);

				return;

			}

			// keyword react
			if(message.content.toLowerCase().includes("uschi") || message.content.toLowerCase().includes("metsola") || message.content.toLowerCase().includes("michel")) {

				if(message.author.id === discord.Client.user.id) return;

				const emoji = message.guild.emojis.cache.random();
				message.react(emoji);

				return;

			}

			// FREUDE React
			if(message.content.toLowerCase().match(/freude[!?]*$/gm)) {

				if(message.author.id === discord.Client.user.id) return;

				const emoji = message.guild.emojis.cache.random();
				await (message.channel as TextChannel).send(`SCHÖNER ${emoji}`);

				return;

			}

			// GOTTERFUNKEN React
			if(message.content.toLowerCase().endsWith("gotterfunken") || message.content.toLowerCase().endsWith("götterfunken")) {

				if(message.author.id === discord.Client.user.id) return;

				const emoji = message.guild.emojis.cache.random();
				await (message.channel as TextChannel).send(`TOCHTER ${emoji}`);

				return;

			}

			// GOTTERFUNKEN React
			if(message.content === "AUS") {

				if(message.author.id === discord.Client.user.id) return;

				const emoji = message.guild.emojis.cache.random();
				const emoji2 = message.guild.emojis.cache.random();

				await (message.channel as TextChannel).send(`ELYSIUM ${emoji}`);
				await (message.channel as TextChannel).send(`${emoji2}`);

				return;

			}

		}

		return;

	},

};