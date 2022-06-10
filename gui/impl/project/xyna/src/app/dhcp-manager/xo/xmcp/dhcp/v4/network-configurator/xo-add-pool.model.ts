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
import { XoRowctype as XoPool } from '../datatypes/generated/Pool/www/gip/com/juno/DHCP/WS/Pool/Messages/xo-row-ctype.model';


export class XoAddPool extends XoObject {

    @XoProperty()
    statistic: boolean;
    @XoProperty()
    targetState: boolean;
    @XoProperty(XoPool)
    pool: XoPool;
    @XoProperty(XoOptionsArray)
    dropDownOptions: XoOptionsArray;

    writeBooleans() {

        if (this.statistic) {
            this.pool.useForStatistics = 'yes';
        } else {
            this.pool.useForStatistics = 'no';
        }
        if (this.targetState) {
            this.pool.targetState = 'active';
        } else {
            this.pool.targetState = 'inactive';
        }
    }

    readBooleans() {

        if (!this.pool.useForStatistics) {
            this.statistic = false;
        } else {
            this.statistic = this.pool.useForStatistics.toLocaleLowerCase() === 'yes';
        }
        if (!this.pool.targetState) {
            this.targetState = false;
        } else {
            this.targetState = this.pool.targetState.toLocaleLowerCase() === 'active';
        }
    }

}

export class XoAddPoolArray extends XoArray<XoAddPool> {
}
