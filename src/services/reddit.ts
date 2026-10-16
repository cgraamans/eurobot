import snoowrap from 'snoowrap';
import ffmpeg from "fluent-ffmpeg";

import * as T from "../../types/index.d.js"

export class reddit {

    private static instance:reddit;

    public client:snoowrap;

    constructor(){

        this.client = new snoowrap({
            userAgent: 'Eurobot/16.0.1',
            clientId: process.env.EUROBOT_REDDIT_CLIENT_ID,
            clientSecret: process.env.EUROBOT_REDDIT_CLIENT_SECRET,
            username: process.env.EUROBOT_REDDIT_USER,
            password: process.env.EUROBOT_REDDIT_PASSWORD
        });

    }

    // Service Instance Initialization
    static getInstance() {
        
        if (!reddit.instance) {
            reddit.instance = new reddit();
        }
        return reddit.instance;

    }

}

export default reddit.getInstance();