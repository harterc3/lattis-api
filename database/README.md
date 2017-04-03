# Database Creation SQL

This is my solution for part 1 of the Coding Challenge.

The `owner` of a lock is associated using the `locks.owner_id` field.
Someone who may not be the `owner` but `shares` the lock is associated using the `user_locks` table which pairs a `user_id` with a `lock.mac_id`.

```
CREATE DATABASE lattis_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lattis_test;

CREATE TABLE users (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE locks (
  `mac_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `owner_id` INT(11) NOT NULL,
  PRIMARY KEY (`mac_id`),
  CONSTRAINT `fk_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_locks (
  `user_id` INT(11) NOT NULL,
  `lock_id` VARCHAR(255) NOT NULL,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_lock_id` FOREIGN KEY (`lock_id`) REFERENCES `locks` (`mac_id`),
  CONSTRAINT `user_locks_pkey` PRIMARY KEY (user_id, lock_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
