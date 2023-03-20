import mysql from "mysql2";
import * as dotenv from "dotenv";

dotenv.config();

export const connection = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
});
