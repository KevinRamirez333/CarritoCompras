import {createPool }from "mysql2/promise";


export default createPool({
  host: process.env.db_mysql_host,
  user: process.env.db_mysql_user,
  password: process.env.db_mysql_password,
  database: process.env.db_mysql_database,
});
/*export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password123#",
  database: "tienda",
});*/