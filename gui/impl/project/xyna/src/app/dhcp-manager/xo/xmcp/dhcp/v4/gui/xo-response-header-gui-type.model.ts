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
import { XoArray, XoArrayClass, XoObject, XoObjectClass, XoProperty } from '@zeta/api';

import { XoErrorParameterGUItype } from './xo-error-parameter-gui-type.model';


@XoObjectClass(null, 'xmcp.dhcp.v4.gui.datatypes', 'ResponseHeader_GUItype')
export class XoResponseHeaderGUItype extends XoObject {


    @XoProperty()
    errorDomain: string;

    @XoProperty()
    errorNumber: string;

    @XoProperty()
    severity: string;

    @XoProperty()
    description: string;

    @XoProperty()
    stacktrace: string;

    @XoProperty(XoErrorParameterGUItype)
    parameterList: XoErrorParameterGUItype;

    @XoProperty()
    status0: string;


}

@XoArrayClass(XoResponseHeaderGUItype)
export class XoResponseHeaderGUItypeArray extends XoArray<XoResponseHeaderGUItype> {
}
