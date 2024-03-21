import express, { response } from 'express'
import mongoose from 'mongoose';
import postModel from './model/postSchema.js';
import bcrypt, { compare } from 'bcrypt'
import dotenv from 'dotenv'
import cors from 'cors'
import todoModel from './model/todoSchema.js';

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
            const response = await postModel.create(userObj)
            res.json({
                message: 'post/user created',
                data: response
            })


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


// ADD TODO API
app.post('/api/addTodo', async (req, res) => {
    try {
        const { email, todo } = req.body

        // res.json({
        //     message: req.body
        // })
        console.log(req.body)
        // user email will be stored



        // const todoObj = { todoArr: [req.body] }
        // const todoObj = { todoArr: [req.body] }

        const user = await todoModel.findOne({ email });
        // const user = await todoModel.findOne({ email });
        // await todoModel.create(req.body)

        console.log(user)
        console.log(email, todo)


        if (!user) {
            const todoAdded = await todoModel.create({ email, todos: [todo] })
            console.log('todoAdded==>', todoAdded)
            res.json({
                message: 'todo added successfully',
                userEmail: todoAdded.email,
                userTodos: todoAdded.todos
            })
            return

        }
        else {
            console.log("user==>", user)       // user if found
            console.log('user.todo===>', user.todos) // user

            user.todos.push(todo)
            console.log('user.todo===>', user.todos)

            const todoUpdated = await todoModel.findOneAndUpdate({ email }, { todos: user.todos })
            console.log('todoUpdated==>', todoUpdated)

            res.json({
                message: 'todo added successfully',
                userEmail: user.email,
                userTodos: user.todos
            })
            return
        }
    } catch (error) {
        console.log('/addTodo trycatch>error===>', error);
    }

})

// UPDATE TODO API 
app.put('/api/updateTodo', async (req, res) => {
    // index from edited button on FE
    // email from LS of FE
    //newTodo from prompt/input

    const { email, todo, index } = req.body



    try {
        // res.json({
        //     message: 'todo updated',
        //     data: req.body,

        // })
        // console.log('todo updated')

        const user = await todoModel.findOne({ email })
        console.log('user==>', user)


        console.log('user.todos[index]===>', user.todos[index]);
        user.todos[index] = todo;
        console.log('updated new todo', user.todos);
        const todoUpdated = await todoModel.findOneAndUpdate({ email }, { todos: user.todos })
        const userTodoUpdated = await todoModel.findOne({ email })
        const { email, todos } = userTodoUpdated
        res.json({
            message: 'todo edited successfully',
            data: { email: userTodoUpdated.email, todos: userTodoUpdated.todos }
        })



    } catch (error) {
        console.log('error=>', error)
    }



})

// DELETE TODO API 
app.delete('/api/deleteTodo', async (req, res) => {

    try {
        const { email, index } = req.body

        const user = await todoModel.findOne({ email })
        user.todos.splice(index, 1)
        console.log('user.todos==>', user.todos)

        const todoDeleted = await todoModel.findOneAndUpdate({ email }, { todos: user.todos })

        res.json({
            message: 'todo deleted',
            // data: req.body
        })


    } catch (error) {
        console.log('error==>', error)
    }

})




//SERVER
app.listen(PORT, () => {
    console.log('SERVER UP')
})