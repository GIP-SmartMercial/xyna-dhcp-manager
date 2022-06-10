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
import { ValidatorFn } from '@angular/forms';

import { Xo } from '@zeta/api';
import { Constructor } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcDialogComponent } from '@zeta/xc';
import { XoDefinitionObserver } from '@zeta/xc/xc-form/definitions/xo/base-definition.model';
import { XoCheckboxDefinition, XoDropdownDefinition, XoInputDefinition, XoItemDefinition, XoPossibleValuesDefinition, XoTextAreaDefinition, XoTextInputDefinition } from '@zeta/xc/xc-form/definitions/xo/item-definition.model';

import { Observable } from 'rxjs/';


export interface Definition {
    label: string;
    dataPath: string;
    type: string;
    possibleValueDataPath?: string;
    validatorFn?: ValidatorFn[];
}

export interface GenericDialogComponentData<D extends Xo> {
    data: D;
    def: Definition[];
    applyFunction: (data: D) => Observable<boolean>;
    header: string;
    comment?: string;
}

@Component({
    templateUrl: './generic-dialog.component.html',
    styleUrls: ['./generic-dialog.component.scss']
})
export class GenericDialogComponent<D extends Xo> extends XcDialogComponent<boolean, GenericDialogComponentData<D>> {

    busy: boolean = false;
    data: D[];
    baseDefinition: XoItemDefinition[];
    header: string;
    comment: string;

    constructor(injector: Injector, private readonly i18nService: I18nService) {
        super(injector);
        this.header = this.i18nService.translate(this.injectedData.header);
        this.comment = this.injectedData.comment ? this.i18nService.translate(this.injectedData.comment) : '';
        this.data = [this.injectedData.data];
        this.baseDefinition = this.injectedData.def.map((def: Definition) => {
            if (def.type === 'dropDown') {
                const ret = this.setStandardValues<XoDropdownDefinition>(def, XoDropdownDefinition);
                ret.placeholder = this.i18nService.translate('please choose...');
                const values: XoPossibleValuesDefinition = new XoPossibleValuesDefinition();
                // dataPath have to be an absolete Path, because otherwise Zeta set ret as parent of value and append the paths.
                // But the path of ret have to be primitive.
                values.dataPath = def.possibleValueDataPath ? def.possibleValueDataPath : '%0%.dropDownOptions';
                values.listItemLabelPath = 'label';
                values.listItemValuePath = 'value';
                ret.possibleValues = values;
                this.setStandardObserver(def, ret);
                ret.decode();
                return ret;
            } else if (def.type === 'text') {
                const ret = this.setStandardValues<XoTextInputDefinition>(def, XoTextInputDefinition);
                ret.isPassword = false;
                this.setStandardObserver(def, ret);
                ret.decode();
                return ret;
            } else if (def.type === 'textArea') {
                const ret = this.setStandardValues<XoTextAreaDefinition>(def, XoTextAreaDefinition);
                ret.numberOfLines = 5;
                this.setStandardObserver(def, ret);
                ret.decode();
                return ret;
            } else if (def.type === 'checkBox') {
                const ret = this.setStandardValues<XoCheckboxDefinition>(def, XoCheckboxDefinition);
                this.setStandardObserver(def, ret);
                ret.decode();
                return ret;
            }
            return null;
        });
    }

    private setStandardValues<I extends XoInputDefinition>(def: Definition, valClass: Constructor<I>): I {
        const val = new valClass();
        val.dataPath = def.dataPath;
        val.label = this.i18nService.translate(def.label);
        val.hidden = false;
        val.disabled = false;
        val.hideIfEmpty = false;
        val.hideIfUndefined = false;
        val.style = '';
        val.placeholder = '';

        if (def.validatorFn) {
            val.validatorClass = def.validatorFn.map<string>((value, index) => {
                return index.toString(10);
            }).join(',');
        }

        return val;
    }

    private setStandardObserver<I extends XoInputDefinition>(def: Definition, val: I) {

        val.setObserver({

            getValidator: def.validatorFn
                ? (value: string) => {
                    return def.validatorFn[parseInt(value, 10)];
                }
                : undefined,

            translate(value: string): string {
                return value;
            }
        });
    }

    apply() {
        this.busy = true;
        this.injectedData.applyFunction(this.injectedData.data).subscribe({
            next: result => {
                if (result) {
                    this.dismiss(true);
                }
            }
        }).add(() => this.busy = false);
    }
}
