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
import { XcCustomValidatorFunction } from '@zeta/xc';

import { XoRowctype as XoPool } from '../../xo/xmcp/dhcp/v4/datatypes/generated/Pool/www/gip/com/juno/DHCP/WS/Pool/Messages/xo-row-ctype.model';


// Netmask section
export const ipv4RegExp = /^(?:(?:2[0-4]\d|25[0-5]|1\d\d|\d\d?)\.){3}(?:2[0-4]\d|25[0-5]|1\d\d|\d\d?)$/;
const validMaskParts: string[] = ['0', '128', '192', '224', '240', '248', '252', '254'];

export const validNetmask = function(mask: string): boolean {

    if (!mask) {
        return false;
    }

    const numbers = mask.split('.');
    if (numbers.length !== 4) {
        return false;
    }
    let found: boolean = false;
    for (let index: number = 0; index < 4; index++) {
        if (found) {
            if (numbers[index] !== '0') {
                return false;
            }
        } else if (numbers[index] !== '255') {
                if (validMaskParts.includes(numbers[index])) {
                    found = true;
                } else {
                    return false;
                }
            }
    }
    return true;
};

export const convertNetmaskToCIDR = function(mask: string): number {

    const numbers = mask.split('.');
    for (let ind: number = 0; ind < 4; ind++) {
        const index: number = validMaskParts.findIndex((value: string) => {
            return value === numbers[ind];
        });
        if (index > -1) {
            return (8 * ind + index);
        }
    }
    return 32;
};

export const validCIDR = function(cidrSt: string): boolean {
    if (cidrSt.startsWith('/')) {
        cidrSt = cidrSt.substring(1);
    }
    const cidr: number = parseInt(cidrSt, 10);
    return -1 < cidr && cidr < 33;
};

export const convertCIDRToNetmask = function(cidr: number): string {

    if (cidr === 32) {
        return '255.255.255.255';
    } else {
        let ret: string = '';
        const numberOf255: number = Math.floor(cidr / 8);
        for (let ind: number = 0; ind < numberOf255; ind++) {
            ret = ret + '255.';
        }

        ret = ret + validMaskParts[cidr % 8];

        for (let ind: number = 0; ind < 3 - numberOf255; ind++) {
            ret = ret + '.0';
        }

        return ret;
    }
};

export const subnetLieInNetmask = function(subnet: string, mask: string): boolean {

    if (!subnet || !mask) {
        return false;
    }

    const maskNumbers = mask.split('.');
    const subnetNumbers = subnet.split('.');

    if (maskNumbers.length !== 4 || subnetNumbers.length !== 4) {
        return false;
    }

    for (let ind: number = 0; ind < 4; ind++) {

        if (maskNumbers[ind] !== '255') {
            const steps: number = 256 / Math.pow(2, (validMaskParts.findIndex(value => value === maskNumbers[ind])));

            let current: number = 0;
            while (current < 256) {
                if (subnetNumbers[ind] === current.toString(10)) {
                    break;
                }
                current = current + steps;
            }
            if (current > 255) {
                return false;
            }
        }
    }

    return true;
};

// Pool section
const ipLieInPool = function(ip: string, poolStart: string, poolEnd: string): boolean {
    const ipNumbers: number[] = ip.split('.').map<number>(value => parseInt(value, 10));
    const poolStartNumbers: number[] = poolStart.split('.').map<number>(value => parseInt(value, 10));
    const poolEndNumbers: number[] = poolEnd.split('.').map<number>(value => parseInt(value, 10));
    // ip > start?
    for (let ind: number = 0; ind < 4; ind++) {
        if (ipNumbers[ind] < poolStartNumbers[ind]) {
            return false;
        } else if (ipNumbers[ind] > poolStartNumbers[ind]) {
            break;
        }
    }
    // ip < end?
    for (let ind: number = 0; ind < 4; ind++) {
        if (poolEndNumbers[ind] < ipNumbers[ind]) {
            return false;
        } else if (poolEndNumbers[ind] > ipNumbers[ind]) {
            break;
        }
    }
    return true;
};

/**
 * This Validator needs exactly one argument.
 * The Argument is a reference of a Pool.
 */
class PoolStartEndValidator implements XcCustomValidatorFunction {
    onValidate(value: any, args: any[]): boolean {

        // validate args;
        if (!value || !args || args.length !== 1 || !args[0] || !(args[0] instanceof XoPool)) {
            return false;
        }
        // args[0].rangeStart = args[0].rangeStart.trim();
        if (!ipv4RegExp.test(args[0].rangeStart) || !ipv4RegExp.test(args[0].rangeStop)) {
            return false;
        }

        // args[0].rangeStart = args[0].rangeStart + ' ';
        // console.log('hi');

        // actual validation
        if (!ipv4RegExp.test(value) || !ipv4RegExp.test(value)) {
            return false;
        }
        return ipLieInPool(value, args[0].rangeStart, args[0].rangeStop);
    }
    errorText: string = 'Start IP does not fit to end IP.';

}

/**
 * This Validator needs exatly one arg, for the pool.
 * It checks wether the input-value is a comma seperated IPv4-list and the last number lies betwenn start and end IP.
 */
class PoolExclusionsValidator implements XcCustomValidatorFunction {

    onValidate(value: string, args: any[]): boolean  {

        // no exclusions
        if (!value) {
            return true;
        }

        // validate args;
        if (!args || args.length !== 1 || !(args[0] instanceof XoPool)) {
            return false;
        }
        if (!ipv4RegExp.test(args[0].rangeStart) || !ipv4RegExp.test(args[0].rangeStop)) {
            return false;
        }

        // actual validation
        const exclusions: string[] = value.split(',');
        if (exclusions.length > 10) {
            return false;
        }

        for (let ind: number = 0; ind < exclusions.length; ind++) {
            exclusions[ind] = exclusions[ind].trim();
            if (ipv4RegExp.test(exclusions[ind])) {
                // only one
                if (!ipLieInPool(exclusions[ind], args[0].rangeStart, args[0].rangeStop)) {
                    return false;
                }
            } else {
                // range
                const temp: string[] = exclusions[ind].split(' - ');
                if (temp.length !== 2) {
                    return false;
                }
                if (!ipv4RegExp.test(temp[0]) || !ipv4RegExp.test(temp[1])) {
                    return false;
                }
                if (!ipLieInPool(temp[0], args[0].rangeStart, args[0].rangeStop) || !ipLieInPool(temp[1], args[0].rangeStart, args[0].rangeStop)) {
                    return false;
                }
            }
        }

        return true;
    }

    errorText: string = 'IP lie not in range or there are too many exlusions.';
}

export const PoolValidatorStartEnd: PoolStartEndValidator = new PoolStartEndValidator();
export const PoolValidatorExclusions: PoolExclusionsValidator = new PoolExclusionsValidator();
