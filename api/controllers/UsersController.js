module.exports = {

  adminIndex: async function (req, res) {

  	var users = await User.all();


 //  	users.then(function(result) {
	//    sails.log('Wow, there are users.  Check it out:', result);
	//    return res.view('pages/admin/users/index', { users: result } );
	// })

  	sails.log('Wow, there are users.  Check it out:', users);
  	return res.view('pages/admin/users/index', { users: users } );
  	
  }

};
