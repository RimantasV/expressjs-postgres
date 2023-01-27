import bodyParser from 'body-parser';
import express from 'express';
import pg from 'pg';

// Connect to the database using the DATABASE_URL environment
//   variable injected by Railway
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
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.text({ type: 'text/html' }));

app.get('/', async (req, res) => {
  console.log(process.env);
  const { rows } = await pool.query('SELECT * from results');
  console.log(rows);
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
