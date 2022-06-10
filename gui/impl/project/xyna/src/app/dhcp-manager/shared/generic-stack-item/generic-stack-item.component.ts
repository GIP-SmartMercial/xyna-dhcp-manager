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
import { Component, Injector, OnDestroy } from '@angular/core';

import { I18nService } from '@zeta/i18n';
import { XcRichListItem, XcTemplate, XDSIconName } from '@zeta/xc';
import { XcStackItem, XcStackItemObserver } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item';
import { XcStackItemComponent, XcStackItemComponentData } from '@zeta/xc/xc-stack/xc-stack-item/xc-stack-item.component';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';

import { DHCPManagerGenericRouteComponent } from '../classes/dhcp-manager-generic-route.component';
import { Attribute } from '../modals/add-attribute-dialog/attribute.model';
import { AttributeRichListComponent, AttributeRichListComponentData } from './attribute-rich-list/attribute-rich-list.component';
import { StackItemRichListComponent, StackItemRichListComponentData } from './stack-item-rich-list/stack-item-rich-list.component';


export interface GenericStackItemComponentData extends XcStackItemComponentData {
    communicationData: CommunicationData;
}

export interface CommunicationData {
    rootRef: DHCPManagerGenericRouteComponent;
    // Obsvarbale from parent to child
    changeObsDown?: Observable<string>;
    // set the Obsvarbale from child to parent
    setChangeObs?: (changeObsUp: Observable<string>) => void;
}

export interface BasicRichListData {
    id: string;

    selectable: boolean;
    select?: (id: string) => void;
    selected?: boolean;
}

@Component({
    template: ''
})
export class GenericStackItemComponent<D extends GenericStackItemComponentData> extends XcStackItemComponent<D> implements OnDestroy {

    /**
     * This Subject tricker if data of object changes. It returns the internal ID of the Object.
     * return '' if the component closed.
     * Example: 1. If the user delete a RichlistItem, then this subject triger and the subStack can close or refresh itself.
     *          2. If some data is changed, then the parent can refresh the associated RichListItem.
     */
    protected subscriptions: Subscription[] = [];
    protected changeSubject: Subject<string> = new Subject<string>();
    protected changeObsUp: Observable<string>;
    XDSIconName = XDSIconName;
    refreshing: boolean = false;

    lastSelectedID: string[] = [];
    protected lastClickedID: string = '';
    protected nextItemID: string = '';

    private _nextItem: XcStackItem = null;
    private _header: string = '';

    private _setSelectionListItem: (ids: string[]) => void;
    set keepSelection(value: boolean) {
        if (value) {
            this._setSelectionListItem = (ids: string[]) => {
                this.richList.forEach(subList => subList.forEach(item => {
                    if (ids.includes(item.data.id)) {
                        item.data.selected = true;
                    } else {
                        item.data.selected = false;
                    }
                }));
                this.lastSelectedID = ids;
                if (this.lastSelectedID.length === 1) {
                    if (this.lastSelectedID[0] !== this.nextItemID) {
                        this.openNextItem(this.lastSelectedID[0]);
                    }
                } else {
                    this.closeNextItem();
                }
            };
        } else {
            this._setSelectionListItem = (ids: string[]) => {
                const found: string[] = [];
                this.richList.forEach(subList => subList.forEach(item => {
                    if (ids.includes(item.data.id)) {
                        item.data.selected = true;
                        found.push(item.data.id);
                    } else {
                        item.data.selected = false;
                    }
                }));
                this.lastSelectedID = found;
                if (this.lastSelectedID.length === 1) {
                    if (this.lastSelectedID[0] !== this.nextItemID) {
                        this.openNextItem(this.lastSelectedID[0]);
                    }
                } else {
                    this.closeNextItem();
                }
            };
        }
    }

    set header(header: string) {
        this._header = header;
        this.stackItem.setBreadcrumbLabel(this._header);
    }

    get header(): string {
        return this._header;
    }

    richList: XcRichListItem<BasicRichListData>[][];

    constructor(injector: Injector, protected i18nService: I18nService) {
        super(injector);
        this.richList = new Array(1);
        this.richList[0] = new Array(0);
        if (this.injectedData.communicationData.setChangeObs) {
            this.injectedData.communicationData.setChangeObs(this.changeSubject.asObservable());
        }
        this.keepSelection = false;
    }

