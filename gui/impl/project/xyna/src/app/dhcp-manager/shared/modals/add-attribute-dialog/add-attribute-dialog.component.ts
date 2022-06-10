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
import { Component, Injector } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcAutocompleteDataWrapper, XcDialogComponent, XcOptionItem } from '@zeta/xc';

import { Attribute, localValueRequirement } from './attribute.model';


export const WARNING: string = 'Attention: This value has global meaning in subnets, pool-types and classes. Changing have global impact!';

export interface AddAttributeComponentData {

    attributes: Attribute[];
    editAttribute?: Attribute;
    withForce: boolean;
    header: string;
    comment?: string;
}

@Component({
    templateUrl: './add-attribute-dialog.component.html',
    styleUrls: ['./add-attribute-dialog.component.scss']
})
export class AddAttributeComponent extends XcDialogComponent<Attribute, AddAttributeComponentData> {

    private _attribute: Attribute;
    editMode: boolean;
    comment: string = WARNING;
    header: string;
    localValueValidtorPattern: RegExp = localValueRequirement;

    attributeWrapper: XcAutocompleteDataWrapper<Attribute> = new XcAutocompleteDataWrapper<Attribute>(
        () => this.attribute,
        value => {
            this.attribute = value;
        }
    );
    globalValueWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this._attribute.value,
        value => this._attribute.value = value
    );

    get attribute(): Attribute {
        return this._attribute;
    }

    set attribute(val: Attribute) {
        this._attribute = val;
        if (this.attribute.isGlobal) {
            this.globalValueWrapper.values = this._attribute.possibleValues.map(value => {
                const ret: XcOptionItem<string> = {value: value, name: value};
                return ret;
            });
        } else {
            this.globalValueWrapper.values = [];
        }
    }

    constructor(injector: Injector, private readonly i18nService: I18nService) {
        super(injector);

        this.attributeWrapper.values = this.injectedData.attributes.map(val => {
            const ret: XcOptionItem<Attribute> = <XcOptionItem<Attribute>>{value: val, name: val.name};
            return ret;
        });

        if (this.injectedData.editAttribute) {
            this.editMode = true;
            this.attribute = this.injectedData.editAttribute;
        } else if (this.injectedData.attributes && this.injectedData.attributes.length) {
                this.attribute = this.injectedData.attributes[0];

            } else {
                this.attribute = new Attribute('-1', 'undefined', false);
                this.dismiss(null);
            }

        this.attributeWrapper.update();

        this.comment = this.i18nService.translate(this.injectedData.comment || this.comment);
        this.header = this.i18nService.translate(this.injectedData.header);
    }
}
