import mongoose from "mongoose";

let userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    contact:{
        type:String,
        required:true,
        isNumeric:true
    },
    profile:{
        profileImg:String,
        address:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    
},{versionKey:false})

export let User = mongoose.model("user",userSchema)