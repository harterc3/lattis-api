"use strict";

const bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  const user = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
      field: 'password_hash'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phone_number'
    },
    createdAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    classMethods: {
      associate: function (models) {
        user.belongsToMany(models.lock, {as: 'sharedLocks', through: models.userLock, foreignKey: 'user_id'});
        user.hasMany(models.lock, {as: 'locks', foreignKey: 'ownerId'});
      }
    },
    instanceMethods: {
      hasCorrectPassword: function(value) {
        return bcrypt.compareSync(value, this.passwordHash) ? this : false;
      }
    }
  });

  const hasSecurePassword = (user, options, callback) => {
    bcrypt.hash(user.get('password'), 10, function(err, hash) {
      if (err) return callback(err);
      user.set('passwordHash', hash);
      return callback(null, options);
    });
  };

  const onCreateOrUpdate = (user, options, callback) => {
    if (user.password) {
      hasSecurePassword(user, options, callback);
    } else {
      return callback(null, options);
    }
  };

  user.beforeCreate(onCreateOrUpdate);
  user.beforeUpdate(onCreateOrUpdate);

  return user;
};