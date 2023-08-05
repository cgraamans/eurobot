import {Client} from "discord.js";

module.exports = {
	name: 'ready',
	once: true,
	execute(client:Client) {
		console.log(`Discord Init [${client.user.tag}]`);
	},
};