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
import { XoRowctype as XoPoolType } from '../datatypes/generated/Pooltype/www/gip/com/juno/DHCP/WS/Pooltype/Messages/xo-row-ctype.model';


// FIXME Shall there be no @XoObjectClass by intention?
export class XoAddEditPooltype extends XoObject {

    @XoProperty()
    isDefault: boolean;
    @XoProperty(XoPoolType)
    poolType: XoPoolType;
    @XoProperty(XoOptionsArray)
    dropDownOptions: XoOptionsArray;

    writeBooleans() {

        if (this.isDefault) {
            this.poolType.isDefault = 'yes';
        } else {
            this.poolType.isDefault = 'no';
        }
    }

    readBooleans() {

        if (!this.poolType.isDefault) {
            this.isDefault = false;
        } else {
            this.isDefault = this.poolType.isDefault.toLocaleLowerCase() === 'yes';
        }
    }
}

export class XoAddEditPooltypeArray extends XoArray<XoAddEditPooltype> {
}
