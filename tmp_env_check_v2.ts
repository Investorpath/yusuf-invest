
import * as dotenv from "dotenv";
dotenv.config();
console.log("DB_URL_SET:" + (process.env.DATABASE_URL ? "YES" : "NO"));
console.log("REPL_ID_SET:" + (process.env.REPL_ID ? process.env.REPL_ID : "NONE"));
