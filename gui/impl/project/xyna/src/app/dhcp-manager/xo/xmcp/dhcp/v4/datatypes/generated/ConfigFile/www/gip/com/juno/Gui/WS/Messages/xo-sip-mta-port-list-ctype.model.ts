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
import { XoSipMtaPortctype } from './xo-sip-mta-port-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.ConfigFile.www.gip.com.juno.Gui.WS.Messages', 'SipMtaPortList_ctype')
export class XoSipMtaPortListctype extends XoXSDBaseModel {


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort1: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort2: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort3: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort4: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort5: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort6: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort7: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort8: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort9: XoSipMtaPortctype = new XoSipMtaPortctype();


    @XoProperty(XoSipMtaPortctype)
    sipMtaPort10: XoSipMtaPortctype = new XoSipMtaPortctype();


}

@XoArrayClass(XoSipMtaPortListctype)
export class XoSipMtaPortListctypeArray extends XoArray<XoSipMtaPortListctype> {
}
