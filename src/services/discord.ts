import DB from "./db";
import {Eurobot} from "../../types/index";
import {IntentsBitField, Partials, Message, User, Client, Guild, GuildMember, Role, MessageReaction} from "discord.js";
import * as fs from "fs";
import * as Conf from "../../conf/discord.json";

class Discord {

    private static instance:Discord;

    public Client:Client

    public Timers:NodeJS.Timeout[] = [];

    // public Config:Eurobot.Config = {};

    private Roles:string[] = [];

    private key:string = process.env.EUROBOT_DISCORD;

    // Service Instance Initialization
    static getInstance() {
        
        if (!Discord.instance) {
            Discord.instance = new Discord();
        }
        return Discord.instance;

    }

    public Config = Conf;

    constructor() {

        try {

            //
            // CONFIG
            //

            // INIT DISCORD CLIENT
            this.Client = new Client({ 
                intents: [
                    IntentsBitField.Flags.MessageContent,
                    IntentsBitField.Flags.Guilds,
                    IntentsBitField.Flags.GuildMessages,
                    IntentsBitField.Flags.GuildWebhooks,
                    IntentsBitField.Flags.GuildMessageReactions,
                    IntentsBitField.Flags.GuildEmojisAndStickers,
                    IntentsBitField.Flags.GuildPresences
                ],partials: [
                    Partials.Message,
                    Partials.Channel,
                    Partials.Reaction
                ]
            });

            // // FILL CONFIG

            // get events and set client on/once for each event
            const eventFiles = fs.readdirSync(`${__dirname}/../events`).filter(file=>!file.endsWith('.map'));

            for (const file of eventFiles) {
                const event = require(`${__dirname}/../events/${file}`);
                if (event.once) {
                    this.Client.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.Client.on(event.name, (...args) => event.execute(...args));
                }
            }

            console.log('Events Init')

            // error
            this.Client.on("error",e=>{

                console.log("!! Discord Service Client Error",e);

            });

            // disconnect
            this.Client.on('disconnect',(message:Message)=>{

                if(message) console.log("!! Disconnected from Discord",message);
            
            });

            // login
            this.Client.login(this.key);

        } catch(e) {

            throw e;
        
        }

    }

    // is a user authorized for an action?
    public async authorizeMessage(message:Message,roles:string[]) {

        let userRoles:Eurobot.Roles.User[] = [];
        let userRoleList:Role[] = [];

        userRoles = this.isConfigRoleLoop(roles);

        // None of the roles exist
        if(userRoles.length < 1) return;

        if(!message.guild.roles) return;
        if(!message.member.roles) return;

        userRoles.forEach(userRole=>{

            const RoleGuild = message.guild.roles.cache.find(guildRole=>guildRole.id === userRole.role_id);
            if(RoleGuild) {

                const hasRole = message.member.roles.cache.get(userRole.role_id);
                if(hasRole) userRoleList.push(hasRole);

            }

        });

        return userRoleList;    

    }

    // is a user authorized for an action?
    public async authorizeMember(member:GuildMember,roles:string[]) {

        let userRoles:Eurobot.Roles.User[] = [];
        let userRoleReturn:Role[] = [];

        console.log("REACTION UID",member.id);

        userRoles = this.isConfigRoleLoop(roles);

        // None of the roles exist
        if(userRoles.length < 1) return;

        userRoles.forEach(userRole=>{

            const getRole = member.roles.cache.get(userRole.role_id);
            if(getRole) {

                userRoleReturn.push(getRole);

            }

        });

        return userRoleReturn;  

    }

    private isConfigRoleLoop(roles:string[]) {

        let userRoles:Eurobot.Roles.User[] = [];
        // Which Available Roles Correspond to the requested ones
        roles.forEach(role=>{
            const UserRole = this.Config.Groups.find(userRole=>userRole.category === role)
            if(UserRole) userRoles.push(UserRole);
        });
        return userRoles;

    }

}

export default Discord.getInstance();