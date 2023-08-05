export class Tools {
    
    // async foreach
    // reference: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    async asyncForEach(array:any, callback:any) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    // debounce for timers
    debounce(func:any, wait:number, immediate?:any) {
        var timeout:any;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // shuffle array 
    // reference: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffleArray(array:any[]) {

        if(array.length < 1) return [];

        let currentIndex = array.length, 
            temporaryValue, 
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;

        }

        return array;

    }

    // Put an 's' at the end of a word if num > 0
    stringMultiplicity(number:number,string:string){
        
        return number !== 1 ? string + "s" : string;
    
    }

    // [YYYY-MM-DD]? HH:ss output.
    dateToHHss(DateObj:Date,setYear:boolean = true) {

        const mm = DateObj.getMonth() + 1,
        dd = DateObj.getDate();

        const date = [
            DateObj.getFullYear() + "-",
            (mm>9 ? "" : "0") + mm + "-",
            (dd>9 ? "" : "0") + dd
        ].join("");
               
        const time = [
            (DateObj.getHours() > 9 ? "" : "0") + DateObj.getHours() +":",
            (DateObj.getMinutes() > 9 ? "" : "0") + DateObj.getMinutes()
        ].join("");

        const dateString = setYear ? date + " " : "";

        return dateString + time; 

    }

    // Convert string with [number][s/m/h/d] to human readable
    dateStringToHuman(string:string) {

        const matches = string.match(/(\d?\d[dhms])/);
        if(matches) {

            const exploded = matches[0].split("");
            const pop = exploded.pop();
            const pack = parseInt(exploded.join(""));

            let human:string;
            if(pop === "s") human = "second";
            if(pop === "m") human = "minute";
            if(pop === "h") human = "hour";
            if(pop === "d") human = "day";
            
            if(human) return `${pack} ${this.stringMultiplicity(pack,human)}`;

        }

        return;

    }

    // Convert string with [number][s/m/h/d] to human readable
    dateStringToMS(string:string) {

        const matches = string.match(/(\d?\d[dhms])/);
        if(matches) {

            const exploded = matches[0].split("");
            const pop = exploded.pop();

            let time:number;

            if(pop === "s") time = 1000;
            if(pop === "m") time = 60000;
            if(pop === "h") time = 3600000;
            if(pop === "d") time = 86400000;

            const pack = parseInt(exploded.join(""));

            return time * pack;

        }

        return;

    }

    // To Roman Numerals
    // http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
    numToRoman (num:number) {

        if (isNaN(num))
            return;

        var digits = String(+num).split(""),
            key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                   "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                   "","I","II","III","IV","V","VI","VII","VIII","IX"],
            roman = "",
            i = 3;

        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;

        return Array(+digits.join("") + 1).join("M") + roman;
    
    }

    toPercent(num:number, total:number) {

        return Math.round(num/(total/100));

    }

}

export default new Tools();