import { Submission } from 'snoowrap';
import { GuildEmoji, Role, User } from 'discord.js';
import mastodon from 'src/services/mastodon';

declare module '*';

declare module "discord.js" {
    export interface Client {
      commands: Collection<unknown, any>
    }
}

export namespace Eurobot {

    export interface Config {
        BadWords?:string[],
        Channels?:Channel[],
        Reactions?:Reaction[],
        Roles?:Roles.Countries,
        Routes?:Route[]
    }

    export namespace Roles {

        export interface Country {
            alias:string,
            role_id:string,
            emoji:string,
            isAlias:number|null,
            
            toggle_result?:number,
            toggle_role?:Role
    
        }

        export interface EPGroup {
            name:string,
            role_id:string,
            emoji:string,
            isAlias:number|null,
            description:string,            
            toggle_result?:number,
            toggle_role?:Role
    
        }

        export interface User {
            role_id:string,
            category:string,
            user_level:number
        }

        export interface Countries {
            Countries:Roles.Country[],
            Users:Roles.User[]
        }

    }

    export interface Reaction {
        reaction:string,
        category:string
    }

    export interface Channel {
        channel_id:string,
        category:string
    }

    export interface Route {

        from:string,
        to:string,
        isActive:number

    }
    
    export namespace Message {
        
        export interface Comment {
            emoji?:GuildEmoji,
            category?:string,random?:boolean
        }
    
    }

    export namespace News {

        export interface Obj {

            subreddit?:Submission[],
            twitter?:any[],
            row?:Row,
            keyword:string,

        }

        export interface Row {

            key:string,
            name?:string,
            subreddit?:string,
            twitter_list?:string,
            twitter?:string,
            url?:string

        }

    }
        
    export namespace Twitter {
        
        export interface MediaObj {
            size:string,
            type:string,
            data:Buffer
        }
    
    }

    export namespace Calendar {

        export interface Span {
            human:string
            range:Calendar.Range
        }

        export interface Range {
            from:Date
            to?:Date
        }

    }

    export namespace Rank {

        export interface Row {

            rank:number,
            xp:number,
            user_id:string

        }

    }

    export namespace Treaty {

        export interface Obj {

            title:string,
            article?:string,
            articleText?:string,
            articleLink?:string,

        }

    }

    // OLD MODELS FOR REFERENCE
    export namespace Models {

        export namespace Polls {

            export interface Poll {
        
                author:string,
                channel:string,
                end:number,
                start:number
                text:string,
        
                message?:string,
                results?:PollResultTotals
                user?:User
        
            }
        
            export interface PollResults {
        
                totals:PollResultTotals
                up?:string[],
                down?:string[],
                shrug?:string[]
        
            }
        
            export interface PollResultTotals {
                    "up":number,
                    "down":number,
                    "shrug":number,
            }
        
            export interface PollResultDBTotal {
        
                vote:string,
                num:number
        
            }
        
        }

    }

}
