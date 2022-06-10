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
import { XoPoolctypeArray } from './xo-pool-ctype.model';
import { XoStaticHostctypeArray } from './xo-static-host-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.Standortgruppenbaum.www.gip.com.juno.WS.Standortgruppenbaum.Messages', 'Subnet_ctype')
export class XoSubnetctype extends XoXSDBaseModel {


    @XoProperty()
    subnetID: string;


    @XoProperty()
    mask: string;


    @XoProperty()
    sharedNetwork: string;


    @XoProperty()
    sharedNetworkID: string;


    @XoProperty()
    subnet: string;


    @XoProperty()
    fixedAttributes: string;


    @XoProperty()
    label: string;


    @XoProperty(XoPoolctypeArray)
    pool: XoPoolctypeArray = new XoPoolctypeArray();


    @XoProperty(XoStaticHostctypeArray)
    staticHost: XoStaticHostctypeArray = new XoStaticHostctypeArray();


}

@XoArrayClass(XoSubnetctype)
export class XoSubnetctypeArray extends XoArray<XoSubnetctype> {
}
