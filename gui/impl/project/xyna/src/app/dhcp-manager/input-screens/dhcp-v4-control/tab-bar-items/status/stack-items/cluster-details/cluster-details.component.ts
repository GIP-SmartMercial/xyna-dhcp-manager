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

import { StartOrderResult } from '@zeta/api';
import { I18nService } from '@zeta/i18n';
import { XcDialogService, XcRichListItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { combineLatest, Observable } from 'rxjs/';

import { DHCPApiService } from '../../../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { WORKFLOWS } from '../../../../../../shared/routes.const';
import { XoCheckStatusForIpInputctype } from '../../../../../../xo/xmcp/dhcp/v4/datatypes/generated/CheckStatus/www/gip/com/juno/Gui/WS/Messages/xo-check-status-for-ip-input-ctype.model';
import { XoCheckStatusForIpResponsectype } from '../../../../../../xo/xmcp/dhcp/v4/datatypes/generated/CheckStatus/www/gip/com/juno/Gui/WS/Messages/xo-check-status-for-ip-response-ctype.model';


export interface ClusterDetailsComponentData extends GenericStackItemComponentData {

    clusterID: string;
}

@Component({
    templateUrl: './cluster-details.component.html',
    styleUrls: ['./cluster-details.component.scss']
})
export class ClusterDetailsComponent extends GenericStackItemComponent<ClusterDetailsComponentData> {

    ips: string[];
    instance: string;
    ipRefreshing: boolean[];

    get isRefreshing(): boolean {
        return this.ipRefreshing.find(ipRefreshing => ipRefreshing);
    }
    set isRefreshing(refreshing: boolean) {
        for (let ind: number = 0; ind < this.ipRefreshing.length; ind++) {
            this.ipRefreshing[ind] = refreshing;
        }
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        const temp = this.injectedData.clusterID.split('::');
        this.instance = temp[0];
        this.header = this.i18nService.translate('Statusdetails') + ' (' + this.instance + ')';
        this.ips = temp[1].split(',,');
        this.ipRefreshing = new Array(this.ips.length);
        this.refresh(-1);
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return null;
    }

    refresh(onlyIPwithIndex: number) {
        if (onlyIPwithIndex < 0) {
            this.isRefreshing = true;
        } else {
            this.ipRefreshing[onlyIPwithIndex] = true;
        }

        combineLatest(
            this.ips.filter(ip => {
                if (onlyIPwithIndex < 0) {
                    return true;
                } else {
                    return ip === this.ips[onlyIPwithIndex];
                }
            }).map<Observable<StartOrderResult>>((ip: string) => {
                const input: XoCheckStatusForIpInputctype = new XoCheckStatusForIpInputctype();
                input.instanceType = this.instance;
                input.ip = ip;
                return this.apiService.startOrderWithHeader('internal', WORKFLOWS.statusForIP, input, XoCheckStatusForIpResponsectype);
            })).subscribe({
                next: results => {
                    if (onlyIPwithIndex < 0) {
                        this.richList = this.buildRichList(results);
                    } else {
                        this.richList[onlyIPwithIndex] = this.buildRichList(results)[0];
                    }
                }
            }).add(() => {
                if (onlyIPwithIndex < 0) {
                    this.isRefreshing = false;
                } else {
                    this.ipRefreshing[onlyIPwithIndex] = false;
                }
            });
    }

    private buildRichList(results: StartOrderResult[]): XcRichListItem<StackItemRichListComponentData>[][] {
        return results.map<XcRichListItem<StackItemRichListComponentData>[]>(result => {
            const response: XoCheckStatusForIpResponsectype = result.output[1] as XoCheckStatusForIpResponsectype;
            return response.statusElement.data.map<XcRichListItem<StackItemRichListComponentData>>(element => {
                return super.constructRichListItemInfoOnly(
                    element.iP, [element.service, element.status],
                    () => this.isDefined(element.exception) && element.exception.length > 0 , '',
                    () => { this.dialogService.info('Stacktrace', element.exception); }, false);
            });
        });
    }

    private isDefined(value: any): boolean {
        return value !== null && value !== undefined;
    }
}
