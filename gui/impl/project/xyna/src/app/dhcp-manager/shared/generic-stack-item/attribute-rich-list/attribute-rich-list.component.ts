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

import { Attribute } from '../../modals/add-attribute-dialog/attribute.model';
import { BasicRichListData } from '../generic-stack-item.component';


export interface AttributeRichListComponentData extends BasicRichListData {
    value: Attribute;

    deleteable: boolean;
    deleteTooltip?: string;
    deleteFunction?: (attribute: Attribute) => void;
}

@Component({
    templateUrl: './attribute-rich-list.component.html',
    styleUrls: ['./attribute-rich-list.component.scss']
})
export class AttributeRichListComponent extends XcRichListItemComponent<void, AttributeRichListComponentData> {

    constructor(injector: Injector) {
        super(injector);
    }

    deleteItem() {
        this.injectedData.deleteFunction(this.injectedData.value);
    }

    selectItem() {
        this.injectedData.select(this.injectedData.id);
    }

    @HostBinding('class.selected')
    get selected(): boolean {
        return this.injectedData.selectable && this.injectedData.selected;
    }

    @HostListener('click')
    onclick() {
        if (this.injectedData.selectable) {
            this.selectItem();
        }
    }
}
