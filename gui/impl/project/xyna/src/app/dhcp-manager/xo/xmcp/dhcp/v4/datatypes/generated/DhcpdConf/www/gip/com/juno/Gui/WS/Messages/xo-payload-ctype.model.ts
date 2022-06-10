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
import { XoObjectClass, XoArrayClass, XoProperty, XoArray } from '@zeta/api';
import { XoXSDBaseModel } from '../../../../../../../../../../../../../xdnc/model/xsd/xo-xsdbase-model.model';
import { XoDhcpdConfResponsectype } from './xo-dhcpd-conf-response-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.DhcpdConf.www.gip.com.juno.Gui.WS.Messages', 'Payload_ctype')
export class XoPayloadctype extends XoXSDBaseModel {


    @XoProperty(XoDhcpdConfResponsectype)
    checkDhcpdConfResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    checkDhcpdConfNewFormatResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    deployDhcpdConfResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    deployDhcpdConfNewFormatResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    deployStaticHostResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    deployStaticHostNewFormatResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    undeployStaticHostResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    undeployStaticHostNewFormatResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    duplicateForMigrationResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    deactivateForMigrationResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    activateForMigrationResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


    @XoProperty(XoDhcpdConfResponsectype)
    deleteForMigrationResponse: XoDhcpdConfResponsectype = new XoDhcpdConfResponsectype();


}

@XoArrayClass(XoPayloadctype)
export class XoPayloadctypeArray extends XoArray<XoPayloadctype> {
}
