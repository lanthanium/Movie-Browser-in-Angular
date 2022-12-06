import { isNgTemplate } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { parse } from 'path';
import { async } from 'rxjs';
import { MovieData } from './movie-data';


@Injectable({
  providedIn: 'root'
})
export class MovieService {

  public static AllTrendingMovies: MovieData[] = [];
  public static Popular: MovieData[] = [];
  public static Now_Playing: MovieData[] = [];
  public static Search: MovieData[] = [];
  public static FavoritedMovies: MovieData[] = [];
  public static WatchLaterMovies: MovieData[] = [];
  public static SeenMovies: MovieData[] = [];
  my_API_KEY = ""; /*<-------------------------------here is where you would paste your API Key*/

  constructor() { }


/*******************************************************************************************
 * getTrendingMovies(), getPopular(), getNowPlaying(), searchMovies()
 * These functions make API requests to themoviedb.org and store the JSON results
 * into locally defined arrays of custom class MovieData. 
 * Using for Loop to construct new instances of MovieData for each category
 ********************************************************************************************/
  getTrendingMovies = async() => {
    let response = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=' + this.my_API_KEY);
    let data = await response.json();

    for (let i = 0; i < data['results'].length; i++)
    {
      let aTrendingMovie = new MovieData(data['results'][i]['id'], data['results'][i]['title'], 
                                         data['results'][i]['poster_path'], data['results'][i]['release_date'], data['results'][i]['overview']);
      MovieService.AllTrendingMovies.push(aTrendingMovie);        
    }
    //localStorage.setItem('trending', JSON.stringify(MovieService.AllTrendingMovies));
    //if (MovieService.AllTrendingMovies.length != 0) console.log(MovieService.AllTrendingMovies);
  }

  getPopular = async() => {
    let response = await fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=' + this.my_API_KEY);
    let data = await response.json();
    let results = data['results'];

    for (let movie of results)
    {
      let popularMovie = new MovieData(movie['id'], movie['title'], movie['poster_path'], movie['release_date'], movie['overview']);
      MovieService.Popular.push(popularMovie);
    }
    //localStorage.setItem('topRated', JSON.stringify(MovieService.Popular));
    //console.log(MovieService.Popular);
  }

  getNowPlaying = async() => {
    let response = await fetch('https://api.themoviedb.org/3/movie/now_playing?api_key=' + this.my_API_KEY);
    let data = await response.json();
    let results =  data['results'];
    for (let movie of results)
    {
      let nowPlayingMovie = new MovieData(movie['id'], movie['title'], movie['poster_path'], movie['release_date'], movie['overview']);
      MovieService.Now_Playing.push(nowPlayingMovie);
    }
    //add to localstorage?
  }

