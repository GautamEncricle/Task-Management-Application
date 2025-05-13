const express = require('express');
const { signup, login } = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get("/protect/testing", protect, (req, res) => {
    res.status(200).json({ message: "You are logged in", user: req.user });
});

module.exports = router;