import { Component, OnInit } from '@angular/core';
import { MovieService } from '../movie.service';
import {ActivatedRoute} from '@angular/router';
import { MovieData } from '../movie-data';
import { async } from 'rxjs';
import { PredictionEvent } from '../prediction-event';


@Component({
  selector: 'app-movie-page',
  templateUrl: './movie-page.component.html',
  styleUrls: ['./movie-page.component.css']
})
export class MoviePageComponent implements OnInit{
  onLoad:boolean = false;
  selected_Movie:MovieData;
  movieID: any;
  gesture: String = "";

  defaultFavoriteButton: boolean = true;
  defaultLaterButton: boolean = true;
  defaultSeenButton: boolean = true;

  removeFavoriteButton: boolean = false;
  removeLaterButton: boolean = false;
  removeSeenButton: boolean = false;

  constructor(private route: ActivatedRoute, private movieService: MovieService){}


  redirectToIMDB(link: string):void{
    window.location.href = link;
  }

  prediction(event: PredictionEvent){
    this.gesture = event.getPrediction();
  }


/*******************************************************************************************
 * addToBookMarks(), removeFromBookMarks()
 * These functions call upon the injected MovieService methods uploadToBookMarks
 * and removeFromBookmarks to update the bookmark page/local storage.
 * Buttons on interface are flipped to reflect current state
 ********************************************************************************************/
  addToBookmarks(category: string):void{
    this.movieService.uploadToBookMarks(category, this.selected_Movie);
    if (category == 'favorites')
    {
      this.defaultFavoriteButton = false;
      this.removeFavoriteButton = true;
    }
    if (category == 'later')
    {
      this.defaultLaterButton = false;
      this.removeLaterButton = true;
    }
    if (category == 'seen')
    {
      this.defaultSeenButton = false;
      this.removeSeenButton = true;
    }
  }

  removeFromBookmarks(category: string):void{
    this.movieService.removeFromBookMarks(category, this.selected_Movie);
    if (category == 'favorites')
    {
      this.defaultFavoriteButton = true;
      this.removeFavoriteButton = false;
    }
    if (category == 'later')
    {
      this.defaultLaterButton = true;
      this.removeLaterButton = false;
    }
    if (category == 'seen')
    {
      this.defaultSeenButton = true;
      this.removeSeenButton = false;
    }
  }



/*******************************************************************************************
 * isInBookMarks()
 * isInBookMarks() is called in on_Refresh_Movie_Page(), which
 * is called by ngOnInit, when the page is loaded/refreshed. 
 * Maps all bookmarks arrays to new arrays of just their ID's
 * Checks if current movie's ID is already in these arrays, if it is, buttons on interface
 * are changed to reflect this state. 
 ********************************************************************************************/
  isInBookmarks():void{
    if (MovieService.FavoritedMovies.length !=0)
    {
      let ID_Bookmarks = MovieService.FavoritedMovies.map(n => n['id']);
      if (ID_Bookmarks.indexOf(Number(this.movieID)) != -1)
      {
        this.defaultFavoriteButton = false;
        this.removeFavoriteButton = true;
      }  
    }
    if (MovieService.WatchLaterMovies.length !=0)
    {
      let ID_Bookmarks = MovieService.WatchLaterMovies.map(n => n['id']);
      if (ID_Bookmarks.indexOf(Number(this.movieID)) != -1)
      {
        this.defaultLaterButton = false;
        this.removeLaterButton = true;
      }  
    }
    if (MovieService.SeenMovies.length !=0)
    {
      let ID_Bookmarks = MovieService.SeenMovies.map(n => n['id']);
      if (ID_Bookmarks.indexOf(Number(this.movieID)) != -1)
      {
        this.defaultSeenButton = false;
        this.removeSeenButton = true;
      }  
    }
  }



/*******************************************************************************************
 * load_Movie_Details()
 * Function is called by on_Refresh_Movie_Page()
 * Called when a user clicks on a movie and is redirected to a new page via the ID of
 * the movie.  Uses route.snapshot.paramMap to get the redirect ID link.
 * Calls upon the injected movieService's method getMovieDetails which makes an API request
 * to obtain the details of the current loaded movie
 ********************************************************************************************/
  load_Movie_Details():void{
    this.movieID = this.route.snapshot.paramMap.get('id');
    this.movieService.getMovieDetails(this.movieID).then((response) => {
      this.selected_Movie = response;
    })
  }


  
/*******************************************************************************************
 * Function is called by ngOnInit
 * Calls upon above functions to load movie details on the page, download all data from local
 * storage, and update buttons on interface to reflect current state
 ********************************************************************************************/
  on_Refresh_Movie_Page = async() => {
    await this.load_Movie_Details();
    await this.movieService.downloadAllDataStorage();
    this.isInBookmarks();
  }



  ngOnInit(){
    this.onLoad = true;
    this.on_Refresh_Movie_Page();
  }

}







/*
movie page has to make sure movie service arrays are updated. 
make sure to download all data from storage on ngoninit on moviepage too

movie has to check if this movie is already in an array
  if it is an a categorized array, change default button to remove button instead

  Perhaps I can do the reverse, isntead of adding entire arrays to storage
  just add a single movie to storage, and add values to it like this
    key: MovieID
    value: {{
      favorites: true
      disliked: false
      watchlater: true
      uninterested: false
    }}

    everytime i favorite a movie, how would i go about this
      local storage setItem(movieID)

    I can call movieservice getmoviedetails each time to create a movie object on the fly, all I need is it's ID

*/


/*
  //make these tell movieservice to push it to it's own array and add it to local storage
  addToFavorites = async():Promise<void> => {
    await this.movieService.uploadToFavorites(this.selected_Movie);
    this.defaultFavoriteButton = false;
    this.removeFavoriteButton = true;
  }

  removeFromFavorites():void{
    this.movieService.removeFromFavorites(this.selected_Movie);
    this.defaultFavoriteButton = true;
    this.removeFavoriteButton = false;
  }

  addToNotInterested():void{
    MovieService.NotInterestedMovies.push(this.selected_Movie);
  }

  addToWatchLater():void{
    MovieService.WatchLaterMovies.push(this.selected_Movie);
  }

  addToDisliked():void{
    MovieService.DislikedMovies.push(this.selected_Movie);
  }



  isInFavorites():void{
    if (MovieService.FavoritedMovies.length ==0)
    {
      //console.log("there is nothing in movieservice favorites")
      return;
    }
    let ID_Bookmarks = MovieService.FavoritedMovies.map(n => n['id']);
    if (ID_Bookmarks.indexOf(Number(this.movieID)) == -1) return;
    else
    {
      this.defaultFavoriteButton = false;
      this.removeFavoriteButton = true;
    }
    //console.log("Favorite Array: ");
    //console.log(MovieService.FavoritedMovies);
    
    //REMEMBER THIS.MOVIEID IS A STRING SO CONVERT TO NUMBER FIRST
    // console.log(ID_Bookmarks);
    // console.log(this.movieID);
    // console.log(ID_Bookmarks.indexOf(Number(this.movieID)));
    // console.log(typeof ID_Bookmarks[0])
    // console.log(typeof this.movieID);
  }



*/