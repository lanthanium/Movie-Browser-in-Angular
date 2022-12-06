import { Component,ViewChild, ElementRef, OnInit } from '@angular/core';
import { MovieData } from '../movie-data';  
import { MovieService } from '../movie.service';
import { PredictionEvent } from '../prediction-event';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {
  @ViewChild('slideContainerLater') slideContainerLater: ElementRef;
  @ViewChild('slideContainerFavorite') slideContainerFavorite: ElementRef;
  @ViewChild('slideContainerSeen') slideContainerSeen: ElementRef;

gesture: String = "";
favorited_BookMarks: MovieData[] = MovieService.FavoritedMovies;
seen_BookMarks: MovieData[] = MovieService.SeenMovies;
watch_Later_BookMarks: MovieData[] = MovieService.WatchLaterMovies;
onLoad: boolean = false;


constructor(private movieService: MovieService){
}
prediction(event: PredictionEvent){
  this.gesture = event.getPrediction();
}



/*******************************************************************************************
 * slideRight, slideLeft
 * Functions are called on click events.  The category carousel is scrolled left/right
 ********************************************************************************************/
slideRight(bookmark: string):void{
  if (bookmark == 'later') this.slideContainerLater.nativeElement.scrollLeft += 500;
  else if (bookmark == 'favorite') this.slideContainerFavorite.nativeElement.scrollLeft += 500;
  else if (bookmark = 'seen') this.slideContainerSeen.nativeElement.scrollLeft += 500;
}

slideLeft(bookmark: string):void{
  if (bookmark == 'later') this.slideContainerLater.nativeElement.scrollLeft -= 500;
  else if (bookmark == 'favorite') this.slideContainerFavorite.nativeElement.scrollLeft -= 500;
  else if (bookmark = 'seen') this.slideContainerSeen.nativeElement.scrollLeft -= 500;
}



/*******************************************************************************************
 * onRefreshBookMarkPage()
 * Function calls upon injected movieService method to download all movie data into locally
 * defined arrays
 ********************************************************************************************/
onRefreshBookMarkPage = async() =>{
  await this.movieService.downloadAllDataStorage();
}



ngOnInit(){
this.onRefreshBookMarkPage();
this.onLoad = true;
}



/*******************************************************************************************
 * Function was used for testing purposes only
 ********************************************************************************************/
testStorage():void{
  console.log(localStorage.getItem('favorites'));
  //localStorage.clear();
  let storageString; //this contains my trending array, it's all in stringied json data, not a movie data object
  try {
    storageString = JSON.parse(localStorage.getItem("favorites") as any);
  } catch (e){
    storageString = {};
  }
  console.log(storageString);
  console.log(Object.entries(localStorage));
}

}
