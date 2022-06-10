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
// Rights -> see https://gipjira.gip.com/projects/DHCP/issues/DHCP-48

export const DHCPMAN_ROUTES = {
    DHCPV4_CONTROL: { navigationName: 'DHCPv4 Control', link: 'dhcpv4-control', right: 'juno.snmptrap.select' },
    DEPLOYMENT_MONITOR: { navigationName: 'Deployment Monitor', link: 'deployment-monitor', right: 'juno.deployments.select' },
    NETWORK_CONFIGURATOR: { navigationName: 'Network Configurator', link: 'network-configurator', right: 'juno.dhcp.select' },
    POOLTYPE_CONFIGURATOR: { navigationName: 'Pooltype Configurator', link: 'pooltype-configurator', right: 'juno.dhcp.select' },
    CLASS_CONFIGURATOR: { navigationName: 'Class Configurator', link: 'class-configurator', right: 'juno.dhcp.select' },
    CONDITION_CONFIGURATOR: { navigationName: 'Condition Configurator', link: 'condition-configurator', right: 'juno.dhcp.select' },
    DHCP_OPTIONS: { navigationName: 'DHCP Options', link: 'dhcp-options', right: 'juno.dhcp.select' },
    LEASE_BROWSER: { navigationName: 'Lease Browser', link: 'lease-browser', right: 'juno.audit.select' }
};


