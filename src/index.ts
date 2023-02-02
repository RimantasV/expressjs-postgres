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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
