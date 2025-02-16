import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MovieGrid from './components/movie/MovieGrid';
import MovieDetail from './components/movie/MovieDetail';
import { useMovies } from './hooks/useMovies';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const { trendingMovies, popularMovies, topRatedMovies } = useMovies();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <MovieGrid title="Trending Now" movies={trendingMovies} />
              <MovieGrid title="Popular Movies" movies={popularMovies} />
              <MovieGrid title="Top Rated" movies={topRatedMovies} />
            </>
          } />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 