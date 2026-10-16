import discord from "../services/discord.js";
import {TextChannel} from "discord.js";
import * as T from "../../types/index.d.js"
import { link } from "fs";
import ffmpeg from "fluent-ffmpeg";
import streams from "memory-streams"
/**
 * Publish a Reddit submission to Discord channels based on the subreddit and type.
 * @param item - The Reddit submission object to be published.
 * @param subreddit - The name of the subreddit from which the submission originates.
 * @param type - The type of the Discord channel to which the submission should be posted.
 * @returns A promise resolving to a boolean indicating whether the submission was posted.
 */
export const publishRedditToDiscord = async (item:T.SubmissionObj,subreddit:string,type:string) => {

    const mediaMetadataLinks:string[] = [];
    if(item.media_metadata) {

        for(const media in item.media_metadata) {

            const mediaObj = item.media_metadata[media];
            const s = mediaObj.s;
            if ("u" in s) {
                let mediaUrl = s.u as string;
                mediaMetadataLinks.push(mediaUrl);
            }

        }

    }

    if(item.url.includes("i.redd.it")){
        mediaMetadataLinks.push(item.url);
    }

    if(!item.url.startsWith("https://") && mediaMetadataLinks.length < 1) return false;

    if(mediaMetadataLinks.length > 4) {
        mediaMetadataLinks.slice(0, 4);
    }

    let link = item.url;
    if(item.url.includes("www.reddit.com/gallery")) {
        link = "<" + item.url + ">";
    }

    let isPosted:boolean = false;
    const guilds = discord.Client.guilds.cache;
    for(const guild of guilds.values()) {

        for(const channelObj of discord.ChannelConfig) {

            if(channelObj.type !== type) continue;

            const channel = guild.channels.cache.get(channelObj.channel) as TextChannel;
            if(channel) {

                const url = (item.url.includes("i.redd.it")) ? "" : `\n`+link;
                const text = `${item.title}${url}\n#${subreddit}`;

                console.log(`> POSTING:Reddit (${subreddit}) -> #News`);
                await channel.send({ content: text, files: mediaMetadataLinks }).catch(e=>{console.log(e)});

                isPosted = true;

            }

        }

    }

    return isPosted;

}

export const fetchRedditVideo = async (item:T.SubmissionObj) => {

    if(!item.media) return;
    if(!item.media.reddit_video) return;
    const dashUrl = item.media.reddit_video.dash_url;

    console.log('dashURL',dashUrl);

    const out = new streams.WritableStream();

    ffmpeg(dashUrl)
        .outputOptions("-c copy")
        .on('end', () => {
          console.log(`Success! Video saved.`);

            return out;
    
        })
        .output(out)
        .run();

}