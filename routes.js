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
          var currentId = null
            , tutorial = null
            , _tutorials = []
          ;
          for (var i = 0; i < tutorials.length; i++) {
            var tutorialId = tutorials[i].tutorials_id
              , tagId = tutorials[i].tags_id
              , tagName = tutorials[i].tag_name
            ;
            if (currentId && currentId === tutorialId) {
              tutorial.tags.push({tags_id: tagId, tag_name: tagName});
            }
            else {
              currentId = tutorialId;
              tutorial = _tutorials[_tutorials.push(tutorials[i]) - 1];
              tutorial.tags = [{tags_id: tagId, tag_name: tagName}];
            }
          }
          return res.render('home.html', {
            is_authenticated: req.userIsAuthenticated,
            username: req.username,
            tutorials: _tutorials
          })
        })
        .catch(function (error) {
          return res.status(500);
        })
      ;
    },

    getTutorials: function (req, res, next) {
      new db.Tutorials()
        .fetchAll({withRelated: 'tags'})
        .then(function (tutorials) {
          //console.log(tutorials.toJSON()[0]);
          return res.render('tutorials.html', {
            tutorials: tutorials.toJSON()
          });
        })
        .catch(function (error) {
          return res.status(500);
        })
      ;
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
      var tags = req.body.tags
        , data = {
        users_id: req.user.id,
        url_path: req.body.path,
        title: req.body.title,
        description: req.body.description,
        content_markdown: req.body.content,
        content_html: marked(req.body.content)
      };

      new db.Tutorials(data).save()
        .then(function (tutorial) {
          var _tags = [], i;
          for (i = 0; i < tags.length; i++) {
            _tags.push({tutorials_id: tutorial.id, tags_id: tags[i]});
          }
          db.InsertTutorialsTags(_tags, function (error) {
            if (error) {
              return res.status(500);
            }
            return res.redirect('/tutorials/' + tutorial.get('url_path'));
          })
        })
        .catch(function (error) {
          return res.status(500);
        })
      ;

    },

    admin: function (req, res, next) {
      var page = req.params.page;

      function _return (data) {
        return res.render('admin/' + page + '.html', {
          is_authenticated: req.userIsAuthenticated,
          username: req.user.attributes.username,
          data: data ? data : null
        });
      };

      if (page === 'create_tutorial') {
        new db.Tags()
          .fetchAll()
          .then(function (tags) {
            data = tags.toJSON();
            _return(data);
          })
          .catch(function (error) {
            console.log('no tags');
          })
        ;
      }
      else {
        _return();
      }
    },

    user: function (req, res, next) {
      function _return (data) {
        return res.render('users.html', {
          is_authenticated: req.userIsAuthenticated,
          username: req.user.attributes.username,
          is_admin: req.isAdmin,
          data: data ? data : null
        })
      };

      if (req.isAdmin) {
        new db.Tutorials()
          .fetchAll({withRelated: 'tags'})
          .then(function (tutorials) {
            _return(tutorials.toJSON());
          })
          .catch(function (error) {
            return res.status(500);
          })
        ;
      }
      else {
        _return();
      }
    },

  }

};
