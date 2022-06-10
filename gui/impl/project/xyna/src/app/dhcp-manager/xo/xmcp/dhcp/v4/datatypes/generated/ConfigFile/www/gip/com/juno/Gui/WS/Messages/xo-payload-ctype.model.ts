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
import { XoTlvToAsciiResponsectype } from './xo-tlv-to-ascii-response-ctype.model';
import { XoTextResponsectype } from './xo-text-response-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.ConfigFile.www.gip.com.juno.Gui.WS.Messages', 'Payload_ctype')
export class XoPayloadctype extends XoXSDBaseModel {


    @XoProperty(XoTlvToAsciiResponsectype)
    tlvToAsciiResponse: XoTlvToAsciiResponsectype = new XoTlvToAsciiResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForInitializedCableModemResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForInitializedCableModemResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForUnregisteredCableModemResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForUnregisteredCableModemResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromStringResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromStringV4Response: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    showPacketsAsAsciiResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    showV4PacketsAsAsciiResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromStringResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromStringV4Response: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForSipMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForSipMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForNcsMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForNcsMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForIsdnMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForIsdnMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForUninitializedMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForUninitializedMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateAsciiFromTemplateForUnregisteredMtaResponse: XoTextResponsectype = new XoTextResponsectype();


    @XoProperty(XoTextResponsectype)
    generateTlvFromTemplateForUnregisteredMtaResponse: XoTextResponsectype = new XoTextResponsectype();


}

@XoArrayClass(XoPayloadctype)
export class XoPayloadctypeArray extends XoArray<XoPayloadctype> {
}
