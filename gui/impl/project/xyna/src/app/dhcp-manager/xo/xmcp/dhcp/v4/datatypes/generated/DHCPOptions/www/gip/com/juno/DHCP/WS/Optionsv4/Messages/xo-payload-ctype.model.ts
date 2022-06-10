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
import { XoArray, XoArrayClass, XoObjectClass, XoProperty } from '@zeta/api';

import { XoXSDBaseModel } from '../../../../../../../../../../../../../../xdnc/model/xsd/xo-xsdbase-model.model';
import { XoColValuesDistinctctype } from './xo-col-values-distinct-ctype.model';
import { XoDeployOnDPPResponsectype } from './xo-deploy-on-dppresponse-ctype.model';
import { XoMetaInfoctype } from './xo-meta-info-ctype.model';
import { XoRowctype } from './xo-row-ctype.model';
import { XoRowListctype } from './xo-row-list-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.DHCPOptions.www.gip.com.juno.DHCP.WS.Optionsv4.Messages', 'Payload_ctype')
export class XoPayloadctype extends XoXSDBaseModel {


    @XoProperty(XoMetaInfoctype)
    metaInfoOutput: XoMetaInfoctype = new XoMetaInfoctype();


    @XoProperty(XoRowListctype)
    getAllRowsOutput: XoRowListctype = new XoRowListctype();


    @XoProperty(XoRowListctype)
    searchRowsOutput: XoRowListctype = new XoRowListctype();


    @XoProperty(XoRowctype)
    updateRowOutput: XoRowctype = new XoRowctype();


    @XoProperty(XoRowctype)
    insertRowOutput: XoRowctype = new XoRowctype();


    @XoProperty()
    deleteRowsOutput: string;


    @XoProperty()
    countAllRowsOutput: string;


    @XoProperty()
    countRowsWithConditionOutput: string;


    @XoProperty(XoDeployOnDPPResponsectype)
    deployOnDPPResponse: XoDeployOnDPPResponsectype = new XoDeployOnDPPResponsectype();


    @XoProperty(XoColValuesDistinctctype)
    colValuesDistinct: XoColValuesDistinctctype = new XoColValuesDistinctctype();


}

@XoArrayClass(XoPayloadctype)
export class XoPayloadctypeArray extends XoArray<XoPayloadctype> {
}