// Workflow section
export const WORKFLOWS = {

    // Control
    // status
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // Out: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.CheckStatus.www.gip.com.juno.Gui.WS.Messages.GetInstanceInfoListResponse_ctype
    statusGetInstanceInfoList: 'xmcp.dhcp.v4.control.CheckStatusGetInstanceInfoList',
    // testOnly
    // statusGetInstanceInfoList: 'test.control.CheckStatusGetInstanceInfoListTest',
    // IN:  xmcp.dhcp.v4.datatypes.generated.CheckStatus.www.gip.com.juno.Gui.WS.Messages.CheckStatusForIpInput_ctype
    // Out: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.CheckStatus.www.gip.com.juno.Gui.WS.Messages.CheckStatusForIpResponse_ctype
    statusForIP: 'xmcp.dhcp.v4.control.CheckStatusForIp',
    // testOnly
    // statusForIP: 'test.control.CheckStatusForIpTest',

    // poolusage
    // IN:  xmcp.tables.datatypes.TableInfo
    // Out: xmcp.tables.datatypes.TableInfo
    //      [n|xmcp.dhcp.v4.control.poolusage.PoolUsage_Type]
    usageGetPoolTypeOverview: 'xmcp.dhcp.v4.control.poolusage.GetPoolTypeOverviewTable',
    // IN:  xmcp.tables.datatypes.TableInfo
    // Out: xmcp.tables.datatypes.TableInfo
    //      [n|xmcp.dhcp.v4.control.poolusage.PoolUsage_Type]
    usageGetPoolDetails: 'xmcp.dhcp.v4.control.poolusage.GetPoolDetailsTable',

    // thresholdcontrol
    threshInsert: 'xmcp.dhcp.v4.control.thresholdcontrol.PoolUsageThresholdInsertRow',
    threshTableInfo: 'xmcp.dhcp.v4.control.thresholdcontrol.GetThresholdControlTable',
    threshDelete: 'xmcp.dhcp.v4.control.thresholdcontrol.PoolUsageThresholdDeleteRowsWithNullConditions',
    threshUpdate: 'xmcp.dhcp.v4.control.thresholdcontrol.PoolUsageThresholdUpdateRowPkWithNullConditions',
    // OUT: [n|xmcp.dhcp.v4.control.thresholdcontrol.DHCPRelayName]
    threshGetDHCPRelays: 'xmcp.dhcp.v4.control.thresholdcontrol.GetDHCPRelays',
    // OUT: [n|xmcp.dhcp.v4.control.thresholdcontrol.PooltypeName]
    threshGetPoolTypes: 'xmcp.dhcp.v4.control.thresholdcontrol.GetPooltypes',

    // DHCPv4Packets
    // IN:  xmcp.tables.datatypes.TableInfo
    // Out: xmcp.tables.datatypes.TableInfo
    //      [n|xmcp.dhcp.v4.datatypes.generated.Dhcpv4Packets.www.gip.com.juno.Auditv4Memory.WS.Dhcpv4Packets.Messages.Row_ctype]
    packetsGetV4Packets: 'xmcp.dhcp.v4.control.dhcppackets.GetDHCPPacketsTable',

    // networkConfiguration
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.RowList_ctype
    siteGroupGetAllRows: 'xmcp.dhcp.v4.netconfigurator.StandortgruppeGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    //      xmcp.dhcp.v4.netconfigurator.TargetID //Target 1
    //      xmcp.dhcp.v4.netconfigurator.TargetID //Target 2
    //      xmcp.dhcp.v4.netconfigurator.ForceOverwrite
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    siteGroupInsertRow: 'xmcp.dhcp.v4.netconfigurator.StandortgruppeInsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    siteGroupDeleteRow: 'xmcp.dhcp.v4.netconfigurator.StandortgruppeDeleteRows',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.RowList_ctype
    targetGetAllRows: 'xmcp.dhcp.v4.netconfigurator.TargetGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.RowList_ctype
    targetSearchRows: 'xmcp.dhcp.v4.netconfigurator.TargetSearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.ConnectData.www.gip.com.juno.DHCP.WS.ConnectData.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.ConnectData.www.gip.com.juno.DHCP.WS.ConnectData.Messages.RowList_ctype
    connectedDataSearchRows: 'xmcp.dhcp.v4.netconfigurator.ConnectDataSearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.Row_ctype
    targetUpdateRows: 'xmcp.dhcp.v4.netconfigurator.TargetUpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.Row_ctype  //Conditions
    //      xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.Row_ctype  //new Values
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.netconfigurator.UpdateRowPkIgnoreEmptyOutput
    targetUpdateRowIgnoreEmpty: 'xmcp.dhcp.v4.netconfigurator.TargetUpdateRowPkIgnoreEmpty',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Target.www.gip.com.juno.DHCP.WS.Target.Messages.Row_ctype  //TargetWithStandortgruppe
    //      xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype  //NewStandortgruppe
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.netconfigurator.UpdateRowPkIgnoreEmptyOutput
    changeTargetsDCHPCluster: 'xmcp.dhcp.v4.netconfigurator.ChangeTargetsDCHPCluster',

    // IN:  xmcp.dhcp.v4.datatypes.generated.Standort.www.gip.com.juno.DHCP.WS.Standort.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Standort.www.gip.com.juno.DHCP.WS.Standort.Messages.RowList_ctype
    siteSearchRows: 'xmcp.dhcp.v4.control.StandortSearchRows',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.RowList_ctype
    sharedNetworkGetAllRows: 'xmcp.dhcp.v4.control.SharedNetworkGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Standort.www.gip.com.juno.DHCP.WS.Standort.Messages.RowList_ctype
    sharedNetworkSearchRows: 'xmcp.dhcp.v4.control.SharedNetworkSearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    //      xmcp.dhcp.v4.datatypes.generated.Standort.www.gip.com.juno.DHCP.WS.Standort.Messages.Row_ctype
    //      xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      [n|xmcp.dhcp.v4.datatypes.generated.Standort.www.gip.com.juno.DHCP.WS.Standort.Messages.Row_ctype]
    //      [n|xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype]
    sharedNetworkSearchRowsBySiteGroup: 'xmcp.dhcp.v4.netconfigurator.FetchStandorteAndDHCPRelaysForStandortgruppe',
    // IN:  xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    sharedNetworkInsertRows: 'xmcp.dhcp.v4.control.SharedNetworkInsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    //      xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    sharedNetworkUpdateRows: 'xmcp.dhcp.v4.control.SharedNetworkUpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype
    //      xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    sharedNetworkDeleteRows: 'xmcp.dhcp.v4.control.SharedNetworkDeleteRows',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Cpedns.www.gip.com.juno.DHCP.WS.Cpedns.Messages.RowList_ctype
    cpednsGetAllRows: 'xmcp.dhcp.v4.netconfigurator.CpednsGetAllRows',

    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.RowList_ctype
    subnetGetAllRows: 'xmcp.dhcp.v4.netconfigurator.SubnetGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.RowList_ctype
    subnetSearchRows: 'xmcp.dhcp.v4.netconfigurator.SubnetSearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.Row_ctype
    subnetInsertRows: 'xmcp.dhcp.v4.netconfigurator.SubnetInsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.Row_ctype
    subnetUpdateRows: 'xmcp.dhcp.v4.netconfigurator.SubnetUpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Subnet.www.gip.com.juno.DHCP.WS.Subnet.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    subnetDeleteRows: 'xmcp.dhcp.v4.netconfigurator.SubnetDeleteRows',

    // IN:  xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.RowList_ctype
    poolSearchRows: 'xmcp.dhcp.v4.control.PoolSearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.Row_ctype
    poolInsertRows: 'xmcp.dhcp.v4.control.PoolInsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.Row_ctype
    poolUpdateRows: 'xmcp.dhcp.v4.control.PoolUpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pool.www.gip.com.juno.DHCP.WS.Pool.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    poolDeleteRows: 'xmcp.dhcp.v4.control.PoolDeleteRows',

    // IN:  xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.RowList_ctype
    hostSearchRows: 'xmcp.dhcp.v4.netconfigurator.StaticHostSearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.Row_ctype
    hostInsertRows: 'xmcp.dhcp.v4.netconfigurator.StaticHostInsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.Row_ctype
    hostUpdateRows: 'xmcp.dhcp.v4.netconfigurator.StaticHostUpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.StaticHost.www.gip.com.juno.DHCP.WS.StaticHost.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    hostDeleteRows: 'xmcp.dhcp.v4.netconfigurator.StaticHostDeleteRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.CM.www.gip.com.juno.Service.WS.CM.Messages.SyncCpeIPsInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.dhcpoptions.SyncCpeIPsOutput
    syncCPEIPs: 'xmcp.dhcp.v4.dhcpoptions.SyncCpeIPs',

    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.CheckDhcpdConfInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    checkConf: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfCheckDhcpdConfNewFormat',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DeployDhcpdConfInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    deployConf: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfDeployDhcpdConfNewFormat',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.MigrationTargetIdentifier_ctype  //Source
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.MigrationTargetIdentifier_ctype  //Target
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateDuplicate: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfDuplicateForMigration',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.MigrationTargetIdentifier_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateDeactivate: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfDeactivateForMigration',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.MigrationTargetIdentifier_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateActivate: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfActivateForMigration',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.MigrationTargetIdentifier_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateDelete: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfDeleteForMigration',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    //      [n|xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype]
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateDuplicateAndMove: 'xmcp.dhcp.v4.netconfigurator.MigrateAndMoveSharedNetworksAndWriteProtocol',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    //      [n|xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype]
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateDeAndActivate: 'xmcp.dhcp.v4.netconfigurator.ActivateAndDeactivateSharedNetworks',
    // IN:  [n|xmcp.dhcp.v4.datatypes.generated.SharedNetwork.www.gip.com.juno.DHCP.WS.SharedNetwork.Messages.Row_ctype]
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    migrateDeleteSharedNetworks: 'xmcp.dhcp.v4.netconfigurator.DeleteSharedNetworks',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.UndeployStaticHostInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.netconfigurator.ErrorProtocol
    undeployHost: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfUndeployStaticHostNewFormat',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DeployStaticHostInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages.DhcpdConfResponse_ctype
    deployHost: 'xmcp.dhcp.v4.netconfigurator.DhcpdConfDeployStaticHostNewFormat',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Standortgruppe.www.gip.com.juno.DHCP.WS.Standortgruppe.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xfmg.xfctrl.filemgmt.ManagedFileId
    exportDHCPConf: 'xmcp.dhcp.v4.netconfigurator.ExportDHCPKonfiguration',

    // deploymentmonitor
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetMetaInfoInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DeployActions.www.gip.com.juno.Gui.WS.Messages.MetaInfo_ctype
    deployGetMetaInfo: 'xmcp.dhcp.v4.deploymentmonitor.GetMetaInfo',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DeployActions.www.gip.com.juno.Deployments.WS.DeployActions.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DeployActions.www.gip.com.juno.Deployments.WS.DeployActions.Messages.RowList_ctype
    deploySearchRows: 'xmcp.dhcp.v4.deploymentmonitor.SearchRows',
    // IN: xmcp.dhcp.v4.deploymentmonitor.CountAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.deploymentmonitor.CountAllRowsOutput
    deployCountAllRows: 'xmcp.dhcp.v4.deploymentmonitor.CountAllRows',


    // pooltypeConfigurator
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.RowList_ctype
    pooltypeGetAllRows: 'xmcp.dhcp.v4.pooltypeconfig.GetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.RowList_ctype
    pooltypeSearchRows: 'xmcp.dhcp.v4.pooltypeconfig.SearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.Row_ctype
    pooltypeInsertRows: 'xmcp.dhcp.v4.pooltypeconfig.InsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.Row_ctype
    pooltypeUpdateRows: 'xmcp.dhcp.v4.pooltypeconfig.UpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Pooltype.www.gip.com.juno.DHCP.WS.Pooltype.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    pooltypeDeleteRows: 'xmcp.dhcp.v4.pooltypeconfig.DeleteRows',


    // dhcpOptions
    // IN:  xmcp.dhcp.v4.dhcpoptions.GetMetaInfoInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.GetMetaInfoInput
    optionsGetMetaInfo: 'xmcp.dhcp.v4.dhcpoptions.GetMetaInfo',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.RowList_ctype
    optionsSearchRows: 'xmcp.dhcp.v4.dhcpoptions.SearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.Row_ctype
    optionsUpdateRow: 'xmcp.dhcp.v4.dhcpoptions.UpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.Row_ctype
    optionsInsertRow: 'xmcp.dhcp.v4.dhcpoptions.InsertRow',
    // IN:  xmcp.dhcp.v4.dhcpoptions.GetLocationsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.CM.www.gip.com.juno.Gui.WS.Messages.ColValuesDistinct_ctype
    optionsGetLocations: 'xmcp.dhcp.v4.dhcpoptions.GetLocations',
    // IN:  xmcp.dhcp.v4.dhcpoptions.DeployOnDPPInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages.DeployOnDPPResponse_ctype
    optionsDeployOnDPP: 'xmcp.dhcp.v4.dhcpoptions.DeployOnDPP',
    // IN:  xmcp.dhcp.v4.dhcpoptions.DeleteRows
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.dhcpoptions.DeleteRowsOutput
    optionsDeleteRows: 'xmcp.dhcp.v4.dhcpoptions.DeleteRows',


    // conditionConfigurator
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetMetaInfoInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.Gui.WS.Messages.MetaInfo_ctype
    conditionsGetMetaInfo: 'xmcp.dhcp.v4.conditionconfigurator.GetMetaInfo',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      [n|xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype]
    conditionsSearchRow: 'xmcp.dhcp.v4.conditionconfigurator.SearchRows',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.RowList_ctype
    conditionsGetAllRows: 'xmcp.dhcp.v4.conditionconfigurator.GetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype
    conditionsUpdateRow: 'xmcp.dhcp.v4.conditionconfigurator.UpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype
    conditionsInsertRow: 'xmcp.dhcp.v4.conditionconfigurator.InsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.conditionconfigurator.DeleteRowsOutput
    conditionsDeleteRows: 'xmcp.dhcp.v4.conditionconfigurator.DeleteRows',


    // classConfigurator
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.RowList_ctype1
    classGetAllRows: 'xmcp.dhcp.v4.classconfigurator.GetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      [n|xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1]
    classSearchRows: 'xmcp.dhcp.v4.classconfigurator.SearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1
    classInsertRows: 'xmcp.dhcp.v4.classconfigurator.InsertRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1
    classUpdateRows: 'xmcp.dhcp.v4.classconfigurator.UpdateRow',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages.Row_ctype1
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.gui.datatypes.DeleteRowsOutput
    classDeleteRows: 'xmcp.dhcp.v4.classconfigurator.DeleteRows',


    // leaseBrowser
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetMetaInfoInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Leases.www.gip.com.juno.Gui.WS.Messages.MetaInfo_ctype
    leaseGetMetaInfo: 'xmcp.dhcp.v4.leasebrowser.GetMetaInfo',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Leases.www.gip.com.juno.Audit.WS.Leases.Messages.SearchRowsInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Leases.www.gip.com.juno.Audit.WS.Leases.Messages.RowList_ctype
    leaseSearchRows: 'xmcp.dhcp.v4.leasebrowser.SearchRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Leases.www.gip.com.juno.Audit.WS.Leases.Messages.CountRowsWithConditionInput_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.leasebrowser.CountRowsWithConditionOutput
    leaseCountRowsWithCondition: 'xmcp.dhcp.v4.leasebrowser.CountRowsWithCondition',
    // IN:  xmcp.dhcp.v4.datatypes.generated.Leases.www.gip.com.juno.Audit.WS.Leases.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.Leases.www.gip.com.juno.Audit.WS.Leases.Messages.Row_ctype
    leaseInsertRow: 'xmcp.dhcp.v4.leasebrowser.InsertRow',


    // Shared
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiOperator.www.gip.com.juno.DHCP.WS.GuiOperator.Messages.RowList_ctype
    GuiOperatorGetAllRows: 'xmcp.dhcp.v4.gui.GuiOperatorGetAllRows',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiParameter.www.gip.com.juno.DHCP.WS.GuiParameter.Messages.RowList_ctype
    GuiParameterGetAllRows: 'xmcp.dhcp.v4.gui.GuiParameterGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.GuiFixedAttribute.www.gip.com.juno.DHCP.WS.GuiFixedAttribute.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiFixedAttribute.www.gip.com.juno.DHCP.WS.GuiFixedAttribute.Messages.RowList_ctype
    GuiFixedAttributeSearchRows: 'xmcp.dhcp.v4.gui.GuiFixedAttributeSearchRows',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiFixedAttribute.www.gip.com.juno.DHCP.WS.GuiFixedAttribute.Messages.RowList_ctype
    GuiFixedAttributeGetAllRows: 'xmcp.dhcp.v4.gui.GuiFixedAttributeGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.GuiFixedAttribute.www.gip.com.juno.DHCP.WS.GuiFixedAttribute.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiFixedAttribute.www.gip.com.juno.DHCP.WS.GuiFixedAttribute.Messages.Row_ctype
    GuiFixedAttributeUpdateRows: 'xmcp.dhcp.v4.gui.GuiFixedAttributeUpdateRow',
    // IN:  xmcp.dhcp.v4.gui.datatypes.GetAllRowsInput
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiAttribute.www.gip.com.juno.DHCP.WS.GuiAttribute.Messages.RowList_ctype
    GuiAttributeGetAllRows: 'xmcp.dhcp.v4.gui.GuiAttributeGetAllRows',
    // IN:  xmcp.dhcp.v4.datatypes.generated.GuiAttribute.www.gip.com.juno.DHCP.WS.GuiAttribute.Messages.Row_ctype
    // OUT: xmcp.dhcp.v4.gui.datatypes.ResponseHeader_GUItype
    //      xmcp.dhcp.v4.datatypes.generated.GuiAttribute.www.gip.com.juno.DHCP.WS.GuiAttribute.Messages.RowList_ctype
    GuiAttributeSearchRows: 'xmcp.dhcp.v4.gui.GuiAttributeSearchRows'
};
