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
import { ChangeDetectorRef, Component, Injector, OnDestroy } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcComponentTemplate, XcTabComponent } from '@zeta/xc';
import { XcStackDataSource } from '@zeta/xc/xc-stack/xc-stack-data-source';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Subscription } from 'rxjs/internal/Subscription';

import { DHCPApiService } from '../../../../shared/classes/dhcp-api.service';
import { ControlTabBarComponentInterface } from '../../dhcp-v4-control.component';
import { ClusterListComponent, ClusterListComponentData } from './stack-items/cluster-list/cluster-list.component';


@Component({
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})
export class StatusComponent extends XcTabComponent<void, any> implements OnDestroy, ControlTabBarComponentInterface {

    private readonly cdr: ChangeDetectorRef;
    private readonly subscription: Subscription;
    readonly stackDataSource = new XcStackDataSource();
    active = false;

    constructor(readonly injector: Injector, apiService: DHCPApiService, i18nService: I18nService) {
        super(injector);

        const item: XcStackItem = new XcStackItem();
        // rootRef is needed if some confirmaton by the user befor action is requested. Then use rootref.confirmAction. This mask is only readonly + refresh buttons, so no confirmation.
        item.setTemplate(new XcComponentTemplate(ClusterListComponent, <ClusterListComponentData>{stackItem: item, communicationData: {rootRef: null}}));
        this.stackDataSource.add(item);

        this.subscription = this.stackDataSource.stackItemsChange.subscribe(() =>
        this.injectedData.cdr.markForCheck()
        );
    }

    onShow() {
        this.active = true;
        this.injectedData.cdr.markForCheck();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onHide() {
        this.active = false;

        /*
         * REMARK
         * For some reason, "detectChanges" instead of "markForCheck" has to be called here
         * to get the active state into the stack
         */
        this.injectedData.cdr.detectChanges();
    }
}
