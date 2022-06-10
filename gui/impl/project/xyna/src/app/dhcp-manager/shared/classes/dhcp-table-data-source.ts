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
import { XoObject } from '@zeta/api';
import { Comparable, Constructor } from '@zeta/base';
import { I18nService } from '@zeta/i18n';
import { XcLocalTableDataSource, XcSortPredicate, XcTableColumn, XcTableDataRequestOptions } from '@zeta/xc';



export class DHCPTableDataSource<R extends Comparable = XoObject> extends XcLocalTableDataSource<R> {

    get rows(): R[] {
        return this.data ;
    }

    constructor(private readonly rowClass: Constructor<R>, i18nService?: I18nService) {
        super(i18nService);
        this.refreshOnFilterChange = false;
    }

    buildTable(metaInfoRowctypeArray: {colnum: number, guiname: string, colname: string, visible: boolean}[]) {

        const columns: XcTableColumn[] = [];
        const cols = metaInfoRowctypeArray.sort((a, b) => a.colnum - b.colnum);
        cols.filter(col => col.visible).forEach(col => {
            columns.push({
                name: col.guiname,
                path: this.pathysized(col.colname)
            });
        });
        this.localTableData = { columns, rows: this.rows || [] };
        this.refresh();

    }

    fillTable(rows: R[]) {
        this.clear();
        rows.forEach(row => this.add(row));
        this.refresh();
    }

    protected request(options: XcTableDataRequestOptions) {
        const process = () => {
            let rows = this.localTableData.rows.concat();
            const columns = this.localTableData.columns;
            // filter rows first
            if (options.filter) {
                rows = rows.filter(row => {
                    return true;
                });
            }
            // sort rows afterwards
            if (options.sort && options.sort.path) {
                rows = rows.sort(XcSortPredicate(options.sort.direction, row => this.resolve(row, options.sort.path)));
            }
            // skip leading rows
            if (options.skip > 0) {
                rows = rows.slice(options.skip);
            }
            // limit remaining rows
            if (options.limit >= 0) {
                rows = rows.slice(0, options.limit);
            }
            // set data
            this.tableData = {
                rows: rows,
                columns: columns
            };
        };

        if (this.localTableDataAsync) {
            this.localTableDataAsync.subscribe(() => process());
        } else {
            process();
        }
    }

    isRequestingRows() {
        const varName = '_refreshCounter';
        this[varName] += 1;
    }

    resolve(row: R, path: string): string {
        const pathized = this.pathysized(path);
        const data = 'data';
        return row[data][pathized];
    }

    /**
     * The column name delivered by the GetMetaInfo-Service cannot be directly mapped to the
     * XcColumnInfo.path and therefore cannot be resolved by XcTable
     */
    pathysized(str: string): string {
        // const instance = new this.rowClass() as R;
        // const keys = Array.from(((instance as unknown as XoObject).properties).keys());

        // this simple conversion seems to be sufficent
        return str.substr(0, 1).toLowerCase() + str.substring(1);
    }

    getFilterObject(): R {
        let keys: string[] = [];
        if (this.localTableData && this.localTableData.columns) {
            keys = this.localTableData.columns.map<string>(col => this.pathysized(col.path));
        }
        const r = new this.rowClass();
        keys.forEach(key => {
            r[key] = this.getFilter(key);
        });
        return r;
    }

}
