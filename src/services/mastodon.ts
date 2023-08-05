import Tools from '../tools';
import {Eurobot} from "../../types";
import generator, { Entity, Response, MegalodonInterface } from 'megalodon'

export class Mastodon {

    private static instance:Mastodon;

    public client:MegalodonInterface;

    // Service Instance Initialization
    static getInstance() {

        if (!Mastodon.instance) {
            Mastodon.instance = new Mastodon();
        }
        return Mastodon.instance;

    }

    constructor() {

        const BASE_URL: string = 'https://mas.to';
        const access_token: string = process.env.EUROBOT_MASTO;
        const toot: string = 'test toot';
        
        this.client = generator('mastodon', BASE_URL, access_token)

    }

    // Media Upload Fns

    // Media Upload Fns

}

export default Mastodon.getInstance();