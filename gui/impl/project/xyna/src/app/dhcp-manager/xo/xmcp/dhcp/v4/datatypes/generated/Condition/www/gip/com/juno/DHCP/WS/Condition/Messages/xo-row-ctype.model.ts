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


@XoObjectClass(XoXSDBaseModel, 'xmcp.dhcp.v4.datatypes.generated.Condition.www.gip.com.juno.DHCP.WS.Condition.Messages', 'Row_ctype')
export class XoRowctype extends XoXSDBaseModel {


    @XoProperty()
    conditionID: string;


    @XoProperty()
    parameter: string;


    @XoProperty()
    operator: string;


    @XoProperty()
    value: string;


    @XoProperty()
    name: string;


    parameterID: string = '';
    operatorID: string = '';


    private _parameterList: XoParameterList;
    private _operstorList: XoOperatorList;

    set parameterList(val: XoParameterList) {
        this._parameterList = val;
        this.remapParameter();
    }

    set operatorList(val: XoOperatorList) {
        this._operstorList = val;
        this.remapOperator();
    }

    private remapParameter() {
        if (this._parameterList) {
            const canidate = this._parameterList.row.data.find(value => {
                return value.guiParameterID === this.parameterID;
            });
            this.parameter = canidate? canidate.name: this.parameterID;
        } else {
            this.parameter = this.parameterID;
        }
    }
    private remapOperator() {
        if (this._operstorList) {
            const canidate = this._operstorList.row.data.find(value => {
                return value.guiOperatorID === this.operatorID;
            });
            this.operator = canidate? canidate.name: this.operatorID;
        } else {
            this.operator = this.operatorID;
        }
    }

    afterDecode() {
        super.afterDecode();
        this.parameterID = this.parameter;
        this.operatorID = this.operator;
        this.remapParameter();
        this.remapOperator();
    }

    beforeEncode() {
        super.beforeEncode();
        this.parameter = this.parameterID;
        this.operator = this.operatorID;
    }

}

@XoArrayClass(XoRowctype)
export class XoRowctypeArray extends XoArray<XoRowctype> {

    set parameterList(val: XoParameterList) {
        this.data.forEach(row => {
            row.parameterList = val;
        });
    }

    set operatorList(val: XoOperatorList) {
        this.data.forEach(row => {
            row.operatorList = val;
        });
    }
}
