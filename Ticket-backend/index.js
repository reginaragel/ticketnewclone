const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const cors=require('cors')
const path=require('path');
const bcrypt=require('bcrypt');
const cookieParser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const db=require('./config/config');
const User=require('./models/User');
const app=express();

dotenv.config({path:path.join(__dirname,'config','config.env')});

const salt=bcrypt.genSaltSync(10);
const secret='e56363w513156356457';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

db();

app.post('/register',async(req,res)=>{
    const {userName,password}=req.body;
    try{
        const user=new User({
            userName,
            password:bcrypt.hashSync(password,salt),
        })
        await user.save();
        res.status(201).json({message:'User Registered Successfully'});
    }catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to register User'})
    }
});

app.post('/login',async(req,res)=>{
    const {userName,password}=req.body;
    const user=await User.findOne({userName});
    const passOk=bcrypt.compareSync(password,user.password);
    if(passOk){
        jwt.sign({userName,id:user._id},secret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token).json({
                id:user._id,
                userName,
            })
        })

    }else{
        res.status(400).json('Wrong Credentials')
    }
    
})

app.get('/',(req,res)=>{
    res.json('Hello world')
})


app.listen(process.env.PORT,()=>{
    console.log( `Server Listening on Port ${process.env.PORT}`)
})