import express from 'express';
const app = express();
const port = process.env.PORT || 3001;
import clerk from 'clerk';
const { authMiddleware } = clerk;
import bodyParser from 'body-parser';
import cors from 'cors';
import pg from "pg";


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "climbing",
    password: "5813",
    port: 5432,
})

db.connect();

db.query("SELECT * FROM users", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        const answer = res.rows
        console.log(answer)
    }
    db.end();
})

/* const userRoutes = require('./routes/user');
const partnerRoutes = require('./routes/partner');
const gymRoutes = require('./routes/gym');
const messageRoutes = require('./routes/message'); */


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cors()); 

/* const authMiddlewareOptions = {
    publicRoutes: ['/'],
    privateRoutes: ['/api/users', '/api/partners', '/api/gyms', '/api/messages'],
  };
app.use(authMiddleware); */



app.get('/', (req, res) => {
  res.send('Hello, World!');
});

/* app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/messages', messageRoutes);
 */

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});