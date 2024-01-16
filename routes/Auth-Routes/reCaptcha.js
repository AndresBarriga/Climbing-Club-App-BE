import axios from 'axios'
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const recaptchaRoute = express.Router();


recaptchaRoute.post('/', async (req, res) => {
    const recaptchaToken = req.body.recaptchaToken;
   
    try {
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: process.env.CAPTCHA_SECRET,
          response: recaptchaToken,
        },
      });
   
      if (response.data.success) {
        res.sendStatus(200);
      } else {
        res.status(400).send('Invalid reCAPTCHA response');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred');
    }
   });
   
   export default recaptchaRoute;