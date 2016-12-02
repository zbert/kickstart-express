'use strict';

var express     = require('express');
var exphbs      = require('express-handlebars');
var routescan   = require('express-routescan');
var requireDir  = require('require-all');
var _           = require('lodash');

var app,
    data,
    helpers;

app = express();

/*****************************************
  Load files
*****************************************/

data = requireDir({dirname: __dirname + '/src/public/data'});
helpers = requireDir({ dirname: __dirname + '/src/templates/helpers'});

/*****************************************
  Setup Handlebars as templating engine
*****************************************/

app.engine('html', exphbs({
  layoutsDir: 'src/templates/views/layouts',
  partialsDir: 'src/templates/views/partials',
  helpers: helpers,
  defaultLayout: 'default-layout',
  extname: '.html'
}));
app.set('view engine', 'html');
app.set('views', __dirname + '/src/templates/views');


/*****************************************
  Setup Middleware
*****************************************/

// Serve static Fies
app.use('/public', express.static('site/public'));

// Common template data across pages
app.use(function(req, res, next){
  req.locals = _.cloneDeep(data);
  next();
});

/*****************************************
  Setup Routes
*****************************************/

routescan(app, { directory: __dirname + '/src/routes'} );

/*****************************************
  Startup Server
*****************************************/

app.listen(3000, function(){
  console.log('------------------------------------------');
  console.log('Template Server Running on localhost:3000');
  console.log('------------------------------------------');
});
