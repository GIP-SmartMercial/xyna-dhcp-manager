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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiService, RuntimeContext, StartOrderOptions, StartOrderOptionsBuilder, StartOrderResult, Xo, XoClassInterface } from '@zeta/api';
import { AuthService } from '@zeta/auth';
import { isString, pack } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcDialogService } from '@zeta/xc';

import { Observable, Subject } from 'rxjs/';
import { tap } from 'rxjs/operators';

import { DHCP_RTC } from '../../const';
import { XoRegisterSessionResponse } from '../../xo/xmcp/dhcp/v4/datatypes/xo-register-session-response.model';
import { XoResponseHeaderGUItype } from '../../xo/xmcp/dhcp/v4/gui/xo-response-header-gui-type.model';


@Injectable()
export class DHCPApiService extends ApiService {

    // internalRTC = RuntimeContext.fromApplication('DHCP-Management');
    internalRTC = DHCP_RTC;

    sessionRegisteredSet = new Set<string>();

    constructor(http: HttpClient, protected authService: AuthService, private readonly dialogService: XcDialogService, private readonly i18nService: I18nService) {
        super(http);

        this.runtimeContext = this.internalRTC;
        this.authService.sessionInfoChange.subscribe({next: si => {
            // console.log('try registration of ', si.sessionId);
            if (si && !this.isSessionRegistered(si.sessionId)) {
                // console.log('preregistration of ' + si.sessionId);
                this.sessionRegisteredSet.add(si.sessionId);
                this.registerSession(si.sessionId).subscribe();
            }
        }});

    }

    isSessionRegistered(sessionId?: string): boolean {
        sessionId = sessionId || (this.authService ? this.authService.sessionInfo.sessionId : '');
        return this.sessionRegisteredSet.has(sessionId);
    }

    registerSession(sid: string) {
        const wf = 'xmcp.dhcp.v4.RegisterSession';
        return this.startOrder(this.internalRTC, wf, [], XoRegisterSessionResponse).pipe(tap(result => {
            if (result && !result.errorMessage) {
                // console.log('registered ' + sid, result.output[0]);
            } else {
                // console.log('error while registration of ' + sid, result.errorMessage);
                this.sessionRegisteredSet.delete(sid);
            }
        },
        err => {
            // console.log('error while registration of ' + sid, err);
            this.sessionRegisteredSet.delete(sid);
        }
        ));
    }

    startOrderWithHeader(rtc: RuntimeContext | 'internal', orderType: string, input?: Xo | Xo[], output?: XoClassInterface | XoClassInterface[], options?: StartOrderOptions): Observable<StartOrderResult> {

        const subject: Subject<StartOrderResult> = new Subject<StartOrderResult>();
        const outputWithHeader = [XoResponseHeaderGUItype, ...pack(output)];

        this.startOrder(rtc, orderType, input, outputWithHeader, options).subscribe({
            next: result => {
                if (result && !result.errorMessage) {
                    const header: XoResponseHeaderGUItype = result.output[0] as XoResponseHeaderGUItype;
                    if (header.description !== 'Ok') {
                        // error massage in Header
                        this.showError(header.description);
                        subject.error(header.description);
                    } else {
                        subject.next(result);
                    }
                } else {
                    subject.error(result.errorMessage);
                }
            },
            error: er => subject.error(er),
            complete: () => subject.complete()
        });
        return subject.asObservable();
    }

    startOrder(rtc: RuntimeContext | 'internal', orderType: string, input?: Xo | Xo[], output?: XoClassInterface | XoClassInterface[], options?: StartOrderOptions): Observable<StartOrderResult> {
        options = options || StartOrderOptionsBuilder.defaultOptionsWithErrorMessage;
        // options.monitoringLevel = 0;
        if (isString(rtc) && rtc === 'internal') {
            rtc = this.internalRTC;
        }
        return super.startOrder(rtc , orderType, input, output, options)
        .pipe(tap({
            next: result => {
                if (result && result.errorMessage) {
                    // xyna factory related error happened
                    this.showError(result.errorMessage);
                }
            },
            error: err => {
                // frontend or technical error happened
                if (isString(err)) {
                    this.showError(err);
                } else {
                    console.error(err);
                }
            }
        })/*,
        filter(result => result && !result.errorMessage)*/ // not filtering globally - allow local error handling
        );
    }

    showError(errorMessage: string) {

        const position: number = errorMessage.indexOf('|#|');
        if (position !== -1) {

            const code: string = errorMessage.substr(0, position);
            const codeType: string = code.substr(0, 1);
            const defaultMessage = 'Unknown Error';

            if (this.i18nService.hasTranslation(code)) {
                this.dialogService.error(this.i18nService.translate(code), null, errorMessage.substr(position + 3));
            } else if (this.i18nService.hasTranslation(codeType)) {
                this.dialogService.error(this.i18nService.translate(codeType), null, errorMessage.substr(position + 3));
            } else {
                this.dialogService.error(this.i18nService.translate(defaultMessage), null, errorMessage.substr(position + 3));
            }

        } else {
            this.dialogService.error(this.i18nService.translate(errorMessage));
        }
    }
}
