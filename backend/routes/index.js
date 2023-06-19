const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const blogController=require('../controller/blogController')
const auth=require('../middleware/auth')
const commentController=require('../controller/commentController')


// Test route
router.get('/test', (req, res) => {
  res.json({ msg: 'testing' });
});

// Register route
router.post('/register', authController.register);
//login
router.post("/login",authController.login)
//logout
router.post("/logout",authController.logout)
//refresh
router.get('/refresh', authController.refresh);

//blog

//creat
router.post("/blog",auth,blogController.create);
//got all
router.get("/blog/all",auth,blogController.getAll)
//got blog by id
router.get("/blog/:id",auth,blogController.getById);
//update
router.put("/blog",auth,blogController.update);
//delete
router.delete("/blog/:id",auth,blogController.delete);

//comment
//create
router.post("/comment",auth,commentController.create);
//get
router.get("/comment/:id",auth,commentController.getById)



module.exports = router;

