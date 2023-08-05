import {Message, EmbedBuilder, TextChannel} from "discord.js";
import discord from "../services/discord";
import {Eurobot} from "../../types/index";

import Tools from '../tools';

export default class DiscordModel {

    constructor() {}

    // comment with emoji and category as options
    public async comment(message:Message,options?:Eurobot.Message.Comment) {
        
        options = Object.assign({category:"default"},options);
        
        const Reactions = discord.Config.Reactions.filter(r=> r.category === options.category);
        if(Reactions.length < 1) return;
        const Reaction = Reactions[Math.floor(Math.random() * (Reactions.length - 1))];

        let comment:string;
        // comment order
        if(Math.random() < 0.5) {
            comment =  `${Reaction.reaction} ${options.emoji ? options.emoji : ""}`;
        } else {
            comment = `${options.emoji ? options.emoji : ""} ${Reaction.reaction}`;
        }

        return comment;

    }

    // push embed job outputs to discord
    public async pushEmbedToDiscord(name:string,embed:EmbedBuilder){
        
        const confChannels = discord.Config.Channels.filter(ch=>ch.category === name);
        if(confChannels.length < 1) return;
        
        discord.Client.guilds.cache.forEach(guild => {

            Tools.asyncForEach(confChannels,async (target:Eurobot.Channel) => {

                const channel = guild.channels.cache.get(target.channel_id) as TextChannel;
                if(channel) {
                    await channel.send({embeds:[embed]}).catch(e=>{console.log(e)});
                }
                return;

            });

            return;

        });

        return;

    }

    // push embed title/url combos to discord
    public async pushTextToDiscord(name:string,text:string) {

        const confChannels = discord.Config.Channels.filter(ch=>ch.category === name);
        if(confChannels.length < 1) return;
        
        discord.Client.guilds.cache.forEach(guild => {

            Tools.asyncForEach(confChannels,async (target:Eurobot.Channel) => {

                const channel = guild.channels.cache.get(target.channel_id) as TextChannel;
                if(channel) {
                    await channel.send({content:text}).catch(e=>{console.log(e)});
                }
                return;

            });

            return;

        });

        return;


    }

}