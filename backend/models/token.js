const mongoose=require('mongoose')

const {Schema}=mongoose;


const refreshtokenSchema=Schema({
    id:{type:String,required:true},
    useID:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{
    timetamps:true
})

module.exports=mongoose.model("RefreshToken",refreshtokenSchema,"token")