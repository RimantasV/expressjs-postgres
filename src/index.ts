import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';

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

app.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * from results');

  res.send(rows);
});

app.post('/', async (req, res) => {
  const { player1, player2, player1score, player2score, date } = req.body;

  pool.query(
    'INSERT INTO results (player1, player2, player1score, player2score, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [player1, player2, player1score, player2score, date],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(results.rows[0]);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
