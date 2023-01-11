const db = require('../db');
const bcrypt = require('bcryptjs');

module.exports = {
	getUserById: async (id) => {
		const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
		return user.rows[0];
	},
	getUserByEmail: async (email) => {
		const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
		return user.rows[0];
	},
	getUserByUsername: async (username) => {
		const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
		return user.rows[0];
	},
	createUser: async (user) => {
		if (user.password) user.password = await bcrypt.hash(user.password, 10);
		const newUser = await db.query(
			`INSERT INTO users (email, password, username, first_name, last_name, address) 
			 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[
				user.email,
				user.password,
				user.username,
				user.first_name,
				user.last_name,
				user.address,
			]
		);
		return newUser.rows[0];
	},
	updateUser: async (id, user) => {
		let queryStr = 'UPDATE users SET ';
		const values = [];
		let i = 1;

		for (const key in user) {
			if (user.hasOwnProperty(key)) {
				if (['id', 'otherProperties'].includes(key)) continue;
				queryStr += `${key} = $${i}, `;
				values.push(user[key]);
				i++;
			}
		}
		queryStr = queryStr.slice(0, -2);
		queryStr += ' WHERE id = $' + i + ' RETURNING *';
		values.push(id);
		const updatedUser = await db.query(queryStr, values);
		return updatedUser.rows[0];
	},
	deleteUser: async (id) => {
		const deletedUser = await db.query('DELETE FROM users WHERE id = $1', [id]);
		return deletedUser.rows[0];
	},
};
