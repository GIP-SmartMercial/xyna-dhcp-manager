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
import { XcDialogComponent, XcRichListItem } from '@zeta/xc';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoColValuesDistinctctype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/CM/www/gip/com/juno/Gui/WS/Messages/xo-col-values-distinct-ctype.model';
import { XoDeployOnDPPResponsectype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DHCPOptions/www/gip/com/juno/DHCP/WS/Optionsv4/Messages/xo-deploy-on-dppresponse-ctype.model';
import { XoRowctype as XoOptionsRow } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/DHCPOptions/www/gip/com/juno/DHCP/WS/Optionsv4/Messages/xo-row-ctype.model';
import { XoDeployOnDPPInput } from '../../../../xo/xmcp/dhcp/v4/dhcp-options/xo-deploy-on-dpp-input.model';
import { XoGetLocationsInput } from '../../../../xo/xmcp/dhcp/v4/dhcp-options/xo-get-locations-input.model';
import { DeployRichListComponent, StringWithBoolean } from './deploy-rich-list/deploy-rich-list.component';


export interface DeployDHCPOptionsModalData {
    row: XoOptionsRow;
}

@Component({
    templateUrl: './deploy-dhcp-options.component.html',
    styleUrls: ['./deploy-dhcp-options.component.scss']
})
export class DeployDHCPOptionsModalComponent extends XcDialogComponent<boolean, DeployDHCPOptionsModalData> {

    busy: boolean;
    locationsList: XcRichListItem<StringWithBoolean>[];

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly i18nService: I18nService) {
        super(injector);

        this.busy = true;
        const payload: XoGetLocationsInput = new XoGetLocationsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.optionsGetLocations, payload, XoColValuesDistinctctype).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const response = result.output[1] as XoColValuesDistinctctype;
                    this.locationsList = response.value.
                    map<XcRichListItem<StringWithBoolean>>((value: string) => {
                        const location: XcRichListItem = {
                            component: DeployRichListComponent,
                            data: {location: value, checked: false}
                        };
                        return location;
                    });
                }
            },
            complete: () => this.busy = false
        });
    }

    checkAll() {
        this.locationsList.forEach((item: XcRichListItem<StringWithBoolean>) => {
            item.data.checked = true;
        });
    }

    apply() {

        this.busy = true;
        const payload: XoDeployOnDPPInput = new XoDeployOnDPPInput();
        payload.deployOnDPPInput = '';

        this.locationsList
            .filter(location => location.data?.checked)
            .forEach(location => payload.deployOnDPPInput = payload.deployOnDPPInput.concat(location.data?.location, ',')
        );

        if (payload.deployOnDPPInput.length > 0) {
            payload.deployOnDPPInput = payload.deployOnDPPInput.substring(0, payload.deployOnDPPInput.length - 1);
        }

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.optionsDeployOnDPP, payload, XoDeployOnDPPResponsectype).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    this.dismiss(true);
                }
            },
            complete: () => this.busy = false
        });
    }
}
