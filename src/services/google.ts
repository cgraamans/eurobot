import privatekey from "../../conf/google/Eurobot-Calendar-1c54f0456b16.json"
import {google, calendar_v3} from "googleapis";
import {calendar as CalendarOptions} from "../../conf/google/options.json"
import {Eurobot} from "../../types/index";

export class Google {

    private static instance:Google;

    private jwtClient:any;

    public calendar:any = google.calendar("v3");

    constructor() {

        // configure a Google JWT auth client
        this.jwtClient = new google.auth.JWT(

            privatekey.client_email,
            null,
            privatekey.private_key,
            ["https://www.googleapis.com/auth/calendar"]

        );

        //Google API authenticate request
        this.jwtClient.authorize(function (err:any, tokens:any) {

            if (err) {

                console.log("Google Auth Error");
                console.log(err)

            } else {

                console.log("Google Init");

            }

        });

    }

    // Service Instance Initialization
    static getInstance() {
        
        if (!Google.instance) {
            Google.instance = new Google();
        }
        return Google.instance;

    }

    // Retrieve Google Calendar
    public Calendar(range:Eurobot.Calendar.Range):Promise<any> {

        return new Promise((resolve,reject)=>{

            this.calendar.events.list({
            
                auth: this.jwtClient,
                calendarId: CalendarOptions.calendarID,
                timeMin:range.from,
                timeMax:range.to,
                singleEvents:true,
                orderBy:"startTime"
                
            }, function (err:any, response:any) {
        
                if (err) {

                    console.log("The Google Calendar API returned an error: " + err);
                    reject(err);
                
                } else {

                    if(response && response.data && response.data.items) {
        
                        resolve(response.data.items);
        
                    } else {
        
                        reject("The Google Calendar API returned an incompatible object");
        
                    }
        
                }

            });

        });

    }

    
}

export default Google.getInstance();