const Joi = require('joi');
const User = require('../models/user');
const Bcrypt = require('bcryptjs');
const userDto = require('../DTO/userDTO');
const JWTServices = require('../services/jwtService');
const RefreshToken = require('../models/token');

const authController = {
  async register(req, res, next) {
    // 1. Validate the data
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.ref('password'),
    });

    // 2. If there's an error in validation, return the error to the middleware
    const { error } = userRegisterSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // 3. If email or username already exist, return error
    const { username, name, email, password } = req.body;
    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });

      if (emailInUse) {
        const error = {
          status: 409,
          message: 'Email is already in use',
        };
        return next(error);
      }

      if (usernameInUse) {
        const error = {
          status: 409,
          message: 'Username is already in use',
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }

    // 4. Password hash
    const hashedPassword = await Bcrypt.hash(password, 10);

    // 5. Store user data in the database
    let accesstoken;
    let refreshtoken;
    let user;

    try {
      const userToRegister = new User({
        username,
        email,
        name,
        password: hashedPassword,
      });

      user = await userToRegister.save();
      // Sign access token
      accesstoken = JWTServices.signAccessToken(
        { _id: user._id, username: user.username },
        '30m'
      );
      // Sign refresh token
      refreshtoken = JWTServices.signRefreshToken({ _id: user._id }, '60m');
    } catch (err) {
      return next(err);
    }

    await JWTServices.storeRefrehToken(refreshtoken, user._id);
    // Sending cookies
    res.cookie('accessToken', accesstoken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie('refreshToken', refreshtoken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    // Response
    const usertosnd = new userDto(user);
    return res.status(201).json({ user: usertosnd });
  },

  async login(req, res, next) {
    // Validate input
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().required(),
    });
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // Check in database
    const { username, password } = req.body;

    let check_user;
    try {
      check_user = await User.findOne({ username });
      if (!check_user) {
        const error = {
          status: 401,
          message: 'Invalid username',
        };
        return next(error);
      }

      const check_password = await Bcrypt.compare(password, check_user.password);

      if (!check_password) {
        const error = {
          status: 401,
          message: 'Invalid password',
        };
        return next(error);
      }

      const accessToken = JWTServices.signAccessToken({ _id: check_user._id }, '30m');
      const refreshToken = JWTServices.signRefreshToken({ _id: check_user._id }, '30m');
      const usertosnd = new userDto(check_user);
      // Update refresh token
      RefreshToken.updateOne(
        {
          _id: check_user._id,
        },
        {
          token: refreshToken,
        },
        {
          upsert: true,
        }
      );

      res.cookie('accessToken', accessToken, {
        maxAge: 100 * 60 * 60,
        httpOnly: true,
      });
      res.cookie('refreshToken', refreshToken, {
        maxAge: 100 * 60 * 60,
        httpOnly: true,
      });

      return res.status(201).json({ user: usertosnd });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    // Delete refresh token from db
    const { refreshToken, accessToken } = req.cookies;
    res.clearCookie('accessToken', accessToken);
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (err) {
      return next(err);
    }
    // Clear cookies
    res.clearCookie('refreshToken', refreshToken);
    res.clearCookie('accessToken', accessToken);
    // Response
    res.status(200).json({ user: null });
  },

  async refresh(req, res, next) {
    // Refresh token access from cookies
    const originalRefreshToken = req.cookies.refreshToken;

    let id;
    try {
      id = JWTServices.verifyAccessToken(originalRefreshToken)._id;
    } catch (err) {
      const error = {
        status: 401,
        message: 'Unauthorized',
      };
      return next(error);
    }

    try {
      const match = await RefreshToken.findOne({ _id: id, token: originalRefreshToken });
      if (!match) {
        const error = {
          status: 401,
          message: 'Unauthorized',
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }

    try {
      const accessToken = JWTServices.signAccessToken({ _id: id }, '30m');
      const refreshToken = JWTServices.signRefreshToken({ _id: id }, '30m');
      await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

      res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });
      res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });
    } catch (err) {
      return next(err);
    }

    const user = await User.findOne({ _id: id });
    const userDto = new userDto(user);

    res.status(200).json({ user: userDto, auth: true });

    // Verify refresh token
    // Generate new tokens
    // Update database
    // Send response
  },
};

module.exports = authController;
