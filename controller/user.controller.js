import { validationResult } from "express-validator";
import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

export const signUp = async (req, res, next) => {
  //console.log("req received");
  //console.log("req received");
  let { name, email, password, contact } = req.body
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(errors)

    let checkEmail = await User.findOne({ email })
    if (checkEmail)
      return res.status(400).json({ err: "Email ID already exists" })

    let saltKey = bcrypt.genSaltSync(12)
    password = bcrypt.hashSync(password, saltKey)

    await sendEmail(name, email, generateUserToken(name, email, password, contact));

    return res.status(202).json({ message: "We’ve sent a verification link to your email. Please open it and verify your account within 10 minutes." });



    // let user = await User.create({name,email,password,contact })
    // if (user != null)
    //     return res.status(201).json({ message: "Sign-up successfull" })
    // return res.status(401).json({ err: "sign-up not successfull" })
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal server error..." })
  }
}

export const signIn = async (req, res, next) => {

  try {
    let { email, password } = req.body

    let user = await User.findOne({ email })

    if (!user)
      return res.status(400).json({ err: "Unauthorised user | Email-id not found" })

    if (!user.isVerified)
      return response.status(401).json({ error: "Unauthorized user | Account is not verified" });

    let status = await bcrypt.compareSync(password, user.password)
    user.password = undefined
    status && res.cookie("token", generateToken(user.id, user.email))

    return status ? res.status(202).json({ message: "Sigin successfull", user }) : res.status(400).json({ err: "Unauthorised user | Invalid Password" })

  } catch (err) {

  }
}


export const verifyAccount = async (req, res, next) => {
  try {
    let { token } = req.body
    // let result =await User.updateOne({email},{$set:{isVerified:true}})
    // return res.status(200).json({message :"Account Verified Successfully"});

    let decode = await jwt.verify(token, process.env.SECRET_KEY)

    let { name, email, password, contact } = decode

    let user = await User.create({ name, email, password, contact, isVerified: true })
    if (user != null)
      return res.status(200).json({ message: "Sign-up successfull" })

    return res.status(500).json({ err: "Sign-up failed. Please try again later." });

  } catch (err) {
    console.log(err)
    if (err.name === 'TokenExpiredError') {
      return res.status(402).json({ error: "Link already expired" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const sendEmail = (name, email, token) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    })
    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: '🎉 Almost There! Just Verify Your Account',
      html: `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <div style="text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="80" />
          <h2 style="color: #333;">Verify Your Email Address</h2>
          <p style="font-size: 15px; color: #555;">Hi <strong>${name}</strong>, you're almost ready to get started! Just click the button below to verify your email and activate your account.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <form method="POST" action="http://localhost:3000/user/verification">
            <input type="hidden" name="token" value="${token}" />
            <button style="
              background-color: #00b894;
              color: #ffffff;
              padding: 14px 30px;
              font-size: 16px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: background 0.3s ease;
            " onmouseover="this.style.backgroundColor='#019875'">
              ✅ Verify My Account
            </button>
          </form>
        </div>

        <p style="text-align: center; font-size: 14px; color: #999;">
          ⏳ This link is valid for <strong>10 minutes</strong> only. If it expires, you can sign up again to get a new one.
        </p>

        <p style="text-align: center; font-size: 13px; color: #ccc; margin-top: 40px;">
          Didn’t request this email? No worries. Just ignore it. 👍
        </p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />

        <p style="text-align: center; font-size: 13px; color: #aaa;">
          © 2025 Backend API Team. All rights reserved.
        </p>
      </div>
    </div>
  `
    };



    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

  })
}

function generateUserToken(name, email, password, contact) {
  let payload = { name, email, password, contact }
  let token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10m' })
  return token;
}

function generateToken(id, email) {
  let payload = { id, email }
  let token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10m' })
  return token;
}