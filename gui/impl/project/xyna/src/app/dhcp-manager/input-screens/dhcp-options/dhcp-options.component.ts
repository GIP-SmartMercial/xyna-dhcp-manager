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
import { XcDialogService, XDSIconName } from '@zeta/xc';

import { Observable, Subject } from 'rxjs/';
import { filter } from 'rxjs/operators';

import { DHCPApiService } from '../../shared/classes/dhcp-api.service';
import { GenericTableDetailsComponent } from '../../shared/classes/generic-table-details.component';
import { WORKFLOWS } from '../../shared/routes.const';
import { XoMetaInfoctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/DHCPOptions/www/gip/com/juno/DHCP/WS/Optionsv4/Messages/xo-meta-info-ctype.model';
import { XoRowctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/DHCPOptions/www/gip/com/juno/DHCP/WS/Optionsv4/Messages/xo-row-ctype.model';
import { XoRowListctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/DHCPOptions/www/gip/com/juno/DHCP/WS/Optionsv4/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../xo/xmcp/dhcp/v4/dhcp-options/xo-delete-rows-output.model';
import { XoGetMetaInfoInput } from '../../xo/xmcp/dhcp/v4/gui/xo-get-meta-info-input.model';
import { DeployDHCPOptionsModalComponent, DeployDHCPOptionsModalData } from './modal/deploy-dhcp-options/deploy-dhcp-options.component';
import { EditNewDHCPOptionsModalComponent, EditNewDHCPOptionsModalData } from './modal/edit-new-dhcp-options/edit-new-dhcp-options.component';


@Component({
    selector: 'dhcp-options-component',
    templateUrl: './dhcp-options.component.html',
    styleUrls: ['./dhcp-options.component.scss', '../../shared/classes/generic-table-details.component.scss']
})
export class DHCPOptionsComponent extends GenericTableDetailsComponent<XoRowctype> {

    constructor(injector: Injector, /* is protected */ apiService: DHCPApiService, dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, apiService, i18nService, dialogService);

        this.tableDataSource.actionElements = [{
            iconName: XDSIconName.DELETE,
            tooltip: this.i18nService.translate('Delete'),
            onAction: option => this.deleteOption(option)
        }];
    }

    getRowClass(): Constructor<XoRowctype> {
        return XoRowctype;
    }

    refresh() {
        super.refresh();
        this.searchRows().subscribe({next: searchRows => {
            this.tableDataSource.fillTable(searchRows.row.data);
        }});
        // this.countRowsWithCondition().subscribe({next: str => this.tableRowCount = str});
    }

    addOption() {
        const data: EditNewDHCPOptionsModalData = {};
        this.dialogService.custom<boolean, EditNewDHCPOptionsModalData, EditNewDHCPOptionsModalComponent>(EditNewDHCPOptionsModalComponent, data)
        .afterDismissResult().pipe(filter(result => result)).subscribe({next: _ => this.refresh()});
    }

    editOption() {
        const data: EditNewDHCPOptionsModalData = {row: this.currentObject};
        this.dialogService.custom<boolean, EditNewDHCPOptionsModalData, EditNewDHCPOptionsModalComponent>(EditNewDHCPOptionsModalComponent, data)
        .afterDismissResult().pipe(filter(result => result)).subscribe({next: _ => this.refresh()});
    }

    deleteOption(row: XoRowctype = this.currentObject) {

        const deleteIt = () => {
            const payload: XoRowctype = row;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.optionsDeleteRows, payload, XoDeleteRowsOutput).subscribe({
                next: result => {
                    if (result && !result.errorMessage) {
                        this.refresh();
                    }
                }
            });
        };
        this.confirmAction('Would you like to delete this Option?', deleteIt);
    }

    deployOption() {
        const data: DeployDHCPOptionsModalData = {row: this.currentObject};
        this.dialogService.custom<boolean, DeployDHCPOptionsModalData, DeployDHCPOptionsModalComponent>(DeployDHCPOptionsModalComponent, data)
        .afterDismissResult().pipe(filter(result => result)).subscribe({next: _ => this.refresh()});
    }

    onShow() {
        super.onShow();
        this.getMetaInfo().subscribe({next: metaInfo => {
            this.tableDataSource.buildTable(metaInfo.col.data);
            this.refresh();
        } });
    }

    getMetaInfo(): Observable<XoMetaInfoctype> {
        const subject = new Subject<XoMetaInfoctype>();

        const request = new XoGetMetaInfoInput();
        request.getMetaInfoInput = '1'; // like flash does
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.optionsGetMetaInfo, request, XoMetaInfoctype).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const metaInfoOutput: XoMetaInfoctype = result.output[1] as XoMetaInfoctype;
                    subject.next(metaInfoOutput);
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

    searchRows(): Observable<XoRowListctype> {

        const subject = new Subject<XoRowListctype>();

        // request.searchRowsInput.table = 'both'; // as flash does it

        const request: XoRowctype = this.tableDataSource.getFilterObject();

        this.tableDataSource.isRequestingRows();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.optionsSearchRows, request, XoRowListctype).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const searchRowsOutput: XoRowListctype = result.output[1] as XoRowListctype;
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
