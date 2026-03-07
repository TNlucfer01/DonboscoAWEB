
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// Public route
router.all('/principal', auth, roleCheck('principal'), (req, res) => {
    res.json({ message: 'Principal', user: req.user });
});

// Moderator + Admin only
router.all('/yearCoordinator', auth, roleCheck('yearCoordinator'), (req, res) => {
    res.json({ message: 'Year Coordinator' });
});

// Admin only
router.all('/yearCoordinator', auth, roleCheck('admin'), async (req, res) => {
    // delete logic here
    res.json({ message: 'Year Coordinator deleted' });
});

module.exports = router;