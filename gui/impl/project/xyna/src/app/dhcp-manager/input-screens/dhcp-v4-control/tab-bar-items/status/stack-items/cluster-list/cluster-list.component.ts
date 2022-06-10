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

import { DHCPApiService } from '../../../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { WORKFLOWS } from '../../../../../../shared/routes.const';
import { XoGetInstanceInfoListResponsectype as XoClusterList } from '../../../../../../xo/xmcp/dhcp/v4/datatypes/generated/CheckStatus/www/gip/com/juno/Gui/WS/Messages/xo-get-instance-info-list-response-ctype.model';
import { XoInstanceInfoctype } from '../../../../../../xo/xmcp/dhcp/v4/datatypes/generated/CheckStatus/www/gip/com/juno/Gui/WS/Messages/xo-instance-info-ctype.model';
import { XoGetAllRowsInput } from '../../../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { ClusterDetailsComponent, ClusterDetailsComponentData } from '../cluster-details/cluster-details.component';


export type ClusterListComponentData = GenericStackItemComponentData;

@Component({
    templateUrl: './cluster-list.component.html',
    styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent extends GenericStackItemComponent<ClusterListComponentData> {

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('DHCPv4-Control');
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<ClusterDetailsComponentData>(
            ClusterDetailsComponent,
            {stackItem: item, communicationData: this.communicationData, clusterID: id}
        );
    }

    refresh() {

        this.refreshing = true;
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.statusGetInstanceInfoList, rowsInput, XoClusterList).subscribe({
            next: result => {
                const list: XoClusterList = result.output[1] as XoClusterList;
                let lastRichListItem: XcRichListItem<StackItemRichListComponentData>;
                this.richList = new Array(1);
                this.richList[0] = [];
                list.instanceInfo.data.sort((a, b) => {
                    if (a.instanceType < b.instanceType) {
                        return -1;
                    } else if (a.instanceType > b.instanceType) {
                        return 1;
                    } else {
                        return 0;
                    }
                }).forEach((value: XoInstanceInfoctype, index, array) => {
                    if (index > 0 && value.instanceType === array[index - 1].instanceType) {
                        lastRichListItem.data.id = lastRichListItem.data.id + ',,' + value.iP;
                    } else {
                        lastRichListItem = super.constructRichListItemOnlySelectable(value.instanceType + '::' + value.iP, [value.instanceType], true);
                        this.richList[0].push(lastRichListItem);
                    }
                });
            }
        }).add(() => {
            this.refreshing = false;
        });
    }
}
