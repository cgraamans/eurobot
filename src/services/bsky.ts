import { BskyAgent, RichText } from "@atproto/api";

export class BlueSky {

    private static instance:BlueSky;

    public blueskyPassword:string;

    // Service Instance Initialization
    static getInstance() {

        if (!BlueSky.instance) {
            BlueSky.instance = new BlueSky();
        }
        return BlueSky.instance;

    }

    constructor() {

      this.blueskyPassword = process.env.EUROBOT_BLUESKY_KEY;

    }

    public async send(text:string) {
                
        const agent = new BskyAgent({ service: "https://bsky.social" });
        await agent.login({
          identifier: "forumgotterfunken@gmail.com",
          password: this.blueskyPassword,
        });
        const richText = new RichText({ text });
        await richText.detectFacets(agent);
        return agent.post({
          $type: "app.bsky.feed.post",
          text: richText.text,
          facets: richText.facets,
          createdAt: new Date().toISOString(),
        });

    }

}

export default BlueSky.getInstance();