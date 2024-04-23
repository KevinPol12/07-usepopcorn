import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKeyPress } from "./useKeyPress";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "f952d5ad"; //We should never leave this key here

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const { movies, isLoading, error } = useMovies(query);
  const [watchedMovies, setWatchedMovies] = useLocalStorageState(
    [],
    "watchedMovies"
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

  function handleAddWatched(toAddMovie, rating, countRef) {
    const result = watchedMovies.filter(
      (movie) => movie.imdbID === toAddMovie.imdbID
    );
    if (result.length > 0) {
      alert("You can't add the same movie twice!");
      handleCloseMovie();
      return;
    }

    const toAddMovieUpdated = {
      ...toAddMovie,
      ourRating: rating,
      countRatingDecisions: countRef,
    };
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
        <Search
          query={query}
          setQuery={setQuery}
          handleCloseMovie={handleCloseMovie}
        />
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
  const countRef = useRef(0);

  useKeyPress("Escape", handleCloseMovie);

  const isWatched = watchedMovies
    .map((movie) => movie.imdbID)
    .includes(selectedMovie.imdbID);
  const watchedRating = watchedMovies.filter(
    (movie) => selectedMovie.imdbID === movie.imdbID
  )[0]?.ourRating;

  useEffect(
    function () {
      if (!rating) return;
      countRef.current = countRef.current + 1;
    },
    [rating]
  );

  useEffect(
    function () {
      document.title = "Movie | " + selectedMovie.Title;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [selectedMovie]
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
                  onClick={() =>
                    handleAddWatched(selectedMovie, rating, countRef.current)
                  }
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

function Search({ query, setQuery, handleCloseMovie }) {
  const inputEl = useRef(null);

  useKeyPress("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
    handleCloseMovie();
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
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
