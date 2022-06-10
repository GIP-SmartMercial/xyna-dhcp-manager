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
import { isString } from '@zeta/base';
import { XcOptionItem } from '@zeta/xc';


/**
 * This Object should always be used as a Transient Subobject of real Xo.
 * Define in this Object the Dropdown Options as Subobjectarray of the xo with Data bevor use generic-dialog with type dropDown.
 * Name it as dropDownOptions.
 */
export class XoOptions<T = string> extends XoObject {

    @XoProperty()
    label: string;
    @XoProperty()
    value: T;

    getXcOptionItem(): XcOptionItem<string> {
        return <XcOptionItem<string>>{value: isString(this.value) ? this.value : '', name: this.label};
    }

    static buildOption<V = string>(label: string, value: V): XoOptions<V> {
        const ret = new XoOptions<V>();
        ret.label = label;
        ret.value = value;
        return ret;
    }
}

export class XoOptionsArray<T = string> extends XoArray<XoOptions<T>> {

    getOptionItems(): XcOptionItem<string>[] {
        return this.data.map<XcOptionItem<string>>(value => value.getXcOptionItem());
    }

    static fromArray<V = string>(options: XoOptions<V>[]): XoOptionsArray<V> {
        const ret = new XoOptionsArray<V>();
        options.forEach(option => {
            ret.data.push(option);
        });
        return ret;
    }
}
