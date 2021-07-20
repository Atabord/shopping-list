import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  private isOpen = false;
  constructor(private elRef: ElementRef, private renderer: Renderer2) {}
  @HostListener('document:click', ['$event']) toggleOpen($event: Event) {
    const dropdownMenu = this.elRef.nativeElement.querySelector('.dropdown-menu')
    if(this.elRef.nativeElement.contains($event.target)){
      if(this.isOpen) {
        this.renderer.removeClass(dropdownMenu, 'show');
        this.isOpen = false;
      } else {
        this.renderer.addClass(dropdownMenu, 'show');
        this.isOpen = true;
     }
    } else {
      this.renderer.removeClass(dropdownMenu, 'show');
      this.isOpen = false;
    }
  }
}
