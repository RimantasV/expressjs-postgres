import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
dotenv.config();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

const pool = new pg.Pool({
  user: 'postgres',
  host: 'containers-us-west-96.railway.app',
  database: 'railway',
  password: process.env.PGPASSWORD,
  port: 8032,
});
const app = express();
const port = process.env.PORT || 3333;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

// get all results
app.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * from results');

  res.send(rows);
});

// create new result
app.post('/', async (req, res) => {
  const { player1, player2, player1score, player2score, date } = req.body;

  pool.query(
    'INSERT INTO results (player1, player2, player1score, player2score, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [player1, player2, player1score, player2score, date],
    (error, results) => {
      if (error) {
        console.log(error);
        throw error;
      }
      res.status(201).send(results.rows[0]);
    }
  );
});

// update a result
app.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { player1, player2, player1score, player2score, date } = req.body;

  pool.query(
    'UPDATE results SET player1 = $1, player2 = $2, player1score = $3, player2score = $4, date = $5 WHERE id = $6',
    [player1, player2, player1score, player2score, date, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).send(results.rows[0]);
    }
  );
});

// delete a result
app.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  pool.query('DELETE from results WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).send(results.rows[0]);
  });
});

// register a user
app.post('/users', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Missing data' });
  }

  // check if user exists
  // check if user exists
  pool.query(
    'SELECT email FROM users WHERE email = $1 ',
    [email],
    async (error, results) => {
      if (error) {
        res.status(400);
        throw new Error('User already exists');
      }
      if (results.rowCount > 0) {
        res.status(400).json({ message: 'User already exists' });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        pool.query(
          'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) ',
          [name, email, hashedPassword],
          (error, results) => {
            if (error) {
              res.status(400).json({ message: 'failed to create a user' });
            }
            res.status(201).send(results.rows[0]);
          }
        );
      }
    }
  );
});

// authenticate
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  pool.query(
    'SELECT id, name, email, password FROM users WHERE email = $1 ',
    [email],
    async (error, results) => {
      if (error) {
        res.status(400).json({ message: 'error' });
      } else {
        console.log(results.rows[0]);
        const user = results.rows[0];
        if (user && (await bcrypt.compare(password, user.password))) {
          res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
          });
        } else res.status(400).json({ message: 'error' });
      }
    }
  );
});

// authenticate
app.get('/users/me', (req, res) => {
  res.json({ message: 'User data' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
