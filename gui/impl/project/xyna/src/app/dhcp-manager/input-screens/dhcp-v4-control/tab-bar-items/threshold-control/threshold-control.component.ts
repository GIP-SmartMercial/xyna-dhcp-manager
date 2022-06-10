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

import { StartOrderResult } from '@zeta/api';
import { I18nService } from '@zeta/i18n';
import { XcAutocompleteDataWrapper, XcDialogService, XcOptionItem, XcOptionItemString, XcRemoteTableDataSource, XcTabComponent, XDSIconName } from '@zeta/xc';

import { Observable } from 'rxjs/';
import { filter, map, tap } from 'rxjs/operators';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoDHCPRelayNameArray } from '../../../../xo/xmcp/dhcp/v4/control/thresholdcontrol/xo-dhcprelay-name.model';
import { XoPooltypeNameArray } from '../../../../xo/xmcp/dhcp/v4/control/thresholdcontrol/xo-pooltype-name.model';
import { XoThresholdType, XoThresholdTypeArray } from '../../../../xo/xmcp/dhcp/v4/control/thresholdcontrol/xo-threshold-type.model';
import { XoResponsectype } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/PoolUsageThreshold/www/gip/com/juno/SnmpTrap/WS/PoolUsageThreshold/Messages/xo-response-ctype.model';
import { ControlTabBarComponentInterface } from '../../dhcp-v4-control.component';
import { AddNewThresholdModalComponent, AddNewThresholdModalData } from './modals/add-new-threshold-modal/add-new-threshold-modal.component';


@Component({
    templateUrl: './threshold-control.component.html',
    styleUrls: ['./threshold-control.component.scss']
})
export class ThresholdControlComponent extends XcTabComponent<void, any> implements ControlTabBarComponentInterface {

    tableDataSource: XcRemoteTableDataSource<XoThresholdType>;
    currentObject: XoThresholdType;
    untouchedCurrentObject: XoThresholdType;
    XDSIconName = XDSIconName;

    /**
     * XcTabComponents are initialized when they are added to the XcTabBarComponent, which
     * is too soon. If the tab is never to be used then code, which will cause server requests,
     * should never be processed. To do this, we use this flag.
     */
    hadNeverBeenSeen = true;

    busy = false;

    dHCPRelayToSharedNetworkIDMap = new Map<string, string>();
    dHCPRelayDataWrapper = new XcAutocompleteDataWrapper(
        () => this.currentObject ? this.currentObject.dHCPRelay : '',
        value => {
            if (this.currentObject) {
                this.currentObject.dHCPRelay = value;
                this.currentObject.sharedNetworkID = this.dHCPRelayToSharedNetworkIDMap.get(value);
            }
        }
    );
    poolTypeToPoolTypeIDMap = new Map<string, string>();
    poolTypeDataWrapper = new XcAutocompleteDataWrapper(
        () => this.currentObject ? this.currentObject.poolType : '',
        value => {
            if (this.currentObject) {
                this.currentObject.poolType = value;
                this.currentObject.pooltypeID = this.poolTypeToPoolTypeIDMap.get(value);
            }
        }
    );

    constructor(readonly injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, private readonly i18nService: I18nService) {
        super(injector);

        this.tableDataSource = new XcRemoteTableDataSource<XoThresholdType>(this.apiService, this.i18nService, this.apiService.internalRTC, WORKFLOWS.threshTableInfo);
        this.tableDataSource.output = XoThresholdTypeArray;

        this.tableDataSource.selectionModel.selectionChange.subscribe(model => {
            this.untouchedCurrentObject = model.selection[0];
            if (this.untouchedCurrentObject) {
                // clone() calls an encode() (therefore: beforeEncode()), which needs to be canceled out
                // by an encode() of the refered object
                this.currentObject = this.untouchedCurrentObject.clone();
                this.untouchedCurrentObject.decode();
            } else {
                this.currentObject = null;
            }

            this.dHCPRelayDataWrapper.update();
            this.poolTypeDataWrapper.update();
        });

        this.tableDataSource.actionElements = [{
            iconName: XDSIconName.DELETE,
            tooltip: this.i18nService.translate('Delete'),
            onAction: threshold => this.delete(threshold)
        }];

        this.tableDataSource.stylesFunction = (row, path) => path === XoThresholdType.getAccessorMap().threshold ? ['threshold-table-cell'] : [];

        //#region - Usually we define afterDecode() and beforeEncode() in the typescript model
        // -- 2 arguments why I defined them here:
        // 1. we generate all data models and that would override the functions
        // 2. we cannot inject I18nService to a model (saving it as static variable is an alternative)
        const allString = this.i18nService.translate('<all>');
        const afterDecode = 'afterDecode';
        const beforeEncode = 'beforeEncode';
        XoThresholdType.prototype[afterDecode] = function() {
            if (this[XoThresholdType.getAccessorMap().sharedNetworkID] === '') {
                this[XoThresholdType.getAccessorMap().dHCPRelay] = allString;
            }
            if (this[XoThresholdType.getAccessorMap().pooltypeID] === '') {
                this[XoThresholdType.getAccessorMap().poolType] = allString;
            }
        };

        XoThresholdType.prototype[beforeEncode] = function() {
            if (this[XoThresholdType.getAccessorMap().dHCPRelay] === allString) {
                this[XoThresholdType.getAccessorMap().sharedNetworkID] = '';
            }
            if (this[XoThresholdType.getAccessorMap().poolType] === allString) {
                this[XoThresholdType.getAccessorMap().pooltypeID] = '';
            }
        };
        //#endregion
    }

