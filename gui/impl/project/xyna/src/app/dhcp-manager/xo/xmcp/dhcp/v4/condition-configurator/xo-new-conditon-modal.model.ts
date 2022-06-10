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
import { XoArray, XoObject, XoProperty } from '@zeta/api';

import { XoOptionsArray } from '../../../../../shared/modals/generic-dialog/xo-gui-only-options.model';
import { XoRowctype as XoCondition } from '../datatypes/generated/Condition/www/gip/com/juno/DHCP/WS/Condition/Messages/xo-row-ctype.model';


export class XoNewCondition extends XoObject {

    @XoProperty(XoCondition)
    condition: XoCondition;

    @XoProperty(XoOptionsArray)
    parameterDropDownOptions: XoOptionsArray;

    @XoProperty(XoOptionsArray)
    operatorDropDownOptions: XoOptionsArray;
}

export class XoNewConditionArray extends XoArray<XoNewCondition> {
}
