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
      var tag = req.query.tags ? req.query.tags : null;
      new db.Tutorials()
        .fetchAll({withRelated: 'tags'})
        .then(function (tutorials) {
          tutorials = tutorials.toJSON();
          new db.Tags().fetchAll()
            .then(function (tags) {
              if (tag) {
                tutorials = tutorials.filter(function (x) {
                  for (var i = 0; i < x.tags.length; i++) {
                    if (x.tags[i].tag_name === tag) {
                      return x;
                    }
                  }
                });
              }
              return res.render('tutorials.html', {
                tutorials: tutorials,
                tags: tags.toJSON(),
                activeTag: tag
              });
            })
            .catch(function (error) {
              return res.status(500);
            })
          ;
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

    updateTutorial: function (req, res, next) {
      var tags = req.body.tags
        , path = req.params.tutorial
        , data = {
        users_id: req.user.id,
        url_path: req.body.path,
        title: req.body.title,
        description: req.body.description,
        content_markdown: req.body.content,
        content_html: marked(req.body.content)
      };

      console.log(path, data);

      new db.Tutorials({url_path: path})
        .fetch({withRelated: 'user'})
        .then(function (tutorial) {
          tutorial.save(data, {method: 'update'})
            .then(function (_update) {
              db.DeleteTutorialsTags(_update.id, function (error) {
                if (error) {
                  return res.status(500);
                }
                var _tags = [], i;
                for (i = 0; i < tags.length; i++) {
                  _tags.push({tutorials_id: _update.id, tags_id: tags[i]});
                }
                db.InsertTutorialsTags(_tags, function (error) {
                  if (error) {
                    return res.status(500);
                  }
                  return res.redirect('/tutorials/' + tutorial.get('url_path'));
                })
              });
            })
            .catch(function (error) {
              return res.status(500);
            })
          ;
        })
        .catch(function (error) {
          return res.status(500);
        })
      ;
    },

    admin: function (req, res, next) {
      var page = req.params.page;

      function _return (data) {
        return res.render('admin/' + data.page + '.html', {
          is_authenticated: req.userIsAuthenticated,
          username: req.user.attributes.username,
          data: data ? data : null
        });
      };

      if (page === 'create') {
        new db.Tags()
          .fetchAll()
          .then(function (tags) {
            data = tags.toJSON();
            data.page = page;
            _return(data);
          })
          .catch(function (error) {
            console.log('no tags');
          })
        ;
      }
      else {
        new db.Tutorials({url_path: page})
          .fetch({withRelated: 'tags'})
          .then(function (tutorial) {
            tutorial = tutorial.toJSON();
            new db.Tags()
              .fetchAll()
              .then(function (tags) {
                activeTags = tutorial.tags.map(function (x) {
                  return x.tags_id;
                });
                data = tags.toJSON();
                data = data.map(function (x) {
                  if (activeTags.indexOf(x.tags_id) > -1) {
                    x.active = true;
                  }
                  return x;
                });
                data.page = 'edit';
                data.tutorial = tutorial;
                _return(data);
              })
              .catch(function (error) {
                console.log('no tags');
              })
            ;
          })
          .catch(function (error) {
            return res.status(500);
          })
        ;
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

    addToMailingList: function (req, res, next) {

    },

  }

};
