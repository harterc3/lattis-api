"use strict";

module.exports = function(sequelize, DataTypes) {
  return sequelize.define("userLock", {}, {
    tableName: 'user_locks',
    timestamps: false
  });
};
