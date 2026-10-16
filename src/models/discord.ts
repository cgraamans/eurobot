import {Message, EmbedBuilder, TextChannel} from "discord.js";
import discord from "../services/discord.js";


// push embed job outputs to discord
export const postEmbedToDiscord = async (channelType:string,embed:EmbedBuilder) => {

    const confChannels = discord.ChannelConfig.filter(ch=>ch.type === channelType);
    if(confChannels.length < 1) return;

    for(const guild of discord.Client.guilds.cache.values()) {

        for(const targetChannel of confChannels) {

            const channel = guild.channels.cache.get(targetChannel.channel) as TextChannel;
            if(channel) {
                await channel.send({embeds:[embed]}).catch(e=>{console.log(e)});
            }
            return;

        }

        return;

    };

    return;

}

//     // push embed title/url combos to discord
//     public async pushTextToDiscord(name:string,text:string) {

//         const confChannels = discord.Config.Channels.filter(ch=>ch.category === name);
//         if(confChannels.length < 1) return;
        
//         discord.Client.guilds.cache.forEach(guild => {

//             Tools.asyncForEach(confChannels,async (target:Eurobot.Channel) => {

//                 const channel = guild.channels.cache.get(target.channel_id) as TextChannel;
//                 if(channel) {
//                     await channel.send({content:text}).catch(e=>{console.log(e)});
//                 }
//                 return;

//             });

//             return;

//         });

//         return;


//     }

// }