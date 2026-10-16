import fetch from "node-fetch"
import * as T from "../../types/index.d.js";
import * as cheerio from 'cheerio';

//
// Get Weather from WTTR.IN
//
export const getWeather = async (area:string) => {

        try {

            const response = await fetch(`https://wttr.in/${area}?format=4`);

            if(!response.ok) return;

            return response.text();

        } catch(e:any) {

            console.log("!WeatherModel",e.respose.body,e);
            return;

        }

    }

//
// GET EU TREATIES FROM EUR-LEX
//
export const getTreaties = async (treatyString:string[]):Promise<void|T.TreatyObj> => {

    try {

        const TFEUsplit = treatyString[0].split(" ");
        let art = TFEUsplit[0];
        let subArtInt;
        let maxArt = 358;
        let artURL = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A12016E";
        let returnObj:T.TreatyObj = {
            title:`🇪🇺 Treaty on the Functioning of the European Union`
        }


        if(TFEUsplit[1] === 'teu') {
            returnObj.title = `🇪🇺 Treaty on European Union`;
            maxArt = 55
            artURL = " http://eur-lex.europa.eu/eli/treaty/teu_2016/";
        }

        if(art.includes(".")){
            const splitArtArr = art.split(".");
            subArtInt = parseInt(splitArtArr[1]);
            art = splitArtArr[0];
        }
        
        const artInt = parseInt(art);

        if(artInt > maxArt) art = "1";
        if(artInt < 0) art = "1";
        
        returnObj.articleLink = artURL + "art_" + art + "/oj";
        
        const response = await fetch(returnObj.articleLink);

        if(!response.ok) return;

        const html = await response.text();
        const $ = cheerio.load(html);
        
        let artTitle = $("div#document1").find("div.tabContent > div > p.ti-art").text();
        if(!artTitle && artTitle.length < 1) return;
    
        artTitle = artTitle.replace(/(\&nbsp;)/gm,"");
        returnObj.article = artTitle;

        let artTxtArr = $("div#document1")
            .find("div.tabContent > div > p.normal")
            .toArray()
            .map(elem=> $(elem).text());

        if(subArtInt && artTxtArr.length > subArtInt-1) {
            
            let locatedSubArt;
            for(let i=0,c=artTxtArr.length;i<c;i++) {
                if(artTxtArr[i].startsWith(subArtInt.toString())) {
                    locatedSubArt = i;
                }
            }

            if(locatedSubArt) {
                artTxtArr[0] = artTxtArr[locatedSubArt];
                artTxtArr.length = 1;
            }
            
        }

        if(artTxtArr.length > 3) {
            artTxtArr.length = 3;
            artTxtArr.push(`[...]`)
        }

        returnObj.articleText = artTxtArr.join('\n');

        return returnObj;

    } catch(e) {

        return;

    }

}