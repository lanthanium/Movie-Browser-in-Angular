import { Component, OnInit, AfterViewInit, ViewChild, QueryList, ElementRef, NgModule } from '@angular/core';
import { async } from 'rxjs';
import { PredictionEvent } from '../prediction-event';
import { MovieService } from '../movie.service';
import { MovieData } from '../movie-data';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, AfterViewInit {
  @ViewChild('slideContainer') slideContainer: ElementRef;

  trendSelect:boolean;
  topSelect: boolean;
  nowPlayingSelect: boolean;


  queryString: string;
  gesture: String = "";
  onLoad: boolean = false;
  restartSearch: boolean;

  trendMoviesArray:MovieData[] = MovieService.AllTrendingMovies;
  topMoviesArray: MovieData[] = MovieService.Popular;
  nowPlayingArray: MovieData[] = MovieService.Now_Playing;
  searchMoviesArray: MovieData[] = MovieService.Search;

  trending: boolean;
  topRated:boolean;
  nowPlaying: boolean;

  constructor(private movieService: MovieService) { }

/*******************************************************************************************
 * Slide functions carousel will be called by a click event in the html page.  It scrolls
 * horizontally through the carousel 
 ********************************************************************************************/
  slideRight():void{
    this.slideContainer.nativeElement.scrollLeft += 500;
  }

  slideLeft():void{
    this.slideContainer.nativeElement.scrollLeft -= 500;
  }



/*******************************************************************************************
 * Search function is called on a keydown event/click event from the HTML page.
 * This function calls on the injected MovieService function, searchMovies, where
 * an API request is made with the search endpoint, and MovieService fetches the results
 * and pushes each movie into a new local array. 
 * searchMoviesArray[] is dynamically set to the movieservice search array
 ********************************************************************************************/
  search = async()=> {
    if (this.queryString == '' || this.queryString == undefined) return;
    else
    {      
      await this.movieService.searchMovies(this.queryString);
    }
  }



/********************************************************************************************
 * These functions are automatically called when page is loaded via ngOnInit
 * It invokes the injected movieService's get movies method to make an API request
 * to the MovieDB.org, and get's the current trending/now playing/top rated movies.  
 * The locally corresponding defined arrays
 * trendMoviesArray[], topMoviesArray[], nowPlayingArray[] is set equal to movieService's arrays 
 ********************************************************************************************/
  getTrendingMoviesHomePage():void{
    if (MovieService.AllTrendingMovies.length != 0) return;
    this.movieService.getTrendingMovies();
  }

  getPopular():void{
    if (MovieService.Popular.length !=0) return;
    this.movieService.getPopular();
  }

  getNowPlaying():void{
    if (MovieService.Now_Playing.length !=0) return;
    this.movieService.getNowPlaying();
  }



/**********************************************************************************************
 * These functions are called when users want to switch to either the
 * Trending tab, Now Playing Tab, and the Top Rated tab.
 * It sets the current selected tab's booleans values true and the others false to make
 * the interface appear/disappear on the page 
 * *********************************************************************************************/
  switchToTop():void{
    this.nowPlaying = false;
    this.nowPlayingSelect = false;
    this.trending = false;
    this.trendSelect = false;
    this.topRated = true;
    this.topSelect = true;
  }

  switchToTrend():void{
    this.nowPlaying = false;
    this.nowPlayingSelect = false;
    this.topRated = false;
    this.topSelect = false;
    this.trending = true;
    this.trendSelect = true;
  }

  switchToNowPlaying():void{
    this.topRated = false;
    this.topSelect = false;
    this.trendSelect = false;
    this.trending = false;
    this.nowPlaying = true;
    this.nowPlayingSelect = true;
  }



/*******************************************************************************************
 * Function used for testing purposes only.  
 ********************************************************************************************/
  testStorage():void{
    this.movieService.testStorage();
  }





  ngOnInit(): void {
    this.trending = true;
    this.trendSelect = true;
    this.getTrendingMoviesHomePage();
    this.onLoad = true;
    this.getPopular();
    this.getNowPlaying(); 
    //localStorage.clear();
  }

  ngAfterViewInit(): void {
  }

  prediction(event: PredictionEvent){
    this.gesture = event.getPrediction();
  }

}
