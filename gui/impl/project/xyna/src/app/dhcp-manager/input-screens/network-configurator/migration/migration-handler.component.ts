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
import { Component, Input } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcAutocompleteDataWrapper, XcDialogService, XDSIconName } from '@zeta/xc';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

import { DHCPApiService } from '../../../shared/classes/dhcp-api.service';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../shared/modals/generic-dialog/generic-dialog.component';
import { XoOptions, XoOptionsArray } from '../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { WORKFLOWS } from '../../../shared/routes.const';
import { XoDhcpdConfResponsectype as XoResponse } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-dhcpd-conf-response-ctype.model';
import { XoMigrationTargetIdentifierctype } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/DhcpdConf/www/gip/com/juno/Gui/WS/Messages/xo-migration-target-identifier-ctype.model';
import { XoRowctype as XoNetwork, XoRowctypeArray as XoNetworkArray } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/SharedNetwork/www/gip/com/juno/DHCP/WS/SharedNetwork/Messages/xo-row-ctype.model';
import { XoRowListctype as XoNetworkList } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/SharedNetwork/www/gip/com/juno/DHCP/WS/SharedNetwork/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSiteGroup } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/Standortgruppe/www/gip/com/juno/DHCP/WS/Standortgruppe/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSiteGroupList } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/Standortgruppe/www/gip/com/juno/DHCP/WS/Standortgruppe/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSubnet } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSubnetList } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoErrorProtocol } from '../../../xo/xmcp/dhcp/v4/network-configurator/xo-error-protocol.model';
import { XoMigrationTarget } from '../../../xo/xmcp/dhcp/v4/network-configurator/xo-migration-target.model';


@Component({
    selector: 'migration-handler',
    templateUrl: './migration-handler.component.html',
    styleUrls: ['./migration-handler.component.scss']
})
export class MigrationHandlerComponent {

    XDSIconName = XDSIconName;

    // type sharedNetwork, subnet, pool
    private _source: XoMigrationTargetIdentifierctype = new XoMigrationTargetIdentifierctype();

    // type multiSharedNetwork
    private _sharedNetworks: XoNetworkArray;
    private set sharedNetwork(ids: string[]) {
        this._sharedNetworks = new XoNetworkArray();
        ids.forEach((id) => {
            const network: XoNetwork = new XoNetwork();
            network.sharedNetworkID = id;
            this._sharedNetworks.append(network);
        });
    }

    private _wf: string;
    migrationDataWrapper: XcAutocompleteDataWrapper<string>;

    constructor(private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, private readonly i18nService: I18nService) {

    }

    @Input('migration-type')
    set migrationType(type: string) {

        this._source.targetType = type;

        if (type === 'multiSharedNetwork') {

            this._wf = WORKFLOWS.migrateDuplicateAndMove;

            this.migrationDataWrapper = new XcAutocompleteDataWrapper<string>(
                () => this._wf,
                value => this._wf = value,
                [
                    { value: WORKFLOWS.migrateDuplicateAndMove, name: this.i18nService.translate('Duplication') },
                    { value: WORKFLOWS.migrateDeAndActivate, name: this.i18nService.translate('De-/Activation') },
                    { value: WORKFLOWS.migrateDeleteSharedNetworks, name: this.i18nService.translate('Delete') },
                ]
            );
        } else {

            this._wf = WORKFLOWS.migrateDuplicate;

            this.migrationDataWrapper = new XcAutocompleteDataWrapper<string>(
                () => this._wf,
                value => this._wf = value,
                [
                    { value: WORKFLOWS.migrateDuplicate, name: this.i18nService.translate('Duplication') },
                    { value: WORKFLOWS.migrateDeactivate, name: this.i18nService.translate('Deactivation') },
                    { value: WORKFLOWS.migrateActivate, name: this.i18nService.translate('Activation') },
                    { value: WORKFLOWS.migrateDelete, name: this.i18nService.translate('Delete') }
                ]
            );
        }
    }

    get migrationType(): string {
        return this._source.targetType;
    }

    @Input('selected-items')
    selectedItems: string[];

    get header(): string {

        if (this.migrationType === 'multiSharedNetwork') {
            return this.i18nService.translate('Migration') + '(' + this.selectedItems.length + ')';
        } else {
            return this.i18nService.translate('Migration');
        }
    }


