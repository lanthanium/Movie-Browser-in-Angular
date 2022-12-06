import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as handTrack from 'handtrackjs';
import { PredictionEvent } from '../prediction-event';
import { MoviePageComponent } from '../movie-page/movie-page.component';
import { HomePageComponent } from '../home-page/home-page.component';
import { BookmarksComponent } from '../bookmarks/bookmarks.component';

@Component({
  selector: 'app-handtracker',
  templateUrl: './handtracker.component.html',
  styleUrls: ['./handtracker.component.css']
})
export class HandtrackerComponent implements OnInit {
  @Output() onPrediction = new EventEmitter<PredictionEvent>();
  @ViewChild('htvideo') video: ElementRef;
  
  /* 
  SAMPLERATE determines the rate at which detection occurs (in milliseconds)
  500, or one half second is about right, but feel free to experiment with faster
  or slower rates
  */
  SAMPLERATE: number = 500; 
  
  detectedGesture:string;
  width:string = "400"
  height:string = "400"

  private model: any = null;
  private runInterval: any = null;

  //handTracker model
  private modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 3, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
  };

  constructor(private moviePage: MoviePageComponent, 
              private homePage: HomePageComponent,
              private bookmarkPage: BookmarksComponent) {
  }
  
  ngOnInit(): void{
    handTrack.load(this.modelParams).then((lmodel: any) =>{
        this.model = lmodel;
        console.log("loaded");
    });
    if (this.homePage.onLoad) this.SAMPLERATE = 1;
    if (this.moviePage.onLoad) this.modelParams['scoreThreshold'] = .7;
  }

  ngOnDestroy(): void{
      this.model.dispose();
  }

  startVideo(): Promise<any> {
    return handTrack.startVideo(this.video.nativeElement).then(function(status: any){
        return status;
    }, (err: any) => { return err; }) 
  }

  startDetection(){
    this.startVideo().then(()=>{
        //The default size set in the library is 20px. Change here or use styling
        //to hide if video is not desired in UI.
        this.video.nativeElement.style.height = "200px"

        console.log("starting predictions");
        this.runInterval = setInterval(()=>{
            this.runDetection();
        }, this.SAMPLERATE);
    }, (err: any) => { console.log(err); });
  }

  stopDetection(){
    console.log("stopping predictions");
    clearInterval(this.runInterval);
    handTrack.stopVideo(this.video.nativeElement);
  }

  /*
    runDetection demonstrates how to capture predictions from the handTrack library.
    It is not feature complete! Feel free to change/modify/delete whatever you need
    to meet your desired set of interactions
  */
 X_array:number[] = [];
 Y_array:number[] = [];
 bookmark_Y_coordinate_Open:number;
 bookmark_Y_coordinate_Close: number;

  runDetection(){
    if (this.model != null){
        let predictions = this.model.detect(this.video.nativeElement).then((predictions: any) => {
            if (predictions.length <= 0) return;
            
            let openhands = 0;
            let closedhands = 0;
            let pointing = 0;
            let pinching = 0;

            //console.log(predictions);
            for(let p of predictions){
                //uncomment to view label and position data
                //console.log(p.label + " at X: " + p.bbox[0] + ", Y: " + p.bbox[1] + " at X: " + p.bbox[2] + ", Y: " + p.bbox[3]);
                //predictions is an array of objects (see a5 google doc)
                
                if(p.label == 'open') 
                {
                  openhands++;
                  this.X_array.push(p.bbox[0]);
                }
                if(p.label == 'closed')
                {
                  closedhands++;
                  this.bookmark_Y_coordinate_Close = p.bbox[1];
                }
                if(p.label == 'point') 
                {
                  pointing++;
                  this.Y_array.push(p.bbox[1]);
                  this.bookmark_Y_coordinate_Open = p.bbox[1];
                }
                if(p.label == 'pinch') pinching++;
                //console.log(this.detectedGesture);
            }
            

            /*******************************************************************************************
             * If the homePage is loaded, uses a swiping system to slide the home page carousel.
             * Takes the last element of the X coordinate array and the first element and subtracts them
             * Depending on the value, it determines if a user's hands moved left or right. 
             ********************************************************************************************/
            if (this.homePage.onLoad)
            {
              if (this.X_array.length > 2)
              {
                if ((this.X_array[this.X_array.length-1] - this.X_array[0]) > 5)
                {
                  console.log('Swipe right')
                  this.homePage.slideLeft();
                  this.X_array = [];
                } 
                if ((this.X_array[this.X_array.length-1] - this.X_array[0]) < -5) 
                {
                  console.log('swipe left')
                  this.homePage.slideRight();
                  this.X_array = [];
                }
              }
            }



            /*******************************************************************************************
             * For the movie details page, certain hand gestures add to corresponding bookmarks
             * Two open hands adds the movie to Watch Later
             * Two pointing hands adds the movie to Favorites
             * Two close hands adds the movie to Seen
             * A pointing hand swiping up redirects to IMDB movie page
            ********************************************************************************************/
            if (this.moviePage.onLoad)
            {
              if (this.Y_array.length>1)
              {
                if ((this.Y_array[this.Y_array.length-1] - this.Y_array[0]) < -5) 
                {
                  this.moviePage.redirectToIMDB(this.moviePage.selected_Movie.getIMDB_URL());
                  this.Y_array = [];
                }
              }

              if (openhands >1 && closedhands==0 && pointing==0 && pinching==0)
              {
                console.log("2 open hands")
                if (this.moviePage.defaultLaterButton) this.moviePage.addToBookmarks('later');
              }
              if (pointing >1 && openhands ==0 && closedhands ==0)
              {
                console.log('2 Pointing');
                if (this.moviePage.defaultFavoriteButton) this.moviePage.addToBookmarks('favorites');
              }

              if (closedhands >1 && openhands == 0 && pointing ==0)
              {
                console.log('2 close');
                if (this.moviePage.defaultSeenButton) this.moviePage.addToBookmarks('seen');
              }

              if (openhands ==1 && pointing ==1)
              {
                console.log('1 open 1 point')
                //this.moviePage.redirectToIMDB(this.moviePage.selected_Movie.getIMDB_URL());
              }

              if (pointing >=1) console.log('1 point');
            }



            
            /*******************************************************************************************
             * For the bookmark page, depending on how high/low the hand is, it will swipe on that
             * corresponding carousel. (Watch later, favorites, seen)
             * Pointing gestures will swipe right
             * Close hand gestures will swipe left
            ********************************************************************************************/            
            if (this.bookmarkPage.onLoad)
            {
                if (this.bookmark_Y_coordinate_Open <= 100) this.bookmarkPage.slideRight('later');
                if (this.bookmark_Y_coordinate_Open >100 && this.bookmark_Y_coordinate_Open <250) this.bookmarkPage.slideRight('favorite');
                if (this.bookmark_Y_coordinate_Open > 250) this.bookmarkPage.slideRight('seen');

                if (this.bookmark_Y_coordinate_Close <=100) this.bookmarkPage.slideLeft('later');
                if (this.bookmark_Y_coordinate_Close >100 && this.bookmark_Y_coordinate_Close < 250) this.bookmarkPage.slideLeft('favorite');
                if (this.bookmark_Y_coordinate_Close > 250) this.bookmarkPage.slideLeft('seen');

                console.log(this.bookmark_Y_coordinate_Close);
                console.log(this.bookmark_Y_coordinate_Open);
            }

            if (openhands == 0 && closedhands == 0 && pointing == 0 && pinching == 0)
            {
                //this.detectedGesture = "None";  
                this.X_array = [];
                this.Y_array = [];
                this.bookmark_Y_coordinate_Close = NaN;
                this.bookmark_Y_coordinate_Open = NaN;
            }



            this.onPrediction.emit(new PredictionEvent(this.detectedGesture))
        }, (err: any) => {
            console.log("ERROR")
            console.log(err)
        });
    }else{
        console.log("no model")
    }
  }
}


