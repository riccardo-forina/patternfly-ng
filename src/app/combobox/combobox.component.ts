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

  protected selectedItem: ComboboxItem;
  protected isOpen = false;
  protected rawItems: any[];
  protected allItems: ComboboxItem[];
  protected filteredItems: ComboboxItem[];
  protected search = '';
  protected lowercaseSearch = '';
  protected activeElementIndex = 0;

  /**
   * The default constructor
   */
  constructor(
    private _ngZone: NgZone
  ) {}

  ngAfterContentChecked() {
    if (this.isOpen) {
      this._ngZone.runOutsideAngular(() => {
        window.requestAnimationFrame(() => {
          this.scrollToActiveElement();
        });
      });
    }
  }

  reset() {
    this.isOpen = false;
    this.search = '';
    this.lowercaseSearch = '';
    this.filteredItems = this.allItems;

    if (this.selectedItem) {
      this.activeElementIndex = this.filteredItems.indexOf(this.selectedItem);
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
    this.reset();
  }

  selectActiveItem() {
    if (this.filteredItems.length > 0) {
      this.selectedItem = this.filteredItems[this.activeElementIndex];
      this.reset();
    }
  }

  setActiveIndex(index: number) {
    this.activeElementIndex = index;
  }

  onArrowUp(ev: KeyboardEvent) {
    ev.preventDefault();
    if (this.isOpen) {
      this.activeElementIndex = this.activeElementIndex > 0
        ? this.activeElementIndex - 1
        : this.activeElementIndex;
    } else {
      this.openPanel();
    }
  }

  onArrowDown(ev: KeyboardEvent) {
    ev.preventDefault();
    if (this.isOpen) {
      this.activeElementIndex = this.activeElementIndex < (this.filteredItems.length - 1)
        ? this.activeElementIndex + 1
        : this.activeElementIndex;
    } else {
      this.openPanel();
    }
  }

  onEnterDown(ev: KeyboardEvent) {
    if (this.isOpen) {
      this.selectActiveItem();
    } else {
      this.openPanel();
    }
  }

  onSearchChange(search: string) {
    this.selectedItem = null;
    this.activeElementIndex = 0;
    this.search = search;
    this.lowercaseSearch = this.search.toLowerCase();
    this.filteredItems =
      this.allItems.filter((item: ComboboxItem) =>
        item.lowercaseLabel.includes(this.lowercaseSearch));
    this.openPanel();
  }

  cancelSelection(ev: MouseEvent) {
    ev.stopPropagation();
    this.selectedItem = null;
    this.reset();
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

  @HostListener('document:click', ['$event'])
  onHostClick(ev: MouseEvent) {
    if (!this.isOpen) {
      return;
    }
    ev.stopPropagation();
    this.closePanel();
  }
}
