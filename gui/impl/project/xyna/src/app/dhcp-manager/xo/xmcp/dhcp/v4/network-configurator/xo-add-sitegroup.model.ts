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
import { XoRowctype } from '../datatypes/generated/Target/www/gip/com/juno/DHCP/WS/Target/Messages/xo-row-ctype.model';


export class XoAddSitegroup extends XoObject {

    @XoProperty()
    gruopName: string;
    @XoProperty(XoRowctype)
    targetOne: XoRowctype;
    @XoProperty(XoRowctype)
    targetTwo: XoRowctype;
    @XoProperty(XoOptionsArray)
    dropDownOptions: XoOptionsArray<XoRowctype>;

}

export class XoAddSitegroupArray extends XoArray<XoAddSitegroup> {
}
