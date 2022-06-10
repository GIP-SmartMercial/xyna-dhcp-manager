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

import { Constructor, downloadFile, MimeTypes } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcDialogService } from '@zeta/xc';

import { Observable, Subject } from 'rxjs/';

import { DHCPApiService } from '../../shared/classes/dhcp-api.service';
import { GenericTableDetailsComponent } from '../../shared/classes/generic-table-details.component';
import { WORKFLOWS } from '../../shared/routes.const';
import { XoRowctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/DeployActions/www/gip/com/juno/Deployments/WS/DeployActions/Messages/xo-row-ctype.model';
import { XoRowListctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/DeployActions/www/gip/com/juno/Deployments/WS/DeployActions/Messages/xo-row-list-ctype.model';
import { XoMetaInfoctype } from '../../xo/xmcp/dhcp/v4/datatypes/generated/DeployActions/www/gip/com/juno/Gui/WS/Messages/xo-meta-info-ctype.model';
import { XoCountAllRowsInput } from '../../xo/xmcp/dhcp/v4/deploymentmonitor/xo-count-all-rows-input.model';
import { XoCountAllRowsOutput } from '../../xo/xmcp/dhcp/v4/deploymentmonitor/xo-count-all-rows-output.model';
import { XoGetMetaInfoInput } from '../../xo/xmcp/dhcp/v4/gui/xo-get-meta-info-input.model';


@Component({
    selector: 'deployment-monitor-component',
    templateUrl: './deployment-monitor.component.html',
    styleUrls: ['./deployment-monitor.component.scss', '../../shared/classes/generic-table-details.component.scss']
})
export class DeploymentMonitorComponent extends GenericTableDetailsComponent<XoRowctype> {

    onlyOnceAtStart = false;
    copyIconButtonName = this.XDSIconName.COPY;

    constructor(injector: Injector, /* is protected */ apiService: DHCPApiService, i18nService: I18nService, dialogs: XcDialogService) {
        super(injector, apiService, i18nService, dialogs);
    }

    getRowClass(): Constructor<XoRowctype> {
        return XoRowctype;
    }

    refresh() {
        super.refresh();
        this.searchRows().subscribe({next: searchRows => {
            this.tableDataSource.fillTable(searchRows.row.data);
        }});
        this.countAllRows().subscribe({next: str => this.tableRowCount = str});
    }

    onShow() {
        super.onShow();
        this.getMetaInfo().subscribe({next: metaInfo => {
            this.tableDataSource.buildTable(metaInfo.col.data);
            this.useShortColumnStyle(XoRowctype.getAccessorMap().log);
            if (!this.onlyOnceAtStart) {
                this.tableDataSource.setFilter(XoRowctype.getAccessorMap().service, '*deploy*');
                this.onlyOnceAtStart = true;
            }
            this.refresh();
        }});
    }

    getMetaInfo(): Observable<XoMetaInfoctype> {
        const subject = new Subject<XoMetaInfoctype>();

        const request = new XoGetMetaInfoInput();
        request.getMetaInfoInput = '1'; // like flash does

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.deployGetMetaInfo, request, XoMetaInfoctype).subscribe({
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

        const request: XoRowctype = this.tableDataSource.getFilterObject();

        this.tableDataSource.isRequestingRows();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.deploySearchRows, request, XoRowListctype).subscribe({
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

    countAllRows(): Observable<string> {

        const subject = new Subject<string>();

        const request = new XoCountAllRowsInput();

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.deployCountAllRows, request, XoCountAllRowsOutput).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const countAllRowsOutput: XoCountAllRowsOutput = result.output[1] as XoCountAllRowsOutput;
                    subject.next(countAllRowsOutput.countAllRowsOutput);
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

    copyLog(event: MouseEvent) {
        console.log('copy', event);
        const log = this.currentObject ? this.currentObject.log : '';
        if (log) {
            navigator.clipboard.writeText(log).then(() => {
                this.copyIconButtonName = this.XDSIconName.CHECKED;
                setTimeout(() => this.copyIconButtonName = this.XDSIconName.COPY, 1200);
            }, reason => {
                this.copyIconButtonName = this.XDSIconName.CLOSE;
                setTimeout(() => this.copyIconButtonName = this.XDSIconName.COPY, 1200);
            });
        }
    }

    downloadLog(event: MouseEvent) {
        const log = this.currentObject ? this.currentObject.log : '';
        downloadFile(log, 'log', MimeTypes.txt);
    }

}
