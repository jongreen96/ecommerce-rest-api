const userQuery = require('../queries/users');
const { isAuthorized } = require('../loaders/middleware');

module.exports = (app) => {
	// ------------------- GET ------------------- //
	// Get user by id
	app.get('/users/:id', async (req, res) => {
		const result = await userQuery.getUserById(req.params.id);
		if (!result) res.status(404).send({ message: 'User not found' });
		res.send(result);
	});

	// Get user by email
	app.get('/users/email/:email', async (req, res) => {
		const result = await userQuery.getUserByEmail(req.params.email);
		if (!result) res.status(404).send({ message: 'User not found' });
		res.send(result);
	});

	// get user by username
	app.get('/users/username/:username', async (req, res) => {
		const result = await userQuery.getUserByUsername(req.params.username);
		if (!result) res.status(404).send({ message: 'User not found' });
		res.send(result);
	});

	// ------------------- PUT ------------------- //
	// Update user
	app.put('/users/:id', isAuthorized, async (req, res) => {
		try {
			const result = await userQuery.updateUser(req.params.id, req.body);
			res.send(result);
		} catch (error) {
			res.status(400).send({ message: 'User not updated' });
		}
	});

	// ------------------- DELETE ------------------- //
	// Delete user
	app.delete('/users/:id', isAuthorized, async (req, res) => {
		try {
			const result = await userQuery.deleteUser(req.params.id);
			req.logout((err) => {
				if (err) {
					res.status(400).send({ message: 'User not logged out' });
				}
			});
			res.send({ message: 'User deleted' });
		} catch (error) {
			res.status(400).send({ message: 'User not deleted' });
		}
	});
};
