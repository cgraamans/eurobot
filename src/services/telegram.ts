import Tools from '../tools';
import TelegramBot from "node-telegram-bot-api";

export class Telegram {

    private static instance:Telegram;

    public client:TelegramBot;

    // Service Instance Initialization
    static getInstance() {

        if (!Telegram.instance) {
            Telegram.instance = new Telegram();
        }
        return Telegram.instance;

    }

    constructor() {

        this.client = new TelegramBot(process.env.EUROBOT_TGTOKEN,{polling:true});

    }

}

export default Telegram.getInstance();