// if (openhands ==1 && pointing ==1)
// {
//   console.log("1 open 1 point")
//   if (this.moviePage.onLoad) this.moviePage.redirectToIMDB(this.moviePage.selected_Movie.getIMDB_URL());
// }


// if (openhands ==2 && closedhands==0 && pointing==0 && pinching==0)
// {
//   console.log("2 open hand")
//   if(this.moviePage.onLoad)
//   {
//     if (this.moviePage.defaultLaterButton) this.moviePage.addToBookmarks('later');
//   } 
// }

// if (openhands == 1)
// {
  
//   //if (this.homePage.loadedHome) this.homePage.slideRight();

// }

// if (closedhands ==1)
// {
//   //if (this.homePage.loadedHome) this.homePage.slideLeft();
// }
// if (openhands ==1 && closedhands ==1)
// {
//   console.log('1 open/1 close')
//   if (this.moviePage.onLoad)
//   {
//     if (this.moviePage.removeLaterButton) this.moviePage.removeFromBookmarks('later');
//   } 
// }

// if (pointing==2 && closedhands == 0 && pinching ==0 && openhands ==0)
// {
//   console.log('2 point')
//   if(this.moviePage.onLoad)
//   {
//     if (this.moviePage.defaultFavoriteButton) this.moviePage.addToBookmarks('favorites');
//   } 
// }

// if (pointing ==1 && closedhands==1)
// {
//   console.log('1 point/1 close')
//   if(this.moviePage.onLoad)
//   {
//     if (this.moviePage.removeFavoriteButton) this.moviePage.removeFromBookmarks('favorites');
//   } 
// }

// if (closedhands == 1 && pointing ==0 && pinching==0 && openhands==0)
// {
//   console.log('1 close')
//   if(this.moviePage.onLoad)
//   {
//     if (this.moviePage.defaultSeenButton) this.moviePage.addToBookmarks('seen');
//   } 
// }

// if (closedhands>1)
// {
//   console.log('2 close')
//   if(this.moviePage.onLoad)
//   {
//     if (this.moviePage.removeSeenButton) this.moviePage.removeFromBookmarks('seen');
//   } 
// }

// if (pinching>1) console.log("2 Pinching")
// else if (pinching ==1)
// {
//   console.log("1 pinching")
// }