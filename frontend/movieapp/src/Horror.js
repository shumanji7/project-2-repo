import React, { useRef } from 'react';

function Horror({ films, onFilmSelect }) {
  const filmsContainerRef = useRef(null);
  const filmsPerPage = 5;

  const handleScroll = (direction) => {
    if (filmsContainerRef.current) {
      const scrollAmount = 200 * filmsPerPage; // Width of one film (200px) * filmsPerPage
      const scrollTo = direction === 'next'
        ? filmsContainerRef.current.scrollLeft + scrollAmount
        : filmsContainerRef.current.scrollLeft - scrollAmount;

      // Smooth scrolling
      filmsContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth', // Enables smooth scrolling
      });
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Select a Film to See Related Movies</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll('previous')}
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '35px',
            marginRight: '10px',
            color: 'white',
          }}
        >
          &#8592;
        </button>

        {/* Films Container */}
        <div
          ref={filmsContainerRef}
          style={{
            display: 'flex',
            gap: '20px',
            overflow: 'hidden', // Hide the scrollbar
            padding: '10px',
            width: '850px', // Adjust width to fit visible films
            maxWidth: '100%',
          }}
        >
          {films.map((film) => (
            <div
              key={film.id}
              style={{
                flex: '0 0 auto',
                cursor: 'pointer',
                border: '3px solid transparent',
                borderRadius: '8px',
                textAlign: 'center',
              }}
              onClick={() => onFilmSelect(film.id)}
            >
              <img
                src={film.image}
                alt={film.title}
                style={{
                  width: '150px',
                  height: '225px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '5px 0',
                  marginTop: '5px',
                  fontSize: '14px',
                }}
              >
                {film.title}
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleScroll('next')}
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '35px',
            marginLeft: '10px',
            color: 'white',
          }}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}

export default Horror;
