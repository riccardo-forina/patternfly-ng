import {
  AfterContentChecked,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { NgOnChangesFeature } from '@angular/core/src/render3';

export interface ComboboxItem {
  value: string;
  label: string;
  lowercaseLabel: string;
}

/**
 * Sample component
 *
 * Usage:
 * <code><pre>
 * // Individual module import
 * import { SampleModule } from 'patternfly-ng/sample';
 * // Or
 * import { SampleModule } from 'patternfly-ng';
 *
 * &#64;NgModule({
 *   imports: [SampleModule,...]
 * })
 * export class AppModule(){}
 * </pre></code>
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'pfng-combobox',
  styles: ['./combobox.component.less'],
  templateUrl: './combobox.component.html',
})
export class ComboboxComponent implements AfterContentChecked {
  /**
   * The placeholder to show in the input area
   */
  placeholder = 'Select an item';

  /**
   */
  @Input('items')
  set items(value: string[] | ComboboxItem[]) {
    this.rawItems = value;
    this.filteredItems = this.allItems =
      this.rawItems.map((item: any): ComboboxItem => {
        if (typeof item === 'string') {
          const itemAsString: string = `${item}`;
          return {
            value: itemAsString,
            label: itemAsString,
            lowercaseLabel: itemAsString.toLowerCase()
          };
        }
        return item;
      });
  }

  /**
   * Set to true to disable
   */
  @Input() disabled: Boolean;

  @ViewChild('panel', { read: ElementRef }) panelElementRef: ElementRef;
  @ViewChild('searchInput', { read: ElementRef }) searchElementRef: ElementRef;

  protected selectedItem: ComboboxItem;
  protected isOpen = false;
  protected rawItems: any[];
  protected allItems: ComboboxItem[];
  protected filteredItems: ComboboxItem[];
  protected search = '';
  protected activeElementIndex = 0;

  /**
   * The default constructor
   */
  constructor(
    private _ngZone: NgZone
  ) {}

  ngAfterContentChecked() {
    // sets the value of the search input box, and hightlights the portion of it that's been autosuggested
    if (this.selectedItem) {
      this._ngZone.runOutsideAngular(() => {
        // force this to be execute after this rendering cycle, to get the updated value in the input element
        setTimeout(() => {
          this.searchElementRef.nativeElement.setSelectionRange(this.search.length, this.selectedItem.label.length);
        });
      });
    }

    if (this.selectedItem) {
      this.activeElementIndex = this.filteredItems.indexOf(this.selectedItem);
    }

    const lowercaseSearch = this.search.toLowerCase();
    if (lowercaseSearch) {
      this.filteredItems =
        this.allItems.filter((item: ComboboxItem) =>
          item.lowercaseLabel.startsWith(lowercaseSearch));
    } else {
      this.filteredItems = this.allItems;
    }

    if (this.isOpen) {
      this._ngZone.runOutsideAngular(() => {
        window.requestAnimationFrame(() => {
          this.scrollToActiveElement();
        });
      });
    }

  }

  togglePanel(ev: MouseEvent) {
    ev.stopPropagation();
    this.isOpen = this.disabled ? false : !this.isOpen;
    if (this.isOpen) {
      this.scrollToActiveElement();
    }
  }

  closePanel() {
    this.isOpen = false;
    if (!this.selectedItem) {
      this.activeElementIndex = 0;
    }
  }

  openPanel() {
    this.isOpen = true;
  }

  selectItem(item: ComboboxItem) {
    this.selectedItem = item;
    this.search = this.selectedItem.label;
    this.closePanel();
  }

  setActiveItem() {
    this.selectedItem = this.filteredItems[this.activeElementIndex];
    this.search = this.selectedItem.label;
    this.closePanel();
  }

  presetActiveItem() {
    this.selectedItem = this.filteredItems[this.activeElementIndex];
  }

  setActiveIndex(index: number) {
    this.activeElementIndex = index;
  }

  cancelSelection(ev: MouseEvent) {
    ev.stopPropagation();
    this.selectedItem = null;
  }

  scrollToActiveElement() {
    if (!this.panelElementRef) {
      return;
    }

    const panelEl = this.panelElementRef.nativeElement;
    const activeEl = panelEl.querySelector(`li:nth-child(${this.activeElementIndex + 1})`);

    if (!activeEl) {
      return;
    }

    const viewportMinY = panelEl.scrollTop;
    const viewportMaxY = viewportMinY + panelEl.clientHeight;

    const d = activeEl.getBoundingClientRect();
    if (activeEl.offsetTop < viewportMinY)  {
      panelEl.scrollTop = activeEl.offsetTop;
    } else if ((activeEl.offsetTop + d.height) > viewportMaxY) {
      panelEl.scrollTop = activeEl.offsetTop + d.height - panelEl.clientHeight;
    }
  }


  /**
   * Responds to the up arrow key event.
   *
   * If the listbox is displayed, moves focus to the last suggested value.
   * If the listbox is not displayed, opens the listbox and moves focus to the last value.
   *
   * @param ev
   */
  onArrowUp(ev: KeyboardEvent) {
    ev.preventDefault();
    if (this.isOpen) {
      this.activeElementIndex = this.activeElementIndex > 0
        ? this.activeElementIndex - 1
        : this.filteredItems.length - 1;
      this.presetActiveItem();
    } else {
      this.openPanel();
    }
  }

  /**
   * Responds to the down arrow key event.
   *
   * If the listbox is displayed moves focus to the second suggested value. Note that the first value is
   * automatically selected.
   * If the listbox is not displayed opens the listbox and moves focus to the first value.
   *
   * @param ev
   */
  onArrowDown(ev: KeyboardEvent) {
    ev.preventDefault();
    if (!this.isOpen) {
      this.openPanel();
    } else {
      this.activeElementIndex = this.activeElementIndex < (this.filteredItems.length - 1)
        ? this.activeElementIndex + 1
        : 0;
    }
    this.presetActiveItem();
  }

  /**
   * Responds to the enter key event.
   *
   * If the listbox is displayed and the first option is automatically selected:
   * - Sets the textbox value to the content of the selected option.
   * - Closes the listbox.
   *
   * @param ev
   */
  onEnterDown(ev: KeyboardEvent) {
    if (!this.isOpen) {
      return;
    }
    this.setActiveItem();
  }

  /**
   * Responds to the escape key event;
   *
   * Clears the textbox
   * If the listbox is displayed, closes it.
   *
   * @param ev
   */
  onEscapeDown(ev: KeyboardEvent) {
    this.search = '';
    this.selectedItem = null;
    this.closePanel();
  }

  onSearchChange(search: string) {
    this.selectedItem = null;
    this.activeElementIndex = 0;
    this.search = search;
    this.openPanel();
  }

  @HostListener('document:click', ['$event'])
  onHostClick(ev: MouseEvent) {
    if (!this.isOpen) {
      return;
    }
    ev.stopPropagation();
    this.closePanel();
  }
}
