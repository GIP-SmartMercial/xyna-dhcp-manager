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
import { XoTextConfigGeneratorParametersctype } from './xo-text-config-generator-parameters-ctype.model';
import { XoCableModemRequestctype } from './xo-cable-modem-request-ctype.model';
import { XoInitializedCableModemctype } from './xo-initialized-cable-modem-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.ConfigFile.www.gip.com.juno.Gui.WS.Messages', 'GenerateAsciiFromTemplateForInitializedCableModemInput_ctype')
export class XoGenerateAsciiFromTemplateForInitializedCableModemInputctype extends XoXSDBaseModel {


    @XoProperty(XoTextConfigGeneratorParametersctype)
    textConfigGeneratorParameters: XoTextConfigGeneratorParametersctype = new XoTextConfigGeneratorParametersctype();


    @XoProperty(XoCableModemRequestctype)
    cableModemRequest: XoCableModemRequestctype = new XoCableModemRequestctype();


    @XoProperty(XoInitializedCableModemctype)
    initializedCableModem: XoInitializedCableModemctype = new XoInitializedCableModemctype();


}

@XoArrayClass(XoGenerateAsciiFromTemplateForInitializedCableModemInputctype)
export class XoGenerateAsciiFromTemplateForInitializedCableModemInputctypeArray extends XoArray<XoGenerateAsciiFromTemplateForInitializedCableModemInputctype> {
}