    execute() {

        if (this.migrationType === 'multiSharedNetwork') {
            this.sharedNetwork = this.selectedItems;

            if (this._wf === WORKFLOWS.migrateDuplicateAndMove || this._wf === WORKFLOWS.migrateDeAndActivate) {
                const sub: Subject<boolean> = new Subject<boolean>();
                this.getTarget(sub.asObservable(), this._wf === WORKFLOWS.migrateDeAndActivate).subscribe({
                    next: target => {
                        if (target) {

                            const input: XoSiteGroup = new XoSiteGroup();
                            input.standortGruppeID = target.uniqueIdentifier;
                            this.apiService.startOrderWithHeader('internal', this._wf, [input, this._sharedNetworks], XoErrorProtocol).subscribe({
                                next: result => {
                                    const out: XoErrorProtocol = result.output[1] as XoErrorProtocol;
                                    sub.next(true);
                                    sub.complete();
                                    let message: string;
                                    let details: string;

                                    if (out.error.toUpperCase() === 'OK') {
                                        if (this._wf === WORKFLOWS.migrateDuplicateAndMove) {
                                            message = this.i18nService.translate('All Relay-Agents completely migrated.');
                                        } else if (this._wf === WORKFLOWS.migrateDeAndActivate) {
                                            if (input.standortGruppeID === '-1') {
                                                message = this.i18nService.translate('All Relay-Agents completely deactivated.');
                                            } else {
                                                message = this.i18nService.translate('All Relay-Agents completely deactivated and on target activated.');
                                            }
                                        }
                                        details = null;

                                    } else {
                                        message = out.successfully + '/' + out.overall + ' ';
                                        if (this._wf === WORKFLOWS.migrateDuplicateAndMove) {
                                            message = message + this.i18nService.translate('Relay-Agents successfully migrated.');
                                        } else if (this._wf === WORKFLOWS.migrateDeAndActivate) {
                                            if (input.standortGruppeID === '-1') {
                                                message = message + this.i18nService.translate('Relay-Agents successfully deactivated.');
                                            } else {
                                                message = message + this.i18nService.translate('Relay-Agents successfully deactivated and on target activated.');
                                            }
                                        }
                                        details = out.error;
                                    }

                                    this.dialogService.info(this.i18nService.translate('Error Protocol'), message, null, details);
                                },
                                error: () => {
                                    sub.next(false);
                                    sub.complete();
                                }
                            });
                        } else {
                            sub.next(false);
                            sub.complete();
                        }
                    },
                    error: () => {
                        sub.next(false);
                        sub.complete();
                    }
                });

            } else {
                this.apiService.startOrderWithHeader('internal', this._wf, this._sharedNetworks, XoErrorProtocol).subscribe({
                    next: result => {
                        const out: XoErrorProtocol = result.output[1] as XoErrorProtocol;
                        let message: string;
                        let details: string;
                        if (out.error.toUpperCase() === 'OK') {
                            message = this.i18nService.translate('All Relay-Agents completely deleted.');
                            details = null;
                        } else {
                            message = out.successfully + '/' + out.overall + ' ' + this.i18nService.translate('Relay-Agents successfully deleted.');
                            details = out.error;
                        }
                        this.dialogService.info(this.i18nService.translate('Error Protocol'), message, null, details);
                    }
                });
            }
        } else {
            this._source.uniqueIdentifier = this.selectedItems[0];

            if (this._wf === WORKFLOWS.migrateDuplicate) {

                const sub: Subject<boolean> = new Subject<boolean>();
                this.getTarget(sub.asObservable()).subscribe({
                    next: target => {
                        if (target) {

                            this.apiService.startOrderWithHeader('internal', this._wf, [this._source, target], XoResponse).subscribe({
                                next: result => {
                                    sub.next(true);
                                    sub.complete();
                                    this.dialogService.info(this.i18nService.translate('Migration'), this.i18nService.translate('Relay-Agent succssesfully duplicated.'));
                                },
                                error: () => {
                                    sub.next(false);
                                    sub.complete();
                                }
                            });
                        } else {
                            sub.next(false);
                            sub.complete();
                        }
                    },
                    error: () => {
                        sub.next(false);
                        sub.complete();
                    }
                });

            } else {

                this.apiService.startOrderWithHeader('internal', this._wf, this._source, XoResponse).subscribe({
                    next: result => {
                        if (this._wf === WORKFLOWS.migrateActivate) {
                            this.dialogService.info(this.i18nService.translate('Migration'), this.i18nService.translate('Relay-Agent succssesfully activated.'));
                        } else if (this._wf === WORKFLOWS.migrateDeactivate) {
                            this.dialogService.info(this.i18nService.translate('Migration'), this.i18nService.translate('Relay-Agent succssesfully deactivated.'));
                        } else if (this._wf === WORKFLOWS.migrateDelete) {
                            this.dialogService.info(this.i18nService.translate('Migration'), this.i18nService.translate('Relay-Agent succssesfully deleted.'));
                        }
                    }
                });

            }
        }
    }

