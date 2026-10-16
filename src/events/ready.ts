import {Client} from "discord.js";

module.exports = {
	name: 'ready',
	once: true,
	execute(client:Client) {
		if(!client || !client.user) return;
		console.log(`Discord Init [${client.user.tag}]`);
	},
};