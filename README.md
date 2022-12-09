# Demo Link
https://www.youtube.com/watch?v=tA9uxOuxnGg

# Overview
A CRUD web application where users can search any movies or browse the current trending/popular movies from TheMovieDB.org. 
Application is designed with ease of accessibliity and user interface in mind.  Clean, elegant, visually appealing and highly interactive.  

# Info
This application uses an API key which will need to be created from TheMovieDB.org.  Replace the my_API_KEY constant in movie-service.ts file
with your own API key for this app to be able to succesfully make API requests.  
movie-service.ts file is located in src/app folder.  This folder is also where all the source code for the different components and pages are.  

Application makes use of handtrack.js library, where certain hand gestures add functionality to the web application.  

# Hand Gestures
Double Open Palms adds a movie to the Watch Later category.
Double Close Fists adds a movie to the Seen category. 
Double Pointing Fingers adds a movie to the Favorites category.
Pointing finger going up redirects user to IMDB page. 

Swiping left/right on home page slides the movie carousel accordingly. 
