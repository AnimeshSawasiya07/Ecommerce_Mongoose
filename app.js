import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose"
import cors from "cors"
import userRouter from "./routes/user.route.js"

dotenv.config()

const app = express()


mongoose.connect(process.env.MONGO_DB_URL).then(() => {
    app.use(cors())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended:true}))
    
    app.use("/user",userRouter)


    app.listen(process.env.PORT, () => {
        console.log("Server Started...");
    })
}).catch(err => {
    console.log(err);
    console.log("Database connection failed");
})
