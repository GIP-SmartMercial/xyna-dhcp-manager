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
import { XcComponentTemplate, XcCustomValidatorFunction, XcDialogService, XcFormValidatorCustom, XcRichListItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Observable } from 'rxjs/internal/Observable';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { Subject } from 'rxjs/internal/Subject';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { AttributeRichListComponentData } from '../../../../shared/generic-stack-item/attribute-rich-list/attribute-rich-list.component';
import { BasicRichListData, GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { AddAttributeComponent, AddAttributeComponentData } from '../../../../shared/modals/add-attribute-dialog/add-attribute-dialog.component';
import { Attribute, FromArrayResult } from '../../../../shared/modals/add-attribute-dialog/attribute.model';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../../shared/modals/generic-dialog/generic-dialog.component';
import { XoOptions, XoOptionsArray } from '../../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { convertCIDRToNetmask, convertNetmaskToCIDR, PoolValidatorExclusions, PoolValidatorStartEnd, subnetLieInNetmask, validCIDR, validNetmask } from '../../../../shared/validator/validator';
import { XoRowListctype as XoGuiAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiAttribute/www/gip/com/juno/DHCP/WS/GuiAttribute/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoGuiFixedAttribute } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-ctype.model';
import { XoRowListctype as XoGuiFixedAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoPool } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pool/www/gip/com/juno/DHCP/WS/Pool/Messages/xo-row-ctype.model';
import { XoRowListctype as XoPoolList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pool/www/gip/com/juno/DHCP/WS/Pool/Messages/xo-row-list-ctype.model';
import { XoRowListctype as XoPoolTypeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoSubnet } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSubnetList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoAddPool } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-add-pool.model';
import { AttributeComponent, AttributeComponentData } from '../attribute/attribute.component';
import { PoolComponent, PoolComponentData } from '../pool/pool.component';


export interface SubnetComponentData extends GenericStackItemComponentData {

    subnetID: string;
}

@Component({
    templateUrl: './subnet.component.html',
    styleUrls: ['./subnet.component.scss']
})
export class SubnetComponent extends GenericStackItemComponent<SubnetComponentData> {

    subnet: XoSubnet = new XoSubnet();
    private _clone: XoSubnet = new XoSubnet();
    migrationID: string[] = new Array(1);
    private _attributes: Attribute[] = new Array<Attribute>();
    private _netmask: string;
    set netmask(val: string) {
        if (this._netmask !== val && validNetmask(val)) {
            this._cidr = convertNetmaskToCIDR(val);
            this.subnet.mask = val;
        }
        this._netmask = val;
    }
    get netmask(): string {
        return this._netmask;
    }
    private _cidr: number;
    set cidr(valSt: string) {
        if (valSt.startsWith('/')) {
            valSt = valSt.substring(1);
        }
        const val: number = parseInt(valSt, 10);
        if (this._cidr !== val && validCIDR(valSt)) {
            this._netmask = convertCIDRToNetmask(val);
            this.subnet.mask = this._netmask;
        }
        this._cidr = val;
    }
    get cidr(): string {
        return this._cidr ? '/' + this._cidr.toString(10) : '';
    }

    subnetValidator: XcCustomValidatorFunction = {
        onValidate: value => subnetLieInNetmask(value, this._netmask),
        errorText: 'This subnet lies not in the netmask.'
    };
    netmaskValidator: XcCustomValidatorFunction = {
        onValidate: validNetmask,
        errorText: 'This is not a valid netmask.'
    };
    CIDRValidator: XcCustomValidatorFunction = {
        onValidate: validCIDR,
        errorText: 'CIDR should be between 0 and 32.'
    };

    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Pool')) {
                    this.refreshPools();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit Subnet');
        this.richList = new Array<XcRichListItem<BasicRichListData>[]>(2);
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Subn' + this.injectedData.subnetID)) {
                    this.refresh();
                }
            }
        }));
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        if (id.startsWith('Pool')) {
            id = id.substring(4);
            return new XcComponentTemplate<PoolComponentData>(
                PoolComponent,
                {stackItem: item, communicationData: this.communicationData, poolID: id}
            );
        } else if (id.startsWith('Attr')) {
            id = id.substring(4);
            if (id.startsWith('Glob')) {
                id = id.substring(4);
                return new XcComponentTemplate<AttributeComponentData>(
                    AttributeComponent,
                    { stackItem: item, communicationData: this.communicationData, attributeId: id, isGlobal: true, saveFunction: this.saveAttribute.bind(this) }
                );
            } else if (id.startsWith('Loca')) {
                id = id.substring(4);
                const idVal: string[] = id.split('=>');

                return new XcComponentTemplate<AttributeComponentData>(
                    AttributeComponent,
                    { stackItem: item, communicationData: this.communicationData, attributeId: idVal[0], isGlobal: false, value: idVal[1], saveFunction: this.saveAttribute.bind(this) }
                );
            } else {
                throw new Error('Wrong ID');
            }
        } else {
            throw new Error('Wrong ID');
        }
    }

    addPool() {

        const payload = new XoAddPool();
        payload.pool = new XoPool();
        payload.pool.subnetID = this.subnet.subnetID;
        payload.pool.subnet = this.subnet.subnet;
        payload.pool.isDeployed = 'NO';
        payload.dropDownOptions = new XoOptionsArray();
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeGetAllRows, rowsInput, XoPoolTypeList).subscribe({
            next: result => {
                const pooltypeList = result.output[1] as XoPoolTypeList;
                pooltypeList.row.data.forEach(value => {
                    const opt: XoOptions = new XoOptions();
                    opt.value = value.poolTypeID;
                    opt.label = value.name;
                    payload.dropDownOptions.data.push(opt);
                });
                const data: GenericDialogComponentData<XoAddPool> = {
                    data: payload,
                    def: [<Definition>{ label: 'From', dataPath: 'pool.rangeStart', type: 'text', validatorFn: [XcFormValidatorCustom(PoolValidatorStartEnd, [payload.pool])] },
                        <Definition>{ label: 'To', dataPath: 'pool.rangeStop', type: 'text', validatorFn: [XcFormValidatorCustom(PoolValidatorStartEnd, [payload.pool])] },
                        <Definition>{ label: 'Pool-Type', dataPath: 'pool.poolTypeID', type: 'dropDown' },
                        <Definition>{ label: 'Target State', dataPath: 'targetState', type: 'checkBox' },
                        <Definition>{ label: 'Statistic', dataPath: 'statistic', type: 'checkBox' },
                        <Definition>{ label: 'Exclusions', dataPath: 'pool.exclusions', type: 'textArea', validatorFn: [XcFormValidatorCustom(PoolValidatorExclusions, [payload.pool])] }],
                    header: 'Add Pool',
                    applyFunction: this.actuallyAddPool.bind(this)
                };
                this.dialogService.custom<boolean, GenericDialogComponentData<XoAddPool>, GenericDialogComponent<XoAddPool>>(GenericDialogComponent, data);
            }
        });
    }

    private actuallyAddPool(data: XoAddPool): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        data.writeBooleans();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.poolInsertRows, data.pool, XoPool).subscribe({
            next: result => {
                sub.next(true);
                this.refreshPools();
            },
            error: () => {
                sub.next(false);
            }
        }).add(() => {
            sub.complete();
        });

        return sub.asObservable();
    }

    deletePool(id: string) {

        const deleteIt = () => {
            const deletePool: XoPool = new XoPool();
            deletePool.poolID = id.substring(4);
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.poolDeleteRows, deletePool, XoDeleteRowsOutput).subscribe({
                next: result => {
                    this.changeSubject.next('Pool' + deletePool.poolID);
                    this.refreshPools();
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Pool?', deleteIt.bind(this));
    }

    addAttribute() {

        const data: AddAttributeComponentData = {
            attributes: this._attributes,
            withForce: false,
            header: 'Add Attribute'
        };
        this.dialogService.custom<Attribute, AddAttributeComponentData, AddAttributeComponent>(AddAttributeComponent, data).afterDismissResult().subscribe({
            next: attribute => {
                if (attribute) {
                    this.saveAttribute(attribute);
                }
            }
        });
    }

    saveAttribute(attribute: Attribute) {

        if (attribute.isGlobal) {
            this._clone.fixedAttributes = attribute.integrateInString(this._clone.fixedAttributes);
            this.subnet.fixedAttributes = this._clone.fixedAttributes;

            const input: XoGuiFixedAttribute = new XoGuiFixedAttribute();
            input.guiFixedAttributeID = attribute.id;
            input.value = attribute.value;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiFixedAttributeUpdateRows, input, XoGuiFixedAttribute).subscribe({
                next: _ => {
                    // value and fixed boolean are part of the Id, but have not a count by reselection after refresh.
                    this.changeID((id) => {return id.includes('Glob' + attribute.id);}, this.buildAttributeID(attribute));
                    this.saveClone();
                }
            });
        } else {
            this._clone.attributes = attribute.integrateInString(this._clone.attributes);
            this.subnet.attributes = this._clone.attributes;
            // value and fixed boolean are part of the Id, but have not a count by reselection after refresh.
            this.changeID((id) => {return id.includes('Loca' + attribute.id);}, this.buildAttributeID(attribute));
            this.saveClone();
        }
    }

    deleteAttribute(attribute: Attribute) {
        const deleteIt = () => {
            if (attribute.isGlobal) {
                this._clone.fixedAttributes = attribute.eraseFromString(this._clone.fixedAttributes);
                this.subnet.fixedAttributes = this._clone.fixedAttributes;
                this.changeSubject.next('AttrGlob' + attribute.id);
            } else {
                this._clone.attributes = attribute.eraseFromString(this._clone.attributes);
                this.subnet.attributes = this._clone.attributes;
                this.changeSubject.next('AttrLoca' + attribute.id);
            }
            this.saveClone();
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Attribute?', deleteIt.bind(this));
    }

    private saveClone() {
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetUpdateRows, this._clone, XoSubnet).subscribe({
            next: result => {
                const out: XoSubnet = result.output[1] as XoSubnet;
                this.changeSubject.next('Subn' + out.subnetID);
                this.refreshAttributes();
            }
        });
    }

    save() {

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetUpdateRows, this.subnet, XoSubnet).subscribe({
            next: result => {
                const out: XoSubnet = result.output[1] as XoSubnet;
                this.changeSubject.next('Subn' + out.subnetID);
                this.refresh();
            }
        });
    }

    refresh() {

        this.refreshPools();

        const subnetInput: XoSubnet = new XoSubnet();
        subnetInput.subnetID = this.injectedData.subnetID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.subnetSearchRows, subnetInput, XoSubnetList).subscribe({
            next: result => {
                const subnetList = result.output[1] as XoSubnetList;
                if (subnetList.row.length === 1) {
                    this.subnet = subnetList.row.data[0];
                    this._clone = this.subnet.clone();
                    this.subnet.decode();
                    this.netmask = this.subnet.mask;
                    this.migrationID[0] = this.subnet.subnetID;
                    this.refreshAttributes();
                } else {
                    this.subnet = null;
                    this._clone = null;
                    this.close();
                }
            }
        });
    }

    private refreshPools() {
        const poolInput: XoPool = new XoPool();
        poolInput.subnetID = this.injectedData.subnetID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.poolSearchRows, poolInput, XoPoolList).subscribe({
            next: result => {
                const poolList: XoPoolList = result.output[1] as XoPoolList;
                this.richList[1] = poolList.row.data.map<XcRichListItem<StackItemRichListComponentData>>((value: XoPool) => {
                    const migration: string = value.migrationState ? '(' + value.migrationState + ')' : '';
                    return super.constructRichListItem('Pool' + value.poolID, [value.rangeStart, value.rangeStop, value.poolType, migration], 'Delete Pool', this.deletePool.bind(this));
                });
                this.resetSelection();
            }
        });
    }

    private refreshAttributes() {
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        combineLatest([
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiFixedAttributeGetAllRows, rowsInput, XoGuiFixedAttributeList),
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiAttributeGetAllRows, rowsInput, XoGuiAttributeList)])
            .subscribe({
                next: result => {
                    const fixedAttributes: XoGuiFixedAttributeList = result[0].output[1] as XoGuiFixedAttributeList;
                    const attributes: XoGuiAttributeList = result[1].output[1] as XoGuiAttributeList;

                    const globalArrays: FromArrayResult = Attribute.globalFromXoArray(this.subnet.fixedAttributes, fixedAttributes.row.data);
                    const localArrays: FromArrayResult = Attribute.localFromXoArray(this.subnet.attributes, attributes.row.data);
                    this._attributes = localArrays.notInString.concat(globalArrays.notInString);

                    this.richList[0] = [].concat(
                        localArrays.inString.map<XcRichListItem<AttributeRichListComponentData>>(attribute => {
                            return super.constructAttributeRichListItem(this.buildAttributeID(attribute), attribute, 'Delete Attribute', this.deleteAttribute.bind(this));
                        }),
                        globalArrays.inString.map<XcRichListItem<AttributeRichListComponentData>>(attribute => {
                            return super.constructAttributeRichListItem(this.buildAttributeID(attribute), attribute, 'Delete Attribute', this.deleteAttribute.bind(this));
                        })
                    );
                    this.resetSelection();
                }
            });
        /*this._attributes.sort((a: Attribute, b: Attribute) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        });*/
    }

    private buildAttributeID(attribute: Attribute): string {
        return (attribute.force ? 'AttrForc' : 'Attr')
        + (attribute.isGlobal ? 'Glob' + attribute.id : 'Loca' + attribute.id + '=>' + attribute.value);
    }
}
