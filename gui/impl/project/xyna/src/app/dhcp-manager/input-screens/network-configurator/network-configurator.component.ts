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
import { Component, Injector, OnDestroy } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcComponentTemplate, XcDialogService } from '@zeta/xc';
import { XcStackDataSource } from '@zeta/xc/xc-stack/xc-stack-data-source';
import { XcStackItem } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';

import { Subscription } from 'rxjs/internal/Subscription';

import { DHCPApiService } from '../../shared/classes/dhcp-api.service';
import { DHCPManagerGenericRouteComponent } from '../../shared/classes/dhcp-manager-generic-route.component';
import { DHCPClusterListComponent, DHCPClusterListComponentData } from './stack-items/dhcp-cluster-list/dhcp-cluster-list.component';


@Component({
    selector: 'network-configurator-component',
    templateUrl: './network-configurator.component.html',
    styleUrls: ['./network-configurator.component.scss']
})
export class NetworkConfiguratorComponent extends DHCPManagerGenericRouteComponent implements OnDestroy {

    private readonly subscription: Subscription;
    readonly stackDataSource = new XcStackDataSource();
    active = false;

    constructor(injector: Injector, /* is protected */ apiService: DHCPApiService, i18nService: I18nService, dialogService: XcDialogService) {
        super(injector, apiService, i18nService, dialogService);

        const item: XcStackItem = new XcStackItem();
        item.setTemplate(new XcComponentTemplate(DHCPClusterListComponent, <DHCPClusterListComponentData>{stackItem: item, communicationData: {rootRef: this}}));
        this.stackDataSource.add(item);

        this.subscription = this.stackDataSource.stackItemsChange.subscribe(() =>
            this.cdr.markForCheck()
        );
    }

    onShow() {
        super.onShow();
        this.active = true;
        this.cdr.markForCheck();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onHide() {
        super.onHide();
        this.active = false;

        /*
         * REMARK
         * For some reason, "detectChanges" instead of "markForCheck" has to be called here
         * to get the active state into the stack
         */
        this.cdr.detectChanges();
    }
}