    get communicationData(): CommunicationData {
        return <CommunicationData>{
            rootRef: this.injectedData.communicationData.rootRef,
            changeObsDown: this.changeSubject.asObservable(),
            setChangeObs: ((changeObsUp: Observable<string>) => {
                this.changeObsUp = changeObsUp;
                this.afterOpen();
            })
        };
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub: Subscription) => {
            sub.unsubscribe();
        });
        this.changeSubject.next('');
        this.changeSubject.complete();
    }

    close() {
        this.stackItem.stack.close(this.stackItem).subscribe();
    }

    closeNextItem() {
        if (this._nextItem) {
            this.stackItem.stack.close(this._nextItem).subscribe();
        }
    }

    openNextItem(id: string) {
        this.closeNextItem();

        this._nextItem = new XcStackItem();
        this._nextItem.addItemObserver(<XcStackItemObserver>{
            afterClose: () => {
                this._nextItem = null;
            }
        });

        const template: XcTemplate = this.getNextComponentTemplate(this._nextItem, id);
        if (template !== null) {
            this._nextItem.setTemplate(template);
            this.stackItem.stack.open(this._nextItem);
            this.nextItemID = id;
        } else {
            this._nextItem = null;
            this.nextItemID = '';
        }
    }

    setSelectionListItem(ids: string[]) {
        this._setSelectionListItem(ids);
    }

    selectListItem(ids: string[]) {
        ids.forEach((id: string) => {
            if (!this.lastSelectedID.includes(id)) {
                this.lastSelectedID.push(id);
            }
        });
        this.setSelectionListItem(this.lastSelectedID);
    }

    deselectListItem(ids: string[]) {
        ids.forEach((id: string) => {
            const index: number = this.lastSelectedID.indexOf(id);
            if (index !== -1) {
                this.lastSelectedID.splice(index, 1);
            }
        });
        this.setSelectionListItem(this.lastSelectedID);
    }

    toggleSelection(ids: string[]) {
        ids.forEach((id: string) => {
            const index: number = this.lastSelectedID.indexOf(id);
            if (index === -1) {
                this.lastSelectedID.push(id);
            } else {
                this.lastSelectedID.splice(index, 1);
            }
        });
        this.setSelectionListItem(this.lastSelectedID);
    }

    resetSelection() {
        this.setSelectionListItem(this.lastSelectedID);
    }

    afterOpen() {

    }

    private multiSelect(id: string, toggle: boolean, range: boolean) {

        if (range) {
            let lastClickedListIndex: number = -1;
            let lastClickedItemIndex: number = -1;
            let idListIndex: number = -1;
            let idItemIndex: number = -1;

            this.richList.forEach((subList, listIndex) => {
                subList.forEach((item, itemIndex) => {
                    if (item.data.id === this.lastClickedID) {
                        lastClickedListIndex = listIndex;
                        lastClickedItemIndex = itemIndex;
                    }
                    if (item.data.id === id) {
                        idListIndex = listIndex;
                        idItemIndex = itemIndex;
                    }
                });
            });

            if (idListIndex === -1 || idItemIndex === -1) {
                return;
            }

            let rangeSelection: string[];
            if (lastClickedListIndex === idListIndex && lastClickedItemIndex !== idItemIndex) {
                let start: number;
                let end: number;
                if (lastClickedItemIndex < idItemIndex) {
                    start = lastClickedItemIndex;
                    end = idItemIndex;
                } else {
                    start = idItemIndex;
                    end = lastClickedItemIndex;
                }
                rangeSelection = this.richList[idListIndex].slice(start, end + 1).map<string>((item) => item.data.id);
            } else {
                rangeSelection = [id];
            }

            if (toggle) {
                this.toggleSelection(rangeSelection);
            } else {
                this.selectListItem(rangeSelection);
            }
        } else if (toggle) {
                this.toggleSelection([id]);
            } else {
                this.setSelectionListItem([id]);
            }

        this.lastClickedID = id;
    }

    protected changeID(identifyOldID: (id: string) => boolean, newID: string) {

        if (identifyOldID(this.nextItemID)) {
            this.nextItemID = newID;
        }
        if (identifyOldID(this.lastClickedID)) {
            this.lastClickedID = newID;
        }
        this.lastSelectedID = this.lastSelectedID.map((id: string) => {
            if (identifyOldID(id)) {
                return newID;
            } else {
                return id;
            }
        });
    }

    /**
     * return null if it is a leaf component.
     */
    protected getNextComponentTemplate(item: XcStackItem, id: string): XcTemplate {
        return null;
    }


    // RichList Factory Area
    constructRichListItem(
        ident: string, values: string[],
        deleteTooltip: string, deleteFunction: (id: string) => void,
        selectable: boolean = true, multiSelectable = false
        ): XcRichListItem<StackItemRichListComponentData> {

        return <XcRichListItem<StackItemRichListComponentData>>{
            component: StackItemRichListComponent,
            data: {
                id: ident,
                values: values,
                deleteable: true,
                deleteTooltip: this.i18nService.translate(deleteTooltip),
                deleteFunction: (id:string) => { deleteFunction(id); this.deselectListItem([id]); },
                withInfo: () => false,
                selectable: selectable,
                // select: this.openNextItem doesn't work. This would not use the overwritten funktions.
                select: (id: string) => { this.setSelectionListItem([id]); },
                selected: false,
                multiSelectable: multiSelectable,
                multiSelect: this.multiSelect.bind(this)
            }
        };
    }

    constructRichListItemWithAll(
        ident: string, values: string[],
        deleteTooltip: string, deleteFunction: (id: string) => void,
        infoTooltip: string, infoFunction: (id: string) => void,
        selectable: boolean = true
        ): XcRichListItem<StackItemRichListComponentData> {

        return <XcRichListItem<StackItemRichListComponentData>>{
            component: StackItemRichListComponent,
            data: {
                id: ident,
                values: values,
                deleteable: true,
                deleteTooltip: this.i18nService.translate(deleteTooltip),
                deleteFunction: (id:string) => { deleteFunction(id); this.deselectListItem([id]); },
                withInfo: () => true,
                infoTooltip: this.i18nService.translate(infoTooltip),
                infoFunction: infoFunction,
                selectable: selectable,
                select: (id: string) => { this.setSelectionListItem([id]); },
                selected: false,
                multiSelectable: false
            }
        };
    }

    constructRichListItemOnlySelectable(
        ident: string, values: string[],
        selectable: boolean = true,
        ): XcRichListItem<StackItemRichListComponentData> {

        return <XcRichListItem<StackItemRichListComponentData>>{
            component: StackItemRichListComponent,
            data: {
                id: ident,
                values: values,
                deleteable: false,
                withInfo: () => false,
                selectable: selectable,
                select: (id: string) => { this.setSelectionListItem([id]); },
                selected: false,
                multiSelectable: false
            }
        };
    }

    constructRichListItemInfoOnly(
        ident: string, values: string[],
        withInfo: () => boolean,
        infoTooltip: string, infoFunction: (id: string) => void,
        selectable: boolean = true
        ): XcRichListItem<StackItemRichListComponentData> {

        return <XcRichListItem<StackItemRichListComponentData>>{
            component: StackItemRichListComponent,
            data: {
                id: ident,
                values: values,
                deleteable: false,
                withInfo: withInfo,
                infoTooltip: this.i18nService.translate(infoTooltip),
                infoFunction: infoFunction,
                selectable: selectable,
                select: (id: string) => { this.setSelectionListItem([id]); },
                selected: false,
                multiSelectable: false
            }
        };
    }

    constructAttributeRichListItem(
        ident: string, value: Attribute,
        deleteTooltip: string, deleteFunction: (attribute: Attribute) => void,
        selectable: boolean = true,
        ): XcRichListItem<AttributeRichListComponentData> {

        return <XcRichListItem<AttributeRichListComponentData>>{
            component: AttributeRichListComponent,
            data: {
                id: ident,
                value: value,
                deleteable: true,
                deleteTooltip: this.i18nService.translate(deleteTooltip),
                deleteFunction: (attribute: Attribute) => { deleteFunction(attribute); this.deselectListItem([ident]); },
                selectable: selectable,
                select: (id: string) => { this.setSelectionListItem([id]); },
                selected: false
            }
        };
    }
}
