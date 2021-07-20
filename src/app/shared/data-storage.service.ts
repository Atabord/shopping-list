import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';

@Injectable({providedIn: 'root'})
export class DataStorageService {
  private api = 'https://ng-atabord-recipe-default-rtdb.firebaseio.com/'
  constructor(
    private http: HttpClient,
    private recipesService: RecipeService,
  ) {}

  storeRecipes() {
    const recipes = this.recipesService.getRecipes();
    this.http.put(`${this.api}/recipes.json`, recipes).subscribe( response => {
      console.log(response);
    });
  }

  fetchRecipes() {
    return this.http.get<Recipe[]>(`${this.api}/recipes.json`)
    .pipe(map(recipes => {
      return recipes.map(recipe => {
        return {
          ...recipe,
          ingredients: recipe.ingredients || [],
        };
      });
    }), tap(recipes => {
      this.recipesService.setRecipes(recipes);
    }));
  }
}
