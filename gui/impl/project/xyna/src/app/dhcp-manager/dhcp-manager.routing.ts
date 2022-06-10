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
import { RouterModule } from '@angular/router';

import { XynaRoutes } from '@zeta/nav';
import { RightGuard } from '@zeta/nav/right.guard';

import { DHCPManagerComponent } from './dhcp-manager.component';
import { DHCPManagerModule } from './dhcp-manager.module';
import { ClassConfiguratorComponent } from './input-screens/class-configurator/class-configurator.component';
import { ConditionConfiguratorComponent } from './input-screens/condition-configurator/condition-configurator.component';
import { DeploymentMonitorComponent } from './input-screens/deployment-monitor/deployment-monitor.component';
import { DHCPOptionsComponent } from './input-screens/dhcp-options/dhcp-options.component';
import { DHCPv4ControlComponent } from './input-screens/dhcp-v4-control/dhcp-v4-control.component';
import { LeaseBrowserComponent } from './input-screens/lease-browser/lease-browser.component';
import { NetworkConfiguratorComponent } from './input-screens/network-configurator/network-configurator.component';
import { PooltypeConfiguratorComponent } from './input-screens/pooltype-configurator/pooltype-configurator.component';
import { DHCPMAN_ROUTES } from './shared/routes.const';


const ROOT = 'dhcp-manager';
const onStartRedirect = DHCPMAN_ROUTES.LEASE_BROWSER.link;

export const DHCPManagerEmbeddingRoutes: XynaRoutes = [
    {
        path: DHCPMAN_ROUTES.DHCPV4_CONTROL.link,
        redirectTo: DHCPMAN_ROUTES.DHCPV4_CONTROL.link + '/',
        pathMatch: 'full'
    },
    {
        path: DHCPMAN_ROUTES.DHCPV4_CONTROL.link + '/:id',
        component: DHCPv4ControlComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.DHCPV4_CONTROL.link, right: DHCPMAN_ROUTES.DHCPV4_CONTROL.right}
    },
    {
        path: DHCPMAN_ROUTES.DEPLOYMENT_MONITOR.link,
        component: DeploymentMonitorComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.DEPLOYMENT_MONITOR.link, right: DHCPMAN_ROUTES.DEPLOYMENT_MONITOR.right}
    },
    {
        path: DHCPMAN_ROUTES.NETWORK_CONFIGURATOR.link,
        component: NetworkConfiguratorComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.NETWORK_CONFIGURATOR.link, right: DHCPMAN_ROUTES.NETWORK_CONFIGURATOR.right}
    },
    {
        path: DHCPMAN_ROUTES.POOLTYPE_CONFIGURATOR.link,
        component: PooltypeConfiguratorComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.POOLTYPE_CONFIGURATOR.link, right: DHCPMAN_ROUTES.POOLTYPE_CONFIGURATOR.right}
    },
    {
        path: DHCPMAN_ROUTES.CLASS_CONFIGURATOR.link,
        component: ClassConfiguratorComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.CLASS_CONFIGURATOR.link, right: DHCPMAN_ROUTES.CLASS_CONFIGURATOR.right}
    },
    {
        path: DHCPMAN_ROUTES.CONDITION_CONFIGURATOR.link,
        component: ConditionConfiguratorComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.CONDITION_CONFIGURATOR.link, right: DHCPMAN_ROUTES.CONDITION_CONFIGURATOR.right}
    },
    {
        path: DHCPMAN_ROUTES.DHCP_OPTIONS.link,
        component: DHCPOptionsComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.DHCP_OPTIONS.link, right: DHCPMAN_ROUTES.DHCP_OPTIONS.right}
    },
    {
        path: DHCPMAN_ROUTES.LEASE_BROWSER.link,
        component: LeaseBrowserComponent,
        pathMatch: 'full',
        canActivate: [RightGuard],
        data: {reuse: DHCPMAN_ROUTES.LEASE_BROWSER.link, right: DHCPMAN_ROUTES.LEASE_BROWSER.right}
    }
];

export const DHCPManagerRoutes: XynaRoutes = [
    {
        path: '',
        redirectTo: ROOT,
        pathMatch: 'full'
    },
    {
        path: ROOT,
        component: DHCPManagerComponent, // this is the base component for every other component + navigation if wanted
        children: [
            {
                path: '',
                redirectTo: onStartRedirect,
                pathMatch: 'full'
            },
            ...DHCPManagerEmbeddingRoutes
        ]
    }
];

export const DHCPManagerRoutingModules = [
    RouterModule.forChild(DHCPManagerRoutes),
    DHCPManagerModule
];

export const DHCPManagerEmbeddingRoutingModules = [
    RouterModule.forChild(DHCPManagerEmbeddingRoutes),
    DHCPManagerModule
];

export const DHCPManagerRoutingProviders = [];
