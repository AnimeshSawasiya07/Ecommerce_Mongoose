import express from "express"
import { signIn, signUp, verifyAccount } from "../controller/user.controller.js";
import { body } from "express-validator";

let router = express.Router()

router.post("/",body("name","name is required").notEmpty(),
body("name","name must only contain alphabets").isAlpha('en-US', { ignore: ' ' }),
body("email","email is required").notEmpty(),
body("email","Invalid email format").isEmail(),
body("password","password is required").notEmpty(),
body("password","password is required").isLength({min:5,max:12}),
body("contact","contact is required").notEmpty(),
body("contact","contact must only contain digit").isNumeric()
,signUp)

router.post("/verification",verifyAccount)
router.post("/sign-in",signIn)

export default router;