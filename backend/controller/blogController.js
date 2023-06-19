const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const { BACLEND_SERVER_PATH } = require('../config/index');
const BlogDTO = require('../DTO/blogDTO');
const BlogDetailDTO=require('../DTO/BlogDetailDTO')
// const BlogDetailDTO = require('../DTO/blogDetailDTO');
const Comment = require('../models/comment');

const blogController = {
  async create(req, res, next) {
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().required(),
      content: Joi.string().required(),
      photo: Joi.string().required(),
    });

    const { error } = createBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { title, author, content, photo } = req.body;
    const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg):base64,/, ''), 'base64');
    const imagePath = `${Date.now()}-${author}.png`;

    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (err) {
      return next(err);
    }

    let newBlog;
    try {
      newBlog = {
        title,
        author,
        content,
        photoPath: `${BACLEND_SERVER_PATH}/storage/${imagePath}`,
      };
      await new Blog(newBlog).save();

    } catch (err) {
      return next(err);
    }

    const blogDto = new BlogDTO(newBlog);
    return res.status(201).json({ blog: blogDto });
  },

  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});
      const blogDTO = blogs.map(blog => new BlogDTO(blog));

      return res.status(200).json({ blogs: blogDTO });
    } catch (err) {
      return next(err);
    }
  },

  async getById(req, res, next) {
    const blogIdSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error } = blogIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }

    const { id } = req.params;
    let blog;
    try {
      blog = await Blog.findOne({ _id: id }).populate('author');
    } catch (err) {
      return next(err);
    }

    const blogDetail = new BlogDetailDTO(blog);
    return res.status(200).json({ blog: blogDetail });
  },

  async update(req, res, next) {
    const updateBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().required(),
      blogId: Joi.string().required(),
      photo: Joi.string(),
    });

    const { error } = updateBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { title, content, author, blogId, photo } = req.body;
    let blog;

    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (err) {
      return next(err);
    }

    if (photo) {
      let previousPhoto = blog.photoPath;
      previousPhoto = previousPhoto.split('/').pop();

      fs.unlinkSync(`storage/${previousPhoto}`);

      const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg):base64,/, ''), 'base64');
      const imagePath = `${Date.now()}-${author}.png`;

      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (err) {
        return next(err);
      }

      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photoPath: `${BACLEND_SERVER_PATH}/storage/${imagePath}`,
        }
      );
    } else {
      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
        }
      );
    }

    return res.status(200).json({ message: "Blog is updated" });
  },

  async delete(req, res, next) {
    const delBlogSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error } = delBlogSchema.validate(req.params);
    if (error) {
      return next(error);
    }

    const { id } = req.params;

    try {
      await Blog.deleteOne({ _id: id });
      await Comment.deleteMany({ blog: id });

      return res.status(200).json({ msg: "deleted" });
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = blogController;
