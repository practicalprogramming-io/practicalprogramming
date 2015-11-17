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

function checkAuthorization (req, res, next) {
  if (req.isAuthenticated && req.user.id) return next();
  else res.status(401).send("Unauthorized request!");
}

// Register, Login & Logout Routes =============================================
server.post('/login/',
  passport.authenticate('login'),
  function (req, res, next) {
    var username = req.user.get('username');
    res.redirect('/users/' + username + '/');
  })
;

server.post('/logout/',
  checkAuthorization,
  function (req, res, next) {
    req.logout();
    res.status(200).end();
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
  function (req, res, next) {
    return res.render('index.html');
  })
;

module.exports = function (callback) {
  callback(server);
};