import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ActionComponent } from './action.component';
/**
 * A module containing objects associated with action components
 */
var ActionModule = /** @class */ (function () {
    function ActionModule() {
    }
    ActionModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        BsDropdownModule.forRoot(),
                        CommonModule,
                        FormsModule
                    ],
                    declarations: [ActionComponent],
                    exports: [ActionComponent],
                    providers: [BsDropdownConfig]
                },] },
    ];
    /** @nocollapse */
    ActionModule.ctorParameters = function () { return []; };
    return ActionModule;
}());
export { ActionModule };
//# sourceMappingURL=action.module.js.map