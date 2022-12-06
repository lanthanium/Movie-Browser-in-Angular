import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { MoviePageComponent} from './movie-page/movie-page.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { UiComponent } from './ui/ui.component';

const routes: Routes = [
    { path: '', component: HomePageComponent},
    { path: 'movie/:id', component: MoviePageComponent},
    { path: 'ui', component: UiComponent },
    { path: 'bookmark', component: BookmarksComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
