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
import { XcAutocompleteDataWrapper, XcDialogComponent, XcOptionItem } from '@zeta/xc';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoOptionsRow } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DHCPOptions/www/gip/com/juno/DHCP/WS/Optionsv4/Messages/xo-row-ctype.model';


export interface EditNewDHCPOptionsModalData {
    row?: XoOptionsRow;
}

@Component({
    templateUrl: './edit-new-dhcp-options.component.html',
    styleUrls: ['./edit-new-dhcp-options.component.scss']
})
export class EditNewDHCPOptionsModalComponent extends XcDialogComponent<boolean, EditNewDHCPOptionsModalData> {

    private readonly _wf: string;
    // Change, if v6 is needed.
    private readonly _encodingTypes: XcOptionItem<string>[] = [
        { value: 'ACS',             name: 'ACS' },
        { value: 'Container',       name: 'Container' },
        { value: 'IpV4Address',     name: 'IpV4Address' },
        { value: 'IpV4AddressList', name: 'IpV4AddressList' },
        { value: 'MacAddress',      name: 'MacAddress' },
        { value: 'OctetString',     name: 'OctetString' },
        { value: 'UnsignedInteger', name: 'UnsignedInteger' },
        { value: 'ColonString',     name: 'ColonString' }
    ];

    // variable for html
    row: XoOptionsRow;
    title: string;
    busy = false;
    encodingDataWrapper: XcAutocompleteDataWrapper;
    get readOnly(): boolean {
        return this.row.readOnly === '1';
    }
    set readOnly(readOnly: boolean) {
        if (readOnly) {
            this.row.readOnly = '1';
        } else {
            this.row.readOnly = '0';
        }
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly i18nService: I18nService) {
        super(injector);
        if (this.injectedData.row) {
            this.row = this.injectedData.row;
            this._wf = WORKFLOWS.optionsUpdateRow;
            this.title = this.i18nService.translate('Add option');
        } else {
            this.row = new XoOptionsRow();
            this.row.valueDataTypeName = this._encodingTypes[0].value;
            this.row.readOnly = '0';
            this._wf = WORKFLOWS.optionsInsertRow;
            this.title = this.i18nService.translate('Edit option');
        }

        this.encodingDataWrapper = new XcAutocompleteDataWrapper(
            () => this.row.valueDataTypeName,
            value => this.row.valueDataTypeName = value,
            this._encodingTypes
        );
    }

    apply() {
        this.busy = true;
        this.apiService.startOrderWithHeader('internal', this._wf, this.row, XoOptionsRow).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    this.dismiss(true);
                }
            },
            complete: () => this.busy = false
        });
    }

}
