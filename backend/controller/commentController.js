const Joi=require('joi');
const comment=require('../models/comment')
const commentController={
    async create(req,res,next){
        const creatCommentSchema=Joi.object({
            conten:Joi.string().required(),
            // blog:Joi.string().required(),
            author:Joi.string().required(),
        })
        const {error}=creatCommentSchema.validate(req.body)
        if(error){
            return next(error)
        }
        const {content,author}=req.body;
        try{
            const newcomment=new comment({
                content,author
            })
            await newcomment.save();

        }catch(err){
            return next(err)
        }
        return res.status(200).json("commented")
    },
  async getById(req,res,next){
    const getCommentSchema=Joi.object({
        id:Joi.string().required(),
    })
    const {error}=getCommentSchema.validate(req.params);
    if(error){
        return next(error);
    }
    let comment;
    try{
        
        comment=await Comment.find({blod:id})

    }catch(err){
        return next(err)
    }

    res.status(200).json({data:comment})
  }

}

module.exports=commentController;