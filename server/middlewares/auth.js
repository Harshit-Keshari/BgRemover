import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login again.' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing' });
    }

    // Decode the JWT safely
    const decoded = jwt.decode(token); // contains `sub` = Clerk userId
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Optionally verify the user exists in Clerk
    const user = await clerkClient.users.getUser(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Clerk user not found' });
    }

    req.user = { clerkId: decoded.sub };
    next();
  } catch (error) {
    console.error('❌ Middleware auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default authUser;
