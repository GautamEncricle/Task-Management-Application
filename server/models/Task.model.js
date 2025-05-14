const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task must have title"]
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["backlog", "in-progress", "completed"],
        default: "backlog"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;