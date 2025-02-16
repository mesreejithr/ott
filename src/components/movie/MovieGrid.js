import React from 'react';
import { Grid, Container, Typography } from '@mui/material';
import MovieCard from './MovieCard';

const MovieGrid = ({ title, movies }) => {
  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MovieGrid; 