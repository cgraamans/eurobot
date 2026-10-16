import {Cal as CalendarOptions} from "../../conf/google/options.json"

import * as T from "../../types/index.d.js"

// Put an 's' at the end of a word if num > 0
export const stringMultiplicity = (num:number, string:string) => {
        
    return num !== 1 ? string + "s" : string;
    
}

// Convert string with [number][s/m/h/d] to human readable
export const dateStringToHuman = (string:string) => {

    const matches = string.match(/(\d?\d[dhms])/);
    if(matches) {

        const exploded = matches[0].split("");
        const pop = exploded.pop();
        const pack = parseInt(exploded.join(""));

        let human:string | undefined;
        if(pop === "s") human = "second";
        if(pop === "m") human = "minute";
        if(pop === "h") human = "hour";
        if(pop === "d") human = "day";
        
        if(human) return `${pack} ${stringMultiplicity(pack,human)}`;

    }

    return;

}

// Convert string with [number][s/m/h/d] to human readable
export const dateStringToMS = (string:string) => {

    const matches = string.match(/(\d?\d[dhms])/);
    if(matches) {

        const exploded = matches[0].split("");
        const pop = exploded.pop();

        let time:number;
        switch(pop) {
            case "s": time = 1000; break;
            case "m": time = 60000; break;
            case "h": time = 3600000; break;
            case "d": time = 86400000; break;
            default: return;
        }

        const pack = parseInt(exploded.join(""));

        return time * pack;

    }

    return;

}

// Convert human calendar times to Date object ranges (ms)
export const textToUnixTimeRange = (text?:string) => {

    // initial return object
    let rtn:T.CalendarSpan = {
        human: "today",
        range: {
            from:new Date(new Date().setHours(0,0,0,0)),
        }
    };
    rtn.range.to = new Date(rtn.range.from.getTime() + 86400000 - 1);

    if(text) {

        if(text.includes("tomorrow")) {

            rtn.range.from = new Date(new Date(new Date().getTime() + 86400000).setHours(0,0,0,0));
            rtn.range.to = new Date(new Date(rtn.range.from).getTime() + (86400000));
            rtn.human = "tomorrow";

        }

        if(text.includes("week")) {

            rtn.range.from = new Date(new Date().setHours(0,0,0,0));
            rtn.range.to = new Date(rtn.range.from.getTime() + (86400000 * 7) - 1);
            rtn.human = "this week";

        }

        const dhms = dateStringToMS(text);
        if(dhms) {

            const human = dateStringToHuman(text);
            if(!human) return;

            rtn.range.from = new Date(new Date().setHours(0,0,0,0));
            rtn.range.to = new Date(rtn.range.from.getTime() + (dhms -1));
            rtn.human = human;

        }

    }

    return rtn;

}

// [YYYY-MM-DD]? HH:ss output.
export const dateToHHss = (DateObj:Date,setYear:boolean = true) => {

    const mm = DateObj.getMonth() + 1,
    dd = DateObj.getDate();

    const date = [
        DateObj.getFullYear() + "-",
        (mm>9 ? "" : "0") + mm + "-",
        (dd>9 ? "" : "0") + dd
    ].join("");
            
    const time = [
        (DateObj.getHours() > 9 ? "" : "0") + DateObj.getHours() +":",
        (DateObj.getMinutes() > 9 ? "" : "0") + DateObj.getMinutes()
    ].join("");

    const dateString = setYear ? date + " " : "";

    return dateString + time; 

}

// toStringCalendar items from google calendar service to string for rich output
export const toStringCalendar = (items:any[],span:T.CalendarSpan) => {

    let footer = "";
    if(items.length > CalendarOptions.maxItems) {
    
        let LenPos = items.length - CalendarOptions.maxItems;
        footer = `\n... and ${LenPos} more.`;
        items.splice((-1 * LenPos),LenPos);

    }

    let calendar = "";
    if(items.length < 1) {
        calendar = `No entries.`;
    }

    for(let item of items){

        if(item.start && item.end && item.status === "confirmed") {

            let description = "";
            let dateString = "";

            if(item.start.date && item.end.date) {

                dateString = `${item.start.date}`;
                if(((new Date(item.end.date).getTime()) - (new Date(item.start.date).getTime())) !== 86400000) {
                    dateString += ` - ${item.end.date}`;
                }

            }

            if(item.start.dateTime && item.end.dateTime) {

                dateString = dateToHHss(new Date(item.start.dateTime));

                if((new Date(item.end.dateTime).getTime()) - (new Date(item.start.dateTime).getTime()) > 86400000) {
                    dateString += (" - " + (dateToHHss(new Date(item.end.dateTime))));
                } 

            }

            if(item.description) {
                description = `${item.description.replace(/(<([^>]+)>)/ig, '')}\n`;
            }
            calendar += `🔹**${item.summary}**\n${dateString}\n${description}\n`;    

        }

    };
            
    return calendar;

}
//     public  toStringCalendar(items:any[],span:Eurobot.Calendar.Span):string {



//     } // toStringCalendar

//     // Get Calendar log for ID from table 
//     // getCalendarLogID
//     public async getLogID(id:string) {

//         const ids:any[] = await db.q(`SELECT * FROM calendar_log WHERE id = ?`,[id]);
//         if(ids && ids.length > 0) return ids[0];
//         return;

//     } // getCalendarLogID

//     public async postLogID(eventID:string) {
//         return await db.q(`INSERT INTO calendar_log SET ?`,[{id:eventID}]);
//     }

// }