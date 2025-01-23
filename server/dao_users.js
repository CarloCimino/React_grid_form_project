'use strict';

const db = require('./db');
const crypto = require('crypto');

exports.getUser = (username, password) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE username = ?`;
      db.get(sql, [username], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined) 
          resolve(false);
        else {
          const user = {id: row.id, username: row.username, is_admin: row.is_admin};
          const salt = row.salt;
          crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
            if (err) 
              reject(err);
            const passwordHex = Buffer.from(row.password, 'hex');
            if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) 
              resolve(false);
            else 
              resolve(user);
          });
        }
      });
    });
  };

  exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined) 
          resolve({error: 'User not found.'});
        else {
          const user = {id: row.id, username: row.username, is_admin: row.is_admin}; 
          resolve(user);
        }
      });
    });
  };