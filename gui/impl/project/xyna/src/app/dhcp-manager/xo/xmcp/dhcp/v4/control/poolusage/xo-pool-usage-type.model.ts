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
import { XoObjectClass, XoArrayClass, XoProperty, XoObject, XoArray } from '@zeta/api';


@XoObjectClass(null, 'xmcp.dhcp.v4.control.poolusage', 'PoolUsage_Type')
export class XoPoolUsageType extends XoObject {


    @XoProperty()
    dHCPServer: string;


    @XoProperty()
    standortGruppeID: string;


    @XoProperty()
    dHCPRelay: string;


    @XoProperty()
    sharedNetworkID: string;


    @XoProperty()
    pool: string;


    @XoProperty()
    poolID: string;


    @XoProperty()
    poolType: string;


    @XoProperty()
    pooltypeID: string;


    @XoProperty()
    size: number;


    @XoProperty()
    used: number;


    @XoProperty()
    usedFraction: number;


    @XoProperty()
    exceedsThreshold: boolean;


}

@XoArrayClass(XoPoolUsageType)
export class XoPoolUsageTypeArray extends XoArray<XoPoolUsageType> {
}
