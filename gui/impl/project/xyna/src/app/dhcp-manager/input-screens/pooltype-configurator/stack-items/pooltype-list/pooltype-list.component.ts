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
import { XcComponentTemplate, XcDialogService, XcRichListItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../../shared/modals/generic-dialog/generic-dialog.component';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoPoolType } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-ctype.model';
import { XoRowListctype as XoPoolTypeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoAddEditPooltype } from '../../../../xo/xmcp/dhcp/v4/pooltype-configurator/xo-add-edit-pooltype.model';
import { negationOptions, PooltypeDetailsComponent, PooltypeDetailsComponentData } from '../pooltype-details/pooltype-details.component';


export type PooltypeListComponentData = GenericStackItemComponentData;

@Component({
    templateUrl: './pooltype-list.component.html',
    styleUrls: ['./pooltype-list.component.scss']
})
export class PooltypeListComponent extends GenericStackItemComponent<PooltypeListComponentData> {

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<PooltypeDetailsComponentData>(
            PooltypeDetailsComponent,
            {stackItem: item, communicationData: this.communicationData, pooltypeID: id}
        );
    }

    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Poty')) {
                    id = id.substring(4);
                    this.refresh();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Pooltypes');
        this.refresh();
    }

    add() {

        const payload: XoAddEditPooltype = new XoAddEditPooltype();
        payload.isDefault = false;
        payload.poolType = new XoPoolType();
        payload.poolType.negation = 'allow';
        payload.dropDownOptions = negationOptions;
        const data: GenericDialogComponentData<XoAddEditPooltype> = {
            data: payload,
            def: this.definineEditDialog(),
            header: 'Add Pooltype',
            applyFunction: this.actuallyAddPooltype.bind(this)
        };
        this.dialogService.custom<boolean, GenericDialogComponentData<XoAddEditPooltype>, GenericDialogComponent<XoAddEditPooltype>>(GenericDialogComponent, data);
    }

    private actuallyAddPooltype(data: XoAddEditPooltype): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        data.writeBooleans();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeInsertRows, data.poolType, XoPoolType).subscribe({
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

    /*editPooltype(id: string, name: string, negation: string, isDefault: string) {

        const payload: XoAddEditPooltype = new XoAddEditPooltype();
        payload.poolType = new XoPoolType();
        payload.poolType.poolTypeID = id;
        payload.poolType.name = name;
        payload.poolType.negation = negation;
        payload.poolType.isDefault = isDefault;
        payload.readBooleans();
        payload.dropDownOptions = negationOptions;
        const data: GenericDialogComponentData<XoAddEditPooltype> = {
            data: payload,
            def: this.definineEditDialog(),
            header: 'Add Pooltype',
            applyFunction: this.actuallyEditPooltype.bind(this)
        }
        this.dialogService.custom<boolean, GenericDialogComponentData<XoAddEditPooltype>, GenericDialogComponent<XoAddEditPooltype>>(GenericDialogComponent, data);
    }

    private actuallyEditPooltype(data: XoAddEditPooltype) {
        const sub: Subject<boolean> = new Subject<boolean>();
        data.writeBooleans();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeUpdateRows, data.poolType, XoPoolType).subscribe({
            next: result => {
                const out = result.output[1] as XoPoolType;
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
    }*/

    private definineEditDialog(): Definition[] {

        return [<Definition>{ label: 'Name', dataPath: 'poolType.name', type: 'text' },
            <Definition>{ label: 'Default', dataPath: 'isDefault', type: 'checkBox' },
            <Definition>{ label: 'Negation', dataPath: 'poolType.negation', type: 'dropDown' }];
    }

    deletePooltype(id: string) {

        const deleteIt = () => {
            const deletePooltype: XoPoolType = new XoPoolType();
            deletePooltype.poolTypeID = id;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeDeleteRows, deletePooltype, XoDeleteRowsOutput).subscribe({
                next: _ => {
                    this.changeSubject.next('Poty' + id);
                    this.refresh();
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Pooltype?', deleteIt.bind(this));
    }

    refresh() {

        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeGetAllRows, rowsInput, XoPoolTypeList).subscribe({
            next: result => {
                const pooltypeList = result.output[1] as XoPoolTypeList;
                this.richList = [pooltypeList.row.data.map<XcRichListItem<StackItemRichListComponentData>>((value: XoPoolType) => {
                    let defaultLabel: string;
                    if (value.isDefault === 'yes') {
                        defaultLabel = '(' + 'default' + ')';
                    } else {
                        defaultLabel = '';
                    }
                    return super.constructRichListItem(value.poolTypeID, [value.name, defaultLabel], 'Delete PoolType', this.deletePooltype.bind(this));
                })];
                this.resetSelection();
            }
        });
    }
}
