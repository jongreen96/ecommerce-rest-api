const checkoutQueries = require('../queries/checkout');
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
stripe.applePayDomains.create({
	domain_name: 'greenvinylgraphics.com',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = (app) => {
	// --------------------- POST --------------------- //
	app.post('/carts/checkout', async (req, res) => {
		try {
			const result = await checkoutQueries.createOrder(
				req.user.id,
				req.body.paymentIntent
			);
			res.send(result);
		} catch (err) {
			res.status(400).send({ message: err.message });
		}
	});

	app.post('/create-payment-intent', async (req, res) => {
		const amount = (req.body.total * 100).toFixed(0);
		const currency = req.body.currency.toLowerCase();
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			automatic_payment_methods: {
				enabled: true,
			},
		});

		res.send({ clientSecret: paymentIntent.client_secret });
	});

	app.post('/webhook', (req, res) => {
		const sig = req.headers['stripe-signature'];
		let event;
		try {
			event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
		} catch (err) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		// Handle the event
		switch (event.type) {
			case 'payment_intent.succeeded':
				const paymentIntent = event.data.object;
				checkoutQueries.paymentProcessed(paymentIntent.id);
				break;
			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		// Return a response to acknowledge receipt of the event
		res.send();
	});
};
