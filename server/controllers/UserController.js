// controllers/userController.js

import { Webhook } from "svix"
import userModel from "../models/userModel.js"

export const clerkWebhooks = async (req, res) => {
  try {
    // ✅ 1. Create Svix Webhook instance with your secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // ✅ 2. Convert raw body (Buffer) to string
    const payload = req.body.toString("utf8")

    // ✅ 3. Verify signature headers
    await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    })

    // ✅ 4. Parse event
    const { data, type } = JSON.parse(payload)

    console.log("📩 Webhook received:", type)

    // ✅ 5. Handle different Clerk event types
    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        }

        await userModel.create(userData)
        console.log("✅ User created:", userData.email)
        return res.json({ success: true })
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        }

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData)
        console.log("🟡 User updated:", userData.email)
        return res.json({ success: true })
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id })
        console.log("🗑️ User deleted:", data.id)
        return res.json({ success: true })
      }

      default:
        console.log("ℹ️ Unhandled event:", type)
        return res.json({ received: true })
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error.message)
    res.status(400).json({ success: false, message: error.message })
  }
}
