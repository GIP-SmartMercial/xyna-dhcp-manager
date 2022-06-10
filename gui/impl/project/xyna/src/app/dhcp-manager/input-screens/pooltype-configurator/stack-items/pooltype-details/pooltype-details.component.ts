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
import { XcAutocompleteDataWrapper, XcComponentTemplate, XcDialogService, XcRichListItem, XcTemplate } from '@zeta/xc';
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
import { XoRowListctype1 as XoClassList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Class0/www/gip/com/juno/DHCP/WS/Class0/Messages/xo-row-list-ctype1.model';
import { XoRowListctype as XoGuiAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiAttribute/www/gip/com/juno/DHCP/WS/GuiAttribute/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoGuiFixedAttribute } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-ctype.model';
import { XoRowListctype as XoGuiFixedAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoPoolType } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-ctype.model';
import { XoRowListctype as XoPoolTypeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoAddClassToPooltype } from '../../../../xo/xmcp/dhcp/v4/pooltype-configurator/xo-add-class-to-pooltype.model';
import { AttributeComponent, AttributeComponentData } from '../../../network-configurator/stack-items/attribute/attribute.component';


export interface PooltypeDetailsComponentData extends GenericStackItemComponentData {

    pooltypeID: string;
}

export const negationOptions: XoOptionsArray = XoOptionsArray.fromArray([XoOptions.buildOption('allow', 'allow'), XoOptions.buildOption('deny', 'deny')]);

@Component({
    templateUrl: './pooltype-details.component.html',
    styleUrls: ['./pooltype-details.component.scss']
})
export class PooltypeDetailsComponent extends GenericStackItemComponent<PooltypeDetailsComponentData> {

    pooltype: XoPoolType =  new XoPoolType();
    private _clone: XoPoolType = new XoPoolType();
    private _attributes: Attribute[] = new Array<Attribute>();

    set isDefault(val: boolean) {
        if (val) {
            this.pooltype.isDefault = 'yes';
        } else {
            this.pooltype.isDefault = 'no';
        }
    }
    get isDefault(): boolean {
        if (!this.pooltype.isDefault) {
            return false;
        }
        return this.pooltype.isDefault.toLocaleLowerCase() === 'yes';
    }

    negationWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.pooltype.negation,
        value => this.pooltype.negation = value,
        negationOptions.getOptionItems()
    );

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit Pooltpe');
        this.richList = new Array<XcRichListItem<BasicRichListData>[]>(2);
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Poty' + this.injectedData.pooltypeID)) {
                    this.refresh();
                }
            }
        }));
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {

        if (id.startsWith('Attr')) {
            id = id.substring(4);
            let isForced: boolean = false;
            if (id.startsWith('Forc')) {
                id = id.substring(4);
                isForced = true;
            }
            if (id.startsWith('Glob')) {
                id = id.substring(4);
                return new XcComponentTemplate<AttributeComponentData>(
                    AttributeComponent,
                    { stackItem: item, communicationData: this.communicationData, attributeId: id, isGlobal: true,
                        withForce: true, isForced: isForced, saveFunction: this.saveAttribute.bind(this) }
                );
            } else if (id.startsWith('Loca')) {
                id = id.substring(4);
                const idVal: string[] = id.split('=>');

                return new XcComponentTemplate<AttributeComponentData>(
                    AttributeComponent,
                    { stackItem: item, communicationData: this.communicationData, attributeId: idVal[0], isGlobal: false,
                        withForce: true, isForced: isForced, value: idVal[1], saveFunction: this.saveAttribute.bind(this) }
                );
            } else {
                throw new Error('Wrong ID');
            }
        } else if (id.startsWith('Clas')) {
            return null;
        } else {
            throw new Error('Wrong ID');
        }
    }

    addClass() {

        const payload = new XoAddClassToPooltype();
        payload.dropDownOptions = new XoOptionsArray();
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.classGetAllRows, rowsInput, XoClassList).subscribe({
            next: result => {
                const classList = result.output[1] as XoClassList;
                classList.row.data.filter(val => {
                    const reg: RegExp = new RegExp('(?:,|^)' + val.classID + '(?:,|$)');
                    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
                    return !this._clone.classIDs.match(reg);
                }).forEach(value => {
                    const opt: XoOptions = new XoOptions();
                    opt.value = value.classID;
                    opt.label = value.name;
                    payload.dropDownOptions.data.push(opt);
                });
                const data: GenericDialogComponentData<XoAddClassToPooltype> = {
                    data: payload,
                    def: [<Definition>{ label: 'Class name', dataPath: 'id', type: 'dropDown' }],
                    header: 'Add Class',
                    applyFunction: this.actuallyAddClass.bind(this)
                };
                this.dialogService.custom<boolean, GenericDialogComponentData<XoAddClassToPooltype>, GenericDialogComponent<XoAddClassToPooltype>>(GenericDialogComponent, data);
            }
        });
    }

    private actuallyAddClass(data: XoAddClassToPooltype): Observable<boolean> {
        const sub: Subject<boolean> = new Subject<boolean>();
        if (data.id) {

            if (this._clone.classIDs) {
                this._clone.classIDs = this._clone.classIDs + ',' + data.id;
            } else {
                this._clone.classIDs = data.id;
            }
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeUpdateRows, this._clone, XoPoolType).subscribe({
                next: _ => {
                    sub.next(true);
                },
                error: () => {
                    sub.next(false);
                }
            }).add(() => {
                sub.complete();
                this.refresh();
            });
        } else {
            sub.next(false);
            sub.complete();
        }
        return sub.asObservable();
    }

    deleteClass(id: string) {

        const deleteIt = () => {
            if (id.startsWith('Clas')) {
                id = id.substring(4);
                const reg: RegExp = new RegExp('(?:,|^)' + id + '(?:,|$)');
                this._clone.classIDs = this._clone.classIDs.replace(reg,
                    (match: string) => {
                        if (match.startsWith(',') && match.endsWith(',')) {
                            return ',';
                        } else {
                            return '';
                        }
                    }
                );
            } else {
                return;
            }
            this.saveClone();
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Class?', deleteIt.bind(this));
    }

    addAttribute() {

        const data: AddAttributeComponentData = {
            attributes: this._attributes,
            withForce: true,
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
            this.pooltype.fixedAttributes = this._clone.fixedAttributes;

            const input: XoGuiFixedAttribute = new XoGuiFixedAttribute();
            input.guiFixedAttributeID = attribute.id;
            input.value = attribute.value;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiFixedAttributeUpdateRows, input, XoGuiFixedAttribute).subscribe({
                next: result => {
                    // value and fixed boolean are part of the Id, but have not a count by reselection after refresh.
                    this.changeID((id) => {return id.includes('Glob' + attribute.id);}, this.buildAttributeID(attribute));
                    this.saveClone();
                }
            });
        } else {
            this._clone.attributes = attribute.integrateInString(this._clone.attributes);
            this.pooltype.attributes = this._clone.attributes;
            // value and fixed boolean are part of the Id, but have not a count by reselection after refresh.
            this.changeID((id) => {return id.includes('Loca' + attribute.id);}, this.buildAttributeID(attribute));
            this.saveClone();
        }
    }

    deleteAttribute(attribute: Attribute) {

        const deleteIt = () => {
            if (attribute.isGlobal) {
                this._clone.fixedAttributes = attribute.eraseFromString(this._clone.fixedAttributes);
                this.pooltype.fixedAttributes = this._clone.fixedAttributes;
                this.changeSubject.next('AttrGlob' + attribute.id);
            } else {
                this._clone.attributes = attribute.eraseFromString(this._clone.attributes);
                this.pooltype.attributes = this._clone.attributes;
                this.changeSubject.next('AttrLoca' + attribute.id);
            }
            this.saveClone();
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Attribute?', deleteIt.bind(this));
    }

    private saveClone() {
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeUpdateRows, this._clone, XoPoolType).subscribe({
            next: result => {
                const out: XoPoolType = result.output[1] as XoPoolType;
                this.changeSubject.next('Poty' + out.poolTypeID);
            }
        }).add(() => {
            this.refresh();
        });
    }

    save() {

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeUpdateRows, this.pooltype, XoPoolType).subscribe({
            next: result => {
                const out: XoPoolType = result.output[1] as XoPoolType;
                this.changeSubject.next('Poty' + out.poolTypeID);
            }
        }).add(() => {
            this.refresh();
        });
    }

    refresh() {

        const searchInput: XoPoolType = new XoPoolType();
        searchInput.poolTypeID = this.injectedData.pooltypeID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.pooltypeSearchRows, searchInput, XoPoolTypeList).subscribe({
            next: result => {
                const pooltypeList: XoPoolTypeList = result.output[1] as XoPoolTypeList;
                if (pooltypeList.row.length === 1) {
                    this.pooltype = pooltypeList.row.data[0];
                    this._clone = this.pooltype.clone();
                    this.pooltype.decode();
                    this.refreshAttributes();
                    this.refreshClass();
                    this.negationWrapper.update();
                } else {
                    this.pooltype = null;
                    this._clone = null;
                    this.close();
                }
            }
        });
    }

    private refreshClass() {
        if (this.pooltype.classIDs === '') {
            this.richList[0] = [];
        } else {
            const classIDList: string[] = this.pooltype.classIDs.split(',');
            const classNameList: string[] = this.pooltype.classes.split(',');

            this.richList[0] = classIDList.map<XcRichListItem<StackItemRichListComponentData>>((value: string, index: number) => {
                return super.constructRichListItem('Clas' + value, [classNameList[index]], 'Delete Class', this.deleteClass.bind(this), false);
            });
            this.resetSelection();
        }
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

                    const globalArrays: FromArrayResult = Attribute.globalFromXoArray(this.pooltype.fixedAttributes, fixedAttributes.row.data);
                    const localArrays: FromArrayResult = Attribute.localFromXoArray(this.pooltype.attributes, attributes.row.data);
                    this._attributes = localArrays.notInString.concat(globalArrays.notInString);

                    this.richList[1] = [].concat(
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
    }

    private buildAttributeID(attribute: Attribute): string {
        return (attribute.force ? 'AttrForc' : 'Attr')
        + (attribute.isGlobal ? 'Glob' + attribute.id : 'Loca' + attribute.id + '=>' + attribute.value);
    }
}
