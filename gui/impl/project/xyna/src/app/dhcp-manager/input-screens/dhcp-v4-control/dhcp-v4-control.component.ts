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
import { Component, Injector, OnInit, ViewChild } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcDialogService, XcTabBarComponent, XcTabBarItem, XcTabComponent } from '@zeta/xc';

import { Subject } from 'rxjs/internal/Subject';

import { DHCPApiService } from '../../shared/classes/dhcp-api.service';
import { DHCPManagerGenericRouteComponent } from '../../shared/classes/dhcp-manager-generic-route.component';
import { DHCPPacketsComponent } from './tab-bar-items/dhcp-packets/dhcp-packets.component';
import { PoolUsageComponent } from './tab-bar-items/pool-usage/pool-usage.component';
import { StatusComponent } from './tab-bar-items/status/status.component';
import { ThresholdControlComponent } from './tab-bar-items/threshold-control/threshold-control.component';


export interface ControlTabBarComponentInterface {
    onShow?: () => void;
    onHide?: () => void;
}


@Component({
    selector: 'dhcp-v4-control-component',
    templateUrl: './dhcp-v4-control.component.html',
    styleUrls: ['./dhcp-v4-control.component.scss']
})
export class DHCPv4ControlComponent extends DHCPManagerGenericRouteComponent implements OnInit {

    private _tabBar: XcTabBarComponent;
    private readonly _tabBarInitialized = new Subject();
    private readonly tabBarItems: XcTabBarItem[] = [];
    private currentTabComponent: XcTabComponent<any, any>;

    @ViewChild(XcTabBarComponent, {static: false})
    set tabBar(value: XcTabBarComponent) {
        this._tabBar = value;
        // xc-tab-bar needs its items attached when the @ViewChild decorator sets a value
        // otherwise: ExpressionChangedAfterItHasBeenCheckedError
        this._tabBar.items = this.tabBarItems;
        this.cdr.detectChanges();

        this._tabBarInitialized.next();
        this._tabBarInitialized.complete();
    }

    get tabBar(): XcTabBarComponent {
        return this._tabBar;
    }

    constructor(injector: Injector, /* is protected */ apiService: DHCPApiService, i18nService: I18nService, dialogs: XcDialogService) {
        super(injector, apiService, i18nService, dialogs);
        this.tabBarItems = [
            {
                closable: false,
                name: this.i18nService.translate('Status'),
                component: StatusComponent,
                data: { urlPart: 'status', cdr: this.cdr}
            },
            {
                closable: false,
                name: this.i18nService.translate('Pool Usage'),
                component: PoolUsageComponent,
                data: { urlPart: 'pool-usage'}
            },
            {
                closable: false,
                name: this.i18nService.translate('Threshold Control'),
                component: ThresholdControlComponent,
                data: { urlPart: 'threshold-control'}
            },
            {
                closable: false,
                name: this.i18nService.translate('DHCP Packets'),
                component: DHCPPacketsComponent,
                data: { urlPart: 'dhcp-packets'}
            }
        ];
    }

    tabChanged(item: XcTabBarItem) {

        const info = this.getUrlInfo();
        const urlPart = (item.data as {urlPart: string}).urlPart;
        const url = info.base + info.baselessUrl + urlPart + info.search;
        info.id = urlPart;
        window.history.pushState(info, item.name, url);

        const isControlTabBarComponent = (cmp: any): cmp is ControlTabBarComponentInterface => {
            return !!cmp;
        };

        this.tabBar.getComponentInstance(item).subscribe({next: cmp => {
            if (isControlTabBarComponent(this.currentTabComponent) && this.currentTabComponent.onHide) {
                this.currentTabComponent.onHide();
            }
            this.currentTabComponent = cmp;
            if (isControlTabBarComponent(this.currentTabComponent) && this.currentTabComponent.onShow) {
                this.currentTabComponent.onShow();
            }
        }});
    }

    ngOnInit() {
        super.ngOnInit();
        const info = this.getUrlInfo();
        const urlPart = info.id;
        const item = this.tabBarItems.find(tab => (tab.data as {urlPart: string}).urlPart === urlPart);
        this._tabBarInitialized.subscribe({next: _ => {
            if (item) {
                this.tabBar.selection = item;
            }
        }});
    }

    getUrlInfo(): {base: string, baselessUrl: string, angularUrl: string, search: string, id: string} {
        let id = '';
        const search = window.location.search;
        const base = (document.querySelector('head base') ).getAttribute('href');
        let baselessUrl = window.location.pathname;
        if (baselessUrl.startsWith(base)) {
            baselessUrl = baselessUrl.slice(base.length);
        }

        let angularUrl = this.router.url; // the search / query string can be in it
        const queryIndex = angularUrl.indexOf('?');
        if (queryIndex >= 0) {
            angularUrl = angularUrl.slice(0, queryIndex);
        }
        if (!baselessUrl.endsWith('/')) {
            const htmlID = baselessUrl.split('/').pop();
            id = id || htmlID;
        }
        baselessUrl = baselessUrl.slice(0, baselessUrl.length - id.length);

        return {base, baselessUrl, angularUrl, search, id};
    }

}
