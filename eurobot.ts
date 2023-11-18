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

const welcomeMessage = `
**About Forum Gotterfunken**

Forum Gotterfunken is an EU-OSINT Server on Discord. EU-OSINT stands for \`European Union - Open Source Intelligence\`. We aim to provide up to date news and information regarding events in and around the EU from a European Perspective.

For serious EU and geopolitical news visit the "Serious Effort" category channels like #serious-effort and #geopolitics.

Please read the #about-us and adhere to the #rules, say hello in #introduce-yourself and come hang out in #general. You can read more about us here: https://discord.com/servers/forum-gotterfunken-257838262943481857

You can support us at https://ko-fi.com/gotterfunken and get special perks!

**About this bot**

Eurobot is our AI Bot. He can provide you with a number of roles and functions. use \`/help\` for more information. Use the commands below to assign roles and register.

Commands:
\`\`\`

    /register - register as an active user

	/country - list countries
	/country <country name> - add/remove country role (and register as an active user).

	/EUGroup - list European Parliamentary group roles
	/EUGroup <parliamentary group name> - add/remove group role (and register as an active user)

    /news - get hot subreddit news
	/latest - latest subreddit news
	/calendar - list calendar entries

\`\`\`

Note: 
Since this is an EU server, EU countries are represented with roles. Non-EU citizens are of course welcome and can join an European Parliamentary Group or add the non-eu country role.

**And finally...**

Trusted users, Users who boost the server and users who contribute to our ko.fi account (https://ko-fi.com/gotterfunken) get to join our secret society!

Come hang with us in #general and discuss today's EU events!

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