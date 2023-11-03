import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import bodyParser from 'body-parser';
import cors from 'cors';
import Pool from 'pg-pool';
import bcrypt from "bcrypt";
import authRouter from './routes/authRoutes.js'

const app = express();
const port = process.env.PORT || 3001;

const saltRounds = 10


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from your React app
  credentials: true, // Allow credentials (e.g., cookies)
};
app.use(cors(corsOptions)); 

// Database connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})


app.use(
  session({
    store: new (pgSession(session))({
      pool: pgPool,
    }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Set the session to expire after 24 hours (in milliseconds)
    },
  })
);

// TODOS!!!! 
//ORGANIZE AUTH ROUTES WITHIN FOLDER
// ORGANIZE AUTH MECHANISM FE AS SEPARATE COMPONENT

//Routes definition
app.get('/', (req, res) => {
  res.send('Welcome to the Climbing Club App!');
});

app.post('/auth', (req, res) => {
  const { email, password } = req.body.form;

  const sql = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  pgPool.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Login Failed - error");
    }

    if (data.rows.length === 0) {
      return res.json("Invalid email or password");
    }

    const user = data.rows[0];

    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        console.error(err);
        return res.status(500).json("Login Failed - error");
      }

      if (result) {
        // Passwords match, the user is authorized
        req.session.user_id = user.user_id // Set the user's ID in the session
        return res.json("Authorized");
        
      } else {
        return res.json("Invalid email or password");
      }
    });
  });
});



app.use('/auth', authRouter);

app.post('/registration', (req,res) =>{
  console.log("Received data:", req.body);
  const {firstName, lastName, email, password} = req.body.form


  bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Password hashing error' });
    }
    const sql = "INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4)";
    const values = [firstName, lastName, email, hash]; // Use the hashed password
    pgPool.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Registration failed - database error' });
      }
      console.log('User registered successfully');
      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
});


app.get('/check-auth', async (req, res) => {
  const sid = req.sessionID
  const isSessionValid = async (sid) => {
    const sql = 'SELECT * FROM session WHERE sid = $1';
    const values = [sid];
  
    try {
      const result = await pgPool.query(sql, values);
      console.log(result.rows.length > 0)
      return result.rows.length > 0;
    } catch (error) {
      console.error(error);
      return false; // In case of an error, treat it as an invalid session
    }
  };

  // Check if the session exists in the database
  const isValid = await isSessionValid(sid);

  if (isValid) {
    console.log('User is authenticated');
    res.sendStatus(200);
  } else {
    console.log('User is not authenticated');
    res.sendStatus(401);
  }
});


process.on('exit', () => {
  pgPool.end();
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});