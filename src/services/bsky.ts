import Tools from '../tools';
import { BskyAgent, RichText } from "@atproto/api";

export class BlueSky {

    private static instance:BlueSky;

    private blueskyPassword = process.env.EUROBOT_BSKY_PASSWORD;

    // Service Instance Initialization
    static getInstance() {

        if (!BlueSky.instance) {
            BlueSky.instance = new BlueSky();
        }
        return BlueSky.instance;

    }

    constructor() {}

    public async send(text:string) {

      console.log(this.blueskyPassword)
                
        const agent = new BskyAgent({ service: "https://bsky.social" });
        await agent.login({
          identifier: "forumgotterfunken@gmail.com",
          password: this.blueskyPassword,
        });
        const richText = new RichText({ text });
        await richText.detectFacets(agent);
        return agent.post({
          text: richText.text,
          facets: richText.facets,
        });

    }

}

export default BlueSky.getInstance();