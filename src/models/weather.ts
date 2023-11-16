import fetch from "node-fetch"

export default class WeatherModel {

    constructor(){}

    public async getCity(area:string) {

        try {

            const response = await fetch(`https://wttr.in/${area}?format=%l:+%C+%c+%t`);
            if(!response.ok) return;

            return response.text();

        } catch(e) {

            console.log("!WeatherModel",e.respose.body,e);
            return;

        }

    }

}