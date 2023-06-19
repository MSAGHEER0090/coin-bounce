class userDto{
    constructor(user){
        this._id=user._id;
        this.name=user.name;
        this.username=user.username
    }
}

module.exports=userDto;