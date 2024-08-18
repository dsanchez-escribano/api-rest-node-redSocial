const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Follow route');
});

// Export the router
module.exports = router;
