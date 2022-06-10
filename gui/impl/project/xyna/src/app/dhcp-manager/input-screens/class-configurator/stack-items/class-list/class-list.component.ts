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
import { XoRowctype1 as XoClass } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Class0/www/gip/com/juno/DHCP/WS/Class0/Messages/xo-row-ctype1.model';
import { XoRowListctype1 as XoClassList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Class0/www/gip/com/juno/DHCP/WS/Class0/Messages/xo-row-list-ctype1.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { ClassDetailsComponent, ClassDetailsComponentData } from '../class-details/class-details.component';


export type ClassListComponentData = GenericStackItemComponentData;

@Component({
    templateUrl: './class-list.component.html',
    styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent extends GenericStackItemComponent<ClassListComponentData> {

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<ClassDetailsComponentData>(
            ClassDetailsComponent,
            {stackItem: item, communicationData: this.communicationData, classID: id}
        );
    }

    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Clas')) {
                    id = id.substring(4);
                    this.refresh();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Class-Configurator');
        this.refresh();
    }

    add() {

        const payload: XoClass = new XoClass();
        const data: GenericDialogComponentData<XoClass> = {
            data: payload,
            def: [<Definition>{ label: 'Class Name', dataPath: 'name', type: 'text' },
                <Definition>{ label: 'Priority', dataPath: 'priority', type: 'text' }],
            header: 'Add Class',
            applyFunction: this.actuallyAddClass.bind(this)
        };
        this.dialogService.custom<boolean, GenericDialogComponentData<XoClass>, GenericDialogComponent<XoClass>>(GenericDialogComponent, data);
    }

    private actuallyAddClass(data: XoClass): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.classInsertRows, data, XoClass).subscribe({
            next: result => {
                const out = result.output[1] as XoClass;
                this.refresh();
                this.changeSubject.next('Clas' + out.classID);
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

    deleteClass(id: string) {

        const deleteIt = () => {
            const deleteClass: XoClass = new XoClass();
            deleteClass.classID = id;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.classDeleteRows, deleteClass, XoDeleteRowsOutput).subscribe({
                next: result => {
                    this.refresh();
                    this.changeSubject.next('Clas' + id);
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Class?', deleteIt.bind(this));
    }

    refresh() {
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.classGetAllRows, rowsInput, XoClassList).subscribe({
            next: result => {
                const classList = result.output[1] as XoClassList;
                this.richList = [classList.row.data.map<XcRichListItem<StackItemRichListComponentData>>((value: XoClass) => {
                    return super.constructRichListItem(value.classID, [value.priority, value.name], 'Delete Class', this.deleteClass.bind(this));
                })];
                this.resetSelection();
            }
        });
    }
}
