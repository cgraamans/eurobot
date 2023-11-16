import {Eurobot} from "../../types/index.d"
import * as https from "https";
import fetch from "node-fetch"

export default class WeatherModel {

    constructor(){}

    public async getCity(area:string) {

        try {

            const response = await fetch(`https://wttr.in/${area}?format="%l:+%C+%c+%t\n"`);
            if(response.status !== 200) return;

            return response.text();

        } catch(e) {

            console.log("!WeatherModel",e.respose.body,e);
            return;

        }

    }

}
