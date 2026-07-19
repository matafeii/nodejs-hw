import createHttpError from 'http-errors';

import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'No file');
  }

  const uploadedFile = await saveFileToCloudinary(req.file.buffer, req.user._id);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: uploadedFile.secure_url,
    },
    { returnDocument: 'after' },
  );

  res.status(200).json({
    url: updatedUser.avatar,
  });
};
