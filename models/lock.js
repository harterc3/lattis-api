"use strict";

module.exports = function(sequelize, DataTypes) {
  const lock = sequelize.define("lock", {
    macId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
      field: 'mac_id'
    },
    name: {
      type: DataTypes.STRING
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'owner_id'
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
        lock.belongsToMany(models.user, {through: models.userLock, foreignKey: 'lock_id'});
        lock.belongsTo(models.user, { as: 'owner', foreignKey: 'ownerId' });
      }
    }
  });

  return lock;
};