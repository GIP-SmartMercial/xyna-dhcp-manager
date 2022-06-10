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
import { XcComponentTemplate, XcDialogService, XcFormValidatorRequired, XcRichListItem, XcTemplate } from '@zeta/xc';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Observable, Subject } from 'rxjs/';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { GenericStackItemComponent, GenericStackItemComponentData } from '../../../../shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponentData } from '../../../../shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { Definition, GenericDialogComponent, GenericDialogComponentData } from '../../../../shared/modals/generic-dialog/generic-dialog.component';
import { XoOptions, XoOptionsArray } from '../../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { WORKFLOWS } from '../../../../shared/routes.const';
import { XoRowctype as XoSiteGroup } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standortgruppe/www/gip/com/juno/DHCP/WS/Standortgruppe/Messages/xo-row-ctype.model';
import { XoRowListctype as XoSiteGroupList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Standortgruppe/www/gip/com/juno/DHCP/WS/Standortgruppe/Messages/xo-row-list-ctype.model';
import { XoRowctype as XoTarget } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Target/www/gip/com/juno/DHCP/WS/Target/Messages/xo-row-ctype.model';
import { XoRowListctype as XoTargetList } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Target/www/gip/com/juno/DHCP/WS/Target/Messages/xo-row-list-ctype.model';
import { XoDeleteRowsOutput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-delete-rows-output.model';
import { XoGetAllRowsInput } from '../../../../xo/xmcp/dhcp/v4/gui/xo-get-all-rows-input.model';
import { XoResponseHeaderGUItype } from '../../../../xo/xmcp/dhcp/v4/gui/xo-response-header-gui-type.model';
import { XoAddSitegroup } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-add-sitegroup.model';
import { XoForceOverwrite } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-force-overwrite.model';
import { XoTargetID } from '../../../../xo/xmcp/dhcp/v4/network-configurator/xo-target-ID.model';
import { DHCPClusterDetailsComponent, DHCPClusterDetailsComponentData } from '../dhcp-cluster-details/dhcp-cluster-details.component';


export type DHCPClusterListComponentData = GenericStackItemComponentData;

@Component({
    templateUrl: './dhcp-cluster-list.component.html',
    styleUrls: ['./dhcp-cluster-list.component.scss']
})
export class DHCPClusterListComponent extends GenericStackItemComponent<DHCPClusterListComponentData> {

    afterOpen() {
        this.subscriptions.push(this.changeObsUp.subscribe({
            next: id => {
                if (id.startsWith('Sigr')) {
                    this.refresh();
                }
            }
        }));
    }

    constructor(injector: Injector, private readonly apiService: DHCPApiService, private readonly dialogService: XcDialogService, i18nService: I18nService) {
        super(injector, i18nService);
        this.header = this.i18nService.translate('Network Configurator');
        this.refresh();
    }

    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return new XcComponentTemplate<DHCPClusterDetailsComponentData>(
            DHCPClusterDetailsComponent,
            {stackItem: item, communicationData: this.communicationData, siteGroupID: id}
        );
    }

    add() {
        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.targetGetAllRows, rowsInput, XoTargetList).subscribe({
            next: result => {
                const targets: XoTargetList = result.output[1] as XoTargetList;
                const payload: XoAddSitegroup = new XoAddSitegroup();
                payload.dropDownOptions = XoOptionsArray.fromArray(
                    targets.row.data
                    .map((value: XoTarget) => XoOptions.buildOption<XoTarget>(value.name, value)
                ));
                const data: GenericDialogComponentData<XoAddSitegroup> = {
                    data: payload,
                    def: [<Definition>{ label: 'Name *', dataPath: 'gruopName', type: 'text', validatorFn: [XcFormValidatorRequired()]},
                        <Definition>{ label: 'Target 1', dataPath: 'targetOne', type: 'dropDown'},
                        <Definition>{ label: 'Target 2', dataPath: 'targetTwo', type: 'dropDown'}
                    ],
                    header: 'Add Cluster',
                    applyFunction: (group: XoAddSitegroup) => this.actuallyAddGroup(group)
                };
                this.dialogService.custom<boolean, GenericDialogComponentData<XoAddSitegroup>, GenericDialogComponent<XoAddSitegroup>>(GenericDialogComponent, data);
            }
        });
    }

    private actuallyAddGroup(payload: XoAddSitegroup, overwrite: boolean = false, sub?: Subject<boolean>): Observable<boolean> {
        sub = sub ? sub : new Subject<boolean>();

        const siteGroup: XoSiteGroup = new XoSiteGroup();
        siteGroup.name = payload.gruopName;
        const target1 = new XoTargetID();
        target1.targetID = payload.targetOne ? payload.targetOne.targetID : '';
        const target2 = new XoTargetID();
        target2.targetID = payload.targetTwo ? payload.targetTwo.targetID : '';
        const force: XoForceOverwrite = new XoForceOverwrite();
        force.flag = overwrite;

        this.apiService.startOrderWithHeader('internal', WORKFLOWS.siteGroupInsertRow, [siteGroup, target1, target2, force], XoSiteGroup).subscribe({
            next: result => {
                const header = result.output[0] as XoResponseHeaderGUItype;

                if (!header.status0) {
                    sub.next(true);
                    this.refresh();
                    sub.complete();
                } else {
                    this.injectedData.communicationData.rootRef.confirmAction(header.status0, this.actuallyAddGroup.bind(this, payload, true, sub)).subscribe({
                        next: res => {
                            if (!res) {
                                sub.next(false);
                                sub.complete();
                            }
                        }
                    });
                }
            },
            error: () => {
                sub.next(false);
                sub.complete();
            }
        });

        return sub.asObservable();
    }

    deleteGroup(id: string, name: string) {
        const deleteIt = () => {
            const deleteSiteGroup: XoSiteGroup = new XoSiteGroup();
            deleteSiteGroup.standortGruppeID = id;
            deleteSiteGroup.name = name;
            this.apiService.startOrderWithHeader('internal', WORKFLOWS.siteGroupDeleteRow, deleteSiteGroup, XoDeleteRowsOutput).subscribe({
                next: result => {
                    // const out: XoDeleteRowsOutput = result.output[1] as XoDeleteRowsOutput;
                    this.changeSubject.next('Sigr' + id);
                    this.refresh();
                }
            });
        };
        this.injectedData.communicationData.rootRef.confirmAction('Would you like to delete this DHCP-Cluster?', deleteIt.bind(this));
    }

    refresh() {

        const rowsInput: XoGetAllRowsInput = new XoGetAllRowsInput();
        this.apiService.startOrderWithHeader('internal', WORKFLOWS.siteGroupGetAllRows, rowsInput, XoSiteGroupList).subscribe({
            next: result => {
                const list: XoSiteGroupList = result.output[1] as XoSiteGroupList;
                this.richList = [list.row.data.map<XcRichListItem<StackItemRichListComponentData>>((value: XoSiteGroup) => {
                    return super.constructRichListItem(
                        value.standortGruppeID,
                        [value.name],
                        'Delete DHCP-Cluster',
                        ((id: string) => {
                            this.deleteGroup(id, value.name);
                        })
                    );
                })];
                this.resetSelection();
            }
        });
    }
}
