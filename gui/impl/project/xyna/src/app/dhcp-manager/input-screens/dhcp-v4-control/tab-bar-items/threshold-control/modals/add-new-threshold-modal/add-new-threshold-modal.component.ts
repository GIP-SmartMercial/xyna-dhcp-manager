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
import { XcAutocompleteDataWrapper, XcDialogComponent } from '@zeta/xc';

import { Observable } from 'rxjs/internal/Observable';
import { concat } from 'rxjs/internal/observable/concat';

import { DHCPApiService } from '../../../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../../../shared/routes.const';
import { XoThresholdType } from '../../../../../../xo/xmcp/dhcp/v4/control/thresholdcontrol/xo-threshold-type.model';
import { XoResponsectype } from '../../../../../../xo/xmcp/dhcp/v4/datatypes/generated/PoolUsageThreshold/www/gip/com/juno/SnmpTrap/WS/PoolUsageThreshold/Messages/xo-response-ctype.model';


export interface AddNewThresholdModalData {
    dHCPRelayToSharedNetworkIDMap: Map<string, string>;
    fillDHCPRelayDataWrapper: (dataWrapper: XcAutocompleteDataWrapper) => Observable<void>;
    poolTypeToPoolTypeIDMap: Map<string, string>;
    fillPoolTypeDataWrapper: (dataWrapper: XcAutocompleteDataWrapper) => Observable<void>;
}

@Component({
    templateUrl: './add-new-threshold-modal.component.html',
    styleUrls: ['./add-new-threshold-modal.component.scss']
})
export class AddNewThresholdModalComponent extends XcDialogComponent<boolean, AddNewThresholdModalData> {

    threshold: XoThresholdType = new XoThresholdType();
    busy = false;

    dHCPRelayDataWrapper = new XcAutocompleteDataWrapper(
        () => this.threshold.dHCPRelay,
        value => {
            this.threshold.dHCPRelay = value;
            this.threshold.sharedNetworkID = this.injectedData.dHCPRelayToSharedNetworkIDMap.get(value);
        }
    );

    poolTypeDataWrapper = new XcAutocompleteDataWrapper(
        () => this.threshold.poolType,
        value => {
            this.threshold.poolType = value;
            this.threshold.pooltypeID = this.injectedData.poolTypeToPoolTypeIDMap.get(value);
        }
    );

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly i18nService: I18nService) {
        super(injector);
        this.busy = true;
        const concatSub = concat(
            this.injectedData.fillDHCPRelayDataWrapper(this.dHCPRelayDataWrapper),
            this.injectedData.fillPoolTypeDataWrapper(this.poolTypeDataWrapper)
        ).subscribe({
            complete: () => {
                this.busy = false;
                if (!concatSub.closed) {
                    concatSub.unsubscribe();
                }
            }
        });

    }

    apply() {
        this.busy = true;

        this.apiService.startOrder('internal', WORKFLOWS.threshInsert, this.threshold, XoResponsectype).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    this.dismiss(true);
                }
            },
            complete: () => this.busy = false
        });
    }

}
