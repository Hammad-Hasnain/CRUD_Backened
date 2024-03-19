import mongoose from "mongoose";



const schema = new mongoose.Schema({
    email: String,
    todos: Array
})


const todoModel = mongoose.model('todo', schema)
export default todoModel;