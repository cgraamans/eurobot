import fetch from "node-fetch";
import * as FileType from "file-type"
import * as https from "https";

import Discord from "discord.js";
import twitter from "twitter";

import Twitter from "../services/twitter";
import Telegram from "../services/telegram";
import Mastodon from "../services/mastodon";
import BlueSky from "../services/bsky";

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
    public textSlice(message:Discord.Message,limit:number = 280,linkShortened:boolean = true) {

        let text = message.content;

        text = text.replace("\n"," ");
        // Determine Length of tweet
        const textArr = text.split(" ");
        let textLink = "";
        let textElements:string[] = [];
        textArr.forEach(textElement=>{
            if(textElement.includes("https://")) {
                textLink = textElement;
            } else {
                textElements.push(textElement);
            }
        });

        let prodTxt = textElements.join(" ");
        if(prodTxt.length + textLink.length > 280) {
        
            prodTxt = prodTxt.slice(0,(280 - (textLink.length + 3))) + "...";

        }

        prodTxt = prodTxt + "\n" + textLink;

        return prodTxt;

    }

    //
    // POST ARTICLE TO SOCIAL MEDIA
    //
    public async post(message:Discord.Message,user?:Discord.User|Discord.PartialUser) {
       
        if(message.content.length < 1) return;

        let discordUserID = message.author.id;
        if(user) discordUserID = user.id;

        const sanitizedTextSmall = this.textSlice(message);
        const sanitizedTextLarge = this.textSlice(message,500,false);

        const post:{twitter:void|twitter.ResponseData,mastodon:any,telegram:any,bluesky:void|{
            uri: string;
            cid: string;
        }} = {twitter:undefined,mastodon:undefined,telegram:undefined,bluesky:undefined};

        if(sanitizedTextSmall) {
            if(!message.content.endsWith(".png") && !message.content.endsWith(".jpg") && !message.content.endsWith(".jpeg")) {
                const tweetMedia = await this.tweetData(message);
                post.twitter = await Twitter.post(sanitizedTextSmall,tweetMedia)
                    .catch(e=>console.log(e));    
            }
        }
        if(sanitizedTextLarge) {
            if(!message.content.endsWith(".png") && !message.content.endsWith(".jpg") && !message.content.endsWith(".jpeg")) {
                post.mastodon = await Mastodon.client.postStatus(sanitizedTextLarge,{})
                    .catch((e:any)=>console.log(e));
            }
        }
        if(sanitizedTextLarge) {
            if(!message.content.endsWith(".png") && !message.content.endsWith(".jpg") && !message.content.endsWith(".jpeg")) {
                post.telegram = await Telegram.client.sendMessage("@euintnews",sanitizedTextLarge)
                    .catch(e=>console.log(e));
            }
        }
        if(sanitizedTextLarge) {
            post.bluesky = await BlueSky.send(sanitizedTextLarge)
                .catch(e=>console.log(e));
        }

        return post;

    }

}