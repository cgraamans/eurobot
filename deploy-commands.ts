import * as fs from 'fs';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import discord from "./src/services/discord";

const commands = [];

const commandFiles = fs.readdirSync('./src/commands').filter(file=>!file.endsWith(".map"));

// Place your client and guild ids here

// Eurobot
const clientId = '673969077319892992';

// EucoBot
// const clientId = '736008030532927599';

// FG
// const guildId = '257838262943481857';

// EP
// const guildId = '637843781617713172';

// FG-E
// const guildId = '633016043136090124';

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env["EUROBOT_DISCORD"]);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);		

		// await rest.put(
		// 	Routes.applicationGuildCommands(clientId, guildId),
		// 	{ body: commands },
		// );

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}

})();