    refresh() {
        this.tableDataSource.refresh();
    }

    add() {
        const data: AddNewThresholdModalData = {
            dHCPRelayToSharedNetworkIDMap: this.dHCPRelayToSharedNetworkIDMap,
            fillDHCPRelayDataWrapper: (dataWrapper: XcAutocompleteDataWrapper) => this.fillDHCPRelayDataWrapper(dataWrapper),
            poolTypeToPoolTypeIDMap: this.poolTypeToPoolTypeIDMap,
            fillPoolTypeDataWrapper: (dataWrapper: XcAutocompleteDataWrapper) => this.fillPoolTypeDataWrapper(dataWrapper)
        };

        this.dialogService.custom<boolean, AddNewThresholdModalData>(AddNewThresholdModalComponent, data).afterDismissResult()
        .pipe(filter(result => result)).subscribe({next: _ => this.refresh()});

    }

    delete(threshold?: XoThresholdType) {

        const deleteIt = () => {
            threshold = threshold || this.untouchedCurrentObject;
            this.apiService.startOrder('internal', WORKFLOWS.threshDelete, threshold, XoResponsectype).subscribe({
                next: result => {
                    this.refresh();
                }
            });
        };

        this.dialogService.confirm(
            this.i18nService.translate('Confirm'),
            this.i18nService.translate('Would you like to delete this Threshold?')
        ).afterDismiss().pipe(filter(result => result)).subscribe({next: _ => deleteIt()});
    }

    close() {
        this.currentObject = null;
        this.tableDataSource.selectionModel.clear();
    }

    apply() {
        this.apiService.startOrder('internal', WORKFLOWS.threshUpdate, [this.untouchedCurrentObject, this.currentObject], XoResponsectype).subscribe({
            next: result => {
                this.refresh();
            }
        });
    }

    fillDHCPRelayDataWrapper(dataWrapper: XcAutocompleteDataWrapper): Observable<void> {
        const allString = this.i18nService.translate('<all>');

        return this.apiService.startOrder('internal', WORKFLOWS.threshGetDHCPRelays, [], XoDHCPRelayNameArray).pipe(
            tap({
                next: result => {
                    if (result && !result.errorMessage) {
                        const names = result.output[0] as XoDHCPRelayNameArray;
                        const options: XcOptionItem[] = [];
                        this.dHCPRelayToSharedNetworkIDMap.clear();

                        options.push(XcOptionItemString(allString));
                        this.dHCPRelayToSharedNetworkIDMap.set(allString, '');

                        names.data.forEach(name => {
                            options.push(XcOptionItemString(name.value));
                            this.dHCPRelayToSharedNetworkIDMap.set(name.value, name.iD);
                        });
                        dataWrapper.values = options;
                    }
                }
            }),
            map<StartOrderResult, void>(result => {})
        );
    }

    fillPoolTypeDataWrapper(dataWrapper: XcAutocompleteDataWrapper): Observable<void> {
        const allString = this.i18nService.translate('<all>');

        return this.apiService.startOrder('internal', WORKFLOWS.threshGetPoolTypes, [], XoPooltypeNameArray).pipe(
            tap({
                next: result => {
                    if (result && !result.errorMessage) {
                        const names = result.output[0] as XoPooltypeNameArray;
                        const options: XcOptionItem[] = [];
                        this.poolTypeToPoolTypeIDMap.clear();

                        options.push(XcOptionItemString(allString));
                        this.poolTypeToPoolTypeIDMap.set(allString, '');

                        names.data.forEach(name => {
                            options.push(XcOptionItemString(name.value));
                            this.poolTypeToPoolTypeIDMap.set(name.value, name.iD);
                        });
                        dataWrapper.values = options;
                    }
                }
            }),
            map<StartOrderResult, void>(result => {})
        );
    }

    onShow() {
        if (this.hadNeverBeenSeen) {
            this.tableDataSource.refresh();
            this.fillDHCPRelayDataWrapper(this.dHCPRelayDataWrapper).subscribe();
            this.fillPoolTypeDataWrapper(this.poolTypeDataWrapper).subscribe();
            this.hadNeverBeenSeen = false;
        }
    }

}