  searchMovies = async(query: string) => {
    let response = await fetch('https://api.themoviedb.org/3/search/movie?api_key=' + this.my_API_KEY + '&language=en-US&query=' + 
    encodeURIComponent(query));
    let data = await response.json();
    let results = data['results'];
    if (MovieService.Search.length !=0) MovieService.Search.length = 0;
    for (let movie of results)
    {
      let searchMovie = new MovieData(movie['id'], movie['title'], movie['poster_path'], movie['release_date'], movie['overview']);
      MovieService.Search.push(searchMovie);
    }
  }



/*******************************************************************************************
 * getMovieDetails()
 * This function is loaded when a page for a single movie is viewed.  Takes the ID of the movie as
 * a parameter, and uses the ID to make API request for the details about the movie. 
 * Various setter functions of MovieData class are called to add more details about the movie
 ********************************************************************************************/
  getMovieDetails = async(movieID: string):Promise<MovieData> => {
    let response = await fetch('https://api.themoviedb.org/3/movie/' + movieID + '?api_key=' + this.my_API_KEY)
    let responseID = await fetch('https://api.themoviedb.org/3/movie/' + movieID + '/external_ids?api_key=' + this.my_API_KEY)
    let data = await response.json();
    let dataID = await responseID.json();

    let movie = new MovieData(data['id'], data['title'], data['poster_path'], data['release_date'], data['overview']);
    movie.setIMDB(dataID['imdb_id']);
    movie.setRating(data['vote_average']);
    movie.setRevenue(data['revenue']);
    movie.setRuntime(data['runtime']);
    //console.log(movie);
    return movie;
  }



/*******************************************************************************************
 * deleteFromLocalArray()
 * Function is called when user wants to remove a movie from a bookmark category. 
 * Parameters: The movie the user wants to delete, and the array that it's getting deleted 
 * from 
 ********************************************************************************************/
  deleteFromLocalArray(movie: MovieData, movieArray: MovieData[]):void{
    for (let i = 0; i < movieArray.length;i++)
    {
      if (movie.id == movieArray[i].id)
      {
        movieArray.splice(i,1);
        break;
      }
    }
  }



/*******************************************************************************************
 * Function is called when user in the movie-page.html when user wants to save a movie
 * to one of the bookmarked categories. 
 * Localstorage and the locally defined bookmark arrays are used to store the movie
 ********************************************************************************************/
  uploadToBookMarks = async(category: string, movie: MovieData) => {
    if (category == 'favorites')
    {
      await MovieService.FavoritedMovies.push(movie);
      localStorage.setItem('favorites', JSON.stringify(MovieService.FavoritedMovies));
    }
    if (category == 'later')
    {
      await MovieService.WatchLaterMovies.push(movie);
      localStorage.setItem('later', JSON.stringify(MovieService.WatchLaterMovies));
    }
    if (category == 'seen')
    {
      await MovieService.SeenMovies.push(movie);
      localStorage.setItem('seen', JSON.stringify(MovieService.SeenMovies));
    }
  }



/*******************************************************************************************
 * removeFromBookMarks(category, movie)
 * Function is called when user wants to remove a movie from a specific bookmark category
 * The movie is deleted from both the local array and the local storage
 ********************************************************************************************/
  removeFromBookMarks = async(category: string, movie: MovieData) =>{
    if (category == 'favorites')
    {
      await this.deleteFromLocalArray(movie, MovieService.FavoritedMovies);
      if (MovieService.FavoritedMovies.length == 0) localStorage.removeItem('favorites');
      else localStorage.setItem('favorites', JSON.stringify(MovieService.FavoritedMovies));
    }
    if (category == 'later')
    {
      await this.deleteFromLocalArray(movie, MovieService.WatchLaterMovies);
      if (MovieService.WatchLaterMovies.length == 0) localStorage.removeItem('later');
      else localStorage.setItem('later', JSON.stringify(MovieService.WatchLaterMovies));
    }
    if (category == 'seen')
    {
      await this.deleteFromLocalArray(movie, MovieService.SeenMovies);
      if (MovieService.SeenMovies.length == 0) localStorage.removeItem('seen');
      else localStorage.setItem('seen', JSON.stringify(MovieService.SeenMovies));
    }
  }




/*******************************************************************************************
 * downloadACategory(category), downloadAllDataStorage()
 * downloadACategory() is called by downloadAllDataStorage()
 * Downloads all specified bookmark category from local storage and pushes it into
 * locally defined arrays
 * downloadAllDataStorage() is called by ngOnInit for all pages in the app. 
 ********************************************************************************************/
  downloadACategory(category: string):void{
    let categoryArray;
   
    if (localStorage.hasOwnProperty(category))
    {
      //console.log(category + " in local storage, downloading now. ") 
      categoryArray = JSON.parse(localStorage.getItem(category) as any)
      for (let n of categoryArray)
      {
        let movie = new MovieData(n['id'], n['name'], n['posterURL'], n['release_Date'], n['overview']);
        if (category == 'favorites') MovieService.FavoritedMovies.push(movie);
        if (category == 'later') MovieService.WatchLaterMovies.push(movie);
        if (category == 'seen') MovieService.SeenMovies.push(movie);
        
      }
    }
    //else console.log(category + " not in local storage");
  }
  
  downloadAllDataStorage = async() => {
    await this.downloadACategory('favorites');
    await this.downloadACategory('later');
    await this.downloadACategory('seen');
  }



/*******************************************************************************************
 * Function was used for testing purposes only
 ********************************************************************************************/
  testStorage():void{
    console.log(localStorage.getItem('trending'));
    //localStorage.clear();
    let storageString; //this contains my trending array, it's all in stringied json data, not a movie data object
    try {
      storageString = JSON.parse(localStorage.getItem("trending") as any);
    } catch (e){
      storageString = {};
    }
    console.log(storageString);
    console.log(Object.entries(localStorage));
    if (localStorage.hasOwnProperty('hello')) console.log("it has that hello key");
    let idTrends = MovieService.AllTrendingMovies.map(n => n['id']);
    console.log(idTrends);
    if (idTrends.indexOf(69420) == -1 ) console.log("not in here")
    else console.log('in here')
  }

}
/*
    Hey guys, so this is a quick demo video of a simple CRUD movie browser web app.  You're able to browse and search up any movies
    you want it works 
    by sending API requests to MovieDB.org It's kind of like IMDB but you have to pay for accessing IMDB's API.
    Anyways yea this app also incorporates hand gestures, so you can swipe a carousel and depending on your gestures
    you can add movies to certain bookmarks, like favorites, watch later, and seen. 
    I'm first gonna just walk through regular usage of the app without hand gestures and then later show how hand gestures
    can be used as additional functionalities. 

*/