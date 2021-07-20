import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { Ingredient } from "src/app/shared/ingredient.model";
import { ShoppingListService } from "../shopping-list.service";

@Component({
  selector: 'app-shopping-list-edit',
  templateUrl: './shopping-list-edit.component.html',
  styleUrls: ['./shopping-list-edit.component.css']
})
export class ShoppingListEditComponent implements OnInit, OnDestroy{
  editingSubscription: Subscription;
  editMode = false;
  editedItemIndex: number;
  editedItem: Ingredient;
  @ViewChild('f') slForm: NgForm;

  constructor(private ingredientsService: ShoppingListService) {}

  ngOnInit() {
    this.editingSubscription =  this.ingredientsService.startedEditing.subscribe(
    (index: number) => {
      this.editMode = true;
      this.editedItemIndex = index;
      this.editedItem = this.ingredientsService.getIngredient(index);
      this.slForm.setValue({
        'name': this.editedItem.name,
        'amount': this.editedItem.amount,
      });
    });
  }

  ngOnDestroy() {
    this.editingSubscription.unsubscribe();
  }

  onSubmit(form: NgForm){
    const {name, amount} = form.value;
    const ingredient = new Ingredient(name, amount)
    if(this.editMode) {
      this.ingredientsService.updateIngredient(this.editedItemIndex, ingredient);
    } else {
      this.ingredientsService.addIngredient(ingredient);
    }
    this.resetForm();
  }

  onDelete() {
    this.ingredientsService.deleteIngredient(this.editedItemIndex);
    this.resetForm();
  }

  resetForm() {
    this.slForm.reset();
    this.editMode = false;
    this.editedItem = undefined;
    this.editedItemIndex = undefined;
  }
}
