module.exports = {

  list: async function (req, res) {

  	var posts = await Post.all();
    sails.log(posts);
  	return res.view('pages/admin/posts/list', { posts: posts } );
  	
  },


  add: async function (req, res) {
  	return res.view('pages/admin/posts/add');
  },
  addPost: async function (req, res) {
    await Post.addPost(req, res);
    req.flash('success', "Post added successfully.");
    res.redirect('/admin/posts');
  },


  edit: async function (req, res) {

    var id = req.params.id;
    var post = await Post.get(id);
    if(!post)
      return res.notFound();
    return res.view('pages/admin/posts/edit', { post: post });
  },
  editPost: async function (req, res) {
    await Post.editPost(req, res);
    req.flash('success', "Post has been updated.");
    res.redirect('back');
  },


  delete: async function (req, res) {

    var id = req.params.id;
    var post = await Post.delete(id);
    //if(post)
      req.flash('success', "Post #"+ id + " has been deleted.");
    //else
      //req.flash('error', "Post #"+ id + " delete encountered error.");
    res.redirect('back');
    
  },





};