const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const loadingSpinner = document.getElementById('loading-spinner');

let debounceTimeout;

// Debounce function to limit API calls
function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function loadMovies(searchTerm) {
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=fc1fef96`;
    try {
        loadingSpinner.classList.remove('hide');
        const res = await fetch(URL);
        const data = await res.json();
        loadingSpinner.classList.add('hide');
        if (data.Response === "True") {
            displayMovieList(data.Search);
            resultGrid.innerHTML = ''; // Clear only when valid results are found
        } else {
            searchList.innerHTML = '';
            resultGrid.innerHTML = '<p class="error-message">No movies found. Please try another search.</p>';
        }
    } catch (error) {
        loadingSpinner.classList.add('hide');
        searchList.innerHTML = '';
        resultGrid.innerHTML = '<p class="error-message">An error occurred. Please try again later.</p>';
    }
}

const debouncedFindMovies = debounce(findMovies, 300);

function findMovies() {
    let searchTerm = movieSearchBox.value.trim();
    if (searchTerm.length > 0) {
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
        resultGrid.innerHTML = ''; // Clear results when search is empty
    }
}

function displayMovieList(movies) {
    searchList.innerHTML = '';
    movies.forEach(movie => {
        const movieListItem = document.createElement('div');
        movieListItem.dataset.id = movie.imdbID;
        movieListItem.classList.add('search-list-item');
        const moviePoster = movie.Poster !== "N/A" ? movie.Poster : "image_not_found.png";

        movieListItem.innerHTML = `
            <div class="search-item-thumbnail">
                <img src="${moviePoster}" alt="${movie.Title} poster">
            </div>
            <div class="search-item-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        `;
        searchList.appendChild(movieListItem);
    });
    loadMovieDetails();
}

async function loadMovieDetails() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = '';
            loadingSpinner.classList.remove('hide');
            try {
                const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=fc1fef96`);
                const movieDetails = await result.json();
                loadingSpinner.classList.add('hide');
                displayMovieDetails(movieDetails);
            } catch (error) {
                loadingSpinner.classList.add('hide');
                resultGrid.innerHTML = '<p class="error-message">Failed to load movie details. Please try again.</p>';
            }
        });
    });
}

function displayMovieDetails(details) {
    resultGrid.innerHTML = `
        <div class="movie-card loaded">
            <div class="movie-poster">
                <img src="${details.Poster !== "N/A" ? details.Poster : "image_not_found.png"}" alt="${details.Title} poster">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${details.Title}</h3>
                <ul class="movie-misc-info">
                    <li class="year">Year: ${details.Year}</li>
                    <li class="rated">Rated: ${details.Rated}</li>
                    <li class="released">Released: ${details.Released}</li>
                </ul>
                <p class="genre"><span>Genre:</span> ${details.Genre}</p>
                <p class="writer"><span>Writer:</span> ${details.Writer}</p>
                <p class="actors"><span>Actors:</span> ${details.Actors}</p>
                <p class="plot"><span>Plot:</span> ${details.Plot}</p>
                <p class="language"><span>Language:</span> ${details.Language}</p>
                <p class="awards"><span><i class="fas fa-award"></i></span> ${details.Awards}</p>
            </div>
        </div>
    `;
}

movieSearchBox.addEventListener('input', debouncedFindMovies);

window.addEventListener('click', (event) => {
    if (event.target.id !== 'movie-search-box' && !searchList.contains(event.target)) {
        searchList.classList.add('hide-search-list');
    }
});