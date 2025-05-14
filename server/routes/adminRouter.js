const express = require('express');
const { getUsers, deleteUser, updateUserRole, getRoles, createRole, updateRole, deleteRole } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Roles and permissions routes
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/:name', updateRole);
router.delete('/roles/:name', deleteRole);

module.exports = router;
