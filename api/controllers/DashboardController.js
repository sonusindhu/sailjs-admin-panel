module.exports = {

  adminIndex: function (req, res) {

    res.view('pages/admin/dashboard/index', {layout: 'layouts/admin'});

  }

};
