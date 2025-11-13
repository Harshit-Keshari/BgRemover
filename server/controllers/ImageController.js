import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import userModel from '../models/userModel.js';

// Controller to remove background
const removeBgImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { clerkId } = req.user;
    const user = await userModel.findOne({ clerkId });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User Not Found' });
    }

    if (user.creditBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No Credit Available',
        creditBalance: user.creditBalance,
      });
    }

    const imagePath = req.file.path;

    const formdata = new FormData();
    formdata.append('image_file', fs.createReadStream(imagePath));

    // Send request to ClipDrop API
    const { data } = await axios.post(
      'https://clipdrop-api.co/remove-background/v1',
      formdata,
      {
        headers: {
          ...formdata.getHeaders(),
          'x-api-key': process.env.CLIPDROP_API,
        },
        responseType: 'arraybuffer', // API returns binary data
      }
    );

    // Convert binary response to base64
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

    // Deduct 1 credit
    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    res.json({
      success: true,
      resultImage,
      creditBalance: user.creditBalance - 1,
      message: 'Background Removed',
    });

  } catch (error) {
    // Improved error handling for API errors
    let errorMessage = error.message;

    if (error.response && error.response.data) {
      try {
        // Convert buffer to string, then parse JSON
        const bufString = Buffer.isBuffer(error.response.data)
          ? error.response.data.toString('utf-8')
          : error.response.data;

        const parsed = JSON.parse(bufString);
        errorMessage = parsed.error || parsed.message || bufString;
      } catch {
        errorMessage = error.response.data.toString();
      }
    }

    console.error('❌ RemoveBg Controller Error:', errorMessage);
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

export { removeBgImage };
