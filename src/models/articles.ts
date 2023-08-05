import fetch from "node-fetch";

import Discord from "discord.js";
import * as FileType from "file-type"
import * as https from "https";

import Twitter from "../services/twitter";
import twitter from "twitter";

import Telegram from "../services/telegram";

import Mastodon from "../services/mastodon";

import Tools from '../tools';
import {Eurobot} from "../../types/index";
import db from "../services/db";

export default class ArticleModel {

    constructor() {

    }

    private async getFile(url:string):Promise<Buffer> {

        return new Promise((resolve,reject)=>{

            let data:any[] = []

            https.get(url, (res) => {

                if (res.statusCode === 200) {

                    res.on("data",chunk=>{
                        data.push(chunk);
                    });

                    res.on("end",()=>{
                        const buffer:Buffer = Buffer.concat(data);
                        resolve(buffer);
                    });

                    res.on("error",err=>{
                        reject(err);
                    });

                } else {

                    reject(`Server responded with ${res.statusCode}: ${res.statusMessage}`);

                }

            });

        });

    }

    public async getByText(text:string) {

        return await db.q(`SELECT * FROM log_articles WHERE text REGEXP ?`,[text]);

    }

    // Prepare tweet data (attachments)
    public async tweetData(message:Discord.Message) {

        let tweetMedia:Eurobot.Twitter.MediaObj[] = [];

        // images [WIP]
        if(message.attachments) {

            let urls:string[] = [];

            message.attachments.forEach(attachment=>{
                urls.push(attachment.url);
            });

            await Tools.asyncForEach(urls,async (url:string)=>{

                const file = await this.getFile(url)
                                .catch(e=>{console.log(e)});

                if(file) {

                    const type = FileType.fromBuffer(file).toString();
                    tweetMedia.push({size:Buffer.byteLength(file).toString(),type:type,data:file});

                }


            });

        }

        return tweetMedia
        

    }

    // Prepare tweet
    public sanitizeTweet(message:Discord.Message) {

        let text = message.content;

        // Determine Length of tweet
        const textArr = text.split(" ");
        let textLinks = 0;
        let textElements:string[] = [];
        textArr.forEach(textElement=>{
            if(textElement.startsWith("https://")) {
                textLinks++;
            } else {
                textElements.push(textElement);
            }
        });

        let prodTxt = textArr.join(" ");
        if(prodTxt.length + (textLinks * 23) > 280) {
        
            prodTxt = prodTxt.slice(0,(280 - (textLinks * 23) - 3)) + "...";

        }

        return prodTxt;

    }

    public sanitizeMasto(message:Discord.Message) {

        let text = message.content;

        // Determine Length of tweet
        const textArr = text.split(" ");
        let textLinks = 0;
        let textElements:string[] = [];
        textArr.forEach(textElement=>{
            if(textElement.startsWith("https://")) {
                textLinks++;
            } else {
                textElements.push(textElement);
            }
        });

        let prodTxt = textArr.join(" ");
        if(prodTxt.length + (textLinks * 23) > 500) {
        
            prodTxt = prodTxt.slice(0,(500 - (textLinks * 23) - 3)) + "...";

        }

        return prodTxt;

    }

    public async masto(text:string) {

        return Mastodon.client.postStatus(text,{})
            .catch((err:any)=>console.log(err));

    }

    //
    // POST ARTICLE TO SOCIAL MEDIA
    //
    public async post(message:Discord.Message,user?:Discord.User|Discord.PartialUser) {
       
        if(message.content.length < 1) return;

        let discordUserID = message.author.id;
        if(user) discordUserID = user.id;

        const tweetMedia = await this.tweetData(message);
        const sanitizedTweet = this.sanitizeTweet(message);
        const sanitizedMasto = this.sanitizeMasto(message);

        const post:{twitter:void|twitter.ResponseData,mastodon:any,telegram:any} = {twitter:undefined,mastodon:undefined,telegram:undefined};

        if(sanitizedTweet) {
            post.twitter = await Twitter.post(sanitizedTweet,tweetMedia).catch(e=>console.log(e));
        }
        if(sanitizedMasto) {
            post.mastodon = await this.masto(sanitizedMasto).catch(e=>console.log(e));
        }
        if(sanitizedMasto){
            post.telegram = await Telegram.client.sendMessage("@euintnews",sanitizedTweet).catch(e=>console.log(e));
        }

        // console.log("> BROADCAST",post);

        return post;

    }

}