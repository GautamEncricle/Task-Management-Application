const mongoose = require('mongoose');
const Task = require('../models/Task.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createTask = catchAsync(async (req, res, next) => {
    const { title, description, status, assignedTo } = req.body;

    // If user is admin and assignedTo is provided, use it; else assign to req.user._id
    let assignedUser = req.user._id;
    if (req.user.role === 'admin' && assignedTo) {
        assignedUser = assignedTo;
    }

    const task = await Task.create({
        title,
        description,
        status,
        assignedTo: assignedUser
    })

    res.status(201).json({
        statusCode: 'Success',
        message: 'Task created successfully',
        task
    })

})

exports.getTasks = catchAsync(async (req, res, next) => {
    const tasks = await Task.find({ assignedTo: req.user._id }).sort('-createdAt');
    res.status(200).json({
        tasks
    })

})

exports.updateTask = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, assignedTo: req.user._id });

    if (!task) {
        return next(new AppError("Task not found or not authorized", 404));
    }
    // Update only provided fields individually to avoid overwriting required fields
    for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            task[key] = req.body[key];
        }
    }
    await task.save();
    res.status(200).json({ task });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
    const task = await Task.findOneAndDelete(
        {
            _id: req.params.id,
            assignedTo: req.user._id
        }
    )

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted" }); s
})