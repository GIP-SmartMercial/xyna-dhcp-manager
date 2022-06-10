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

import { XoObject } from '@zeta/api';
import { Constructor } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcDialogService } from '@zeta/xc';

import { BehaviorSubject, Observable } from 'rxjs/';

import { DHCPApiService } from './dhcp-api.service';
import { DHCPManagerGenericRouteComponent } from './dhcp-manager-generic-route.component';
import { DHCPTableDataSource } from './dhcp-table-data-source';


@Component({
    template: ''
})
export class GenericTableDetailsComponent<R extends XoObject = XoObject> extends DHCPManagerGenericRouteComponent {

    protected tableRowCount: string;

    get tableRowCountString(): string {
        const str = this.tableRowCount ? 'Showing $0/$1 Entries' : 'Showing $0 Entries';
        return this.i18nService.translate(
            str,
            {key: '$0', value: '' + this.tableDataSource.rows.length || '0'},
            {key: '$1', value: this.tableRowCount || '0'});
    }

    private readonly shortColumnPathSet = new Set<string>();
    private readonly shortColumnCSSClassName = 'short-column-class';

    protected _tableDataSource: DHCPTableDataSource<R>;
    private readonly _currentObjectChange = new BehaviorSubject<R>(null);

    get tableDataSource(): DHCPTableDataSource<R> {
        return this._tableDataSource;
    }

    get currentObject(): R {
        return this._currentObjectChange.value;
    }

    set currentObject(value: R) {
        this._currentObjectChange.next(value);
    }

    get currentObjectChange(): Observable<R> {
        return this._currentObjectChange.asObservable();
    }

    constructor(injector: Injector, protected apiService: DHCPApiService, protected i18nService: I18nService, protected dialogService: XcDialogService) {
        super(injector, apiService, i18nService, dialogService);

        this._tableDataSource = new DHCPTableDataSource<R>(this.getRowClass());
        this.tableDataSource.localTableData = {
            columns: [],
            rows: []
        };
        this.tableDataSource.selectionModel.selectionChange.subscribe({next: model => this.currentObject = model.selection[0] });

        this.tableDataSource.stylesFunction = (row, path) => {
            return this.shortColumnPathSet.has(path) ? [this.shortColumnCSSClassName] : [];
        };
    }

    protected getRowClass(): Constructor<R> {
        return null;
    }

    useShortColumnStyle(path: string) {
        this.shortColumnPathSet.add(path);
    }

    onShow() {
        super.onShow();
    }

    onHide() {
        super.onHide();
    }

    refresh() {
    }

    close() {
        this.currentObject = null;
        this.tableDataSource.selectionModel.clear();
    }

}
