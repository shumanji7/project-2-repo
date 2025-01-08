import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const [username, setUsername] = useState('');
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

    fetchWelcomeMessage();
  }, [navigate]);

  return (
    <div>
      <h2>{username}</h2>
    </div>
  );
}

export default Welcome;
