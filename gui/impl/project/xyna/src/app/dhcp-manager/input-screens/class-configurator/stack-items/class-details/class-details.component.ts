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

import { combineLatest } from 'rxjs/internal/observable/combineLatest';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { AttributeRichListComponentData } from '../../../../shared/generic-stack-item/attribute-rich-list/attribute-rich-list.component';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { AddAttributeComponent, AddAttributeComponentData } from '../../../../shared/modals/add-attribute-dialog/add-attribute-dialog.component';
import { Attribute, FromArrayResult } from '../../../../shared/modals/add-attribute-dialog/attribute.model';
import { XoOptions, XoOptionsArray } from '../../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype1 as XoClass, XoRowctype1Array as XoClassArray } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Class0/www/gip/com/juno/DHCP/WS/Class0/Messages/xo-row-ctype1.model';
import { XoRowctype as XoCondition } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-ctype.model';
import { XoRowListctype as XoConditionList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-list-ctype.model';
import { XoRowListctype as XoGuiAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiAttribute/www/gip/com/juno/DHCP/WS/GuiAttribute/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoGuiFixedAttribute } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-ctype.model';
import { XoRowListctype as XoGuiFixedAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-list-ctype.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { AttributeComponent, AttributeComponentData } from '../../../network-configurator/stack-items/attribute/attribute.component';
import { ConditionBuilderComponent, ConditionBuilderComponentData } from '../../modals/condition-builder/condition-builder.component';


export interface ClassDetailsComponentData extends GenericStackItemComponentData {

    classID: string;
}

export const negationOptions: XoOptionsArray = XoOptionsArray.fromArray([XoOptions.buildOption('allow', 'allow'), XoOptions.buildOption('deny', 'deny')]);

@Component({
    templateUrl: './class-details.component.html',
    styleUrls: ['./class-details.component.scss']
})
export class ClassDetailsComponent extends GenericStackItemComponent<ClassDetailsComponentData> {

    class: XoClass =  new XoClass();
    conditional: string;
    private _condition: XoCondition[] = [];
    private _clone: XoClass = new XoClass();
    private _attributes: Attribute[] = new Array<Attribute>();

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit Class');
        this.subscriptions.push(this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (id.startsWith('Clas' + this.injectedData.classID)) {
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
                        withForce: true, isForced: isForced, saveFunction: this.saveAttribute.bind(this)}
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
        } else {
            throw new Error('Wrong ID');
        }
    }

    editCondition() {

        const data: ConditionBuilderComponentData = {existingCondition: this.conditional, conditions: this._condition};
        this.dialogService.custom<string, ConditionBuilderComponentData, ConditionBuilderComponent>(ConditionBuilderComponent, data).afterDismissResult().subscribe({
            next: condition => {
                if (condition) {
                    this.conditional = condition;
                    this.writeConditional();
                    this.saveClone();
                }
            }
        });
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
            this.class.fixedAttributes = this._clone.fixedAttributes;

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
            this.class.attributes = this._clone.attributes;
            // value and fixed boolean are part of the Id, but have not a count by reselection after refresh.
            this.changeID((id) => {return id.includes('Loca' + attribute.id);}, this.buildAttributeID(attribute));
            this.saveClone();
        }
    }

    deleteAttribute(attribute: Attribute) {

        const deleteIt = () => {
            if (attribute.isGlobal) {
                this._clone.fixedAttributes = attribute.eraseFromString(this._clone.fixedAttributes);
                this.class.fixedAttributes = this._clone.fixedAttributes;
                this.changeSubject.next('AttrGlob' + attribute.id);
            } else {
                this._clone.attributes = attribute.eraseFromString(this._clone.attributes);
                this.class.attributes = this._clone.attributes;
                this.changeSubject.next('AttrLoca' + attribute.id);
            }
            this.saveClone();
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this Attribute?', deleteIt.bind(this));
    }

    private saveClone() {
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.classUpdateRows, this._clone, XoClass).subscribe({
            next: result => {
                const out: XoClass = result.output[1] as XoClass;
                this.changeSubject.next('Clas' + out.classID);
            }
        }).add(() => {
            this.refresh(true);
        });
    }

    save() {

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.classUpdateRows, this.class, XoClass).subscribe({
            next: result => {
                const out: XoClass = result.output[1] as XoClass;
                this.changeSubject.next('Clas' + out.classID);
            }
        }).add(() => {
            this.refresh();
        });
    }

    refresh(onlyClone: boolean = false) {

        const searchInput: XoClass = new XoClass();
        searchInput.classID = this.injectedData.classID;
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.classSearchRows, searchInput, XoClassArray).subscribe({
            next: result => {
                const classArray: XoClassArray = result.output[1] as XoClassArray;
                if (classArray.length === 1) {
                    this._clone = classArray.data[0];
                    if (onlyClone) {
                        this.class.fixedAttributes = this._clone.fixedAttributes;
                        this.class.attributes = this._clone.attributes;
                        this.class.conditional = this._clone.conditional;
                    } else {
                        this.class = this._clone.clone();
                        this._clone.decode();
                    }
                    this.refreshConditions();
                    this.refreshAttributes();
                } else {
                    this.class = null;
                    this._clone = null;
                    this.close();
                }
            }
        });
    }

    refreshConditions() {

        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.conditionsGetAllRows, rowsInput, XoConditionList).subscribe({
            next: result => {
                const conditionList: XoConditionList = result.output[1] as XoConditionList;
                this._condition = conditionList.row.data;
                this.readConditional();
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

                    const globalArrays: FromArrayResult = Attribute.globalFromXoArray(this._clone.fixedAttributes, fixedAttributes.row.data);
                    const localArrays: FromArrayResult = Attribute.localFromXoArray(this._clone.attributes, attributes.row.data);
                    this._attributes = localArrays.notInString.concat(globalArrays.notInString);

                    this.richList = [[].concat(
                        localArrays.inString.map<XcRichListItem<AttributeRichListComponentData>>(attribute => {
                            return super.constructAttributeRichListItem(this.buildAttributeID(attribute), attribute, 'Delete Attribute', this.deleteAttribute.bind(this));
                        }),
                        globalArrays.inString.map<XcRichListItem<AttributeRichListComponentData>>(attribute => {
                            return super.constructAttributeRichListItem(this.buildAttributeID(attribute), attribute, 'Delete Attribute', this.deleteAttribute.bind(this));
                        })
                    )];
                    this.resetSelection();
                }
            });
    }

    private buildAttributeID(attribute: Attribute): string {
        return (attribute.force ? 'AttrForc' : 'Attr')
        + (attribute.isGlobal ? 'Glob' + attribute.id : 'Loca' + attribute.id + '=>' + attribute.value);
    }

    private writeConditional() {

        let replaceName: string = this.conditional;
        this._condition.forEach(cond => {
            const reg: RegExp = new RegExp('((?<=^| )' + this.escapeRegex(cond.name) + '(?=$| ))', 'gm');
            replaceName = replaceName.replace(reg, '<' + cond.conditionID + '>') ;
        });
        this._clone.conditional = replaceName;
        this.class.conditional = this._clone.conditional;
    }

    private readConditional() {

        let replaceID: string = this._clone.conditional;
        this._condition.forEach(cond => {
            const reg: RegExp = new RegExp('((?<=^| )<' + cond.conditionID + '>(?=$| ))', 'gm');
            replaceID = replaceID.replace(reg, cond.name) ;
        });
        this.conditional = replaceID;
    }

    private escapeRegex(string: string): string {
        // eslint-disable-next-line no-useless-escape
        return string.replace(/[-\/\\^$*+?.()\|[\]{}]/g, '\\$&');
    }
}
