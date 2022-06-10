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
import { Router } from '@angular/router';

import { AuthService } from '@zeta/auth';
import { I18nService } from '@zeta/i18n';
import { XcMenuItem, XcNavListItem, XcNavListOrientation, XDSIconName } from '@zeta/xc';

import { DHCPTranslations_DE_DE } from './locale/dynamic.translations.de-DE';
import { DHCPTranslations_EN_US } from './locale/dynamic.translations.en-US';
import { DHCPMAN_ROUTES } from './shared/routes.const';


@Component({
    templateUrl: './dhcp-manager.component.html',
    styleUrls: ['./dhcp-manager.component.scss']
})
export class DHCPManagerComponent {

    navListItems: XcNavListItem[] = [];
    XcNavListOrientation = XcNavListOrientation;

    usermenuItems = [
        <XcMenuItem>{ name: this.authService.username, icon: XDSIconName.USER, disabled: true },
        <XcMenuItem>{ name: 'Logout', icon: XDSIconName.ARROWLEFT, click: () => this.authService.logout().subscribe({next: () => this.router.navigateByUrl('/Authenticate')}) }
    ];

    constructor(injector: Injector, private readonly router: Router, private readonly authService: AuthService, private readonly i18nService: I18nService) {
        this.navListItems = DHCPManagerComponent.getNavListItems(authService);
        this.i18nService.setTranslations(I18nService.DE_DE, DHCPTranslations_DE_DE);
        this.i18nService.setTranslations(I18nService.EN_US, DHCPTranslations_EN_US);
    }

    static getNavListItems(auth: AuthService): XcNavListItem[] {
        const items: XcNavListItem[] = [];

        if (auth.hasRight(DHCPMAN_ROUTES.DHCPV4_CONTROL.right)) {
            items.push({
                name: DHCPMAN_ROUTES.DHCPV4_CONTROL.navigationName,
                link: DHCPMAN_ROUTES.DHCPV4_CONTROL.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.DEPLOYMENT_MONITOR.right)) {
            items.push({
                name: DHCPMAN_ROUTES.DEPLOYMENT_MONITOR.navigationName,
                link: DHCPMAN_ROUTES.DEPLOYMENT_MONITOR.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.NETWORK_CONFIGURATOR.right)) {
            items.push({
                name: DHCPMAN_ROUTES.NETWORK_CONFIGURATOR.navigationName,
                link: DHCPMAN_ROUTES.NETWORK_CONFIGURATOR.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.POOLTYPE_CONFIGURATOR.right)) {
            items.push({
                name: DHCPMAN_ROUTES.POOLTYPE_CONFIGURATOR.navigationName,
                link: DHCPMAN_ROUTES.POOLTYPE_CONFIGURATOR.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.CLASS_CONFIGURATOR.right)) {
            items.push({
                name: DHCPMAN_ROUTES.CLASS_CONFIGURATOR.navigationName,
                link: DHCPMAN_ROUTES.CLASS_CONFIGURATOR.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.CONDITION_CONFIGURATOR.right)) {
            items.push({
                name: DHCPMAN_ROUTES.CONDITION_CONFIGURATOR.navigationName,
                link: DHCPMAN_ROUTES.CONDITION_CONFIGURATOR.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.DHCP_OPTIONS.right)) {
            items.push({
                name: DHCPMAN_ROUTES.DHCP_OPTIONS.navigationName,
                link: DHCPMAN_ROUTES.DHCP_OPTIONS.link
            });
        }
        if (auth.hasRight(DHCPMAN_ROUTES.LEASE_BROWSER.right)) {
            items.push({
                name: DHCPMAN_ROUTES.LEASE_BROWSER.navigationName,
                link: DHCPMAN_ROUTES.LEASE_BROWSER.link
            });
        }
        return items;
    }

}
