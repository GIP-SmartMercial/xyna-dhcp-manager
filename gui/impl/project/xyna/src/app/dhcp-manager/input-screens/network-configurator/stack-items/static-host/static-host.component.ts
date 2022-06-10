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
import { XcAutocompleteDataWrapper, XcCustomValidatorFunction, XcDialogService, XcOptionItem, XcTemplate, XDSIconName } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { ipv4RegExp } from '../../../../shared/validator/validator';
import { XoSyncCpeIPsInputctype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/CM/www/gip/com/juno/Service/WS/CM/Messages/xo-sync-cpe-ips-input-ctype.model';
import { XoDeployStaticHostInputctype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-deploy-static-host-input-ctype.model';
import { XoDhcpdConfResponsectype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-dhcpd-conf-response-ctype.model';
import { XoUndeployStaticHostInputctype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-undeploy-static-host-input-ctype.model';
import { XoRowListctype as XoPoolTypeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoHost } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/StaticHost/www/gip/com/juno/DHCP/WS/StaticHost/Messages/xo-row-ctype.model';
import { XoRowListctype as XoHostList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/StaticHost/www/gip/com/juno/DHCP/WS/StaticHost/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoSyncCPEIPOutput } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-sync-cpe-ips-output.model';


export interface StaticHostComponentData extends GenericStackItemComponentData {

    hostID: string;
}

@Component({
    templateUrl: './static-host.component.html',
    styleUrls: ['./static-host.component.scss']
})
export class StaticHostComponent extends GenericStackItemComponent<StaticHostComponentData> {

    host: XoHost = new XoHost();
    readonly: boolean = true;

    set dynamicDnsActive(val: boolean) {
        if (val) {
            this.host.dynamicDnsActive = 'true';
        } else {
            this.host.dynamicDnsActive = 'false';
        }
    }
    get dynamicDnsActive(): boolean {
        if (!this.host.dynamicDnsActive) {
            return false;
        }
        return this.host.dynamicDnsActive.toLocaleLowerCase() === 'true';
    }

    pooltypeWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.host.desiredPoolType,
        value => this.host.desiredPoolType = value
    );

    get deployedIcon(): XDSIconName {
        if (this.host.deployed1 && this.host.deployed1.toLocaleLowerCase() === 'yes') {
            return XDSIconName.CHECKED;
        } else {
            return XDSIconName.MSGWARNING;
        }
    }

    ipNeededValidator: XcCustomValidatorFunction = {
        onValidate: value => {
            if (!value) {
                return this.dynamicDnsActive;
            }
            return ipv4RegExp.test(value);
        },
        errorText: 'IP is required, if dynamic dns is inactive.'
    };

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit Static Host');
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Host' + this.injectedData.hostID)) {
                    this.refresh();
                }
            }
        }));
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return null;
    }

    undeploy() {

        const undeployIt = () => {
            const undeployInput: XoUndeployStaticHostInputctype = new XoUndeployStaticHostInputctype();
            undeployInput.staticHostId = this.host.staticHostID;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.undeployHost, undeployInput, XoDhcpdConfResponsectype).subscribe()
                .add(() => {
                    this.refresh();
                });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to undeploy this Static Host?', undeployIt.bind(this));
    }

    deploy() {

        const deployIt = () => {
            const deployInput: XoDeployStaticHostInputctype = new XoDeployStaticHostInputctype();
            deployInput.staticHostId = this.host.staticHostID;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.deployHost, deployInput, XoDhcpdConfResponsectype).subscribe()
                .add(() => {
                    this.refresh();
                });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to deploy this Static Host?', deployIt.bind(this));
    }

    syncCpeIp() {

        const syncInput: XoSyncCpeIPsInputctype = new XoSyncCpeIPsInputctype();
        syncInput.mac = this.host.cpe_mac;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.syncCPEIPs, syncInput, XoSyncCPEIPOutput).subscribe()
            .add(() => {
                this.refresh();
            });
    }

    save() {

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.hostUpdateRows, this.host, XoHost).subscribe({
            next: result => {
                const out: XoHost = result.output[1] as XoHost;
                this.changeSubject.next('Host' + out.staticHostID);
                this.refresh();
            }
        });
    }

    refresh() {

        const hostInput: XoHost = new XoHost();
        hostInput.staticHostID = this.injectedData.hostID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.hostSearchRows, hostInput, XoHostList).subscribe({
            next: result => {
                const hostList: XoHostList = result.output[1] as XoHostList;
                if (hostList.row.length === 1) {
                    this.host = hostList.row.data[0];
                    if ((this.host.deployed1 && this.host.deployed1.toLocaleLowerCase() === 'yes') ||
                        (this.host.deployed2 && this.host.deployed2.toLocaleLowerCase() === 'yes')) {
                        this.readonly = true;
                    } else {
                        this.readonly = false;
                    }
                } else {
                    this.host = null;
                    this.close();
                }
            }
        });

        this.fillDataWrapper();
    }

    private fillDataWrapper() {
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeGetAllRows, rowsInput, XoPoolTypeList).subscribe({
            next: result => {
                const pooltypeList = result.output[1] as XoPoolTypeList;
                this.pooltypeWrapper.values = pooltypeList.row.data.map(value => {
                    const ret: XcOptionItem<string> = {value: value.poolTypeID, name: value.name};
                    return ret;
                });
            }
        });
    }
}
