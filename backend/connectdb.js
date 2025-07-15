import { createConnection } from "mysql2";

const connection = createConnection({
  host: "localhost",
  user: "root",       
  password: "radhe",        
  database: "url_shortener"
});

connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");
});

export default connection;
