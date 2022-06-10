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
import { ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from '@zeta/i18n';
import { RouteComponent } from '@zeta/nav';
import { XcDialogService, XDSIconName } from '@zeta/xc';

import { Observable } from 'rxjs/';
import { filter } from 'rxjs/operators';

import { DHCPApiService } from './dhcp-api.service';


@Component({
    template: ''
})
export class DHCPManagerGenericRouteComponent extends RouteComponent {

    protected router: Router;
    protected cdr: ChangeDetectorRef;

    XDSIconName = XDSIconName;

    constructor(protected injector: Injector, protected apiService: DHCPApiService, protected i18nService: I18nService, protected dialogService: XcDialogService) {
        super();
        this.router = this.injector.get(Router);
        this.cdr = this.injector.get(ChangeDetectorRef);
    }

    confirmAction( massage: string, action: (() => void) ): Observable<boolean> {

        const ret = this.dialogService.confirm(
            this.i18nService.translate('Confirm'),
            this.i18nService.translate(massage)
        ).afterDismiss();
        ret.pipe(filter(result => result)).subscribe({next: _ => action()});
        return ret;
    }

    onShow() {
        super.onShow();
    }

    onHide() {
        super.onHide();
    }

}
