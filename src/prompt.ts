import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

export class Prompt {
    static inject = [DialogController];

    controller: any;
    answer: any;
    message: string;

    constructor(controller: DialogController) {
        this.controller = controller;
        this.answer = null;         
        controller.settings.lock = false;
        controller.settings.centerHorizontalOnly = true;
    }

    activate(message) {
        this.message = message;
    }
}

