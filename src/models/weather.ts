import fetch from "node-fetch"

export default class WeatherModel {

    constructor(){}

    public async getCity(area:string) {

        try {

            const response = await fetch(`https://wttr.in/${area}?format=4`);

            console.log(response);

            if(!response.ok) return;

            return response.text();

        } catch(e) {

            console.log("!WeatherModel",e.respose.body,e);
            return;

        }

    }

}