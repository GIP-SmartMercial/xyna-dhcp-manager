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
import { Component, Injector } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcCustomValidatorFunction, XcDialogComponent } from '@zeta/xc';

import { Observable } from 'rxjs/internal/Observable';

import { convertCIDRToNetmask, convertNetmaskToCIDR, subnetLieInNetmask, validCIDR, validNetmask } from '../../../../shared/validator/validator';
import { XoRowctype as XoSubnet } from '../../../../xo/xmcp/dhcp/v4/datatypes/generated/Subnet/www/gip/com/juno/DHCP/WS/Subnet/Messages/xo-row-ctype.model';


export interface AddSubnetDialogComponentData {
    subnet: XoSubnet;
    addFunction: (subnet: XoSubnet) => Observable<boolean>;
}

@Component({
    templateUrl: './add-subnet-dialog.component.html',
    styleUrls: ['./add-subnet-dialog.component.scss']
})
export class AddSubnetDialogComponent extends XcDialogComponent<boolean, AddSubnetDialogComponentData> {

    subnet: XoSubnet;
    busy: boolean = false;

    private _netmask: string;
    set netmask(val: string) {
        if (this._netmask !== val && validNetmask(val)) {
            this._cidr = convertNetmaskToCIDR(val);
            this.subnet.mask = val;
        }
        this._netmask = val;
    }
    get netmask(): string {
        return this._netmask;
    }
    private _cidr: number;
    set cidr(valSt: string) {
        if (valSt.startsWith('/')) {
            valSt = valSt.substring(1);
        }
        const val: number = parseInt(valSt, 10);
        if (this._cidr !== val && validCIDR(valSt)) {
            this._netmask = convertCIDRToNetmask(val);
            this.subnet.mask = this._netmask;
        }
        this._cidr = val;
    }
    get cidr(): string {
        return this._cidr ? '/' + this._cidr.toString(10) : '';
    }

    subnetValidator: XcCustomValidatorFunction = {
        onValidate: value => subnetLieInNetmask(value, this._netmask),
        errorText: 'This subnet lies not in the netmask.'
    };
    netmaskValidator: XcCustomValidatorFunction = {
        onValidate: validNetmask,
        errorText: 'This is not a valid netmask.'
    };
    CIDRValidator: XcCustomValidatorFunction = {
        onValidate: validCIDR,
        errorText: 'CIDR should be between 0 and 32.'
    };

    constructor(injector: Injector, private readonly i18nService: I18nService) {
        super(injector);
        this.subnet = this.injectedData.subnet;
    }

    apply() {
        this.busy = true;
        this.injectedData.addFunction(this.subnet).subscribe({
            next: result => {
                if (result) {
                    this.dismiss(true);
                }
            }
        }).add(() => this.busy = false);
    }
}
