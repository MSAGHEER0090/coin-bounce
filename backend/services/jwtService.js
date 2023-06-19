 const jwt=require('jsonwebtoken');
const {REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET}=require('../config/index')
// const {REFRESH_TOKEN_SECRET}=require('../config/index')
// const RefreshToken=require('../models/token')
//  const ACCESS_TOKEN_SECRET='b82f75378d68903161fa6a33aa879563328b9dd16de0fd07cca3bb2acc7d067594d8a42d45754314ce41ef6cd96ffca371bfccd27b8db29f9589504a78a42da1'
//  const REFRESH_TOKEN_SECRET='477b2589aa9555fda02944374b06303caf3f0c75dd6e5b5efd4c289120bcf42042145df6c72e0e9f9a5da1ad9da8fad970ac0eaa039cb4bf3774b16455e3157e'

 class JWTServices{
    //sign access token
    static signAccessToken(payload,expiryTime){
        return jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:expiryTime});

    }
    //sign refresh token
    static signRefreshToken(payload,expiryTime){
        return jwt.sign(payload,REFRESH_TOKEN_SECRET,{expiresIn:expiryTime})
    }
    //verify access token
    static  verifyAccessToken(token){
        return jwt.verify(token,ACCESS_TOKEN_SECRET);
    }
    //verify refersh token
    static  verifyRefereshToken(token){
        return jwt.verify(token,REFRESH_TOKEN_SECRET);
    }
    //store refresh token in db
    static  async storeRefrehToken(token,userId){
        try{
            const newToken=new RefreshToken({
                token:token,
                userId:userId
            });
            await newToken.save();

        }catch(err){
            console.log(err);
        }
    }

 }

 module.exports=JWTServices;