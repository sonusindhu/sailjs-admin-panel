/**
 * Post.js
 *
 */

 module.exports = {

  attributes: {

    title: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 200
    },

    description: {
      type: 'string',
      columnType: 'longtext',
      required: true,
    },
    status: {
      type: 'boolean'
    },
    user_id: {
      model: 'user'
    }

  },
  

  // Find all posts
  all: async function () {
    return await Post.find({sort: 'createdAt DESC'}).populate('user_id');;
  },

  // Find post
  get: async function (id) {
    return await Post.findOne({id: id});
  },

  // delete post
  delete: async function (postId) {
    if(postId)
      return await Post.destroy({ id: postId });
    else
      return false;
  },


  addPost: async function (req, res) {  /* POSTed data */
    var title  = req.body ? req.body.title : undefined,
        status  = req.body ? req.body.status : 0,
        description = req.body ? req.body.description : undefined;
      //technically - once policies in place, this if can be removed as this action couldn't be called unless the user is logged in.
      if ( ! req.me ) {
          return res.badRequest("Cannot add post without a logged in user");
      } else if ( ! title && ! description) {
          return res.badRequest("Need a title or description to create post");
      } else {
        return await  Post.create({ title: title || '', description: description || '', user_id: req.me.id, status: status });
      }

    },

    editPost: async function (req, res) {  /* POSTed data */
      var title  = req.body ? req.body.title : undefined,
          status  = req.body ? req.body.status : 0,
          id  = req.body ? req.body.id : false,
          description = req.body ? req.body.description : undefined;
      //technically - once policies in place, this if can be removed as this action couldn't be called unless the user is logged in.
      if ( ! req.me ) {
          return res.badRequest("Cannot add post without a logged in user");
      } else if (!id) {
          return res.badRequest("Something went wrong, please try again later.");
      } else {

        return await Post.update({id: id}).set({ title: title, description: description, status: status });
      }

    }




};
