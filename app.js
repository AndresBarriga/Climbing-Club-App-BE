import express from 'express';
import cors from 'cors';
import Pool from 'pg-pool';
import loginRouter from './routes/Auth-Routes/LogInRoute.js'
import initialUserPreferencesRouter from './routes/profileRoutes/initialUserPreferencesRouter.js';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import showProfileRouter from './routes/profileRoutes/showProfileUser.js';
import logoutRouter from './routes/Auth-Routes/LogOutRoute.js';
import editUserProfileRouter from './routes/profileRoutes/editUserProfile.js'
import locationsRouter from './routes/Locations-routes/locationsRouter.js';
import userFavouritesRouter from './routes/Locations-routes/favoritesRouter.js';
import userFavouritesGetRouter from './routes/Locations-routes/favoritesRouterGet.js';
import getUserLocation from './routes/endpoints/getUserLocation.js';
import getAvailableLocations from './routes/endpoints/getAvailableLocations.js';
import createRequestRouter from './routes/Climbing-Request/createRequest.js';
import getRequestRouter from './routes/Climbing-Request/getRequestPerUser.js';
import deleteRequestRouter from './routes/Climbing-Request/deleteRequest.js';
import reviewsRouter from './routes/Locations-routes/routesReviews.js';
import searchRouter from './routes/search/searchRoute.js';
import searchNavigationRouter from './routes/search/searchNavigation.js';
import getAllRequestRouter from './routes/Climbing-Request/getAllRequest.js';
import showOtherProfileRouter from './routes/profileRoutes/showOtherProfileUser.js';
import sendMessageRouter from './routes/messages/sendMessageRequest.js';
import getMessageRouter from './routes/messages/getMessages.js';
import updateMessagesRouter from './routes/messages/updateToReadMessages.js';
import newMessagesRouter from './routes/messages/newMessages.js';
import recaptchaRoute from './routes/Auth-Routes/reCaptcha.js';
import registrationPlusRoute from './routes/Auth-Routes/RegisterPlusRoute.js';
import createPasswordRoute from './routes/Auth-Routes/PasswordCreationRoute.js';
import recoverPasswordRoute from './routes/Auth-Routes/recoverPasswordRoute.js';
import locationsMapRouter from './routes/mapRelatedRoutes/getLocationsMap.js';
import notificationSettingsRouter from './routes/notifications/notificationSettings.js';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import getNotificationsRouter from './routes/notifications/getNotifications.js';
import getRequestById from './routes/Climbing-Request/getRequestbyId.js';
import postNotificationRead from './routes/notifications/postNotificationRead.js';
import deleteConversationRouter from './routes/messages/deleteMessages.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Database connections
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/google/callback",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('accessToken:', accessToken);
  console.log('refreshToken:', refreshToken);
  console.log('profile:', profile);
 
  const email = profile.emails[0].value;
  try {
    console.log('GoogleStrategy callback triggered');
    // Check if a user with the given email exists in the database
    const { rows } = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = rows[0];

    if (user) {
      console.log('User found in database:', user);
      // User exists, update with Google ID if not set
      if (!user.google_id) {
        await pgPool.query('UPDATE users SET google_id = $1 WHERE email = $2', [profile.id, email]);
      }
    } else {
      // User doesn't exist, create a new one
      const result = await pgPool.query(
        'INSERT INTO users(email, google_id, first_name, last_name) VALUES($1, $2, $3, $4) RETURNING *',
        [email, profile.id, profile.name.givenName, profile.name.familyName]
      );
      user = result.rows[0];
      console.log('New user created:', user);
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));





