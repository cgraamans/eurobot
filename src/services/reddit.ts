import Snoowrap from 'snoowrap';

export class reddit {

    private static instance:reddit;

    public client:Snoowrap;

    constructor(){

        this.client = require("snoowrap");
        this.client = new Snoowrap({
            userAgent: 'GotterfunkenPostingBot',
            clientId: process.env.FG_REDDIT_CLIENT_ID,
            clientSecret: process.env.FG_REDDIT_CLIENT_SECRET,
            username: process.env.FG_REDDIT_USER,
            password: process.env.FG_REDDIT_PASS
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