module.exports = {

  adminIndex: async function (req, res) {

  	var users = await User.all();
  	return res.view('pages/admin/users/index', { users: users } );
  	
  },


  adminAdd: async function (req, res) {

  	return res.view('pages/admin/users/add');
  	
  },


  adminEdit: async function (req, res) {

    var id = req.params.id;
    var user = await User.get(id);
    
    // if(req.method == 'POST'){

    // }

    if(!user)
      return res.notFound();

      //return req.redirect('/admin/users');

    return res.view('pages/admin/users/edit', { user: user });
    
  },


  adminDelete: async function (req, res) {

    
    var id = req.params.id;
    var user = await User.delete(id);
    if(user)
      req.flash('success', "User #"+ id + " has been deleted.");
    else
      req.flash('error', "User #"+ id + " delete encountered error.");

    res.redirect('back');
    
  },


  

  allPost: function(req, res, next){
  	console.log(req.session);
    //req.session.flash = [];
    next();
  }


};
