import { BskyAgent, RichText } from "@atproto/api";
import urlMetadata from 'url-metadata';

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

        const richText = new RichText({ text:text });
        await richText.detectFacets(agent);

        let embedObj;
        const matches = text.match(/https?:\/\/\S+/gi);
        if(matches && matches.length > 0) {

          const metaData = await urlMetadata(matches[0]).catch(e=>console.log(e));

          console.log(matches);

          if(metaData && metaData['og:image'] && metaData['og:url'] && metaData['og:title']) {

            let blob = await fetch(metaData['og:image']).then(r => r.blob()).catch(e=>console.log(e));
            if(blob) {
              
              const int8Arr = new Uint8Array(await blob.arrayBuffer());
              const data = await agent.uploadBlob(int8Arr).catch(e=>console.log(e));
              if(data && data.data && data.data.blob) {

                embedObj = {
                  embed: {
                      $type: 'app.bsky.embed.external',
                      external: {
                          uri: metaData['og:url'],
                          title: metaData['og:title'],
                          description: metaData['og:description'],
                          thumb: data.data.blob
                      }
                  } 
                };

              }

            }

          }

        }

        let payload = {
            $type: "app.bsky.feed.post",
            text: richText.text,
            facets: richText.facets,
            createdAt: new Date().toISOString(),
        };

        if(embedObj) payload = {...payload, ...embedObj};

        return agent.post(payload);

    }

}

export default BlueSky.getInstance();