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
import { XoRowctype } from './xo-row-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.DppFixedAttribute.www.gip.com.juno.DHCP.WS.DppFixedAttribute.Messages', 'UpdateRowPkInput_ctype')
export class XoUpdateRowPkInputctype extends XoXSDBaseModel {


    @XoProperty(XoRowctype)
    conditions: XoRowctype = new XoRowctype();


    @XoProperty(XoRowctype)
    newValues: XoRowctype = new XoRowctype();


}

@XoArrayClass(XoUpdateRowPkInputctype)
export class XoUpdateRowPkInputctypeArray extends XoArray<XoUpdateRowPkInputctype> {
}
