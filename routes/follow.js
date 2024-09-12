const express = require('express');
const router = express.Router();
const FollowController = require("../controllers/follow");
const check = require("../midllewares/auth");

// Define your routes here
router.get('/', (req, res) => {
    res.send('Follow route');
});

router.post("/save", check.auth, FollowController.save)
router.delete("/unfollow/:id", check.auth, FollowController.unfollow)
router.get("/following/:id?/:page?", check.auth, FollowController.following)
router.get("/followers/:id?/:page?", check.auth, FollowController.followers)

// Export the router
module.exports = router;
