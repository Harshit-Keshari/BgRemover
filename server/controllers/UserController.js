// controllers/userController.js
import { Webhook } from "svix"
import userModel from "../models/userModel.js"

export const clerkWebhooks = async (req, res) => {
  try {
    // 1️⃣ Verify the webhook signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    const payload = req.body.toString("utf8")

    await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    })

    // 2️⃣ Parse event
    const { data, type } = JSON.parse(payload)
    console.log("📩 Webhook received:", type)

    switch (type) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address
        if (!email) {
          console.warn("⚠️ Webhook received user without email:", data.id)
          return res.status(400).json({ success: false, message: "Email missing in webhook data" })
        }

        const userData = {
          clerkId: data.id,
          email: email, // ✅ FIX: added this line
          photo: data.image_url || data.profile_image_url || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
        }

        // Avoid duplicates
        const existingUser = await userModel.findOne({ clerkId: data.id })
        if (existingUser) {
          console.log("User already exists:", email)
          return res.json({ success: true, message: "User already exists" })
        }

        await userModel.create(userData)
        console.log("✅ User created:", email)
        return res.json({ success: true })
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",
          photo: data.image_url || data.profile_image_url || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
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
        console.log("Unhandled event:", type)
        return res.json({ received: true })
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack, // temporary for debugging
  });
}
}
