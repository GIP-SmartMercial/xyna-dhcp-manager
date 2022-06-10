/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2022 GIP SmartMercial GmbH, Germany
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
import { Component, HostBinding, HostListener, Injector } from '@angular/core';

import { XcRichListItemComponent } from '@zeta/xc';

import { BasicRichListData } from '../generic-stack-item.component';


export interface StackItemRichListComponentData extends BasicRichListData {
    values: string[];

    deleteable: boolean;
    deleteTooltip?: string;
    deleteFunction?: (id: string) => void;

    withInfo: () => boolean;
    infoTooltip?: string;
    infoFunction?: (id: string) => void;

    multiSelectable: boolean;
    multiSelect?: (id: string, toggle: boolean, range: boolean) => void;
}

@Component({
    templateUrl: './stack-item-rich-list.component.html',
    styleUrls: ['./stack-item-rich-list.component.scss']
})
export class StackItemRichListComponent extends XcRichListItemComponent<void, StackItemRichListComponentData> {

    gridLabels: number[];

    constructor(injector: Injector) {
        super(injector);

        const gridMinWidth: number = Math.floor(12 / this.injectedData.values.length);
        const mod: number = 12 % this.injectedData.values.length;

        this.gridLabels = new Array(this.injectedData.values.length);
        for (let ind: number = 0; ind < this.gridLabels.length; ind++) {
            if (ind < mod) {
                this.gridLabels[ind] = gridMinWidth + 1;
            } else {
                this.gridLabels[ind] = gridMinWidth;
            }
        }
    }

    infoItem() {
        this.injectedData.infoFunction(this.injectedData.id);
    }

    deleteItem() {
        this.injectedData.deleteFunction(this.injectedData.id);
    }

    selectItem() {
        this.injectedData.select(this.injectedData.id);
    }

    multiSelect(toggle: boolean, range: boolean) {
        this.injectedData.multiSelect(this.injectedData.id, toggle, range);
    }

    @HostBinding('class.selected')
    get selected(): boolean {
        return this.injectedData.selectable && this.injectedData.selected;
    }

    @HostListener('click', ['$event.ctrlKey || $event.metaKey', '$event.shiftKey'])
    onclick(ctrl: boolean, shift: boolean) {
        if (this.injectedData.selectable) {

            if (this.injectedData.multiSelectable) {
                this.multiSelect(ctrl, shift);
            } else {
                this.selectItem();
            }
        }
    }
}
