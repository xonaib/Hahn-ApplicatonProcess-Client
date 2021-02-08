import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { ModalOptions } from './interfaces/modal.interface'
export class Prompt {
    static inject = [DialogController];

    controller: any;
    answer: any;
    messages: string[];
    options: ModalOptions;

    constructor(controller: DialogController) {
        this.controller = controller;
        this.answer = null;
        controller.settings.lock = false;
        controller.settings.centerHorizontalOnly = true;
    }

    activate(options: ModalOptions) {
        //this.messages = messages;
        this.options = options;
    }
}