// Configure Passport authenticated session persistence.
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((user_id, done) => {
  pgPool.query('SELECT * FROM users WHERE user_id = $1', [user_id], (err, results) => {
    if (err) {
      return done(err);
    }
    if (results.rows.length > 0) {
      const user = results.rows[0];
      done(null, user);
    } else {
      done(new Error('User not found'));
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: ['http://localhost:3000', 'https://climbing-club-membership.vercel.app'],
  credentials: true, // Allow credentials (e.g., cookies)
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
};

app.use(cors(corsOptions));

app.use(session({ secret: 'your secret', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Middleware to authenticate the user for the "Private" route
const privateRouteMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log("token in Private Route Middleware,", token)
    const decodedToken = jwt.decode(token);
    console.log('Token received issued at:', new Date(decodedToken.iat * 1000));
    jwt.verify(token, 'your-secret-key', (err, user) => {
      if (err) {
        
        console.log('Current time:', new Date().getTime());
        console.log('Token expired at:', err.expiredAt);
        console.error(err); // Log the error
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get('/auth/google',
 (req, res, next) => {
   console.log('/auth/google route hit');
   next();
 },
 passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Define the route that Google redirects to after authentication
app.get('/auth/google/callback',
(req, res, next) => {
  console.log('/auth/google/callback route hit');
  next();
},
  passport.authenticate('google', { failureRedirect: '/auth' }),
  (req, res) => {
    // Assuming req.user contains the authenticated user object
    const token = jwt.sign({ user_id: req.user.user_id }, 'your-secret-key', { expiresIn: '1h' });
    console.log('Generated JWT:', token);
    const decodedToken = jwt.decode(token);
console.log('Token issued at:', new Date(decodedToken.iat * 1000));
    // Set the token in a cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // use true if you're on HTTPS, false for HTTP
      sameSite: 'lax', // adjust the SameSite attribute as needed
      domain: 'localhost', // set this to your frontend's domain
      path: '/'
    });
    // Redirect to the frontend's dashboard page with the token as a query parameter
    res.redirect(`http://localhost:3000/dashboard?token=${token}`)
  }

);

app.get('/auth', (req, res) => {
  res.status(401).send('Authentication failed');
});

//Routes definition
app.get('/', loginRouter, (req, res) => {
  res.send('Welcome to the Climbing Club App!');
});
app.use('/auth', loginRouter);
app.use('/initial-preferences', initialUserPreferencesRouter)
app.use('/edit-profile', editUserProfileRouter)
app.use('/show-profile', showProfileRouter)
app.use('/climbing-locations', locationsRouter)
app.use('/logout', logoutRouter)
app.use('/user_favourites', userFavouritesRouter);
app.use('/user_favourites_get', userFavouritesGetRouter)
app.use('/api/create_request', createRequestRouter)
app.use('/api/getUserLocation', getUserLocation)
app.use('/api/getAvailableLocations', getAvailableLocations)
app.use('/api/getActiveRequest', getRequestRouter)
app.use('/api/deleteRequest', deleteRequestRouter)
app.use('/reviews', reviewsRouter);
app.use('/search', searchRouter);
app.use('/searchNavigation', searchNavigationRouter);
app.use('/api/getAllRequests', getAllRequestRouter);
app.use('/api/showOtherProfile', showOtherProfileRouter);
app.use('/api/sendMessage', sendMessageRouter);
app.use("/api/getMessage", getMessageRouter);
app.use("/api/updateMessagesStatus", updateMessagesRouter);
app.use("/api/newMessages", newMessagesRouter);
app.use("/api/verify-recaptcha", recaptchaRoute)
app.use("/api/register-plus", registrationPlusRoute)
app.use('/api/create-password', createPasswordRoute)
app.use('/api/recover-password', recoverPasswordRoute)
app.use('/api/getLocationsForMap', locationsMapRouter)
app.use('/api/notificationSettings', notificationSettingsRouter),
app.use('/api/getNotifications', getNotificationsRouter)
app.use('/api/getRequest', getRequestById)
app.use('/api/notificationRead', postNotificationRead)
app.use('/api/deleteConversation', deleteConversationRouter)

app.get('/check-auth', privateRouteMiddleware, (req, res) => {
  res.sendStatus(200);
});


app.post('/initial-preferences/profile-picture', privateRouteMiddleware, (req, res) => {
  res.sendStatus(200);
});

app.get('/dashboard', privateRouteMiddleware, (req, res) => {
  res.sendStatus(200);
});
app.get('/show-profile', privateRouteMiddleware, (req, res) => {
  res.sendStatus(200);
});

app.get('/api/isAuthenticated', privateRouteMiddleware, (req, res) => {
  res.json({ isAuthenticated: true });
  res.sendStatus(200)
});



process.on('exit', () => {
  pgPool.end();
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

