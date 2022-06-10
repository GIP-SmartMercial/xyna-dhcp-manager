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
import { XcDialogService } from '@zeta/xc';

import { Observable, Subject } from 'rxjs/';

import { DHCPApiService } from '../../shared/classes/dhcp-api.service';
import { GenericTableDetailsComponent } from '../../shared/classes/generic-table-details.component';
import { WORKFLOWS } from '../../shared/routes.const';
import { XoCountRowsWithConditionInputctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Leases/www/gip/com/juno/Audit/WS/Leases/Messages/xo-count-rows-with-condition-input-ctype.model';
import { XoRowctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Leases/www/gip/com/juno/Audit/WS/Leases/Messages/xo-row-ctype.model';
import { XoRowListctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Leases/www/gip/com/juno/Audit/WS/Leases/Messages/xo-row-list-ctype.model';
import { XoSearchRowsInputctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Leases/www/gip/com/juno/Audit/WS/Leases/Messages/xo-search-rows-input-ctype.model';
import { XoMetaInfoctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Leases/www/gip/com/juno/Gui/WS/Messages/xo-meta-info-ctype.model';
import { XoGetMetaInfoInput } from '../../xo/xmcp/dhcp/v4/gui/xo-get-meta-info-input.model';
import { XoCountRowsWithConditionOutput } from '../../xo/xmcp/dhcp/v4/leasebrowser/xo-count-rows-with-condition-output.model';


@Component({
    selector: 'lease-browser-component',
    templateUrl: './lease-browser.component.html',
    styleUrls: ['./lease-browser.component.scss', '../../shared/classes/generic-table-details.component.scss']
})
export class LeaseBrowserComponent extends GenericTableDetailsComponent<XoRowctype> {

    constructor(injector: Injector, apiService: DHCPApiService, i18nService: I18nService, dialogs: XcDialogService) {
        super(injector, apiService, i18nService, dialogs);
    }

    refresh() {
        super.refresh();
        this.searchRows().subscribe({next: searchRows => {
            this.tableDataSource.fillTable(searchRows.row.data);
        }});
        this.countRowsWithCondition().subscribe({next: str => this.tableRowCount = str});
    }

    getRowClass(): Constructor<XoRowctype> {
        return XoRowctype;
    }

    onShow() {
        this.getMetaInfo().subscribe({next: metaInfo => {
            this.tableDataSource.buildTable(metaInfo.col.data);
            this.refresh();
        } });
    }

    getMetaInfo(): Observable<XoMetaInfoctype> {
        const subject = new Subject<XoMetaInfoctype>();

        const request = new XoGetMetaInfoInput();
        request.getMetaInfoInput = '1'; // like flash does
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.leaseGetMetaInfo, request, XoMetaInfoctype).subscribe({
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

        const request = new XoSearchRowsInputctype();
        request.table = 'both'; // as flash does it

        request.row = this.tableDataSource.getFilterObject();

        this.tableDataSource.isRequestingRows();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.leaseSearchRows, request, XoRowListctype).subscribe({
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

    countRowsWithCondition(): Observable<string> {

        const subject = new Subject<string>();

        const request = new XoCountRowsWithConditionInputctype();
        request.table = 'both';

        // this.tableDataSource.currentFilter.forEach(filter => {
        //     request.row.data[filter.path] = filter.filter;
        // });

        request.row = this.tableDataSource.getFilterObject();

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.leaseCountRowsWithCondition, request, XoCountRowsWithConditionOutput).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const countRowsWithConditionOutput: XoCountRowsWithConditionOutput = result.output[1] as XoCountRowsWithConditionOutput;
                    subject.next(countRowsWithConditionOutput.countRowsWithConditionOutput);
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
