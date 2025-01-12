const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

// Server Setup
const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'payweek',
  database: 'movies',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected');
  }
});

// JWT Configuration
const ACCESS_TOKEN_SECRET = 'your_access_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_secret';
const ACCESS_TOKEN_LIFETIME = '1h';
const REFRESH_TOKEN_LIFETIME = '7d';

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Registration failed' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME });
    const refreshToken = jwt.sign({ id: user.id, username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFETIME });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ accessToken });
  });
});

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(403).json({ error: 'Refresh token required' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME });
    res.status(200).json({ accessToken: newAccessToken });
  });
});

app.get('/welcome', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const query = 'SELECT username FROM users WHERE id = ?';
    db.query(query, [user.id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: `Welcome, ${results[0].username}!` });
    });
  });
});

//5 feature films to choose from
const films = [
  { id: 1, title: 'The Dark Knight', genreIds: ['Action']},
  { id: 2, title: 'The Matrix', genreIds: ['Sci-Fi']},
  { id: 3, title: 'Napoleon Dynamite', genreIds: ['Comedy']},
  { id: 4, title: 'Shawshank Redemption', genreIds: ['Drama']},
  { id: 5, title: 'The Shining', genreIds: ['Horror']},
];

//Selection of 9 related films per genre
const relatedFilms = {
  'Action': [
    { id: 101, title: 'Leon the Professional'},
    { id: 102, title: 'John Wick'},
    { id: 103, title: 'Full Metal Jacket'},
    { id: 104, title: 'Crouching Tiger, Hidden Dragon'},
    { id: 105, title: 'Gladiator'},
    { id: 106, title: 'Kill Bill: Volume 1'},
    { id: 107, title: 'Goldfinger'},
    { id: 108, title: 'The Warriors'},
    { id: 109, title: 'Apocalypse Now'},
  ],
  'Sci-Fi': [
    { id: 201, title: 'District 9'},
    { id: 202, title: 'Alien'},
    { id: 203, title: 'Moon'},
    { id: 204, title: 'Starship Troopers'},
    { id: 205, title: 'Star Wars: Episode III - Revenge of the Sith'},
    { id: 206, title: '2001: A Space Odyssey'},
    { id: 207, title: 'Donnie Darko'},
    { id: 208, title: 'Blade Runner'},
    { id: 209, title: 'Ex Machina'},
  ],
  'Comedy': [
    { id: 301, title: 'Shaun of the Dead'},
    { id: 302, title: 'Friday'},
    { id: 303, title: 'Borat'},
    { id: 304, title: 'Snatch'},
    { id: 305, title: 'Lock, Stock and Two Smoking Barrels'},
    { id: 306, title: 'The Other Guys'},
    { id: 307, title: 'Anchorman'},
    { id: 308, title: 'The Big Lebowski'},
    { id: 309, title: 'Hot Fuzz'},
  ],
  'Drama': [
    { id: 401, title: 'Scarface'},
    { id: 402, title: 'City of God'},
    { id: 403, title: 'The Green Mile'},
    { id: 404, title: 'The Godfather'},
    { id: 405, title: 'Trainspotting'},
    { id: 406, title: 'One Flew Over the Cuckoos Nest'},
    { id: 407, title: 'Goodfellas'},
    { id: 408, title: 'The Truman Show'},
    { id: 409, title: 'Taxi Driver'},
  ],
  'Horror': [
    { id: 501, title: '28 Days Later'},
    { id: 502, title: '28 Weeks Later'},
    { id: 503, title: 'Rosemarys Baby'},
    { id: 504, title: 'Requiem for a Dream'},
    { id: 505, title: 'Jacobs Ladder'},
    { id: 506, title: 'American Psycho'},
    { id: 507, title: 'House'},
    { id: 508, title: 'Silence of the Lambs'},
    { id: 509, title: 'Resident Evil'},
  ],
};

function getRelatedMoviesByGenres(genres) {
  const related = [];
  genres.forEach(genre => {
    if (relatedFilms[genre]) {
      related.push(...relatedFilms[genre]);
    }
  });

  const seen = new Set();
  const uniqueMovies = related.filter(movie => {
    if (seen.has(movie.id)) {
        return false;
    }
    seen.add(movie.id);
    return true;
  });
  return uniqueMovies;
}

function displayRelatedMovies(movies) {
  const relatedMoviesElement = document.getElementById('related-movies');
  relatedMoviesElement.innerHTML = '';  // Clear any previous content

  if (movies.length === 0) {
    relatedMoviesElement.innerHTML = '<p>No related movies found.</p>';
  } else {
    movies.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.classList.add('related-movie');
      movieElement.textContent = movie.title;
      relatedMoviesElement.appendChild(movieElement);
    });
  }
}

app.use(express.static('public'));

app.get('/films', (req, res) => {
  res.json(films);
});
app.get('/related-movies', (req, res) => {
  const selectedFilmIds = req.query.ids ? req.query.ids.split(',').map(Number) : [];

  if (selectedFilmIds.length === 0) {
    return res.status(400).json({ error: 'No films selected' });
  }

  const selectedFilms = films.filter(film => selectedFilmIds.includes(film.id));
  if (selectedFilms.length === 0) {
    return res.status(404).json({ error: 'Selected films not found' });
  }

  const allGenres = [...new Set(selectedFilms.flatMap(film => film.genreIds))];
  const relatedFilms = getRelatedMoviesByGenres(allGenres);

  // Return the related films in a valid JSON format
  if (relatedFilms.length > 0) {
    return res.json(relatedFilms);  // Valid JSON response
  } else {
    return res.status(404).json({ error: 'No related movies found' });  // Handle empty result
  }
});


//Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));