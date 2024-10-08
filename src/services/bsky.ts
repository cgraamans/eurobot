import { AtpAgent, RichText } from "@atproto/api";
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

    //
    // Upload Image to Bluesky. Return image upload info from Bluesky. 
    //
    public async upImageToBSky(url:string, agent:AtpAgent) {

      try {

        let data;

        // Get the fileblob
        let blob = await fetch(url).then(r => r.blob())
          .catch(e=>console.log(e));
        if(blob) {
          
          // Turn it into an arrayBuffer
          const buffer = await blob.arrayBuffer()
            .catch(e=>{console.log(e)});
          if(buffer) {

            // make it an int8 Array
            const int8Arr = new Uint8Array(buffer);
            if(int8Arr) {

              // Upload it to Bluesky
              data = await agent.uploadBlob(int8Arr)
                .catch(e=>console.log(e));

            }

          }

        }

        return data;

      } catch(e) {

        console.log(e);

        return;

      }

    }

    //
    // Send text to Bluesky
    //
    public async send(text:string) {

      let embedObj;

      // Login
      const agent = new AtpAgent({ service: "https://bsky.social" });
      if(!agent) return;

      await agent.login({
        identifier: "forumgotterfunken@gmail.com",
        password: this.blueskyPassword,
      })
      .catch(e=>console.log(e));

      // Is there a link?
      const matches = text.match(/https?:\/\/\S+/gi);
      if(matches && matches.length > 0) {

        if(matches[0].endsWith(".png") || matches[0].endsWith(".jpg") || matches[0].endsWith(".jpeg")  ) {

          //
          // IMAGE
          //

          const imageData = await this.upImageToBSky(matches[0],agent)
            .catch(e=>console.log(e));
          if(imageData && imageData.data && imageData.data.blob) {

            const cleanText = text.replace(matches[0],"");

            // Fill embedObj
            embedObj = {
              embed: {
                  $type: 'app.bsky.embed.images',
                  images:[{
                    alt:cleanText,
                    image:imageData.data.blob
                  }]
                } 

            };

          }

        } else {
          
          //
          // LINK
          //

          // Get URL's metadata
          const metaData = await urlMetadata(matches[0])
            .catch(e=>console.log(e));
          if(metaData && metaData['og:image'] && metaData['og:url'] && metaData['og:title']) {

            // Upload image if there is one.
            const imageData = await this.upImageToBSky(metaData['og:image'],agent)
              .catch(e=>console.log(e));
            if(imageData && imageData.data && imageData.data.blob) {

              // Fill embedObj
              embedObj = {
                embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                        uri: metaData['og:url'],
                        title: metaData['og:title'],
                        description: metaData['og:description'],
                        thumb: imageData.data.blob
                    }

                  } 

              };

            }

          }

        }

      }

      // Enrich text
      const richText = new RichText({ text:text });
      await richText.detectFacets(agent)
        .catch(e=>console.log(e));

      // Prepare payload
      let payload = {
          $type: "app.bsky.feed.post",
          text: richText.text,
          facets: richText.facets,
          createdAt: new Date().toISOString(),
      };

      // Merge embedObj
      if(embedObj) payload = {...payload, ...embedObj};

      // Post
      return await agent.post(payload);

  }

}

export default BlueSky.getInstance();