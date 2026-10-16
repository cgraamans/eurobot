import * as fs from "fs";
import { Collection, EmbedBuilder, TextChannel} from "discord.js";
import { Listing } from "snoowrap";

import Discord from "./src/services/discord.js";
import db from "./src/services/db.js";
import reddit from "./src/services/reddit.js";
import google from "./src/services/google.js";

import { textToUnixTimeRange, toStringCalendar } from "./src/models/google.js"
import { publishRedditToDiscord, fetchRedditVideo } from "./src/models/reddit.js";
import { postEmbedToDiscord } from "./src/models/discord.js"
import * as T from "./types/index.d.js";



// import {CalendarModel} from "./src/models/google";
// import NewsModel from "./src/models/news";
// import DiscordModel from "./src/models/discord";

// import Tools from './src/tools';

import * as schedule from "node-schedule";
import * as path from 'path';

let jobs:schedule.Job[] = [];



// const calendarModel = new CalendarModel();
// const discordModel = new DiscordModel();

console.log(`APP [${new Date()}] @ ${__dirname}`);

// const welcomeMessage = `Welcome to Forum Gotterfunken.

// Forum Gotterfunken is an EU-OSINT Server on Discord. EU-OSINT stands for European Union - Open Source Intelligence. We aim to provide up to date news and information regarding events in and around the EU from a European Perspective.

// Please read the #about-us and adhere to the #rules, say hello in #introduce-yourself, visit the serious-effort channels for news and information and come hang out in #general-effort for a casual chat.

// - type \`/help\` for more information  
// - type \`/roles\` to view avaiable roles and functions.

// Be nice and remember the human.

// Kindest regards, 
// the Mod Team`;

// SET COMMANDS
try {

    Discord.Client.commands = new Collection();

    const foldersPath = path.join(__dirname,'/src/commands');
    const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {

        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
    
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                Discord.Client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

	}

} catch(e) {

    console.log(e);

}

// INTERACTIONS
Discord.Client.on("interactionCreate", async (interaction)=>{

    if (!interaction.isCommand()) return;

    const command = Discord.Client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`>> ${interaction.commandName} by ${interaction.user.username}`,error,`\n`);
        await interaction.reply({ content: 'Eurobot errored while executing this command!', ephemeral: true });
    }

});

//
// JOBS
//

try {

    // CALENDAR JOB MORNING
    jobs.push(schedule.scheduleJob(`0 7 * * *`, async function(){

        console.log(`> JOB:Calendar (Morning)`);

		const span:T.CalendarSpan|undefined = textToUnixTimeRange("today");
        if(!span) return;
		const items = await google.Calendar(span.range).catch(e=>{console.log(e)});
        if(!items || items.length < 1) return;

		const calendar = toStringCalendar(items,span)

		const calendarDescription:string = `Calendar for ${span.human}\n\n`;

		const embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Calendar`)
			.setDescription(calendarDescription + calendar)
			.setColor(0x001489)
            .setFooter({text:`use /calendar :)`});
    
        await postEmbedToDiscord("calendar",embed);

        return;

    }));

    // CALENDAR JOB EVENING
    jobs.push(schedule.scheduleJob(`0 21 * * *`, async function(){

        console.log(`> JOB:Calendar (Evening)`);

		const span:T.CalendarSpan|undefined = textToUnixTimeRange("tomorrow");
        if(!span) return;
		const items = await google.Calendar(span.range).catch(e=>{console.log(e)});
        if(!items || items.length < 1) return;

		const calendar = toStringCalendar(items,span)

		const calendarDescription:string = `Calendar for ${span.human}\n\n`;

		const embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Calendar`)
			.setDescription(calendarDescription + calendar)
			.setColor(0x001489)
            .setFooter({text:`use /calendar :)`});
    
        await postEmbedToDiscord("calendar",embed);

        return;

    }));

//     // News JOB
//     jobs.push(schedule.scheduleJob(`0 */4 * * *`, async function(){
        
//         let newsObj:Eurobot.News.Obj = {keyword:"eunews"};

//         const subreddits = ['eunews','europeanarmy','europeanfederalists','europeanculture','europeanunion','euspace','eutech'];
//         newsObj.keyword = subreddits[Math.floor(Math.random()*subreddits.length)];
        
//         console.log(`> JOB:News (${newsObj.keyword})`);

//         // get news
//         const newsModel = new NewsModel(3);
// 		const keywordObjRow = await newsModel.getKeywordObjRow(newsObj.keyword);
//         if(!keywordObjRow) return;
        
//         newsObj.row = keywordObjRow;

// 		// get news
// 		newsObj = await newsModel.get(newsObj,"new");
//         if(!newsObj) return;

// 		if((newsObj.subreddit && newsObj.subreddit.length > 0) || (newsObj.twitter && newsObj.twitter.length > 0)) {    

//             const embed = newsModel.toRich(newsObj);
//             if(!embed) return;
//             if(!newsObj.row) return;
            
//             embed.setFooter({text:`/r/${newsObj.row.name} - use /news for more news :)`});

//             await discordModel.pushEmbedToDiscord("Job-News",embed);
    
//         }

//         return;

//     }));

    // JOB:Reddit -> #News
    jobs.push(schedule.scheduleJob(`*/2 * * * *`, async function(){

        const subreddits = await db.query(`SELECT * FROM reddit_feeds WHERE active = 1`);
        if(!subreddits || subreddits.length < 1) return;

        const subreddit = subreddits[Math.floor(Math.random()*subreddits.length)];
        console.log(`> JOB:Reddit (${subreddit.name}) -> #News`);

        const newList: Listing<T.SubmissionObj>|void = await reddit.client.getNew(subreddit.name, { limit: 30 }).catch(e=>console.log(e));

        if(!newList || newList.length < 1) return;

        for (const item of newList) {

            if(!item.title || !item.url) continue;
            if(item.thumbnail === "self" || item.thumbnail === "nsfw" || item.thumbnail === "default") continue;
            if(item.is_self || item.is_video) continue;
            if(item.url.startsWith("https://v.redd.it")) {

                const video = fetchRedditVideo(item);
                console.log(video);
                continue;

            }

            const hasDoubles = await db.query(`SELECT * FROM discord_reddit_log WHERE id = ? OR url = ?`,[item.id,item.url]);
            if(hasDoubles && hasDoubles.length > 0) continue;

            const hasWhitelist = await db.query(`SELECT name from reddit_whitelist WHERE name = ?`,[item.author.name]);
            if(!hasWhitelist || hasWhitelist.length < 1) continue;

            const post = await publishRedditToDiscord(item,subreddit.name,"reddit_news").catch(e=>{console.error(e)});

            if(post) {
                await db.query(`INSERT INTO discord_reddit_log (id,url) VALUES (?,?)`,[item.id,item.url]);
            }

        }

    }));

} catch(e) {

    console.error(e);

}