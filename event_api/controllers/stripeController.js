const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/eventModel');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'kes',
          product_data: {
            name: event.title,
            description: event.description,
          },
          unit_amount: event.price * 100, // convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_CLIENT_URL}/payment-success?eventId=${event._id}`,
      cancel_url: `${process.env.BASE_CLIENT_URL}/payment-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err.message);
    res.status(500).json({ message: 'Stripe session creation failed' });
  }
};
