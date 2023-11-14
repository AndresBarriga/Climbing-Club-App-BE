import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from './authenticateToken.js';
import multer from 'multer';
import cloudinary from './cloudinaryConfig.js';

// Set up PostgreSQL connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})


const editUserProfileRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Define the PUT route for updating user preferences
editUserProfileRouter.put('/', authenticateToken ,(req, res) => {
  // Extract the user_id from the request
  console.log("edit profile route was hit")
  const user_id = req.user_id;
  const { gender, birthday, location, climbing_style, preferred_belayer_device, type_of_climber, climbing_equipment, climbing_grades_boulder, climbing_grades_climbing, favorite_climbing_destinations, route_preferences, climbing_philosophy, route_whish_list, bio } = req.body;
  // SQL query to update the user preferences in the database
  const sql = `UPDATE user_preferences SET gender = $2, birthday = $3, location = $4, climbing_style = $5, preferred_belayer_device = $6, type_of_climber = $7, climbing_equipment = $8, climbing_grades_boulder = $9, climbing_grades_climbing = $10, favorite_climbing_destinations = $11, route_preferences = $12, climbing_philosophy = $13, route_wish_list = $14, bio=$15 WHERE user_id = $1`;
  const values = [user_id, gender, birthday, location, climbing_style, preferred_belayer_device, type_of_climber, climbing_equipment, climbing_grades_boulder, climbing_grades_climbing, favorite_climbing_destinations, route_preferences, climbing_philosophy, route_whish_list, bio];

  // Execute the SQL query
  pgPool.query(sql, values, (err, data) => {
    // Handle any errors during the query
    if (err) {
      console.error(err);
      return res.status(500).json("Error updating user preferences");
    }

    // If the query is successful, return a success response
    return res.json("User preferences updated successfully");
  });
});

//Define PUT route for update profile pictures.
editUserProfileRouter.put('/profile-picture', authenticateToken, upload.single('file'), async (req, res) => {
  console.log("Edit Profile pic route was hit")
  console.log('Request File:', req.file);

  try {
    // Extract the public_id of the current profile picture from the request
    const currentProfilePictureId = req.body.currentProfilePictureId;

    // Delete the current profile picture from Cloudinary
    if (currentProfilePictureId) {
      await cloudinary.uploader.destroy(currentProfilePictureId);
    }
      // Upload the received file to Cloudinary
    // The file is converted to a base64 string before being uploaded
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
    // SQL query to update the profile picture URL in the users table
    const sqlUpdate = `UPDATE users SET profile_picture = $1 WHERE user_id = $2`;
    const valuesUpdate = [result.secure_url, req.user_id];

    pgPool.query(sqlUpdate, valuesUpdate, (errUpdate, dataUpdate) => {
      if (errUpdate) {
        console.error(errUpdate);
        return res.status(500).json("Error updating user profile picture");
      }
      // If the query was successful, send the new profile picture URL in the response
      return res.json({ profile_picture: result.secure_url });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error uploading image");
  }
});

export default editUserProfileRouter;

