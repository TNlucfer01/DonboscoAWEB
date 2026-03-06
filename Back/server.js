const { ExpressValidator } = require("express-validator")

const express =require("express")
const app=express();
const cors=require("cors");
app.use(cors);

app.get("/",(req,res)=>{
				res.send("this is the root");
				res.end();
});
app.listen(8080,()=>{"the serve is running on server port no 8080"})
console.log("server runing on port 8080 ")

