var bcrypt = require('bcrypt-nodejs')
  , config = require('./config.json')
  , knex = require('knex')(config.db)
  , bookshelf = require('bookshelf')(knex)
  , save = bookshelf.Model.prototype.save
;

bookshelf.Model.prototype.save = function () {
  return save.apply(this, arguments).then(function (model) {
    return model ? model.fetch() : model;
  })
};

module.exports = {

  UsersRoles: bookshelf.Model.extend({
    tableName: 'users_roles',
    idAttribute: 'users_roles_id',
  }),

  Users: bookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'users_id',
    generateHash: function (password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },
    validPassword: function (password) {
      return bcrypt.compareSync(password, this.get('password'));
    },
    role: function () {
      return this.hasOne(UsersRoles, 'users_roles_id');
    },
    profile: function () {
      return this.hasOne(UsersProfiles, 'users_profiles_id');
    }
  }),

  UsersProfiles: bookshelf.Model.extend({
    tableName: 'users_profiles',
    idAttribute: 'users_profiles_id',
    user: function () {
      return this.belongsTo(Users, 'users_id');
    }
  }),

  Tutorials: bookshelf.Model.extend({
    tableName: 'tutorials',
    idAttribute: 'tutorials_id',
    user: function () {
      return this.belongsTo(Users, 'users_id');
    },
    tags: function () {
      return this.hasMany(TutorialsTags, 'tutorials_tags_id');
    }
  }),

  Tags: bookshelf.Model.extend({
    tableName: 'tags',
    idAttribute: 'tags_id'
  }),

  TutorialsTags: bookshelf.Model.extend({
    tableName: 'tutorials_tags',
    idAttribute: 'tutorials_tags_id',
    tutorial: function () {
      return this.belongsTo(Tutorials, 'tutorials_id');
    },
    tags: function () {
      return this.hasOne(Tags, 'tags_id');
    }
  }),

  Jobs: bookshelf.Model.extend({
    tableName: 'jobs',
    idAttribute: 'jobs_id',
    user: function () {
      return this.belongsTo(Users, 'users_id');
    },
    tags: function () {
      return this.hasMany(JobsTags, 'jobs_tags_id');
    }
  }),

  JobsTags: bookshelf.Model.extend({
    tableName: 'jobs_tags',
    idAttribute: 'jobs_tags_id',
    job: function () {
      return this.belongsTo(Jobs, 'jobs_id');
    },
    tags: function () {
      return this.hasOne(Tags, 'tags_id');
    }
  })

};