var marked = require('marked');

marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

module.exports = function (db) {

  return {

    getHomePage: function (req, res, next) {

    db.TutorialsRecent
      .then(function (tutorials) {
        return res.render('home.html', {
          is_authenticated: req.userIsAuthenticated,
          username: req.username,
          tutorials: tutorials
        })
      })
      .catch(function (error) {
        return res.status(500);
      })
    ;

    },

    getTutorials: function (req, res, next) {

    },

    getTutorial: function (req, res, next) {
      var path = req.params.tutorial;

      new db.Tutorials({url_path: path})
        .fetch({withRelated: 'user'})
        .then(function (tutorial) {
          res.render('tutorial.html', {
            title: tutorial.get('title'),
            content: tutorial.get('content_html'),
            author: tutorial.relations.user.get('username'),
            created: tutorial.get('created_datetime')
          });
        })
        .catch(function (error) {
          return res.status(500);
        })
      ;

    },

    createTutorials: function (req, res, next) {
      var data = {
        users_id: req.user.id,
        url_path: req.body.path,
        title: req.body.title,
        description: req.body.description,
        content_markdown: req.body.content,
        content_html: marked(req.body.content)
      };

      new db.Tutorials(data).save()
        .then(function (tutorial) {
          return res.redirect('/tutorials/' + tutorial.get('url_path'));
        })
        .catch(function (error) {
          return res.status(500);
        })
      ;

    },

  }

};