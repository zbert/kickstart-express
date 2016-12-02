'use strict';

module.exports = {
  '/': function(req, res) {
    var locals;

    locals = req.locals;
    locals.page = 'page-homepage show-background-2';

    res.render('home', locals);
  },
  '/home': function(req, res) {
    var locals;

    locals = req.locals;
    locals.page = 'page-homepage show-background-2';

    res.render('home', locals);
  },

  '/index': function(req, res) {
    var locals;

    locals = req.locals;
    locals.page = 'page-index';

    res.render('index', locals);
  }
}
