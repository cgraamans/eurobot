import { TwitterApi } from 'twitter-api-v2';
import Tools from '../tools';
import {Eurobot} from "../../types/index.d";

export class Twitter {

    private static instance:Twitter;

    private client:TwitterApi;

    // Service Instance Initialization
    static getInstance() {

        if (!Twitter.instance) {
            Twitter.instance = new Twitter();
        }
        return Twitter.instance;

    }

    constructor() {

        this.client = new TwitterApi({
            appKey: process.env.EUROBOT_TWITTER_CONSUMER_KEY,
            appSecret: process.env.EUROBOT_TWITTER_CONSUMER_SECRET,
            accessToken: process.env.EUROBOT_TWITTER_TOKEN_KEY,
            accessSecret: process.env.EUROBOT_TWITTER_TOKEN_SECRET
        });

    }

    // post twitter message with media object
    public async post(message:string,media?:Eurobot.Twitter.MediaObj[]) {

        return await this.client.v2.tweet({text:message})
            .catch(e=>{console.log("POST ERROR"),console.log(e)});

    }

}

export default Twitter.getInstance();