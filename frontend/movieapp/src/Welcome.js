import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './forest.jpg';

function Welcome() {
  const [username, setUsername] = useState('');
  const [films, setFilms] = useState([]);
  const [selectedFilms, setSelectedFilms] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/welcome', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUsername(response.data.message);
      } catch (error) {
        alert('Session expired. Please log in again.');
        navigate('/');
      }
    };

    const fetchFilms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/films'); 
        setFilms(response.data);
      } catch (error) {
        console.error("Error fetching films:", error);
      }
    };

    fetchWelcomeMessage();
    fetchFilms();
  }, [navigate]);

  useEffect(() => {
    if (selectedFilms.length > 0) {
      const fetchRelatedMovies = async () => {
        try {
          const response = await axios.get('http://localhost:5000/related-movies', {
            params: { ids: selectedFilms.join(',') },
          });
          setRelatedMovies(response.data);
        } catch (error) {
          console.error("Error fetching related movies:", error);
        }
      };
      fetchRelatedMovies();
    } else {
      setRelatedMovies([]); 
    }
  }, [selectedFilms]);

  const handleFilmSelect = (filmId) => {
    setSelectedFilms((prevSelectedFilms) => {
      if (prevSelectedFilms.includes(filmId)) {
        return prevSelectedFilms.filter((id) => id !== filmId);
      } else {
        return [...prevSelectedFilms, filmId];
      }
    });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        justifyContent: 'flex-start', 
        overflowY: 'auto', 
      }}
    >
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        padding: '20px', 
        borderRadius: '8px', 
        maxWidth: '90%', 
        width: '400px', 
        marginTop: '30px',
      }}>
        <h1>{username}</h1>
        <div style={{ marginTop: '20px' }}>
          <h3>Select Films to See Related Movies</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {films.map((film) => (
              <div key={film.id} style={{ margin: '10px' }}>
                <input
                  type="checkbox"
                  id={`film-${film.id}`}
                  onChange={() => handleFilmSelect(film.id)}
                  checked={selectedFilms.includes(film.id)}
                />
                <label htmlFor={`film-${film.id}`} style={{ marginLeft: '8px' }}>
                  {film.title} - {film.genre}
                </label>
              </div>
            ))}
          </div>
        </div>
        {relatedMovies.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3>Related Movies</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {relatedMovies.map((movie) => (
                <div key={movie.id} style={{ margin: '10px', width: '150px', textAlign: 'center' }}>
                  <h4>{movie.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#df7474',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            width: '260px',
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Welcome;
