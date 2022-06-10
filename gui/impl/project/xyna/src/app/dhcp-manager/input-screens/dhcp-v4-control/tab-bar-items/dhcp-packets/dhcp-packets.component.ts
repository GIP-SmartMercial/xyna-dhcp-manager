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
import { XcRemoteTableDataSource, XcTabComponent, XDSIconName, XoRemappingTableInfoClass, XoTableInfo } from '@zeta/xc';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoDHCPv4Packets, XoRowctypeArray as XoDHCPv4PacketsArray } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Dhcpv4Packets/www/gip/com/juno/Auditv4Memory/WS/Dhcpv4Packets/Messages/xo-row-ctype.model';
import { ControlTabBarComponentInterface } from '../../dhcp-v4-control.component';


@Component({
    templateUrl: './dhcp-packets.component.html',
    styleUrls: ['./dhcp-packets.component.scss']
})
export class DHCPPacketsComponent extends XcTabComponent<void, any> implements ControlTabBarComponentInterface {


    private _hadNeverBeenSeen: boolean = true;
    XDSIconName = XDSIconName;
    v4PacketsTableDataSource: XcRemoteTableDataSource<XoDHCPv4Packets>;

    constructor(readonly injector: Injector, private readonly apiService: DHCPApiService, private readonly i18nService: I18nService) {
        super(injector);
        this.v4PacketsTableDataSource = new XcRemoteTableDataSource<XoDHCPv4Packets>(this.apiService, this.i18nService, this.apiService.internalRTC, WORKFLOWS.packetsGetV4Packets);
        this.v4PacketsTableDataSource.tableInfoClass = XoRemappingTableInfoClass(
            XoTableInfo, XoDHCPv4Packets,
            { src: t => t.discover, dst: t => t.discoverTemplate },
            { src: t => t.offer, dst: t => t.offerTemplate }
        );

        this.v4PacketsTableDataSource.output = XoDHCPv4PacketsArray;
    }

    refresh() {
        this.v4PacketsTableDataSource.refresh();
    }

    onShow() {
        if (this._hadNeverBeenSeen) {
            this.v4PacketsTableDataSource.refresh();
            this._hadNeverBeenSeen = false;
        }
    }
}
