import express from 'express';
import pg from 'pg';

const pool = new pg.Pool({
  user: 'postgres',
  host: 'containers-us-west-96.railway.app',
  database: 'railway',
  password: process.env.PGPASSWORD,
  port: 8032,
});
const app = express();
const port = process.env.PORT || 3333;

app.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * from results');
  let resultString = '<ul>';
  rows.forEach(
    (row) =>
      (resultString += `<li>${row.player1} ${row.player1score}:${row.player2score} ${row.player2}</li>`)
  );
  resultString += '</ul>';
  res.send(resultString);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
