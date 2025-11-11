// API controller function to manage clerk user with database 
// http://localhost:4000/api/user/webhooks -> this si webhooks end point 

import { Webhook } from "svix"
import userModel from "../models/userModel.js"

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Verify webhook
    await whook.verify(req.body.toString(), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    })

    const { data, type } = JSON.parse(req.body)

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        }

        await userModel.create(userData)
        console.log("✅ User created:", userData.email)
        res.json({ success: true })
        break
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        }

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData)
        console.log("🟡 User updated:", userData.email)
        res.json({ success: true })
        break
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id })
        console.log("🗑️ User deleted:", data.id)
        res.json({ success: true })
        break
      }

      default:
        res.json({ received: true })
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error.message)
    res.status(400).json({ success: false, message: error.message })
  }
}
