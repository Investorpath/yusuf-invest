
import * as dotenv from "dotenv";
dotenv.config();
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("REPL_ID:", process.env.REPL_ID);
console.log("SESSION_SECRET exists:", !!process.env.SESSION_SECRET);
