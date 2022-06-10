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
import { Component, Injector, OnInit } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcDialogComponent, XcDialogService } from '@zeta/xc';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoCondition } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-ctype.model';
import { XoRowListctype as XoConditionList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { ConditionChooserComponent, ConditionChooserComponentData, ConditionChooserComponentOutput } from '../condition-chooser/condition-chooser.component';


export interface ConditionBuilderComponentData {
    existingCondition: string,
    conditions: XoCondition[]
}

const expectedAfterMap: Map<string, string[]> = new Map([
    ['(', ['(', 'NOT', 'C']],
    [')', [')' , 'Konj']],
    ['Konj', ['(', 'NOT', 'C']],
    ['NOT', ['(', 'C']],
    ['C', [')', 'Konj']]
]);

@Component({
    templateUrl: './condition-builder.component.html',
    styleUrls: ['./condition-builder.component.scss']
})
export class ConditionBuilderComponent extends XcDialogComponent<string, ConditionBuilderComponentData> implements OnInit {

    private _conditions: XoCondition[];
    conditionString: string;
    header: string;
    validString: string = '';
    isValid: boolean = false;
    infoText: string =
    'Conditions for Class objects corresponds to logic expressions. They have the following format:\n' +
    '(Condition1 AND Condition2) OR (Condition3 AND Condition4).\n' +
    '"Condition1" stands for each of the Conditions.\n' +
    'You can use the control elements under the text field to add text fragments at the end. ' +
    'You can also use direct text input. ' +
    'Validate the Condition bevor you try to save it. Saving will validate the Condition again.';

    private textAreaElement: HTMLTextAreaElement;

    constructor(injector: Injector, private readonly dialogService: XcDialogService, private readonly i18nService: I18nService, private readonly apiService: DHCPApiService) {
        super(injector);
        this._conditions = this.injectedData.conditions;
        this.conditionString = this.injectedData.existingCondition;
        this.header = this.i18nService.translate('Edit Condition');
        this.infoText = this.i18nService.translate(this.infoText);
    }

    // textArea
    private getTextAreaElement(): HTMLTextAreaElement {
        const element: Element = document.getElementById('editArea');
        return element.querySelector('textarea');
    }

    ngOnInit(): void {
        this.textAreaElement = this.getTextAreaElement();
    }

    getCaretPosition(): number {
        if (this.textAreaElement) {
            this.textAreaElement.focus();
            return this.textAreaElement.selectionStart;
        } else {
            return -1;
        }
    }

    setCaretPosition(postion: number) {
        this.textAreaElement.focus();
        this.textAreaElement.setSelectionRange(postion, postion);
    }

    // addButtons
    addCondition() {
        const data: ConditionChooserComponentData = { conditions: this._conditions };
        this.dialogService.custom<ConditionChooserComponentOutput, ConditionChooserComponentData, ConditionChooserComponent>(ConditionChooserComponent, data).afterDismissResult().subscribe({
            next: condition => {
                this._conditions = condition.conditions;
                if (condition.condition) {
                    this.integrateString(condition.condition.name + ' ');
                }
            }
        });
    }

    addAND() {
        this.integrateString('AND ');
    }

    addOR() {
        this.integrateString('OR ');
    }

    addNOT() {
        this.integrateString('NOT ');
    }

    addOpenBracket() {
        this.integrateString('( ');
    }

    addClosedBracket() {
        this.integrateString(') ');
    }

    private integrateString(string: string) {
        const position: number = this.getCaretPosition();
        // Fallback, if the textarea could not be found
        if (position < 0) {
            this.conditionString = this.conditionString + string;
        // The textArea is found
        } else {
            this.conditionString = this.conditionString.substring(0, position) + string + this.conditionString.substring(position);
            this.textAreaElement.value = this.conditionString;
            this.setCaretPosition(position + string.length);
        }
        this.isValid = false;
    }

    // validate
    apply() {
        this.validate();
        if (this.isValid) {
            this.dismiss(this.intoFormat(this.conditionString));
        }
    }

    private intoFormat(condition: string): string {
        // trim to one whitespace
        condition = condition.trim();
        condition = condition.replace(/\r?\n/gm, ' ');
        condition = condition.replace(/ +/gm,' ');

        // one whitespace between every Bracket
        condition = condition.replace(/\((?! )/gm,'( ');
        condition = condition.replace(/(?<! )\)/gm,' )');
        return condition;
    }

    validate() {
        this.validString = this.validateCondition(this.conditionString);
        if (this.validString === 'Condition is valid') {
            this.isValid = true;
        } else {
            this.isValid = false;
        }
        this.validString = this.i18nService.translate(this.validString);
    }

    private validateCondition(condition: string): string {

        if (condition.length === 0) {
            return 'Condition is empty';
        }

        // replace every condition with "C"
        let findConditionPattern: string = '';
        this._conditions.forEach((cond)=>{
            findConditionPattern = findConditionPattern + '|(?<=^|\\(| )' + this.escapeRegex(cond.name) + '(?=$|\\)| )';
        });
        findConditionPattern = findConditionPattern.substring(1);
        const finCond: RegExp = new RegExp(findConditionPattern,'gm');
        condition = condition.replace(finCond, 'C');

        // trim to one whitespace
        condition = condition.trim();
        condition = condition.replace(/\r?\n/gm, ' ');
        condition = condition.replace(/ +/gm,' ');

        // one whitespace between every Bracket
        condition = condition.replace(/\((?! )/gm,'( ');
        condition = condition.replace(/(?<! )\)/gm,' )');

        const conditionParts = condition.split(' ');
        let openBracket: number = 0;
        let lastSymbol: string = 'Konj';

        conditionParts.forEach(operator => {
            if (operator === 'AND' || operator === 'OR') {
                operator = 'Konj';
            }
            if (!expectedAfterMap.get(lastSymbol).find((symbol) => symbol === operator)) {
                return 'Invalid syntax or invalid condition';
            }
            lastSymbol = operator;
            if (operator === '(') {
                openBracket++;
            } else if (operator === ')') {
                openBracket--;
                if (openBracket < 0) {
                    return 'Unexpected closed bracket';
                }
            }
        });
        if (lastSymbol !== 'C' && lastSymbol !== ')') {
            return 'Condition is incomplete';
        }
        if (openBracket > 0) {
            return 'Too many open brackets';
        }

        return 'Condition is valid';
    }

    private escapeRegex(string: string): string {
        // eslint-disable-next-line no-useless-escape
        return string.replace(/[-\/\\^$*+?.()\|[\]{}]/g, '\\$&');
    }

    refresh() {

        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsGetAllRows, rowsInput, XoConditionList).subscribe({
            next: result => {
                const conditionList: XoConditionList = result.output[1] as XoConditionList;
                this._conditions = conditionList.row.data;
            }
        });
    }
}
