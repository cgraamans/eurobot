import mysql from "mysql2/promise";

export class DB {

    private static instance:DB;

    private Pool:mysql.Pool;

    constructor() {
        
        try {

            this.Pool = mysql.createPool({
                user:process.env.EUROBOT_DB_USERNAME,
                password:process.env.EUROBOT_DB_PASSWD,
                database:process.env.EUROBOT_DB,
                host:'localhost',
                multipleStatements: true,
                charset:'utf8mb4',
                connectionLimit : 1000,
                connectTimeout  : 60 * 60 * 1000,
            });

            console.log(process.env.EUROBOT_DB+" DB Pool Init");

        } catch(e:any) {

            console.log("DB Pool Init Error",e);
            process.exit(-1)

        }

    }

    static getInstance() {
        
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;

    }

    async query(sql:string, vals:any[] = []): Promise<any> {

        const [results] = await this.Pool.query(sql, vals);

        return results;

    }

    public where(arr:Array<string>){

        let rtn = "";
        
        for(let i=0;i<arr.length;i++){
            if (i === 0) {
                rtn += "WHERE " + arr[i];
            } else {
                rtn += " AND " + arr[i];
            }
        }
        
        return rtn;

    }

}

export default DB.getInstance();