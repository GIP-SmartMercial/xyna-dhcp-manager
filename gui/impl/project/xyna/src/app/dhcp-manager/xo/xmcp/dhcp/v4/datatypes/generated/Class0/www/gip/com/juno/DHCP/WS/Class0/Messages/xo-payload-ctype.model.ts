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
import { XoXSDBaseModel } from '../../../../../../../../../../../../../../xdnc/model/xsd/xo-xsdbase-model.model';
import { XoMetaInfoctype } from '../../../../Gui/WS/Messages/xo-meta-info-ctype.model';
import { XoRowListctype1 } from './xo-row-list-ctype1.model';
import { XoRowctype1 } from './xo-row-ctype1.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.Class0.www.gip.com.juno.DHCP.WS.Class0.Messages', 'Payload_ctype')
export class XoPayloadctype extends XoXSDBaseModel {


    @XoProperty(XoMetaInfoctype)
    metaInfoOutput: XoMetaInfoctype = new XoMetaInfoctype();


    @XoProperty(XoRowListctype1)
    getAllRowsOutput: XoRowListctype1 = new XoRowListctype1();


    @XoProperty(XoRowListctype1)
    searchRowsOutput: XoRowListctype1 = new XoRowListctype1();


    @XoProperty(XoRowctype1)
    updateRowOutput: XoRowctype1 = new XoRowctype1();


    @XoProperty(XoRowctype1)
    insertRowOutput: XoRowctype1 = new XoRowctype1();


    @XoProperty()
    deleteRowsOutput: string;


    @XoProperty()
    countAllRowsOutput: string;


    @XoProperty()
    countRowsWithConditionOutput: string;


}

@XoArrayClass(XoPayloadctype)
export class XoPayloadctypeArray extends XoArray<XoPayloadctype> {
}
