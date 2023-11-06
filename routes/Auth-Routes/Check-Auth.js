import express from 'express';
import Pool from 'pg-pool';

const app = express();


const checkAuthRoute = express.Router();



checkAuthRoute.get('/', (req, res) => {
  req.sid = req.sessionID;

  // Check if the session exists in the current session store
  req.sessionStore.get(req.sid, (err, session) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else if (session) {
      console.log('User is authenticated for session ID:', req.sid);
      res.sendStatus(200);
    } else {
      console.log('User is not authenticated');
      res.status(401).send('Please log in to access this resource');
    }
  });
});

export default checkAuthRoute;