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
import { XcRemoteTableDataSource, XcTabComponent, XDSIconName } from '@zeta/xc';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoPoolUsageType, XoPoolUsageTypeArray } from '../../../../xo/xmcp/dhcp/v4/control/poolusage/xo-pool-usage-type.model';
import { ControlTabBarComponentInterface } from '../../dhcp-v4-control.component';


@Component({
    templateUrl: './pool-usage.component.html',
    styleUrls: ['./pool-usage.component.scss']
})
export class PoolUsageComponent extends XcTabComponent<void, any> implements ControlTabBarComponentInterface {

    private _hadNeverBeenSeen: boolean = true;
    private _highlight: boolean = false;

    overviewTableDataSource: XcRemoteTableDataSource<XoPoolUsageType>;
    detailsTableDataSource: XcRemoteTableDataSource<XoPoolUsageType>;
    XDSIconName = XDSIconName;

    get highlight(): boolean {
        return this._highlight;
    }
    set highlight(val: boolean) {
        this._highlight = val;
        this.overviewTableDataSource.triggerMarkForChange();
        this.detailsTableDataSource.triggerMarkForChange();
    }

    constructor(readonly injector: Injector, private readonly apiService: DHCPApiService, private readonly i18nService: I18nService) {
        super(injector);
        this.overviewTableDataSource = new XcRemoteTableDataSource<XoPoolUsageType>(this.apiService, this.i18nService, this.apiService.internalRTC, WORKFLOWS.usageGetPoolTypeOverview);
        this.overviewTableDataSource.output = XoPoolUsageTypeArray;
        this.detailsTableDataSource = new XcRemoteTableDataSource<XoPoolUsageType>(this.apiService, this.i18nService, this.apiService.internalRTC, WORKFLOWS.usageGetPoolDetails);
        this.detailsTableDataSource.output = XoPoolUsageTypeArray;

        const markFunktion = (row: XoPoolUsageType, path: string): string[] => {
            if (this.highlight && row.exceedsThreshold) {
                return ['primarycolor'];
            } else {
                return [];
            }
        };
        this.overviewTableDataSource.stylesFunction = markFunktion;
        this.detailsTableDataSource.stylesFunction = markFunktion;
    }

    refreshOverview() {
        this.overviewTableDataSource.refresh();
    }

    refreshDetails() {
        this.detailsTableDataSource.refresh();
    }

    onShow() {
        if (this._hadNeverBeenSeen) {
            this.overviewTableDataSource.refresh();
            this.detailsTableDataSource.refresh();
            this._hadNeverBeenSeen = false;
        }
    }
}
