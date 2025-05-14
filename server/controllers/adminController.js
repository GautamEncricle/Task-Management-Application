
const User = require('../models/User.model');

// Get all users - admin only
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({
            statusCode: "Error",
            error: `Failed to fetch users: ${error.message}`
        });
    }
};

// Delete a user by ID - admin only
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({
            statusCode: "Error",
            error: `Failed to delete user: ${error.message}`
        });
    }
};

// Update user role - admin only
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.role = role;
        await user.save();
        res.status(200).json({ message: "User role updated", user });
    } catch (error) {
        res.status(500).json({
            statusCode: "Error",
            error: `Failed to update user role: ${error.message}`
        });
    }
};

// Roles and Permissions management (simple in-memory for now)
let roles = [
    { name: "admin", permissions: ["view", "edit", "delete", "assign"] },
    { name: "user", permissions: ["view", "edit"] },
];

// Get all roles
exports.getRoles = (req, res) => {
    res.status(200).json({ roles });
};

// Create a new role
exports.createRole = (req, res) => {
    const { name, permissions } = req.body;
    if (roles.find(r => r.name === name)) {
        return res.status(400).json({ message: "Role already exists" });
    }
    roles.push({ name, permissions });
    res.status(201).json({ message: "Role created", role: { name, permissions } });
};

// Update a role
exports.updateRole = (req, res) => {
    const { name } = req.params;
    const { permissions } = req.body;
    const role = roles.find(r => r.name === name);
    if (!role) {
        return res.status(404).json({ message: "Role not found" });
    }
    role.permissions = permissions;
    res.status(200).json({ message: "Role updated", role });
};

// Delete a role
exports.deleteRole = (req, res) => {
    const { name } = req.params;
    const index = roles.findIndex(r => r.name === name);
    if (index === -1) {
        return res.status(404).json({ message: "Role not found" });
    }
    roles.splice(index, 1);
    res.status(200).json({ message: "Role deleted" });
};
