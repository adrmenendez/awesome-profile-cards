const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.set('view engine', 'ejs');

const serverPort = process.env.PORT || 3001;
app.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

const serverStaticPath = './public';
app.use(express.static(serverStaticPath));

const db = new Database('./src/data/database.db', {
  verbose: console.log,
});

app.get('/card/:id', (req, res) => {
  const query = db.prepare('SELECT * FROM users WHERE id = ?');
  const data = query.get(req.params.id);
  res.render('pages/card', data);
});

app.post('/card/', (req, res) => {
  const response = {};
  if (!req.body.name) {
    response.success = false;
    response.error = 'Debes rellenar el nombre';
  } else if (!req.body.job) {
    response.success = false;
    response.error = 'Debes rellenar el puesto';
  } else if (!req.body.photo) {
    response.success = false;
    response.error = 'Debes rellenar la imagen';
  } else if (!req.body.email) {
    response.success = false;
    response.error = 'Debes rellenar el email';
  } else if (!req.body.linkedin) {
    response.success = false;
    response.error = 'Debes rellenar el linkedin';
  } else if (!req.body.github) {
    response.success = false;
    response.error = 'Debes rellenar el github';
  } else if (!req.body.phone) {
    response.success = false;
    response.error = 'Debes rellenar el teléfono';
  } else {
    const query = db.prepare(
      'INSERT INTO users (name, job, photo, phone, email, linkedin, github, palette) VALUES (?,?,?,?,?,?,?,?)'
    );
    const result = query.run(
      req.body.name,
      req.body.job,
      req.body.photo,
      req.body.phone,
      req.body.email,
      req.body.linkedin,
      req.body.github,
      req.body.palette
    );
    response.success = true;
    if (req.hostname === 'localhost') {
      response.cardURL =
        `http://localhost:${serverPort}/card/` + result.lastInsertRowid;
    } else {
      response.cardURL =
        'https://create-ur-awesome-profile-card.herokuapp.com/card/' +
        result.lastInsertRowid;
    }
  }
  res.json(response);
});

app.get('*', (req, res) => {
  const notFoundFileRelativePath = '../static/404-not-found.html';
  const notFoundFileAbsolutePath = path.join(
    __dirname,
    notFoundFileRelativePath
  );
  res.status(404).sendFile(notFoundFileAbsolutePath);
});
