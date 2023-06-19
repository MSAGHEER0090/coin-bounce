// const JWTServices = require('../services/jwtservice');
const User = require('../models/user');
const userDto = require('../DTO/userDTO');
const JWTServices=require('../services/jwtService')

const auth = async (req, res, next) => {
  try {
    // Validation of refresh and access tokens
    const { refreshToken, accessToken } = req.cookies;
    if (!refreshToken || !accessToken) {
      const error = {
        status: 401,
        message: "Unauthorized"
      };
      return next(error);
    }

    let id;
    try {
      id = JWTServices.verifyAccessToken(accessToken);
    } catch (err) {
      return next(err);
    }

    let user;
    try {
      user = await User.findOne({ _id: id });
    } catch (err) {
      return next(err);
    }

    const userDTO = new userDto(user);

    req.user = userDTO;
    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = auth;
