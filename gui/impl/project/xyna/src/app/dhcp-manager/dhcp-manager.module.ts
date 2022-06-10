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
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ZetaModule } from '@zeta/zeta.module';

import { DHCPManagerComponent } from './dhcp-manager.component';
import { ClassConfiguratorComponent } from './input-screens/class-configurator/class-configurator.component';
import { ConditionBuilderComponent } from './input-screens/class-configurator/modals/condition-builder/condition-builder.component';
import { ConditionChooserComponent } from './input-screens/class-configurator/modals/condition-chooser/condition-chooser.component';
import { ClassDetailsComponent } from './input-screens/class-configurator/stack-items/class-details/class-details.component';
import { ClassListComponent } from './input-screens/class-configurator/stack-items/class-list/class-list.component';
import { ConditionConfiguratorComponent } from './input-screens/condition-configurator/condition-configurator.component';
import { DeploymentMonitorComponent } from './input-screens/deployment-monitor/deployment-monitor.component';
import { DHCPOptionsComponent } from './input-screens/dhcp-options/dhcp-options.component';
import { DeployDHCPOptionsModalComponent } from './input-screens/dhcp-options/modal/deploy-dhcp-options/deploy-dhcp-options.component';
import { DeployRichListComponent } from './input-screens/dhcp-options/modal/deploy-dhcp-options/deploy-rich-list/deploy-rich-list.component';
import { EditNewDHCPOptionsModalComponent } from './input-screens/dhcp-options/modal/edit-new-dhcp-options/edit-new-dhcp-options.component';
import { DHCPv4ControlComponent } from './input-screens/dhcp-v4-control/dhcp-v4-control.component';
import { DHCPPacketsComponent } from './input-screens/dhcp-v4-control/tab-bar-items/dhcp-packets/dhcp-packets.component';
import { LongValueTemplateComponent } from './input-screens/dhcp-v4-control/tab-bar-items/dhcp-packets/templates/long-value-template.model';
import { PoolUsageComponent } from './input-screens/dhcp-v4-control/tab-bar-items/pool-usage/pool-usage.component';
import { ClusterDetailsComponent } from './input-screens/dhcp-v4-control/tab-bar-items/status/stack-items/cluster-details/cluster-details.component';
import { ClusterListComponent } from './input-screens/dhcp-v4-control/tab-bar-items/status/stack-items/cluster-list/cluster-list.component';
import { StatusComponent } from './input-screens/dhcp-v4-control/tab-bar-items/status/status.component';
import { AddNewThresholdModalComponent } from './input-screens/dhcp-v4-control/tab-bar-items/threshold-control/modals/add-new-threshold-modal/add-new-threshold-modal.component';
import { ThresholdControlComponent } from './input-screens/dhcp-v4-control/tab-bar-items/threshold-control/threshold-control.component';
import { LeaseBrowserComponent } from './input-screens/lease-browser/lease-browser.component';
import { MigrationHandlerComponent } from './input-screens/network-configurator/migration/migration-handler.component';
import { AddSubnetDialogComponent } from './input-screens/network-configurator/modals/add-subnet/add-subnet-dialog.component';
import { NetworkConfiguratorComponent } from './input-screens/network-configurator/network-configurator.component';
import { AttributeComponent } from './input-screens/network-configurator/stack-items/attribute/attribute.component';
import { DHCPClusterDetailsComponent } from './input-screens/network-configurator/stack-items/dhcp-cluster-details/dhcp-cluster-details.component';
import { DHCPClusterListComponent } from './input-screens/network-configurator/stack-items/dhcp-cluster-list/dhcp-cluster-list.component';
import { PoolComponent } from './input-screens/network-configurator/stack-items/pool/pool.component';
import { SharedNetworkComponent } from './input-screens/network-configurator/stack-items/shared-network/shared-network.component';
import { StaticHostComponent } from './input-screens/network-configurator/stack-items/static-host/static-host.component';
import { SubnetComponent } from './input-screens/network-configurator/stack-items/subnet/subnet.component';
import { PooltypeConfiguratorComponent } from './input-screens/pooltype-configurator/pooltype-configurator.component';
import { PooltypeDetailsComponent } from './input-screens/pooltype-configurator/stack-items/pooltype-details/pooltype-details.component';
import { PooltypeListComponent } from './input-screens/pooltype-configurator/stack-items/pooltype-list/pooltype-list.component';
import { DHCPApiService } from './shared/classes/dhcp-api.service';
import { DHCPManagerGenericRouteComponent } from './shared/classes/dhcp-manager-generic-route.component';
import { GenericTableDetailsComponent } from './shared/classes/generic-table-details.component';
import { OnFocusedEnterDirective } from './shared/directives/on-focused-enter.directive';
import { AttributeRichListComponent } from './shared/generic-stack-item/attribute-rich-list/attribute-rich-list.component';
import { GenericStackItemComponent } from './shared/generic-stack-item/generic-stack-item.component';
import { StackItemRichListComponent } from './shared/generic-stack-item/stack-item-rich-list/stack-item-rich-list.component';
import { AddAttributeComponent } from './shared/modals/add-attribute-dialog/add-attribute-dialog.component';
import { GenericDialogComponent } from './shared/modals/generic-dialog/generic-dialog.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ZetaModule
    ],
    declarations: [
        // generic-parent-component
        DHCPManagerComponent,
        DHCPManagerGenericRouteComponent,
        GenericTableDetailsComponent,
        // actual input-screens
        // Control
        DHCPv4ControlComponent,
        StatusComponent,
        ClusterListComponent,
        ClusterDetailsComponent,
        PoolUsageComponent,
        ThresholdControlComponent,
        AddNewThresholdModalComponent,
        DHCPPacketsComponent,
        LongValueTemplateComponent,
        // DeploymentMonitor
        DeploymentMonitorComponent,
        // NetworkConfigurator
        NetworkConfiguratorComponent,
        DHCPClusterListComponent,
        DHCPClusterDetailsComponent,
        SharedNetworkComponent,
        AddSubnetDialogComponent,
        SubnetComponent,
        PoolComponent,
        AttributeComponent,
        StaticHostComponent,
        MigrationHandlerComponent,
        // PooltypeConfigurator
        PooltypeConfiguratorComponent,
        PooltypeListComponent,
        PooltypeDetailsComponent,
        // ClassConfigurator
        ClassConfiguratorComponent,
        ClassListComponent,
        ClassDetailsComponent,
        ConditionBuilderComponent,
        ConditionChooserComponent,
        // ConditionConfigurator
        ConditionConfiguratorComponent,
        // DHCPOptions
        DHCPOptionsComponent,
        EditNewDHCPOptionsModalComponent,
        DeployDHCPOptionsModalComponent,
        DeployRichListComponent,
        // LeaseBrowser
        LeaseBrowserComponent,
        // shared
        GenericDialogComponent,
        GenericStackItemComponent,
        AddAttributeComponent,
        OnFocusedEnterDirective,
        StackItemRichListComponent,
        AttributeRichListComponent
    ],
    providers: [
        DHCPApiService
    ]
})
export class DHCPManagerModule {
}
