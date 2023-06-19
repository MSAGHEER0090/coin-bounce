const express=require('express')
const dbconnect=require('./Database/index')
// const PORT=require('./config/index')
// const {PORT}=require('./config/index')
const { PORT } = require('./config/index');
const router=require('./routes/index')
const errorHandler=require('./middleware/errorhandllor')
const cookieParser=require('cookie-parser');

const app=express();

//for sending data in cookie through middleware
app.use(cookieParser());
// const PORT=5000;

dbconnect();
app.use(express.json())
app.use(router)

app.get("/",(req,res)=>{
    res.json({msg:"Hello wewe world"})
})

app.use('/storage',express.static('storage'));
app.use(errorHandler);
app.listen(PORT,console.log(`app is runing on port ${PORT}`))

