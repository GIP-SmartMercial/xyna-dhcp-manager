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
import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';


export interface OnFocusedEnterController {
    onEnterFunction?: (event: KeyboardEvent) => void;
}


@Directive({
    selector: '[focused-enter]'
})
export class OnFocusedEnterDirective implements AfterViewInit, OnDestroy {

    private element: HTMLElement;

    @Output('focused-enter')
    readonly change = new EventEmitter<KeyboardEvent>();

    @Input('focused-enter-controller')
    controller: OnFocusedEnterController = {};

    private readonly fn = (event: KeyboardEvent) => {
        if ((event.key === 'Enter' || event.code === 'Enter') && this.element) {
            const inputFields = this.element.querySelectorAll('thead input');
            let found = false;
            if (inputFields) {
                inputFields.forEach(input => found = found || document.activeElement === input);

                if (found) {
                    this.ngZone.run(() => {
                        if (this.controller && this.controller.onEnterFunction) {
                            this.controller.onEnterFunction(event);
                        }
                        this.change.emit(event);
                    });
                    event.preventDefault();
                }
            }
        }
    };


    constructor(
        private readonly elementRef: ElementRef,
        private readonly ngZone: NgZone
    ) {
    }

    ngAfterViewInit() {
        this.element = this.elementRef.nativeElement;
        if (this.element) {
            this.ngZone.runOutsideAngular(() => {
                this.element.addEventListener('keyup', this.fn);
            });
        }
    }

    ngOnDestroy() {
        if (this.element) {
            this.element.removeEventListener('keyup', this.fn);
        }
    }

}
