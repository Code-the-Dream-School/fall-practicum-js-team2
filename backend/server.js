require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db.postgres');

const PORT = process.env.PORT || 8080;

pool.query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('PostgreSQL connected');
    });
  })
  .catch((err) => {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  });
