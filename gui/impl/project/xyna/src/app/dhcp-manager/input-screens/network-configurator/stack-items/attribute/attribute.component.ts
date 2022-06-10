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
import { XcAutocompleteDataWrapper, XcDialogService, XcOptionItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { WARNING } from '../../../../shared/modals/add-attribute-dialog/add-attribute-dialog.component';
import { Attribute, localValueRequirement } from '../../../../shared/modals/add-attribute-dialog/attribute.model';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoGuiAttribute } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiAttribute/www/gip/com/juno/DHCP/WS/GuiAttribute/Messages/xo-row-ctype.model';
import { XoRowListctype as XoGuiAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiAttribute/www/gip/com/juno/DHCP/WS/GuiAttribute/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoGuiFixedAttribute } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-ctype.model';
import { XoRowListctype as XoGuiFixedAttributeList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-list-ctype.model';


export interface AttributeComponentData extends GenericStackItemComponentData {

    attributeId: string;
    isGlobal: boolean;
    saveFunction: (attribute: Attribute) => void;
    value?: string;
    // is needed for pooltype/class Configurator
    withForce?: boolean;
    isForced?: boolean;
}

@Component({
    templateUrl: './attribute.component.html',
    styleUrls: ['./attribute.component.scss']
})
export class AttributeComponent extends GenericStackItemComponent<AttributeComponentData> {

    attribute: Attribute;
    comment: string;
    localValueValidtorPattern: RegExp = localValueRequirement;


    globalValueWrapper: XcAutocompleteDataWrapper<string> = new XcAutocompleteDataWrapper<string>(
        () => this.attribute.value,
        value => this.attribute.value = value
    );

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Edit Attribute');
        this.attribute = new Attribute(this.injectedData.attributeId, '', this.injectedData.isGlobal, '');
        this.comment = i18nService.translate(WARNING);
        this.injectedData.communicationData.changeObsDown.subscribe({
            next: id => {
                if (this.attribute.isGlobal) {
                    if (id.startsWith('AttrGlob' + this.attribute.id)) {
                        this.close();
                    }
                } else if (id.startsWith('AttrLoca' + this.attribute.id)) {
                    this.close();
                }
            }
        });
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return null;
    }

    save() {

        this.injectedData.saveFunction(this.attribute);
    }

    refresh() {

        if (this.injectedData.isGlobal) {

            const payload: XoGuiFixedAttribute = new XoGuiFixedAttribute();
            payload.guiFixedAttributeID = this.injectedData.attributeId;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiFixedAttributeSearchRows, payload, XoGuiFixedAttributeList).subscribe({
                next: result => {
                    const attributeList: XoGuiFixedAttributeList = result.output[1] as XoGuiFixedAttributeList;

                    if (attributeList.row.length === 1) {
                        const attr = attributeList.row.data[0];
                        this.attribute = new Attribute(attr.guiFixedAttributeID, attr.name, true, attr.value, attr.valueRange.split(','), this.injectedData.isForced);
                        this.globalValueWrapper.values = this.attribute.possibleValues.map(val => {
                            const ret: XcOptionItem<string> = {value: val, name: val};
                            return ret;
                        });
                        this.globalValueWrapper.update();

                    } else {
                        this.attribute = new Attribute(this.injectedData.attributeId, '', this.injectedData.isGlobal, '');
                        this.close();
                    }
                }
            });

        } else {

            const payload: XoGuiAttribute = new XoGuiAttribute();
            payload.guiAttributeID = this.injectedData.attributeId;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.GuiAttributeSearchRows, payload, XoGuiAttributeList).subscribe({
                next: result => {
                    const attributeList: XoGuiAttributeList = result.output[1] as XoGuiAttributeList;

                    if (attributeList.row.length === 1) {
                        const attr = attributeList.row.data[0];
                        this.attribute = new Attribute(attr.guiAttributeID, attr.name, false, this.injectedData.value, [], this.injectedData.isForced);

                    } else {
                        this.attribute = new Attribute(this.injectedData.attributeId, '', this.injectedData.isGlobal, '');
                        this.close();
                    }
                }
            });
        }
    }
}
