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
import { XoArray, XoArrayClass, XoObjectClass, XoProperty, XoTransient } from '@zeta/api';
import { XcTemplate } from '@zeta/xc';



import { XoXSDBaseModel } from '../../../../../../../../../../../../../../xdnc/model/xsd/xo-xsdbase-model.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.Dhcpv4Packets.www.gip.com.juno.Auditv4Memory.WS.Dhcpv4Packets.Messages', 'Row_ctype')
export class XoRowctype extends XoXSDBaseModel {


    @XoProperty()
    host: string;


    @XoProperty()
    ip: string;


    @XoProperty()
    inTime: string;


    @XoProperty()
    discover: string;


    @XoProperty()
    offer: string;


    @XoProperty()
    @XoTransient()
    discoverTemplate: XcTemplate[];

    @XoProperty()
    @XoTransient()
    offerTemplate: XcTemplate[];

    afterDecode() {
        super.afterDecode();
        // const discoverData: LongValueTemplateData = { value: this.discover };
        // this.discoverTemplate = [ new XcComponentTemplate(LongValueTemplateComponent, discoverData) ];

        // const offerData: LongValueTemplateData = { value: this.offer };
        // this.offerTemplate = [ new XcComponentTemplate(LongValueTemplateComponent, offerData) ];
    }
}

@XoArrayClass(XoRowctype)
export class XoRowctypeArray extends XoArray<XoRowctype> {
}

