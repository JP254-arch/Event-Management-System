const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');
const verifyToken = require('../middlewares/verifyToken');

// @route   POST /api/stripe/create-checkout-session
// @desc    Create Stripe Checkout session for an event
// @access  Private (requires token)
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      line_items: [
        {
          price_data: {
            currency: 'kes',
            product_data: {
              name: event.title,
              description: event.description
            },
            unit_amount: event.price * 100, // in cents
          },
          quantity: 1,
        }
      ],
      customer_email: req.user.email
    });

    res.status(200).json({ url: session.url }); // ✅ frontend redirects using this
  } catch (err) {
    console.error('❌ Stripe session error:', err.message);
    res.status(500).json({ message: 'Stripe session error' });
  }
});

module.exports = router;
