// server/routes/userRoutes.js
import express from 'express'
import { Webhook } from 'svix'

const router = express.Router()

// <-- other user routes here, e.g. router.post('/login', ...) -->

// Clerk webhook route
// Note: use express.raw() here so the raw body is available for signature verification.
router.post(
  '/webhooks',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET in env')
      return res.status(500).send('Webhook secret not configured')
    }

    const wh = new Webhook(WEBHOOK_SECRET)

    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    }

    try {
      const event = wh.verify(req.body, headers)
      console.log('✅ Clerk webhook verified:', event.type)

      // handle events you care about:
      if (event.type === 'user.created') {
        // event.data contains the Clerk payload for user.created
        console.log('New user created — event.data:', event.data)
      }

      // Respond 2xx to indicate success
      res.status(200).json({ status: 'received' })
    } catch (err) {
      console.error('❌ Webhook verification failed:', err && err.message ? err.message : err)
      res.status(400).json({ error: 'invalid signature' })
    }
  }
)

export default router
