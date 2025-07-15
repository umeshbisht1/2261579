import express from "express";  // ✅ Must be in quotes
const app = express(); 
// import { userrouter } from "./router/user_router.js";         // ✅ No need for `new`

app.get("/", (req, res) => {
  res.send("hello this is working");
});
app.get("/api",(req,res)=>{
    res.status(200).json({message:"umesh have learned the basic and working on the protype"})
})
// node index

app.listen(3000, () => {        // ✅ Typo: should be `listen`
  console.log("App listening at port number 3000");
});