    private getTarget(workflowObservable: Observable<boolean>, allowEmptyTarget: boolean = false): Observable<XoMigrationTargetIdentifierctype> {

        const sub: Subject<XoMigrationTargetIdentifierctype> = new Subject<XoMigrationTargetIdentifierctype>();
        const target: XoMigrationTarget = new XoMigrationTarget();
        target.migrationTarget = new XoMigrationTargetIdentifierctype();
        target.dropDownOptions = new XoOptionsArray();
        if (allowEmptyTarget) {
            const opt: XoOptions = new XoOptions();
            opt.value = '-1';
            opt.label = '';
            target.dropDownOptions.data.push(opt);
        }

        const getAllInput: XoGetAllRowsInput = new XoGetAllRowsInput();

        if (this._source.targetType === 'sharedNetwork' || this._source.targetType === 'multiSharedNetwork') {
            target.migrationTarget.targetType = 'standortgruppe';

            this.apiService.startOrderWithHeader('internal', WORKFLOWS.siteGroupGetAllRows, getAllInput, XoSiteGroupList).subscribe({
                next: result => {
                    const out: XoSiteGroupList = result.output[1] as XoSiteGroupList;

                    out.row.data.forEach((value: XoSiteGroup) => {
                        const opt: XoOptions = new XoOptions();
                        opt.value = value.standortGruppeID;
                        opt.label = value.name;
                        target.dropDownOptions.data.push(opt);
                    });

                    this.startMigrationDialog(workflowObservable, target, sub);
                },
                error: () => {
                    sub.error(null);
                }
            });

        } else if (this._source.targetType === 'subnet') {
            target.migrationTarget.targetType = 'sharedNetwork';

            this.apiService.startOrderWithHeader('internal', WORKFLOWS.sharedNetworkGetAllRows, getAllInput, XoNetworkList).subscribe({
                next: result => {
                    const out: XoNetworkList = result.output[1] as XoNetworkList;

                    out.row.data.forEach((value: XoNetwork) => {
                        const opt: XoOptions = new XoOptions();
                        opt.value = value.sharedNetworkID;
                        opt.label = value.sharedNetwork;
                        target.dropDownOptions.data.push(opt);
                    });

                    this.startMigrationDialog(workflowObservable, target, sub);
                },
                error: () => {
                    sub.error(null);
                }
            });

        } else if (this._source.targetType === 'pool') {
            target.migrationTarget.targetType = 'subnet';

            this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetGetAllRows, getAllInput, XoSubnetList).subscribe({
                next: result => {
                    const out: XoSubnetList = result.output[1] as XoSubnetList;

                    out.row.data.forEach((value: XoSubnet) => {
                        const opt: XoOptions = new XoOptions();
                        opt.value = value.subnetID;
                        opt.label = value.subnet;
                        target.dropDownOptions.data.push(opt);
                    });

                    this.startMigrationDialog(workflowObservable, target, sub);
                },
                error: () => {
                    sub.error(null);
                }
            });

        } else {
            sub.error(null);
        }
        return sub.asObservable();
    }

    private startMigrationDialog(workflowObservable: Observable<boolean>, target: XoMigrationTarget, sub: Subject<XoMigrationTargetIdentifierctype>) {

        const data: GenericDialogComponentData<XoMigrationTarget> = {
            data: target,
            def: [<Definition>{ label: 'Migrate to', dataPath: 'migrationTarget.uniqueIdentifier', type: 'dropDown'}],
            header: 'Please choose the migration target',
            applyFunction: (migrationTarget: XoMigrationTarget) => {
                sub.next(migrationTarget.migrationTarget);
                return workflowObservable;
            }
        };
        this.dialogService.custom<boolean, GenericDialogComponentData<XoMigrationTarget>, GenericDialogComponent<XoMigrationTarget>>(GenericDialogComponent, data).afterDismissResult().subscribe({
            next: bol => {
                if (!bol) {
                    sub.next(null);
                }
                sub.complete();
            }
        });
    }
}