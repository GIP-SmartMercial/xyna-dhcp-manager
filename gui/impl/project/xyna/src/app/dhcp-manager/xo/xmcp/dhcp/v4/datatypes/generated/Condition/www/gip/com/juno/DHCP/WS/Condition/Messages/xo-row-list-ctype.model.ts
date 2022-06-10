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
import { XoArray, XoArrayClass, XoObjectClass, XoProperty } from '@zeta/api';

import { XoXSDBaseModel } from '../../../../../../../../../../../../../../xdnc/model/xsd/xo-xsdbase-model.model';
import { XoRowListctype as XoOperatorList } from '../../../../../../../../../GuiOperator/www/gip/com/juno/DHCP/WS/GuiOperator/Messages/xo-row-list-ctype.model';
import { XoRowListctype as XoParameterList } from '../../../../../../../../../GuiParameter/www/gip/com/juno/DHCP/WS/GuiParameter/Messages/xo-row-list-ctype.model';
import { XoRowctypeArray } from './xo-row-ctype.model';


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages', 'RowList_ctype')
export class XoRowListctype extends XoXSDBaseModel {


    @XoProperty(XoRowctypeArray)
    row: XoRowctypeArray = new XoRowctypeArray();

    set parameterList(val: XoParameterList) {
        this.row.data.forEach(row => {
            row.parameterList = val;
        });
    }

    set operatorList(val: XoOperatorList) {
        this.row.data.forEach(row => {
            row.operatorList = val;
        });
    }
}

@XoArrayClass(XoRowListctype)
export class XoRowListctypeArray extends XoArray<XoRowListctype> {
}
