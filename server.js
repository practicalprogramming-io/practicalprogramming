var express = require('express')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , passport = require('passport')
  , nunjucks = require('nunjucks')
  , config = require('./config.json')
  , database = require('./database')
  , routes = require('./routes')(database)
  , server = express();
;

server.set('port', process.env.PORT || 3030);

server.use(cookieParser('secret'));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json({ limit: '25mb' }));

require('./passport')(passport);

server.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

nunjucks.configure('public/views', {
  autoescape: true,
  express: server
});

server.use(passport.initialize());
server.use(passport.session());

server.enable('trust proxy');

function requireAuthorization (req, res, next) {
  if (req.isAuthenticated && req.user.id) return next();
  else res.status(401).send("Unauthorized request!");
}

function isAuthenticated (req, res, next) {
  if (req.isAuthenticated && req.user && req.user.id) {
    req.userIsAuthenticated = true;
  }
  else {
    req.userIsAuthenticated = false;
  }
  return next();
}

// Register, Login & Logout Routes =============================================
server.post('/login/',
  passport.authenticate('login'),
  function (req, res, next) {
    var username = req.user.get('username');
    res.redirect('/users/' + username + '/');
  })
;

server.get('/logout/',
  requireAuthorization,
  function (req, res, next) {
    req.logout();
    res.redirect('/');
  })
;

server.post('/register/',
  passport.authenticate('register'),
  function (req, res, next) {
    var username = req.user.get('username');
    res.redirect('/users/' + username + '/');
  })
;

// Admin Routes ================================================================
server.get('/admin/tutorials/',
  function (req, res, next) {
    return next();
  }, routes.getAdminTutorials)
;

server.post('/admin/tutorials/',
  function (req, res, next) {
    return next();
  }, routes.createAdminTutorials)
;

// Tutorials and Tutorials Admin Routes ========================================
server.get('/tutorials/:tutorial/',
  function (req, res, next) {

  })
;

server.post('/tutorials/:tutorial/',
  function (req, res, next) {

  })
;

// Jobs Routes =================================================================
server.get('/jobs/:job/',
  function (req, res, next) {

  })
;

server.post('/jobs/:job/',
  function (req, res, next) {

  })
;

// Public Routes ===============================================================
server.use('/assets', express.static(__dirname + '/public/assets/'));
server.use('/js', express.static(__dirname + '/public/js/'));
server.use('/style', express.static(__dirname + '/public/css/'));
server.use('/images', express.static(__dirname + '/public/images/'));

server.get('/',
  isAuthenticated,
  function (req, res, next) {
    return res.render('home.html', {
      is_authenticated: req.userIsAuthenticated
    })
  })
;

server.get('/login/',
  isAuthenticated,
  function (req, res, next) {
    return res.render('login.html', {
      is_authenticated: req.userIsAuthenticated
    })
  })
;

server.get('/register/',
  isAuthenticated,
  function (req, res, next) {
    return res.render('register.html', {
      is_authenticated: req.userIsAuthenticated
    })
  })
;

server.get('/users/:user/',
  requireAuthorization,
  isAuthenticated,
  function (req, res, next) {
    return res.render('users.html', {
      is_authenticated: req.userIsAuthenticated
    })
  })
;

module.exports = function (callback) {
  callback(server);
};