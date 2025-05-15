const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User.model');

// Get all users - admin only, with optional filtering by status, role, search
exports.getUsers = catchAsync(async (req, res, next) => {
    const { status, role, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }
    const users = await User.find(filter).select('-password');
    res.status(200).json({ users });
})

// Delete a user by ID - admin only
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404))
    }
    res.status(200).json({ message: "User deleted successfully" });
})

// Update user role - admin only
exports.updateUserRole = catchAsync(async (req, res, next) => {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
        return next(new AppError("Invalid role", 400))
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404))
    }
    user.role = role;
    await user.save();
    res.status(200).json({ message: "User role updated", user });
});

// Update user status - admin only
exports.updateUserStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    if (!['active', 'inactive', 'pending'].includes(status)) {
        return next(new AppError("Invalid status", 400));
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    user.status = status;
    await user.save();
    res.status(200).json({ message: "User status updated", user });
});

// Roles and Permissions management 
let roles = [
    { name: "admin", permissions: ["view", "edit", "delete", "assign"] },
    { name: "user", permissions: ["view", "edit"] },
];

// Get all roles
exports.getRoles = (req, res) => {
    res.status(200).json({ roles });
};

// Create a new role
exports.createRole = catchAsync((req, res, next) => {
    const { name, permissions } = req.body;
    if (roles.find(r => r.name === name)) {
        return next(new AppError("Role already exists", 400));
    }
    roles.push({ name, permissions });
    res.status(201).json({ message: "Role created", role: { name, permissions } });
});

// Update a role
exports.updateRole = catchAsync((req, res, next) => {
    const { name } = req.params;
    const { permissions } = req.body;
    const role = roles.find(r => r.name === name);
    if (!role) {
        return next(new AppError("Role not found", 404));
    }
    role.permissions = permissions;
    res.status(200).json({ message: "Role updated", role });
});

// Delete a role
exports.deleteRole = catchAsync((req, res, next) => {
    const { name } = req.params;
    const index = roles.findIndex(r => r.name === name);
    if (index === -1) {
        return next(new AppError("Role not found", 404));
    }
    roles.splice(index, 1);
    res.status(200).json({ message: "Role deleted" });
});