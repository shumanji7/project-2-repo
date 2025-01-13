import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import backgroundImage from './forest.jpg';

function MovieInfo() {
  const { movieId } = useParams(); 
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);

  useEffect(() => {
    const fetchMovieInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/movie/${movieId}`);
        setMovie(response.data.movie);
        setRelatedMovies(response.data.relatedMovies);
      } catch (error) {
        console.error('Error fetching movie info:', error);
      }
    };

    fetchMovieInfo();
  }, [movieId]); 

  
  const handleRelatedMovieClick = (id) => {
    navigate(`/movie/${id}`); 
  };

  return (
    <div style={{backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            justifyContent: 'flex-start', 
            overflowY: 'auto',
            textAlign: 'center',
            padding: '20px',  
            backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      {movie ? (
        <>
          <h1>{movie.title}</h1>
          <img
            src={movie.image}
            alt={movie.title}
            style={{
              width: '300px',
              height: '450px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          />
          <h3>Related Movies</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            {relatedMovies.map((related) => (
              <div
                key={related.id}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                onClick={() => handleRelatedMovieClick(related.id)}
              >
                <img
                  src={related.image}
                  alt={related.title}
                  style={{
                    width: '150px',
                    height: '225px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <p style={{ marginTop: '10px', color: 'white' }}>{related.title}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading movie info...</p>
      )}
    </div>
  );
}

export default MovieInfo;
