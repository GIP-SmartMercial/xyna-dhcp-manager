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
import { XcAutocompleteDataWrapper, XcComponentTemplate, XcCustomValidatorFunction, XcDialogService, XcFormValidatorCustom, XcFormValidatorRequired, XcOptionItem, XcRichListItem, XcTemplate, XDSIconName } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../../shared/modals/generic-dialog/generic-dialog.component';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { ipv4RegExp, PoolValidatorExclusions, PoolValidatorStartEnd } from '../../../../shared/validator/validator';
import { XoRowctype as XoPool } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pool/www/gip/com/juno/DHCP/WS/Pool/Messages/xo-row-ctype.model';
import { XoRowListctype as XoPoolList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pool/www/gip/com/juno/DHCP/WS/Pool/Messages/xo-row-list-ctype.model';
import { XoRowListctype as XoPoolTypeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoHost } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/StaticHost/www/gip/com/juno/DHCP/WS/StaticHost/Messages/xo-row-ctype.model';
import { XoRowListctype as XoHostList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/StaticHost/www/gip/com/juno/DHCP/WS/StaticHost/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { StaticHostComponent, StaticHostComponentData } from '../static-host/static-host.component';


export interface PoolComponentData extends GenericStackItemComponentData {

    poolID: string;
}

@Component({
    templateUrl: './pool.component.html',
    styleUrls: ['./pool.component.scss']
})
export class PoolComponent extends GenericStackItemComponent<PoolComponentData> {

    pool: XoPool = new XoPool();
    migrationID: string[] = new Array(1);

    // Booleans
    set statistic(val: boolean) {
        if (val) {
            this.pool.useForStatistics = 'yes';
        } else {
            this.pool.useForStatistics = 'no';
        }
    }
    get statistic(): boolean {
        if (!this.pool.useForStatistics) {
            return false;
        }
        return this.pool.useForStatistics.toLocaleLowerCase() === 'yes';
    }

    set targetState(val: boolean) {
        if (val) {
            this.pool.targetState = 'active';
        } else {
            this.pool.targetState = 'inactive';
        }
    }
    get targetState(): boolean {
        if (!this.pool.targetState) {
            return false;
        }
        return this.pool.targetState.toLocaleLowerCase() === 'active';
    }

    get deployedIcon(): XDSIconName {
        if (this.pool.isDeployed && this.pool.isDeployed.toLocaleLowerCase() === 'yes') {
            return XDSIconName.CHECKED;
        } else {
            return XDSIconName.MSGWARNING;
        }
    }

    // DataWrapper
    pooltypeWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.pool.poolTypeID,
        value => {
            this.pool.poolTypeID = value;
            this.pool.poolType = this.pooltypeWrapper.value.name;
        }
    );

    // Pool Validator
    validatorMap: Map<string, {validator: XcCustomValidatorFunction, args: any[]}> = new Map([
        ['poolStart', {validator: PoolValidatorStartEnd, args: new Array<string>(1)}],
        ['poolEnd', {validator: PoolValidatorStartEnd, args: new Array<string>(1)}],
        ['exclusions', {validator: PoolValidatorExclusions, args: new Array<string>(1)}]
    ]);

    // Host Validator
    ipNeededValidator: XcCustomValidatorFunction = {
        onValidate: (value, args) => {
            if (!value) {
                return (args[0] as XoHost).dynamicDnsActive === 'true';
            }
            return ipv4RegExp.test(value);
        },
        errorText: 'IP is required, if dynamic dns is inactive.'
    };

    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Host')) {
                    this.listRefresh();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit Pool');
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Pool' + this.injectedData.poolID)) {
                    this.refresh();
                }
            }
        }));
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<StaticHostComponentData>(
            StaticHostComponent,
            {stackItem: item, communicationData: this.communicationData, hostID: id}
        );
    }

    deleteHost(id: string) {
        const deleteIt = () => {
            const deleteHost: XoHost = new XoHost();
            deleteHost.staticHostID = id;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.hostDeleteRows, deleteHost, XoDeleteRowsOutput).subscribe({
                next: result => {
                    this.changeSubject.next('Host' + id);
                    this.listRefresh();
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Static Host?', deleteIt.bind(this));
    }

    save() {
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.poolUpdateRows, this.pool, XoPool).subscribe({
            next: result => {
                const out: XoPool = result.output[1] as XoPool;
                this.changeSubject.next('Pool' + out.poolID);
                this.refresh();
            }
        });
    }

    addHost() {

        const hostInput: XoHost = new XoHost();
        hostInput.assignedPoolID = this.pool.poolID;
        hostInput.subnetID = this.pool.subnetID;
        hostInput.deployed1 = 'NO';
        hostInput.deployed2 = 'NO';
        hostInput.dynamicDnsActive = 'false';
        const data: GenericDialogComponentData<XoHost> = {
            data: hostInput,
            def: [<Definition>{ label: 'Mac *', dataPath: 'cpe_mac', type: 'text', validatorFn: [XcFormValidatorRequired()] },
                <Definition>{ label: 'Hostname *', dataPath: 'hostname', type: 'text', validatorFn: [XcFormValidatorRequired()] },
                <Definition>{ label: 'Remote ID', dataPath: 'remoteId', type: 'text' },
                <Definition>{ label: 'Ip', dataPath: 'ip', type: 'text', validatorFn: [XcFormValidatorCustom(this.ipNeededValidator, [hostInput])] },
                <Definition>{ label: 'Config Description', dataPath: 'configDescr', type: 'textArea' }],
            header: 'Add Static Host',
            applyFunction: this.actuallyAddHost.bind(this)
        };
        this.dialogService.custom<boolean, GenericDialogComponentData<XoHost>, GenericDialogComponent<XoHost>>(GenericDialogComponent, data);
    }

    private actuallyAddHost(data: XoHost): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.hostInsertRows, data, XoHost).subscribe({
            next: _ => {
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

    refresh() {

        this.listRefresh();

        const poolInput: XoPool = new XoPool();
        poolInput.poolID = this.injectedData.poolID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.poolSearchRows, poolInput, XoPoolList).subscribe({
            next: result => {
                const poolList: XoPoolList = result.output[1] as XoPoolList;
                if (poolList.row.length === 1) {
                    this.pool = poolList.row.data[0];
                    this.fillValidatorData();
                    this.migrationID[0] = this.pool.poolID;
                } else {
                    this.pool = null;
                    this.close();
                }
            }
        });

        this.fillDataWrapper();
    }

    private listRefresh() {
        const hostInput: XoHost = new XoHost();
        hostInput.assignedPoolID = this.injectedData.poolID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.hostSearchRows, hostInput, XoHostList).subscribe({
            next: result => {
                const hostList: XoHostList = result.output[1] as XoHostList;
                this.richList = [hostList.row.data.map<XcRichListItem<StackItemRichListComponentData>>((value: XoHost) => {
                    return super.constructRichListItem(value.staticHostID, [value.hostname, value.ip, value.cpe_mac], 'Delete Host', this.deleteHost.bind(this));
                })];
                this.resetSelection();
            }
        });
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

    private fillValidatorData() {
        this.validatorMap.get('poolStart').args[0] = this.pool;
        this.validatorMap.get('poolEnd').args[0] = this.pool;
        this.validatorMap.get('exclusions').args[0] = this.pool;
    }
}
