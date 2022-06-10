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
import { XoManagedFileId } from '@fman/runtime-contexts/xo/xo-managed-file-id.model';
import { XoManagedFileID } from '@zeta/api';

import { I18nService } from '@zeta/i18n';
import { XcAutocompleteDataWrapper, XcComponentTemplate, XcDialogService, XcFormValidatorPattern, XcFormValidatorRequired, XcRichListItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { combineLatest, Observable } from 'rxjs/';
import { Subject } from 'rxjs/internal/Subject';
import { map, switchMap } from 'rxjs/operators';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../../shared/modals/generic-dialog/generic-dialog.component';
import { XoOptions, XoOptionsArray } from '../../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoConnectedData } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/ConnectData/www/gip/com/juno/DHCP/WS/ConnectData/Messages/xo-row-ctype.model';
import { XoRowListctype as XoConnectedDataList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/ConnectData/www/gip/com/juno/DHCP/WS/ConnectData/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoCpedns } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Cpedns/www/gip/com/juno/DHCP/WS/Cpedns/Messages/xo-row-ctype.model';
import { XoRowListctype as XoCpednsList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Cpedns/www/gip/com/juno/DHCP/WS/Cpedns/Messages/xo-row-list-ctype.model';
import { XoCheckDhcpdConfInputctype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-check-dhcpd-conf-input-ctype.model';
import { XoDeployDhcpdConfInputctype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-deploy-dhcpd-conf-input-ctype.model';
import { XoDhcpdConfResponsectype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-dhcpd-conf-response-ctype.model';
import { XoRowctype as XoSharedNetwork, XoRowctypeArray as XoSharedNetworkArray } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/SharedNetwork/www/gip/com/juno/DHCP/WS/SharedNetwork/Messages/xo-row-ctype.model';
import { XoRowctype as XoSite, XoRowctypeArray as XoSiteArray } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standort/www/gip/com/juno/DHCP/WS/Standort/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSiteList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standort/www/gip/com/juno/DHCP/WS/Standort/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSiteGroup } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standortgruppe/www/gip/com/juno/DHCP/WS/Standortgruppe/Messages/xo-row-ctype.model';
import { XoRowctype as XoTarget } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Target/www/gip/com/juno/DHCP/WS/Target/Messages/xo-row-ctype.model';
import { XoRowListctype as XoTargetList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Target/www/gip/com/juno/DHCP/WS/Target/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoAddNetwork } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-add-network.model';
import { XoAddSitegroup } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-add-sitegroup.model';
import { XoUpdateRowPkIgnoreEmptyOutput } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-update-row-ignore-empty-output.model';
import { SharedNetworkComponent, SharedNetworkComponentData } from '../shared-network/shared-network.component';


export interface DHCPClusterDetailsComponentData extends GenericStackItemComponentData {

    siteGroupID: string;
}

@Component({
    templateUrl: './dhcp-cluster-details.component.html',
    styleUrls: ['./dhcp-cluster-details.component.scss']
})
export class DHCPClusterDetailsComponent extends GenericStackItemComponent<DHCPClusterDetailsComponentData> {

    private readonly _maxListLegnth: number = 100;

    name: string;

    targetOne: XoTarget = new XoTarget();
    connectedDataOne: XoConnectedData = new XoConnectedData();
    targetTwo: XoTarget = new XoTarget();
    connectedDataTwo: XoConnectedData = new XoConnectedData();

    private _filterName: string = '';
    set filterName(val: string) {
        this._filterName = val;
        // this.refresh();
    }
    get filterName(): string {
        return this._filterName;
    }
    private _filterSite: string = '';
    set filterSite(val: string) {
        this._filterSite = val;
        // this.refresh();
    }
    get filterSite(): string {
        return this._filterSite;
    }
    private _filterMigrationStatus: string = '';
    migrationStatusFilterWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this._filterMigrationStatus,
        value => this._filterMigrationStatus = value,
        [
            { value: '', name: '' },
            { value: 'SourceRoot', name: 'SourceRoot' },
            { value: 'TargetRoot', name: 'TargetRoot' },
        ]
    );


    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Shne')) {
                    this.listRefresh();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.keepSelection = true;
        this.header = this.i18nService.translate('Edit DHCP-Cluster');
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Sigr' + this.injectedData.siteGroupID)) {
                    this.close();
                }
            }
        }));
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<SharedNetworkComponentData>(
            SharedNetworkComponent,
            {stackItem: item, communicationData: this.communicationData, sharedNetworkID: id, siteGroupID: this.injectedData.siteGroupID}
        );
    }

    deleteSharedNetwork(id: string) {

        const deleteIt = () => {
            const deleteNetwork: XoSharedNetwork = new XoSharedNetwork();
            deleteNetwork.sharedNetworkID = id;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.sharedNetworkDeleteRows, deleteNetwork, XoDeleteRowsOutput).subscribe({
                next: result => {
                    this.changeSubject.next('Shne' + id);
                    this.refresh();
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this DHCP-Relay?', deleteIt.bind(this));
    }

    editTarget(target: number) {

        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetGetAllRows, rowsInput, XoTargetList).subscribe({
            next: result => {
                const targets: XoTargetList = result.output[1] as XoTargetList;
                const payload: XoAddSitegroup = new XoAddSitegroup();
                const emptyTarget = new XoTarget();
                emptyTarget.name = '';
                emptyTarget.targetID = '0';
                payload.dropDownOptions = XoOptionsArray.fromArray(
                    [emptyTarget, ...targets.row.data]
                    .map((value: XoTarget) => XoOptions.buildOption<XoTarget>(value.name, value)
                ));

                const data: GenericDialogComponentData<XoAddSitegroup> = {
                    data: payload,
                    def: [<Definition>{ label: 'Name', dataPath: 'targetOne', type: 'dropDown' }],
                    header: 'Change Server',
                    applyFunction: (group: XoAddSitegroup) => {

                        // confirm change if target is already in use
                        if (group.targetOne.standortGruppeID) {
                            return this.dialogService.confirm(
                                this.i18nService.translate('Confirmation'),
                                this.i18nService.translate('lp_dhcp_cluster_target_inuse', { key: '$0', value: group.targetOne.standortGruppe })
                            ).afterDismissResult().pipe(
                                switchMap(() => this.actuallyEditTarget(group, target, true))
                            );
                        } else {
                            return this.actuallyEditTarget(group, target, false);
                        }
                    }
                };
                this.dialogService.custom<boolean, GenericDialogComponentData<XoAddSitegroup>, GenericDialogComponent<XoAddSitegroup>>(GenericDialogComponent, data);
            }
        });
    }

    private actuallyEditTarget(data: XoAddSitegroup, target: number, targetAlreadyUsed: boolean = false): Observable<boolean> {

        const ret: Subject<boolean> = new Subject();

        const nullTarget: XoTarget = new XoTarget();
        nullTarget.standortGruppeID = 'NULL';
        const nullGroup: XoSiteGroup = new XoSiteGroup();
        nullGroup.standortGruppeID = 'NULL';
        let oldTarget: XoTarget;
        if (target === 1) {
            oldTarget = this.targetOne;
        } else if (target === 2) {
            oldTarget = this.targetTwo;
        }
        if (!oldTarget.targetID) {
            oldTarget.targetID = '0';
        }
        const siteTarget: XoTarget = new XoTarget();
        siteTarget.standortGruppeID = this.injectedData.siteGroupID;
        const siteGroup: XoSiteGroup = new XoSiteGroup();
        siteGroup.standortGruppeID = this.injectedData.siteGroupID;
        const newtarget = new XoTarget();
        newtarget.targetID = data.targetOne.targetID;

        (targetAlreadyUsed
            ? this.apiService.startOrderWithHeader('internal', WORKFLOWS.changeTargetsDCHPCluster, [newtarget, siteGroup], XoUpdateRowPkIgnoreEmptyOutput)
            : combineLatest([
                this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetUpdateRowIgnoreEmpty, [oldTarget, nullTarget], XoUpdateRowPkIgnoreEmptyOutput),
                this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetUpdateRowIgnoreEmpty, [newtarget, siteTarget], XoUpdateRowPkIgnoreEmptyOutput)
            ]).pipe(map(results => results[1]))
        ).subscribe({
            next: () => ret.next(true),
            error: () => ret.next(false)
        }).add(() => {
            this.refresh();
            ret.complete();
        });

        return ret.asObservable();
    }

    addNetwork() {

        const payload = new XoAddNetwork();
        payload.network = new XoSharedNetwork();
        payload.cpednsDropDownOptions = new XoOptionsArray();
        payload.standortDropDownOptions = new XoOptionsArray();
        this.fillDataWrapper(payload).subscribe({
            next: bol => {
                if (bol) {
                    const data: GenericDialogComponentData<XoAddNetwork> = {
                        data: payload,
                        def: [<Definition>{ label: 'DHCP-Relay *', dataPath: 'network.sharedNetwork', type: 'text', validatorFn: [XcFormValidatorRequired(), XcFormValidatorPattern(/^[^ ]*$/)] },
                            <Definition>{ label: 'Site', dataPath: 'network.standortID', type: 'dropDown', possibleValueDataPath: '%0%.standortDropDownOptions' },
                            <Definition>{ label: 'CPE-DNS', dataPath: 'network.cpeDnsID', type: 'dropDown', possibleValueDataPath: '%0%.cpednsDropDownOptions' },
                            <Definition>{ label: 'Link-Addresses', dataPath: 'network.linkAddresses', type: 'textArea' }],
                        header: 'Add DHCP-Relay',
                        applyFunction: this.actuallyAddNetwork.bind(this)
                    };
                    this.dialogService.custom<boolean, GenericDialogComponentData<XoAddNetwork>, GenericDialogComponent<XoAddNetwork>>(GenericDialogComponent, data);
                }
            }
        });
    }

    private fillDataWrapper(payload: XoAddNetwork): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        const siteInput: XoSite = new XoSite();
        siteInput.standortGruppeID = '';
        combineLatest([
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.cpednsGetAllRows, rowsInput, XoCpednsList),
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.siteSearchRows, siteInput, XoSiteList)
        ]).subscribe({
            next: result => {
                const cpedns = result[0].output[1] as XoCpednsList;
                cpedns.row.data.forEach((value: XoCpedns) => {
                    const opt: XoOptions = new XoOptions();
                    opt.value = value.cpeDnsID;
                    opt.label = value.cpeDns;
                    payload.cpednsDropDownOptions.data.push(opt);
                });
                const sites = result[1].output[1] as XoSiteList;
                sites.row.data.filter((value: XoSite) => {
                    return !value.standortGruppeID;
                }).forEach((value: XoSite) => {
                    const opt: XoOptions = new XoOptions();
                    opt.value = value.standortID;
                    opt.label = value.name;
                    payload.standortDropDownOptions.data.push(opt);
                });
                this.refresh();
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

    private actuallyAddNetwork(data: XoAddNetwork): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        const siteGroup: XoSiteGroup = new XoSiteGroup();
        siteGroup.standortGruppeID = this.injectedData.siteGroupID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.sharedNetworkInsertRows, [data.network, siteGroup], XoSharedNetwork).subscribe({
            next: result => {
                sub.next(true);
                this.listRefresh();
            },
            error: () => {
                sub.next(false);
            }
        }).add(() => {
            sub.complete();
        });

        return sub.asObservable();
    }

    export() {
        const exportInput: XoSiteGroup = new XoSiteGroup();
        exportInput.standortGruppeID = this.injectedData.siteGroupID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.exportDHCPConf, exportInput, XoManagedFileId).subscribe({
            next: result => {
                const out: XoManagedFileId = result.output[1] as XoManagedFileId;
                const fileID: XoManagedFileID = new XoManagedFileID();
                fileID.iD = out.id;

                const title = this.i18nService.translate('Export successful!');
                const message = this.i18nService.translate('Export assembled and ready for download.');
                this.dialogService.confirm(title, message).afterDismissResult().subscribe(
                    confirmation => {
                        if (confirmation) {
                            this.apiService.download(fileID);
                        }
                    }
                );
            }
        });
    }

    deploy() {

        const deployIt = () => {
            const deployInput: XoDeployDhcpdConfInputctype = new XoDeployDhcpdConfInputctype();
            deployInput.standortGruppeID = this.injectedData.siteGroupID;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.deployConf, deployInput, XoDhcpdConfResponsectype).subscribe({
                next: result => {
                    this.refresh();
                    this.dialogService.info(
                        this.i18nService.translate('Deployment successful'),
                        this.i18nService.translate('Deployment is completed successful.')
                    );
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to deploy this DHCP-Cluster?', deployIt.bind(this));
    }

    check() {

        const payload: XoCheckDhcpdConfInputctype = new XoCheckDhcpdConfInputctype();
        payload.standortGruppeID = this.injectedData.siteGroupID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.checkConf, payload, XoDhcpdConfResponsectype).subscribe({
            next: result => {
                this.dialogService.info(
                    this.i18nService.translate('Checking successful'),
                    this.i18nService.translate('Checking is completed successful.')
                );
            }
        });
    }

    save() {

        if (this.targetOne.targetID) {
            if (this.targetTwo.targetID) {
                combineLatest([
                    this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetUpdateRows, this.targetOne, XoTarget),
                    this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetUpdateRows, this.targetTwo, XoTarget)])
                    .subscribe({
                        next: result => {
                            this.targetOne = result[0].output[1] as XoTarget;
                            this.targetTwo = result[1].output[1] as XoTarget;
                            this.refresh();
                        }
                    });
            } else {
                this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetUpdateRows, this.targetOne, XoTarget).subscribe({
                    next: result => {
                        this.targetOne = result.output[1] as XoTarget;
                        this.refresh();
                    }
                });
            }
        }
    }

    refresh() {

        const targetInput: XoTarget = new XoTarget();
        targetInput.standortGruppeID = this.injectedData.siteGroupID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetSearchRows, targetInput, XoTargetList).subscribe({
            next: result => {
                const targetList: XoTargetList = result.output[1] as XoTargetList;

                if (targetList.row.length > 0) {
                    this.targetOne = targetList.row.data[0];
                    this.refreshConectedData(this.targetOne.connectDataID, true);
                    if (targetList.row.length > 1) {
                        this.targetTwo = targetList.row.data[1];
                        this.refreshConectedData(this.targetTwo.connectDataID, false);
                    } else {
                        this.targetTwo = new XoTarget();
                        this.connectedDataTwo = new XoConnectedData();
                    }
                } else {
                    this.targetOne = new XoTarget();
                    this.connectedDataOne = new XoConnectedData();
                    this.targetTwo = new XoTarget();
                    this.connectedDataTwo = new XoConnectedData();
                }
            }
        });

        this.listRefresh();
    }

    listRefresh() {
        this.refreshing = true;
        const siteGroupInput: XoSiteGroup = new XoSiteGroup();
        siteGroupInput.standortGruppeID = this.injectedData.siteGroupID;
        const siteInput: XoSite = new XoSite();
        siteInput.name = this._filterSite;
        const networkInput: XoSharedNetwork = new XoSharedNetwork();
        networkInput.standort = this._filterSite;
        networkInput.sharedNetwork = this._filterName;
        networkInput.migrationState = this._filterMigrationStatus;

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.sharedNetworkSearchRowsBySiteGroup, [siteGroupInput, siteInput, networkInput], [XoSiteArray, XoSharedNetworkArray]).subscribe({
            next: result => {
                const netList: XoSharedNetworkArray = result.output[2] as XoSharedNetworkArray;
                const netArray: XoSharedNetwork[] = netList.data.slice(0, this._maxListLegnth);
                this.richList = [netArray.map<XcRichListItem<StackItemRichListComponentData>>((value: XoSharedNetwork) => {
                    const migration: string = value.migrationState ? '(' + value.migrationState + ')' : '';
                    return super.constructRichListItem(value.sharedNetworkID, [value.sharedNetwork, value.standort, migration], 'Delete DHCP-Relay', this.deleteSharedNetwork.bind(this), true, true);
                })];
                this.resetSelection();
            }
        }).add(() => {
            this.refreshing = false;
        });
    }

    private refreshConectedData(id: string, isOne: boolean) {
        const conectedDataInput: XoConnectedData = new XoConnectedData();
        conectedDataInput.connectDataID = id;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.connectedDataSearchRows, conectedDataInput, XoConnectedDataList).subscribe({
            next: result => {
                const out = result.output[1] as XoConnectedDataList;
                if (isOne) {
                    this.connectedDataOne = out.row.data[0];
                } else {
                    this.connectedDataTwo = out.row.data[0];
                }
            }
        });
    }
}
