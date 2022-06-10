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
import { XcDialogComponent, XcDialogService, XcLocalTableDataSource, XcTableColumn } from '@zeta/xc';

import { combineLatest, Observable, Subject } from 'rxjs/';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../../shared/modals/generic-dialog/generic-dialog.component';
import { XoOptions, XoOptionsArray } from '../../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoNewCondition } from '../../../../xo/xmcp/dhcp/v4/condition-configurator/xo-new-conditon-modal.model';
import { XoRowctype as XoCondition } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-ctype.model';
import { XoRowListctype as XoConditionList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoOperator } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiOperator/www/gip/com/juno/DHCP/WS/GuiOperator/Messages/xo-row-ctype.model';
import { XoRowListctype as XoOperatorList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiOperator/www/gip/com/juno/DHCP/WS/GuiOperator/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoParameter } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiParameter/www/gip/com/juno/DHCP/WS/GuiParameter/Messages/xo-row-ctype.model';
import { XoRowListctype as XoParameterList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiParameter/www/gip/com/juno/DHCP/WS/GuiParameter/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';


export interface ConditionChooserComponentData {
    conditions: XoCondition[]
}

export interface ConditionChooserComponentOutput {
    conditions: XoCondition[],
    condition?: XoCondition
}


@Component({
    templateUrl: './condition-chooser.component.html',
    styleUrls: ['./condition-chooser.component.scss']
})
export class ConditionChooserComponent extends XcDialogComponent<ConditionChooserComponentOutput, ConditionChooserComponentData> {

    dsCondition: XcLocalTableDataSource<XoCondition> = new XcLocalTableDataSource<XoCondition>();
    private _conditions: XoCondition[];
    header: string;

    constructor(injector: Injector, private readonly dialogService: XcDialogService, private readonly i18nService: I18nService, private readonly apiService: DHCPApiService) {
        super(injector);
        this._conditions = this.injectedData.conditions;
        this.header = this.i18nService.translate('Choose Condition');

        const columns: XcTableColumn[] = [
            {name: this.i18nService.translate('Name'), path: 'name'},
            {name: this.i18nService.translate('Parameter'), path: 'parameter'},
            {name: this.i18nService.translate('Operator'), path: 'operator'},
            {name: this.i18nService.translate('Value'), path: 'value'}];

        this.dsCondition.localTableData =  { columns: columns , rows: this._conditions };
        this.dsCondition.refresh();
    }

    addCondition() {

        const payload: XoNewCondition = new XoNewCondition();
        payload.condition = new XoCondition();
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        combineLatest(
            [this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiParameterGetAllRows, rowsInput, XoParameterList),
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiOperatorGetAllRows, rowsInput, XoOperatorList)])
            .subscribe({
                // All Workflows successful
                next: results => {
                    const parameterList: XoParameterList = results[0].output[1] as XoParameterList;
                    const operatorList: XoOperatorList = results[1].output[1] as XoOperatorList;

                    payload.parameterDropDownOptions = XoOptionsArray.fromArray(
                        parameterList.row.data.map<XoOptions>((parameter: XoParameter) =>
                            XoOptions.buildOption(parameter.name, parameter.guiParameterID)
                        )
                    );
                    payload.operatorDropDownOptions = XoOptionsArray.fromArray(
                        operatorList.row.data.map<XoOptions>((operator: XoOperator) =>
                            XoOptions.buildOption(operator.name, operator.guiOperatorID)
                        )
                    );

                    const data: GenericDialogComponentData<XoNewCondition> = {
                        data: payload,
                        def: [<Definition>{ label: 'Name', dataPath: 'condition.name', type: 'text' },
                        <Definition>{ label: 'Parameter', dataPath: 'condition.parameter', type: 'dropDown', possibleValueDataPath: '%0%.parameterDropDownOptions' },
                        <Definition>{ label: 'Operator', dataPath: 'condition.operator', type: 'dropDown', possibleValueDataPath: '%0%.operatorDropDownOptions' },
                        <Definition>{ label: 'Value', dataPath: 'condition.value', type: 'text' }],
                        header: 'Add Condition',
                        applyFunction: this.actuallyAddCondition.bind(this)
                    };
                    this.dialogService.custom<boolean, GenericDialogComponentData<XoNewCondition>, GenericDialogComponent<XoNewCondition>>(GenericDialogComponent, data);
                }
            });
    }

    private actuallyAddCondition(data: XoNewCondition): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsInsertRow, data.condition, XoCondition).subscribe({
            next: _ => {
                this.refresh();
                sub.next(true);
            },
            error: () => {
                sub.next(false);
            }
        }).add(() => {
            sub.complete();
        });
        return sub.asObservable();
    }

    apply(apply: boolean = true) {

        const selection: XoCondition[] = this.dsCondition.selectionModel.selection;
        if (apply && selection && selection.length !== 0) {
            this.dismiss({ condition: selection[0], conditions: this._conditions });
        } else {
            this.dismiss({ conditions: this._conditions });
        }
    }

    refresh() {

        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsGetAllRows, rowsInput, XoConditionList).subscribe({
            next: result => {
                const conditionList: XoConditionList = result.output[1] as XoConditionList;
                this._conditions = conditionList.row.data;
                this.dsCondition.clear();
                conditionList.row.data.forEach(row => this.dsCondition.add(row));
                this.dsCondition.refresh();
            }
        });
    }
}