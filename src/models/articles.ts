// import fetch from "node-fetch";
// import * as FileType from "file-type"
// import * as https from "https";

// import Discord from "discord.js";

// // import Telegram from "../services/telegram";
// import Mastodon from "../services/mastodon";
// import BlueSky from "../services/bsky";




// export default class ArticleModel {

//     constructor() {

//     }

//     public async getByText(text:string) {

//         return await db.q(`SELECT * FROM log_articles WHERE text REGEXP ?`,[text]);

//     }


//     // Prepare tweet
//     public textSlice(message:Discord.Message,limit:number = 299,linkShortened:boolean = true) {

//         let text = message.content;

//         text = text.replace("\n"," ");
//         // Determine Length of tweet
//         const textArr = text.split(" ");
//         let textLink = "";
//         let textElements:string[] = [];
//         textArr.forEach(textElement=>{
//             if(textElement.includes("https://")) {
//                 textLink = textElement;
//             } else {
//                 textElements.push(textElement);
//             }
//         });

//         let prodTxt = textElements.join(" ");
//         if(prodTxt.length + textLink.length > limit) {
        
//             prodTxt = prodTxt.slice(0,(limit - (textLink.length + 3))) + "...";

//         }

//         prodTxt = prodTxt + "\n" + textLink;

//         return prodTxt;

//     }

//     //
//     // POST ARTICLE TO SOCIAL MEDIA
//     //
//     public async post(message:Discord.Message,user?:Discord.User|Discord.PartialUser) {
       
//         if(message.content.length < 1) return;

//         let discordUserID = message.author.id;
//         if(user) discordUserID = user.id;

//         const sanitizedTextSmall = this.textSlice(message,299,false);
//         const sanitizedTextLarge = this.textSlice(message,500,false);

//         let post:any = {};
//         if(sanitizedTextLarge) {
//             if(!message.content.endsWith(".png") && !message.content.endsWith(".jpg") && !message.content.endsWith(".jpeg")) {
//                 post.mastodon = await Mastodon.client.postStatus(sanitizedTextLarge,{})
//                     .catch((e:any)=>console.log(e));
//             }
//         }
//         // if(sanitizedTextLarge) {
//         //     if(!message.content.endsWith(".png") && !message.content.endsWith(".jpg") && !message.content.endsWith(".jpeg")) {
//         //         post.telegram = await Telegram.client.sendMessage("@euintnews",sanitizedTextLarge)
//         //             .catch(e=>console.log(e));
//         //     }
//         // }
//         if(sanitizedTextLarge) {
//             post.bluesky = await BlueSky.send(sanitizedTextSmall)
//                 .catch(e=>console.log(e));
//         }

//         return post;

//     }

