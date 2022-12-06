
export class MovieData {
    id: number;
    name: string;
    posterURL: string;
    release_Date: string;
    IMDB_URL: string;
    overview: string;
    rating: number;
    revenue: number;
    runtime: number;

    constructor(id: number, name: string, poster_Path: string, date: string, overview: string){
        this.id = id;
        this.name = name;
        this.posterURL = 'https://image.tmdb.org/t/p/original/' + poster_Path;
        this.release_Date = date;
        this.overview = overview;

        if (poster_Path == null)
        {
            this.posterURL = '../assets/download.png'
        }
            
    }

    setRuntime(runtime: number):void{
        this.runtime = runtime;
    }

    getRating():string{
        if (this.rating == 0|| this.rating == undefined) return "Not yet rated"
        return this.rating.toString() + '/10';
    }

    getRuntime():string{
        if (this.runtime ==0 || this.runtime == undefined) return "Not Yet Available"
        let hours = Math.floor(this.runtime/60);
        let minutes = this.runtime % 60;
        return hours + 'h ' + minutes + 'm'
    }

    getBoxOffice():string{
        if (this.revenue == undefined || this.revenue ==0) return "Info Currently Unavailable"
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return formatter.format(this.revenue);
    }

    getOverview():string{
        return this.overview;
    }
    
    setIMDB(imdb_id:string): void{
        this.IMDB_URL = "https://www.imdb.com/title/" + imdb_id
    }

    setRating(rating:number):void{
        this.rating = rating;
    }

    setRevenue(revenue: number):void{
        this.revenue = revenue;
    }

    getIMDB_URL():string {
        return this.IMDB_URL;
    }

    getID(): number{
        return this.id;
    }

    getTitle(): string{
        return this.name;
    }

    getDate(): string{
        return this.release_Date;
    }

    getIDString(): string{
        return this.id.toString();
    }
}
