import Snoowrap from 'snoowrap';

export class reddit {

    private static instance:reddit;

    public client:Snoowrap;

    constructor(){

        this.client = require("snoowrap");
        this.client = new Snoowrap({
            userAgent: 'Eurobot',
            clientId: process.env.EUROBOT_REDDIT_CLIENT_ID,
            clientSecret: process.env.EUROBOT_REDDIT_CLIENT_SECRET,
            // refreshToken: process.env.EUROBOT_REDDIT_REFRESHTOKEN
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