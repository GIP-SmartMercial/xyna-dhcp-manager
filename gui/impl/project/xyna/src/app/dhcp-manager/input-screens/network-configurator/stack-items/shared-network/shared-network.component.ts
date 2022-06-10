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
import { XcAutocompleteDataWrapper, XcComponentTemplate, XcDialogService, XcOptionItem, XcRichListItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowListctype as XoCpednsList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Cpedns/www/gip/com/juno/DHCP/WS/Cpedns/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSharedNetwork } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/SharedNetwork/www/gip/com/juno/DHCP/WS/SharedNetwork/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSharedNetworkList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/SharedNetwork/www/gip/com/juno/DHCP/WS/SharedNetwork/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSite } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standort/www/gip/com/juno/DHCP/WS/Standort/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSiteList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standort/www/gip/com/juno/DHCP/WS/Standort/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSiteGroup } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standortgruppe/www/gip/com/juno/DHCP/WS/Standortgruppe/Messages/xo-row-ctype.model';
import { XoRowctype as XoSubnet } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSubnetList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { AddSubnetDialogComponent, AddSubnetDialogComponentData } from '../../modals/add-subnet/add-subnet-dialog.component';
import { SubnetComponent, SubnetComponentData } from '../subnet/subnet.component';


export interface SharedNetworkComponentData extends GenericStackItemComponentData {

    sharedNetworkID: string;
    siteGroupID: string;
}

@Component({
    templateUrl: './shared-network.component.html',
    styleUrls: ['./shared-network.component.scss']
})
export class SharedNetworkComponent extends GenericStackItemComponent<SharedNetworkComponentData> {

    network: XoSharedNetwork = new XoSharedNetwork();
    migrationID: string[] = new Array(1);

    noSpaceRegEx: RegExp = new RegExp('^[^ ]*$');

    siteWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => {
            return this.siteWrapper.values.find(option => {
                return option.name === this.network.standort;
            }).value;
        },
        value => {
            this.network.standortID = value;
            this.network.standort = this.siteWrapper.value.name;
        }
    );
    cpednsDataWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.network.cpeDnsID,
        value => {
            this.network.cpeDnsID = value;
            this.network.cpeDns = this.cpednsDataWrapper.value.name;
        }
    );

    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Subn')) {
                    this.listRefresh();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit DHCP-Relay');
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Shne' + this.injectedData.sharedNetworkID)) {
                    this.refresh();
                }
            }
        }));
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<SubnetComponentData>(
            SubnetComponent,
            {stackItem: item, communicationData: this.communicationData, subnetID: id}
        );
    }

    addSubnet() {

        const payload = new XoSubnet();
        payload.sharedNetworkID = this.network.sharedNetworkID;
        payload.sharedNetwork = this.network.sharedNetwork;
        const data: AddSubnetDialogComponentData = {
            subnet: payload,
            addFunction: this.actuallyAddSubnet.bind(this)
        };
        // Because the value of cidr and netmask are not independent, workflow defined UI doesn't work. So this has to be an own Dialog.
        this.dialogService.custom<boolean, AddSubnetDialogComponentData, AddSubnetDialogComponent>(AddSubnetDialogComponent, data);
    }

    private actuallyAddSubnet(data: XoSubnet): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetInsertRows, data, XoSubnet).subscribe({
            next: result => {
                this.listRefresh();
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

    deleteSubnet(id: string) {

        const deleteIt = () => {
            const deleteSubnet: XoSubnet = new XoSubnet();
            deleteSubnet.subnetID = id;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetDeleteRows, deleteSubnet, XoDeleteRowsOutput).subscribe({
                next: result => {
                    this.changeSubject.next('Subn' + id);
                    this.refresh();
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Subnet?', deleteIt.bind(this));
    }

    save() {

        const siteGroup: XoSiteGroup = new XoSiteGroup();
        siteGroup.standortGruppeID = this.injectedData.siteGroupID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.sharedNetworkUpdateRows, [this.network, siteGroup], XoSharedNetwork).subscribe({
            next: result => {
                const out: XoSharedNetwork = result.output[1] as XoSharedNetwork;
                this.changeSubject.next('Shne' + out.sharedNetworkID);
                this.refresh();
            }
        });
    }

    refresh() {

        // Actual Data
        this.listRefresh();

        const networkInput: XoSharedNetwork = new XoSharedNetwork();
        networkInput.sharedNetworkID = this.injectedData.sharedNetworkID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.sharedNetworkSearchRows, networkInput, XoSharedNetworkList).subscribe({
            next: result => {
                const netList = result.output[1] as XoSharedNetworkList;
                if (netList.row.length === 1) {
                    this.network = netList.row.data[0];
                    this.migrationID[0] = this.network.sharedNetworkID;
                } else {
                    this.network = null;
                    this.close();
                }
            }
        });

        // DataWrapper
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.cpednsGetAllRows, rowsInput, XoCpednsList).subscribe({
            next: result => {
                const cpednsList = result.output[1] as XoCpednsList;
                this.cpednsDataWrapper.values = cpednsList.row.data.map(value => {
                    const ret: XcOptionItem<string> = {value: value.cpeDnsID, name: value.cpeDns};
                    return ret;
                });
            }
        });

        const siteInput: XoSite = new XoSite();
        siteInput.standortGruppeID = '';
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.siteSearchRows, siteInput, XoSiteList).subscribe({
            next: result => {
                const siteList = result.output[1] as XoSiteList;
                this.siteWrapper.values = siteList.row.data.filter(value  => {
                    return !value.standortGruppeID;
                }).map(value => {
                    const ret: XcOptionItem<string> = {value: value.standortID, name: value.name};
                    return ret;
                });
            }
        });
    }

    private listRefresh() {
        const subnetInput: XoSubnet = new XoSubnet();
        subnetInput.sharedNetworkID = this.injectedData.sharedNetworkID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetSearchRows, subnetInput, XoSubnetList).subscribe({
            next: result => {
                const subnetList: XoSubnetList = result.output[1] as XoSubnetList;
                this.richList = [subnetList.row.data.map<XcRichListItem<StackItemRichListComponentData>>((value: XoSubnet) => {
                    const migration: string = value.migrationState ? '(' + value.migrationState + ')' : '';
                    return super.constructRichListItem(value.subnetID, [value.subnet, value.mask, migration], 'Delete Subnet', this.deleteSubnet.bind(this));
                })];
                this.resetSelection();
            }
        });
    }
}
