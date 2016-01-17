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

nunjucks.configure(
  ['views', 'views/admin'], {
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

function requireAdmin (req, res, next) {
  new database.Users({users_id: req.user.id})
    .fetch({withRelated: 'role'})
    .then(function (user) {
      var role = user.relations.role.get('role');
      if (role === 'admin') return next();
      else res.status(401).send("Unauthorized request!");
    })
    .catch(function (error) {
      return res.status(401).send("Unauthorized request!");
    })
  ;
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

function isAdmin (req, res, next) {
  new database.Users({users_id: req.user.id})
    .fetch({withRelated: 'role'})
    .then(function (user) {
      var role = user.relations.role.get('role');
      if (role === 'admin') req.isAdmin = true;
      else req.isAdmin = false;
      return next();
    })
    .catch(function (error) {
      return next();
    })
  ;
}

function getUsername (req, res, next) {
  if (req.isAuthenticated && req.user && req.user.id) {
    req.username = req.user.attributes.username;
  }
  else {
    req.username = null;
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

// Tutorials and Tutorials Admin Routes ========================================
server.get('/tutorials/',
  function (req, res, next) {
    return next();
  }, routes.getTutorials);
;

server.get('/tutorials/:tutorial/',
  function (req, res, next) {
    return next();
  }, routes.getTutorial);
;

server.post('/tutorials/',
  requireAuthorization,
  requireAdmin,
  function (req, res, next) {
    return next();
  }, routes.createTutorials)
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
  getUsername,
  function (req, res, next) {
    return next();
  }, routes.getHomePage)
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
  isAdmin,
  function (req, res, next) {
    return next();
  }, routes.user)
;

server.get('/admin/:page/',
  requireAuthorization,
  requireAdmin,
  isAuthenticated,
  function (req, res, next) {
    return next();
  }, routes.admin)
;

module.exports = function (callback) {
  callback(server);
};
