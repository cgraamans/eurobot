// import * as fs from 'fs';
// import {REST} from '@discordjs/rest';
// import {Routes} from 'discord-api-types/v9';
// import discord from "./src/services/discord";

// const commands = [];

// const commandFiles = fs.readdirSync('./src/commands').filter(file=>!file.endsWith(".map"));

// // Place your client and guild ids here

// Eurobot
const clientId = '673969077319892992';

// // EucoBot
// // const clientId = '736008030532927599';

// FG
const guildId = '257838262943481857';

// // EP
// // const guildId = '637843781617713172';

// // FG-E
// // const guildId = '633016043136090124';

// for (const file of commandFiles) {
// 	const command = require(`./src/commands/${file}`);
// 	commands.push(command.data.toJSON());
// }

// const rest = new REST({ version: '9' }).setToken(process.env["EUROBOT_DISCORD"]);

// (async () => {
// 	try {
// 		console.log('Started refreshing application (/) commands.');

// 		await rest.put(
// 			Routes.applicationCommands(clientId),
// 			{ body: commands },
// 		);		

// 		// await rest.put(
// 		// 	Routes.applicationGuildCommands(clientId, guildId),
// 		// 	{ body: commands },
// 		// );

// 		console.log('Successfully reloaded application (/) commands.');
// 	} catch (error) {
// 		console.error(error);
// 	}

// })();




import { REST, Routes } from 'discord.js';
// import { clientId, guildId, token } from './config.json';
import fs from 'fs';
import path from 'path';

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env["EUROBOT_DISCORD"]);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data:any = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();