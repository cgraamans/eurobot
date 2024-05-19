import * as fs from "fs";
import { Collection, EmbedBuilder, TextChannel} from "discord.js";
import {Eurobot} from "./types/index";

import Discord from "./src/services/discord";
import db from "./src/services/db";

import {CalendarModel} from "./src/models/google";
import NewsModel from "./src/models/news";
import DiscordModel from "./src/models/discord";

import google from "./src/services/google";
import Tools from './src/tools';

import * as schedule from "node-schedule";
import * as path from 'path';

let jobs:schedule.Job[] = [];



const calendarModel = new CalendarModel();
const discordModel = new DiscordModel();

console.log(`APP [${new Date()}] @ ${__dirname}`);

const welcomeMessage = `Welcome to Forum Gotterfunken.



\`\`\`
Forum Gotterfunken is an EU-OSINT Server on Discord. EU-OSINT stands for European Union - Open Source Intelligence. We aim to provide up to date news and information regarding events in and around the EU from a European Perspective.

Please read the #introduction and adhere to the #rules, say hello in #introduce-yourself, visit the serious-effort channels for news and information and come hang out in #general-effort for a casual chat. 
\`\`\`

- type \`/help\` for more information  
- type \`/roles\` to view avaiable roles and functions.

Be nice and remember the human.

Kindest regards, 
the Mod Team`;

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

// guildMemberAdd Message
Discord.Client.on("guildMemberAdd", async (member)=>{

    const embed = new EmbedBuilder()
    .setTitle(`🇪🇺 Welcome to Forum Gotterfunken.`)
    .setDescription(welcomeMessage)
    .setColor(0x001489)
    .setFooter({text:`use /help in the discord server for more information. :)`});
    await member.send({embeds:[embed]}).catch(e=>console.log(e));
    
});

//
// JOBS
//

try {

    // CALENDAR JOB MORNING
    jobs.push(schedule.scheduleJob(`0 7 * * *`, async function(){

        console.log(`> JOB:Calendar (Morning)`);

		const span:Eurobot.Calendar.Span = calendarModel.textToUnixTimeRange("today");
		const items = await google.Calendar(span.range).catch(e=>{console.log(e)});
        if(!items || items.length < 1) return;

		const calendar = calendarModel.toStringCalendar(items,span)

		const calendarDescription:string = `Calendar for ${span.human}\n\n`;

		const embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Calendar`)
			.setDescription(calendarDescription + calendar)
			.setColor(0x001489)
            .setFooter({text:`use /calendar :)`});
    
        await discordModel.pushEmbedToDiscord("Job-Calendar",embed);

        return;

    }));


    // CALENDAR JOB EVENING
    jobs.push(schedule.scheduleJob(`0 19 * * *`, async function(){
    
        console.log(`> JOB:Calendar (Evening)`);

		const span:Eurobot.Calendar.Span = calendarModel.textToUnixTimeRange("tomorrow");
		const items = await google.Calendar(span.range).catch(e=>{console.log(e)});
        if(!items || items.length < 1) return;

		const calendar = calendarModel.toStringCalendar(items,span)

		const calendarDescription:string = `Calendar for ${span.human}\n\n`;

		const embed = new EmbedBuilder()
			.setTitle(`🇪🇺 Eurobot Calendar`)
			.setDescription(calendarDescription + calendar)
			.setColor(0x001489);  
    
        await discordModel.pushEmbedToDiscord("Job-Calendar",embed);

        return;

    }));

    // News JOB
    jobs.push(schedule.scheduleJob(`0 */4 * * *`, async function(){
        
        let newsObj:Eurobot.News.Obj = {keyword:"eunews"};

        const subreddits = ['eunews','europeanarmy','europeanfederalists','europeanculture','europeanunion','euspace','eutech'];
        newsObj.keyword = subreddits[Math.floor(Math.random()*subreddits.length)];
        
        console.log(`> JOB:News (${newsObj.keyword})`);

        // get news
        const newsModel = new NewsModel(3);
		const keywordObjRow = await newsModel.getKeywordObjRow(newsObj.keyword);
        if(!keywordObjRow) return;
        
        newsObj.row = keywordObjRow;

		// get news
		newsObj = await newsModel.get(newsObj);
        if(!newsObj) return;

		if((newsObj.subreddit && newsObj.subreddit.length > 0) || (newsObj.twitter && newsObj.twitter.length > 0)) {    

            const embed = newsModel.toRich(newsObj);
            if(!embed) return;
            
            embed.setFooter({text:`/r/${newsObj.row.name} - use /news for more news :)`});

            await discordModel.pushEmbedToDiscord("Job-News",embed);
    
        }

        return;

    }));

    // News to articles job
    jobs.push(schedule.scheduleJob(`*/2 * * * *`, async function(){

        let newsObj:Eurobot.News.Obj = {keyword:"EUNews"};
        const subreddits = ['EUNews','EuropeanArmy','EuropeanUnion','EUSpace','EUTech','EuropeanFederalists','EuropeanCulture'];

        newsObj.keyword = subreddits[Math.floor(Math.random()*subreddits.length)];
        console.log(`> JOB:News-To-Articles (${newsObj.keyword})`);

        // get news
        const newsModel = new NewsModel(10);

        newsObj = await newsModel.get(newsObj);
        if(!newsObj) return;
        if((newsObj.subreddit &&newsObj.subreddit.length > 0) || (newsObj.twitter && newsObj.twitter.length > 0)) {    

            await Promise.all(newsObj.subreddit.map(async (item)=>{

                if(!item.title || !item.url) return;
                if(item.thumbnail === "self" || item.thumbnail === "nsfw" || item.thumbnail === "default") return;
                if(item.is_self || item.is_video || item.is_meta) return;
                if(item.num_crossposts > 0) return;
                if(item.url.endsWith(".jpg")) return;
                if(item.url.endsWith(".png")) return;
                if(item.url.startsWith("https://v.redd.it")) return;

                const hasWhitelist = await db.q(`SELECT * from reddit_whitelist WHERE name = ?`,[item.author.name]);
                if(hasWhitelist.length < 1) return;

                const hasDoubles = await db.q(`
                    SELECT * FROM log_articles WHERE text = ? OR text LIKE ? OR text LIKE ? OR text LIKE ?
                    `,[
                        item.url,
                        item.url+"%",
                        "%"+item.url,
                        "%"+item.url+"%"
                    ])
                    .catch(e=>console.log(e));
    
                if(hasDoubles.length > 0) return;
               
                // post to articles
                await discordModel.pushTextToDiscord("Reddit-to-Articles",`${item.title}\n${item.link_flair_text?"#" + item.link_flair_text + " ":""}#${newsObj.keyword} \n`+item.url);

            }));

        }

    }));


} catch(e) {

    console.error(e);

}