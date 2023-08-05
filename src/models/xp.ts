import db from "../services/db";
import Discord from "discord.js";

export default class xp {

    constructor(){}

    public async getByMessage(messageId:string) {

        return await db.q("SELECT * FROM discord_log_xp WHERE message_id = ?",[messageId]);

    }

    public async getTotal(userId:string) {

        return await db.q("SELECT SUM(xp) as xp from discord_log_xp WHERE user_id = ?",[userId]);

    }

    public async getRankList(limit:number=10,timespan:string="m") {

        let timeStart:number = (new Date()).getTime() - (60*60*24*31*1000);

        if(timespan === "w") {

            timeStart = (new Date()).getTime() - (60*60*24*7*1000);

        }

        if(timespan === "d") {

            timeStart = (new Date()).getTime() - (60*60*24*1000);

        }

        console.log("timeStart",timeStart);

        return await db.q(`

            select 
                @rownum:=@rownum+1 as rank,
                xp,
                user_id
            from 
                (

                    select 
                        sum(xp) as xp,
                        user_id
                    from discord_log_xp
                    where dt > ?
                    group by user_id
                    order by xp desc
                    LIMIT ?

                )T,
                (select @rownum:=0)a
            `,
            [
                new Date(timeStart).toISOString().slice(0, 19).replace('T', ' '),
                limit
            ]
        );

    }

    public async getById(messageId:string,userId:string) {
        
        return await db.q("SELECT message_id FROM discord_log_xp WHERE message_id = ? AND user_id = ?",[messageId,userId])
            .catch(e=>{console.log(e)});
        
    }


    public async set(message:Discord.Message,userId:string,xp:number=1) {

        const check = await this.getById(message.id,userId);
        if(!check || !(check.length > 0)) {

            const res = await db.q("INSERT INTO discord_log_xp SET ?",[{
                message_id:message.id,
                guild_id:message.guild.id,
                channel_id:message.channel.id,
                user_id:userId,
                xp:xp
            }]).catch(e=>{console.log(e)});

        }

        return;

    }

}