import twitter from "twitter";
import Tools from '../tools';
import {Eurobot} from "../../types/index.d";

export class Twitter {

    private static instance:Twitter;

    private client:twitter;

    // Service Instance Initialization
    static getInstance() {

        if (!Twitter.instance) {
            Twitter.instance = new Twitter();
        }
        return Twitter.instance;

    }

    constructor() {

        this.client = new twitter({
            consumer_key: process.env.FG_TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.FG_TWITTER_CONSUMER_SECRET,
            access_token_key: process.env.FG_TWITTER_TOKEN_KEY,
            access_token_secret: process.env.FG_TWITTER_TOKEN_SECRET
        });

        // Test connection on init
        const params = {screen_name: "eunewsbot"};
        this.client.get("statuses/user_timeline", params, (error)=>{
            if (error) console.log("Twitter Init Error",error);
            if(!error) console.log("Twitter Init");
        });

    }

    // post twitter message with media object
    public async post(message:string,media?:Eurobot.Twitter.MediaObj[]) {

        let params:{status:string,media_ids?:string} = {status:message};

        if(media && media.length > 0) {

            let mediaIds:string[];

            await Tools.asyncForEach(media,async (mediaObj:Eurobot.Twitter.MediaObj)=>{

                const mediaId = await this.initUpload(mediaObj.size,mediaObj.type).catch(e=>{throw e});
                if(mediaId) {

                    await this.appendUpload(mediaId,mediaObj.data).catch(e=>{throw e});
                    const finalized = await this.finalizeUpload(mediaId).catch(e=>{throw e});

                    mediaIds.push(mediaId);

                }

            });

            if(mediaIds.length > 0) {
                params.media_ids = mediaIds.join(","); 
            }
        }

        return await this.client.post("statuses/update",params)
            .catch(e=>{console.log("POST ERROR"),console.log(e)});

    }

    public async get(params:{screen_name:string}){

        await this.client.get('statuses/user_timeline', params);

    }

    //
    // Media Upload Fns
    // https://github.com/desmondmorris/node-twitter/tree/master/examples#media
    //

    private async initUpload (mediaSize:string,mediaType:string) {
        return this.makePost('media/upload', {
            command    : 'INIT',
            total_bytes: mediaSize,
            media_type : mediaType,
        }).then((data:twitter.ResponseData) => data.media_id_string);
    }

    private async appendUpload (mediaId:string,mediaData:Buffer,segment?:number) {
        return this.makePost('media/upload', {
            command      : 'APPEND',
            media_id     : mediaId,
            media        : mediaData,
            segment_index: 0
        }).then((data:twitter.ResponseData) => mediaId);
    }

    private async finalizeUpload (mediaId:string) {
        return this.makePost('media/upload', {
            command : 'FINALIZE',
            media_id: mediaId
        }).then((data:twitter.ResponseData) => mediaId);
    }

    private async makePost (endpoint:string, params:twitter.RequestParams) {
        return new Promise((resolve, reject) => {
            this.client.post(endpoint, params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // Media Upload Fns

}

export default Twitter.getInstance();