'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'locks',
      {
        mac_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING
        },
        owner_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        created_at: {
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        updated_at: {
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        }
      }
    ).then(() => {
      return queryInterface.sequelize.query(`ALTER TABLE locks 
        MODIFY COLUMN updated_at DATETIME NOT NULL 
        DEFAULT NOW() ON UPDATE NOW();`
      );
    }).then(() => {
      return queryInterface.createTable(
        'user_locks',
        {
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            }
          },
          lock_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'locks',
              key: 'mac_id'
            }
          }
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('user_locks').then(() => {
      return queryInterface.dropTable('locks');
    });
  }
};
