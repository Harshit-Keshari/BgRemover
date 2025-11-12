// controllers/UserController.js
import { Webhook } from "svix"
import userModel from "../models/userModel.js"

export const clerkWebhooks = async (req, res) => {
  console.log("🚀 Webhook endpoint hit")

  try {
    // ✅ Create Svix Webhook instance with your secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    console.log("🧩 Using CLERK_WEBHOOK_SECRET:", !!process.env.CLERK_WEBHOOK_SECRET)

    // ✅ Convert raw body (Buffer) to string
    const payload = req.body?.toString("utf8")
    if (!payload) {
      console.error("❌ No payload found")
      return res.status(400).json({ success: false, message: "Missing raw body payload" })
    }

    // ✅ Verify signature headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    }

    console.log("🪪 Headers:", headers)

    await whook.verify(payload, headers)

    // ✅ Parse event
    const { data, type } = JSON.parse(payload)
    console.log("📩 Webhook received:", type)

    switch (type) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address || `${data.id}@noemail.clerk.dev`

        const userData = {
          clerkId: data.id,
          email,
          photo: data.image_url || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
        }

        console.log("🧠 Creating user:", userData)

        const newUser = await userModel.create(userData)
        console.log("✅ User created:", newUser._id)

        return res.json({ success: true, message: "User created" })
      }

      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address || ""
        const userData = {
          email,
          photo: data.image_url || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
        }

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData)
        console.log("🟡 User updated:", email)
        return res.json({ success: true, message: "User updated" })
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id })
        console.log("🗑️ User deleted:", data.id)
        return res.json({ success: true, message: "User deleted" })
      }

      default:
        console.log("ℹ️ Unhandled event type:", type)
        return res.json({ received: true })
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error)
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    })
  }
}
