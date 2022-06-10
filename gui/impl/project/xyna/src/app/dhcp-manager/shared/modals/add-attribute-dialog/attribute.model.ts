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
import { Comparable } from '@zeta/base';

import { XoRowctype as XoGuiAttribute } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiAttribute/www/gip/com/juno/DHCP/WS/GuiAttribute/Messages/xo-row-ctype.model';
import { XoRowctype as XoGuiFixedAttribute } from '../../../xo/xmcp/dhcp/v4/datatypes/generated/GuiFixedAttribute/www/gip/com/juno/DHCP/WS/GuiFixedAttribute/Messages/xo-row-ctype.model';


export interface FromArrayResult {
    inString: Attribute[];
    notInString: Attribute[];
}

export const localValueRequirement: RegExp = /^[^<>]*$/;

export class Attribute implements Comparable {

    get uniqueKey(): string {

        if (this.isGlobal) {
            return 'Glob' + this.id;
        } else {
            return 'Loca' + this.id;
        }
    }
    equals(that?: this): boolean {
        if (!that) {
            return false;
        }
        if ((this.isGlobal && that.isGlobal) ||
            (!this.isGlobal && !that.isGlobal)) {
            return this.id === that.id;
        } else {
            return false;
        }
    }

    constructor(id: string, name: string, isGlobal: boolean, value?: string, possibleValues: string[] = [], force: boolean = false) {
        this.id = id;
        this.name = name;
        this.isGlobal = isGlobal;
        this.value = value;
        this.possibleValues = possibleValues;
        this.force = force;
    }


    static localFromXoArray(baseString: string, localAttributes: XoGuiAttribute[]): FromArrayResult {
        // Attributes have the Form #id1=<#value1>,#id2=<#value2>,#id3=<#value3>
        const ret: FromArrayResult = <FromArrayResult>{inString: [], notInString: []};
        localAttributes.forEach(value => {
            const attr: Attribute = new Attribute(value.guiAttributeID, value.name, false, '', [], false);
            const reg: RegExp = new RegExp('\\b' + value.guiAttributeID + '(?::|)=<[^>]*');
            // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            let matchResult: string[] = baseString.match(reg);
            if (matchResult) {
                matchResult = matchResult[0].split('=<');
                if (matchResult[0].endsWith(':')) {
                    attr.force = true;
                }
                attr.value = matchResult[1];
                ret.inString.push(attr);
            } else {
                ret.notInString.push(attr);
            }
        });
        return ret;
    }

    static globalFromXoArray(baseString: string, globalAttributes: XoGuiFixedAttribute[]): FromArrayResult {
        // FixedAttributes have the Form #id1,#id2,#id3
        const ret: FromArrayResult = <FromArrayResult>{inString: [], notInString: []};
        globalAttributes.forEach(value => {
            const attr: Attribute = new Attribute(value.guiFixedAttributeID, value.name, true, value.value, value.valueRange.split(','), false);
            const reg: RegExp = new RegExp('\\b' + value.guiFixedAttributeID + '(?::|\\b)');
            // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            const matchResult: string[] = baseString.match(reg);
            if (matchResult) {
                if (matchResult[0].endsWith(':')) {
                    attr.force = true;
                }
                ret.inString.push(attr);
            } else {
                ret.notInString.push(attr);
            }
        });
        return ret;
    }

    integrateInString(baseString: string): string {

        if (baseString === '') {
            return this.toString();
        }
        let reg: RegExp;
        if (this.isGlobal) {
            reg = new RegExp('(?<=^|,)' + this.id + '(?::|)(?=$|,)|$');
            return baseString.replace(reg,
                (match: string) => {
                    if (match) {
                        return this.toString();
                    } else {
                        return ',' + this.toString();
                    }
                });
        } else {
            reg = new RegExp('(?<=^|,)' + this.id + '(?::|)=<[^>]+>(?=$|,)|$');
            return baseString.replace(reg,
                (match: string) => {
                    if (match) {
                        return this.toString();
                    } else {
                        return ',' + this.toString();
                    }
                });
        }
    }

    eraseFromString(baseString: string): string {

        let reg: RegExp;
        if (this.isGlobal) {
            reg = new RegExp('(?:,|^)' + this.id + '(?::|)(?:,|$)');
        } else {
            reg = new RegExp('(?:,|^)' + this.id + '(?::|)=<' + this.value + '>(?:,|$)');
        }
        return baseString.replace(reg,
            (match: string) => {
                if (match.startsWith(',') && match.endsWith(',')) {
                    return ',';
                } else {
                    return '';
                }
            });
    }

    toString(): string {
        if (this.isGlobal) {
            return this.force ? this.id + ':' : this.id;
        } else {
            return (this.force ? this.id + ':' : this.id) + '=<' + this.value + '>';
        }
    }

    id: string;
    name: string;
    isGlobal: boolean;
    value: string;
    possibleValues: string[];
    force: boolean;
}
