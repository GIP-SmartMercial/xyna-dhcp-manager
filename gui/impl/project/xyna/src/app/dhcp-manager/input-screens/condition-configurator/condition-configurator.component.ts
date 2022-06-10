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

import { Constructor } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcAutocompleteDataWrapper, XcDialogService, XcOptionItem, XDSIconName } from '@zeta/xc';

import { Observable } from 'rxjs/internal/Observable';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';

import { DHCPApiService } from '../../shared/classes/dhcp-api.service';
import { GenericTableDetailsComponent } from '../../shared/classes/generic-table-details.component';
import { WORKFLOWS } from '../../shared/routes.const';
import { XoDeleteRowsOutput } from '../../xo/xmcp/dhcp/v4/condition-configurator/xo-delete-rows-output.model';
import { XoRowctype as XoConditionRow, XoRowctypeArray as XoConditionRowArray } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-ctype.model';
import { XoMetaInfoctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/Gui/WS/Messages/xo-meta-info-ctype.model';
import { XoRowListctype as XoOperatorList } from '../../xo/xmcp/dhcp/v4/datatypes/generated/GuiOperator/www/gip/com/juno/DHCP/WS/GuiOperator/Messages/xo-row-list-ctype.model';
import { XoRowListctype as XoParameterList } from '../../xo/xmcp/dhcp/v4/datatypes/generated/GuiParameter/www/gip/com/juno/DHCP/WS/GuiParameter/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoGetMetaInfoInput } from '../../xo/xmcp/dhcp/v4/gui/xo-get-meta-info-input.model';


@Component({
    selector: 'condition-configurator-component',
    templateUrl: './condition-configurator.component.html',
    styleUrls: ['./condition-configurator.component.scss', '../../shared/classes/generic-table-details.component.scss']
})
export class ConditionConfiguratorComponent extends GenericTableDetailsComponent<XoConditionRow> {

    private _currentObjectClone: XoConditionRow;
    private _currentObjectsubscription: Subscription;
    private _wf: string;
    deleteBusy = false;
    applyBusy = false;

    get busy(): boolean {
        return this.deleteBusy || this.applyBusy;
    }

    set currentObjectClone(value: XoConditionRow) {
        this._currentObjectClone = value;
        this._wf = WORKFLOWS.conditionsUpdateRow;
        this.parameterDataWrapper.update();
        this.operatorDataWrapper.update();
    }

    get currentObjectClone(): XoConditionRow {
        return this._currentObjectClone;
    }

    constructor(injector: Injector, /* is protected */ apiService: DHCPApiService, dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, apiService, i18nService, dialogService);

        this.tableDataSource.actionElements = [{
            iconName: XDSIconName.DELETE,
            tooltip: this.i18nService.translate('Delete'),
            onAction: condition => this.deleteCondition(condition),
            disabled: this.busy
        }];
    }

    parameterDataWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.currentObjectClone ? this.currentObjectClone.parameterID : '',
        value => this.currentObjectClone.parameterID = value
    );

    operatorDataWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.currentObjectClone ? this.currentObjectClone.operatorID : '',
        value => this.currentObjectClone.operatorID = value
    );

    getRowClass(): Constructor<XoConditionRow> {
        return XoConditionRow;
    }

    refresh() {
        super.refresh();

        const request: XoGetAllRowsInput = new XoGetAllRowsInput();
        request.GetAllRowsInput = '1';

        combineLatest(
            [this.searchRows(),
                this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiParameterGetAllRows, request, XoParameterList),
                this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiOperatorGetAllRows, request, XoOperatorList)
            ]).subscribe({
                // All Workflows successful
                next: results => {
                    const parameterList: XoParameterList = results[1].output[1] as XoParameterList;
                    const operatorList: XoOperatorList = results[2].output[1] as XoOperatorList;
                    results[0].parameterList = parameterList;
                    results[0].operatorList = operatorList;
                    this.parameterDataWrapper.values = parameterList.row.data.map(value => {
                        const ret: XcOptionItem<string> = { value: value.guiParameterID, name: value.name };
                        return ret;
                    });
                    this.operatorDataWrapper.values = operatorList.row.data.map(value => {
                        const ret: XcOptionItem<string> = { value: value.guiOperatorID, name: value.name };
                        return ret;
                    });
                    this.tableDataSource.fillTable(results[0].data);
                }
            });
    }

    addCondition() {
        this.currentObject = new XoConditionRow();
        this._wf = WORKFLOWS.conditionsInsertRow;
    }

    apply() {
        this.applyBusy = true;
        this._currentObjectClone.name = this._currentObjectClone.name.trim();
        this.apiService.startOrderWithHeader('internal', this._wf, this._currentObjectClone, XoConditionRow).subscribe({
            next: _ => {
                this.refresh();
            }
        }).add(() => {
            this.applyBusy = false;
        });
    }

    deleteCondition(row: XoConditionRow = this.currentObject) {

        const deleteIt = () => {
            this.deleteBusy = true;
            const payload: XoConditionRow = row;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsDeleteRows, payload, XoDeleteRowsOutput).subscribe({
                next: _ => {
                    this.refresh();
                }
            }).add(() => {
                this.deleteBusy = false;
            });
        };
        this.confirmAction('Would you like to delete this Condition?', deleteIt);
    }

    onShow() {
        super.onShow();
        this.getMetaInfo().subscribe({next: metaInfo => {
            this.tableDataSource.buildTable(metaInfo.col.data);
            this.refresh();
        } });
        this._currentObjectsubscription = this.currentObjectChange.subscribe({
            next: condition => {
                if (condition) {
                    this.currentObjectClone = condition.clone();
                    condition.decode();
                } else {
                    this.currentObjectClone = null;
                }
            } });
    }

    onHide() {
        this._currentObjectsubscription.unsubscribe();
        super.onHide();
    }

    getMetaInfo(): Observable<XoMetaInfoctype> {
        const subject = new Subject<XoMetaInfoctype>();

        const request = new XoGetMetaInfoInput();
        request.getMetaInfoInput = '1'; // like flash does
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsGetMetaInfo, request, XoMetaInfoctype).subscribe({
            next: result => {
                const metaInfoOutput: XoMetaInfoctype = result.output[1] as XoMetaInfoctype;
                subject.next(metaInfoOutput);
                subject.complete();
            },
            error: err => {
                subject.error(err);
                subject.complete();
            }
        });


        return subject.asObservable();
    }

    searchRows(): Observable<XoConditionRowArray> {

        const subject = new Subject<XoConditionRowArray>();

        const request: XoConditionRow = this.tableDataSource.getFilterObject();

        this.tableDataSource.isRequestingRows();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsSearchRow, request, XoConditionRowArray).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const searchRowsOutput: XoConditionRowArray = result.output[1] as XoConditionRowArray;
                    subject.next(searchRowsOutput);
                    subject.complete();
                } else {
                    subject.error(result.errorMessage);
                    subject.complete();
                }
            },
            error: err => {
                subject.error(err);
                subject.complete();
            }
        });

        return subject.asObservable();
    }
}
