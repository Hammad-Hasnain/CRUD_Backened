import express, { response } from 'express'
import mongoose from 'mongoose';
import postModel from './model/postSchema.js';
import bcrypt, { compare } from 'bcrypt'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()


const app = express()
const PORT = process.env.PORT || 5000



// DB connecting
mongoose.connect(process.env.URI)
mongoose.connection.on("connected", () => { console.log('Mongo db connected') })
mongoose.connection.on("error", (err) => { console.log('Mongo db not connected==>', err) })


// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// get API
app.get('/', async (req, res) => {
    res.json({
        message: "SERVER UP"
    })
})


// SIGNUP API
app.post('/api/signUp', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)


        const userObj = {
            ...req.body,
            password: hashedPassword,
        }

        const isEmail = await postModel.findOne({ email })

        if (!isEmail) {
            await postModel.create(userObj)
        }
        else {
            res.json({ message: 'Email already exists' })
            return
        }

    } catch (error) {
        console.log(error);
    }

})


// LOGIN API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body


    if (!email || !password) {
        res.json({
            message: 'required credentials are missing'
        })
        return
    }
    else {
        const user = await postModel.findOne({ email })
        const hashedPassword = user.password

        const compared = await bcrypt.compare(password, hashedPassword)
        if (compared) {
            res.json({
                message: 'successfully login',
                data: 'email exist'
            })
        }
        else {
            res.json({
                message: 'Invalid credentials'
            })
        }
    }
})



//SERVER
app.listen(PORT, () => {
    console.log('SERVER UP')
})