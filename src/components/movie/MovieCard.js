import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <Card 
      sx={{ 
        maxWidth: 345,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.03)'
        }
      }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <CardMedia
        component="img"
        height="500"
        image={imageUrl}
        alt={movie.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {movie.title}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {new Date(movie.release_date).getFullYear()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ⭐ {movie.vote_average.toFixed(1)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovieCard; 