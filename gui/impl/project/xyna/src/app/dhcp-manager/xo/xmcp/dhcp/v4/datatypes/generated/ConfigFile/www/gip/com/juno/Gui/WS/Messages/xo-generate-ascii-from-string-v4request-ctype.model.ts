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
import { XoInputHeaderContentctype } from './xo-input-header-content-ctype.model';
import { XoGenerateAsciiFromStringV4Inputctype } from './xo-generate-ascii-from-string-v4input-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.ConfigFile.www.gip.com.juno.Gui.WS.Messages', 'GenerateAsciiFromStringV4Request_ctype')
export class XoGenerateAsciiFromStringV4Requestctype extends XoXSDBaseModel {


    @XoProperty(XoInputHeaderContentctype)
    inputHeader: XoInputHeaderContentctype = new XoInputHeaderContentctype();


    @XoProperty(XoGenerateAsciiFromStringV4Inputctype)
    generateAsciiFromStringV4Input: XoGenerateAsciiFromStringV4Inputctype = new XoGenerateAsciiFromStringV4Inputctype();


}

@XoArrayClass(XoGenerateAsciiFromStringV4Requestctype)
export class XoGenerateAsciiFromStringV4RequestctypeArray extends XoArray<XoGenerateAsciiFromStringV4Requestctype> {
}
