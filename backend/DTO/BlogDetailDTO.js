class BlogDetailDTO{
    constructor(blog) {
        this._id=blog._id;
        this.content = blog.content;
        this.title = blog.title;
        this.photo = blog.photoPath;
        this.authorName=blog.author.name;
        this.authorUsername=blog.author.authorUsername;
      }
}
module.exports=BlogDetailDTO;