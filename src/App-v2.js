import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "f952d5ad";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [query, setQuery] = useState("interstellar");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoadingB, setIsLoadingB] = useState(false);

  // const tempQuery = "messi";

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Error Fetching");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.message !== "The user aborted a request.") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 1) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  function handleCloseMovie() {
    setSelectedMovie(null);
  }

  function handleSetSelectedMovie(movieId) {
    if (selectedMovie?.imdbID === movieId) {
      setSelectedMovie(null);
      return;
    }

    async function GetSelectedMovie() {
      setIsLoadingB(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`
      );
      const data = await res.json();
      setSelectedMovie(data);
      setIsLoadingB(false);
    }
    GetSelectedMovie();
  }

  function handleAddWatched(toAddMovie, rating) {
    const result = watchedMovies.filter(
      (movie) => movie.imdbID === toAddMovie.imdbID
    );
    if (result.length > 0) {
      alert("You can't add the same movie twice!");
      handleCloseMovie();
      return;
    }

    const toAddMovieUpdated = { ...toAddMovie, ourRating: rating };
    const updatedWatchedMovies = [...watchedMovies, toAddMovieUpdated];
    setWatchedMovies(updatedWatchedMovies);
    handleCloseMovie();
    return;
  }

  function handleDeleteWatched(toRemoveMovie) {
    const newWatchedArray = watchedMovies.filter(
      (movie) => movie.imdbID !== toRemoveMovie
    );

    setWatchedMovies(newWatchedArray);
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies}></NumResults>
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {!error && !isLoading && (
            <MovieList
              movies={movies}
              handleSetSelectedMovie={handleSetSelectedMovie}
            />
          )}
          {!error && isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {/* {query.length < 1 && (
            <h2 style={{ textAlign: "center" }}>Welcome!</h2>
          )} */}
        </Box>
        <Box>
          {isLoadingB && <Loader />}
          {!isLoadingB && selectedMovie && (
            <MovieDetails
              selectedMovie={selectedMovie}
              handleCloseMovie={handleCloseMovie}
              handleAddWatched={handleAddWatched}
              watchedMovies={watchedMovies}
            />
          )}
          {!isLoadingB && !selectedMovie && (
            <>
              <WatchedSummary watchedMovies={watchedMovies} />
              <WatchedMoviesList
                watchedMovies={watchedMovies}
                handleDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function MovieDetails({
  selectedMovie,
  handleCloseMovie,
  handleAddWatched,
  watchedMovies,
}) {
  const [rating, setRating] = useState("");
  const isWatched = watchedMovies
    .map((movie) => movie.imdbID)
    .includes(selectedMovie.imdbID);
  const watchedRating = watchedMovies.filter(
    (movie) => selectedMovie.imdbID === movie.imdbID
  )[0]?.ourRating;

  useEffect(
    function () {
      document.title = "Movie | " + selectedMovie.Title;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [selectedMovie]
  );

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          handleCloseMovie();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleCloseMovie]
  );

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={handleCloseMovie}>
          ←
        </button>
        <img src={selectedMovie.Poster} alt={selectedMovie.Title} />
        <div className="details-overview">
          <h2>{selectedMovie.Title}</h2>
          <p>
            {selectedMovie.Released} - {selectedMovie.Runtime}
          </p>
          <p>{selectedMovie.Genre}</p>
          <p>⭐{selectedMovie.imdbRating} IMDb rating</p>
        </div>
      </header>

      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating maxRating={10} size={24} onSetRating={setRating} />
              {rating > 0 && (
                <button
                  className="btn-add"
                  onClick={() => handleAddWatched(selectedMovie, rating)}
                >
                  Add
                </button>
              )}
            </>
          ) : (
            <p style={{ textAlign: "center" }}>
              You already rated this movie with {watchedRating} 🌟
            </p>
          )}
        </div>
        <p>
          <em>{selectedMovie.Plot}</em>
        </p>
        <p>Starring: {selectedMovie.Actors} </p>
        <p>Directed by: {selectedMovie.Director} </p>
      </section>
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🔴</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// function WatchedBox() {
//   const [isOpen2, setIsOpen2] = useState(true);
//   const [watchedMovies, setWatchedMovies] = useState(tempWatchedData);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watchedMovies={watchedMovies} />

//           <WatchedMoviesList watchedMovies={watchedMovies} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, handleSetSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSetSelectedMovie={handleSetSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSetSelectedMovie }) {
  return (
    <li onClick={() => handleSetSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesList({ watchedMovies, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watchedMovies.map((watchedMovie) => (
        <WatchedMovie
          watchedMovie={watchedMovie}
          key={watchedMovie.imdbID}
          handleDeleteWatched={handleDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ watchedMovie, handleDeleteWatched }) {
  return (
    <li>
      <img src={watchedMovie.Poster} alt={`${watchedMovie.Title} poster`} />
      <h3>{watchedMovie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{watchedMovie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{watchedMovie.ourRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{watchedMovie.Runtime}</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatched(watchedMovie.imdbID)}
        >
          ❌
        </button>
      </div>
    </li>
  );
}

function WatchedSummary({ watchedMovies }) {
  const avgImdbRating = average(watchedMovies.map((movie) => movie.imdbRating));
  const avgUserRating = average(watchedMovies.map((movie) => movie.ourRating));
  const avgRuntime = average(
    watchedMovies.map((movie) => movie.Runtime.split(" ")[0])
  );

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watchedMovies.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}
