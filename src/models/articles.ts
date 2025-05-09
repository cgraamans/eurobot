import fetch from "node-fetch";
import * as FileType from "file-type"
import * as https from "https";

import Discord from "discord.js";

import Telegram from "../services/telegram";
import Mastodon from "../services/mastodon";
import BlueSky from "../services/bsky";

import {Eurobot} from "../../types/index";
import db from "../services/db";

import axios from "axios";
import * as cheerio from 'cheerio';


export default class ArticleModel {

    constructor() {

    }

    public async getByText(text:string) {

        return await db.q(`SELECT * FROM log_articles WHERE text REGEXP ?`,[text]);

    }


    // Prepare tweet
    public textSlice(message:Discord.Message,limit:number = 299,linkShortened:boolean = true) {

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
        if(prodTxt.length + textLink.length > limit) {
        
            prodTxt = prodTxt.slice(0,(limit - (textLink.length + 3))) + "...";

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

        const sanitizedTextSmall = this.textSlice(message,299,false);
        const sanitizedTextLarge = this.textSlice(message,500,false);

        let post:any = {};
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
            post.bluesky = await BlueSky.send(sanitizedTextSmall)
                .catch(e=>console.log(e));
        }

        return post;

    }

    //
    // GET EU TREATIES
    //
    public async getTreaties(treatyString:string[]):Promise<void|Eurobot.Treaty.Obj> {

        try {

            const TFEUsplit = treatyString[0].split(" ");
            let art = TFEUsplit[0];
            let subArtInt;
            let maxArt = 358;
            let artURL = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A12016E";
            let returnObj:Eurobot.Treaty.Obj = {
                title:`🇪🇺 Treaty on the Functioning of the European Union`
            }


            if(TFEUsplit[1] === 'teu') {
                returnObj.title = `🇪🇺 Treaty on European Union`;
                maxArt = 55
                artURL = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A12016M";
            }

            if(art.includes(".")){
                const splitArtArr = art.split(".");
                subArtInt = parseInt(splitArtArr[1]);
                art = splitArtArr[0];
            }
            
            const artInt = parseInt(art);

            if(artInt > maxArt) art = "001";
            if(artInt < 100) art = "0" + art;
            if(artInt < 10) art = "0" + art;
            if(artInt < 0) art = "001";
            
            returnObj.articleLink = artURL + art;
            
            let ml = await axios.get(returnObj.articleLink).catch(e=>{console.log(e)});
            if(!ml) return;
        
            const $ = cheerio.load(ml.data);
            
            let artTitle = $("div#document1").find("div.tabContent > div > p.ti-art").text();
            if(!artTitle && artTitle.length < 1) return;
        
            artTitle = artTitle.replace(/(\&nbsp;)/gm,"");
            returnObj.article = artTitle;

            let artTxtArr = $("div#document1")
                .find("div.tabContent > div > p.normal")
                .toArray()
                .map(elem=> $(elem).text());

            if(subArtInt && artTxtArr.length > subArtInt-1) {
                
                let locatedSubArt;
                for(let i=0,c=artTxtArr.length;i<c;i++) {
                    if(artTxtArr[i].startsWith(subArtInt.toString())) {
                        locatedSubArt = i;
                    }
                }

                if(locatedSubArt) {
                    artTxtArr[0] = artTxtArr[locatedSubArt];
                    artTxtArr.length = 1;
                }
                
            }

            if(artTxtArr.length > 3) {
                artTxtArr.length = 3;
                artTxtArr.push(`[...]`)
            }

            returnObj.articleText = artTxtArr.join('\n');

            return returnObj;

        } catch(e) {

            return;

        }

    }

}