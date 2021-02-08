import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import {
    ValidationRules, ValidationControllerFactory, ValidationController,
    ControllerValidateResult, validateTrigger
} from 'aurelia-validation';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { Router } from 'aurelia-router';

import { Prompt } from './prompt';
import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';
import { areEqual, isNullOrEmpty, isNull } from './resources/utility';
import { Applicant } from './interfaces/applicant.interface';
import { ModalOptions } from './interfaces/modal.interface';
import { ApplicantsAPI } from './services/api.service';

@inject(WebAPI, EventAggregator,
    NewInstance.of(ValidationController), ApplicantsAPI,
    DialogService, Router)
export class ContactDetail {
    //public api: any;
    public routeConfig: any;
    //public contact: any;
    public originalApplicant: Applicant;
    //public ea: EventAggregator;
    public applicantId: number;
    public isEditMode = false;

    public applicant: Applicant = new Applicant();
    //public validationController: ValidationController;
    static inject = [DialogService];
    constructor(private api: WebAPI, private ea: EventAggregator,
        private validationController: ValidationController,
        private apiService: ApplicantsAPI, private dialogService: DialogService,
        private router: Router) {

    }

    addFormValidation(): void {
        this.validationController.reset();
        this.validationController.validateTrigger = validateTrigger.change;

        const emailPattern = /^[a-z][a-zA-Z0-9_.]*(\.[a-zA-Z][a-zA-Z0-9_.]*)?@[a-z][a-zA-Z-0-9_\-\.]*$/;
        const emailRegex = new RegExp(emailPattern);
        ValidationRules
            //.ensure('Name')
            //.required().withMessage('Name is required.')
            //.minLength(5).withMessage('Minimum Length should be 5 charcters.')
            //.ensure('FamilyName')
            //.required().withMessage('Family Name is required.')
            //.minLength(5).withMessage('Minimum Length should be 5 charcters.')
            .ensure('Address')
            .required().withMessage('Address is required')
            .minLength(10).withMessage('Minimum Length should be 10 charcters.')
            .ensure('EmailAdress')
            .matches(emailRegex).withMessage('Email should be valid.')
            .ensure('Age')
            .range(20, 60).withMessage('Age should be between 20 and 60')
            .on(this.applicant);

    }

    inputFieldBlur(fieldName: string): void {
        console.log('@@ blur from ' + fieldName);
    }

    validateMe(): void {
        this.validationController.validate();
    }

    activate(params, routeConfig): void {
        this.routeConfig = routeConfig;

        this.applicantId = params.id || 0;
        this.fetchPageData(params.id);
    }

    fetchPageData(id?: number): void {

        // if id is provided, open in edit mode
        // else, open in create mode
        if (id) {
            this.isEditMode = true;
            this.fetchApplicant(id);
        }
        else {
            this.isEditMode = false;
            const applicant = this.getNewApplicant();
            this.prepareApplicantForm(applicant);
        }
    }

    /** Prepare Form page, given a applicant object */
    prepareApplicantForm(applicant: Applicant): void {
        this.applicant = applicant;

        // create a copy
        this.originalApplicant = this.cloneApplicant(applicant);
        this.addFormValidation();
    }

    /** Simple clone method, used json.parse => because our object is not very complex */
    cloneApplicant(original: Applicant): Applicant {
        const copy = JSON.parse(JSON.stringify(original));

        return copy;
    }

    getNewApplicant(): Applicant {
        const applicant = new Applicant();

        return applicant;
    }

    fetchApplicant(id: number): void {
        this.apiService.getApplicant(id)
            .then((applicant: Applicant) => {
                this.prepareApplicantForm(applicant);
            });
    }


    /** can reset if there is some data in form */
    get canReset(): boolean {
        //return (!isNullOrEmpty(this.applicant.Name) || !isNullOrEmpty(this.applicant.FamilyName)
        //    || !isNullOrEmpty(this.applicant.Address) || !isNullOrEmpty(this.applicant.CountryOfOrigin));
        return !areEqual(this.applicant, this.originalApplicant);
    }

    /** CanSave: if data in form is valid */
    get canSave(): boolean {
        return ((isNull(this.validationController.errors) || this.validationController.errors.length == 0))
            && this.formHasCompleteData;

        //return (!isNullOrEmpty(this.applicant.Name) && !isNullOrEmpty(this.applicant.FamilyName) 
        //    && !isNullOrEmpty(this.applicant.Address));
    }

    /** if any form field has data */
    get formHasAnyData(): boolean {
        const formHasData = !isNullOrEmpty(this.applicant.Name)
            || !isNullOrEmpty(this.applicant.FamilyName)
            || !isNullOrEmpty(this.applicant.CountryOfOrigin)
            || !isNullOrEmpty(this.applicant.Address)
            || !isNullOrEmpty(this.applicant.EmailAdress);

        return formHasData;
    }

    /** Return if all the fields have data */
    get formHasCompleteData(): boolean {
        const formHasData = !isNullOrEmpty(this.applicant.Name)
            && !isNullOrEmpty(this.applicant.FamilyName)
            && !isNullOrEmpty(this.applicant.CountryOfOrigin)
            && !isNullOrEmpty(this.applicant.Address)
            && !isNullOrEmpty(this.applicant.EmailAdress)
            && this.applicant.Age > 0;

        return formHasData
    }

    resetForm(): void {
        const modalOptions = new ModalOptions();
        modalOptions.Title = 'Reset';
        modalOptions.ButtonOneText = 'Yes';
        modalOptions.ModalBody = ['Are you sure you want to reset form?'];

        this.openDialog(modalOptions)
            .then((result: DialogCloseResult) => {
                if (!result.wasCancelled) {
                    // reset stuff
                    this.fetchPageData(this.applicantId);
                }
            });
    }

    save(): void {
        console.log('save');

        this.validationController.validate()
            .then((validationResult: ControllerValidateResult) => {
                if (validationResult.valid) {
                    this.saveApplicant(this.applicant);
                }
            });


        /*this.api.saveContact(this.contact).then(contact => {
            this.contact = contact;
            this.routeConfig.navModel.setTitle(contact.firstName);
            this.originalContact = JSON.parse(JSON.stringify(contact));
            this.ea.publish(new ContactUpdated(this.contact));
        });*/
    }

    saveApplicant(applicant: Applicant): void {
        if (this.isEditMode) {
            this._updateExistingApplicant(applicant);
        }
        else {
            this._addNewApplicant(applicant);
        }

    }

    /** Adding a new applicant, use POST */
    private _addNewApplicant(applicant: Applicant): void {
        this.apiService.saveApplicant(this.applicant)
            .then(result => {
                if (result.status == 400) {
                    // there was some error on server

                    if (result.errors) {
                        // compose error message to display
                        const errorMsgs = this._composeErrorMessage(result.errors);
                        console.log('@@errors', errorMsgs);
                        this._displayErrorMessages(errorMsgs);
                    }
                    return;
                }
                this.router.navigateToRoute('applicants');
                console.log('@@ post request', result);
            });
    }

    /** Updating an existing applicant, use PUT */
    private _updateExistingApplicant(applicant: Applicant): void {
        this.apiService.putApplicant(this.applicant.ID, this.applicant)
            .then(result => {
                if (result === true) {
                    this.router.navigateToRoute('applicants');
                    return;
                }
                // there was some error while saving
                if (result.errors) {
                    // compose error message to display
                    const errorMsgs = this._composeErrorMessage(result.errors);
                    console.log('@@errors', errorMsgs);
                    this._displayErrorMessages(errorMsgs);
                }
                console.log('@@ post request', result);
            });
    }

    private _composeErrorMessage(errors: any): string[] {
        const messages: string[] = [];

        const errorValues: string[][] = Object.values(errors);

        errorValues.forEach((groupedErrors: string[]) => {
            groupedErrors.forEach((error: string) => {
                messages.push(error);
            });
        });

        return messages;
    }
    private _displayErrorMessages(errorMessages: string[]): void {
        const modalOptions = new ModalOptions();
        modalOptions.Title = 'Error from server';
        modalOptions.ModalBody = errorMessages;

        this.openDialog(modalOptions)
            .then((result: DialogCloseResult) => {
                //if (!result.wasCancelled) {

                //}
            });
    }

    openDialog(options: ModalOptions): Promise<DialogCloseResult> {
        return this.dialogService.open({ viewModel: Prompt, model: options, lock: false })
            .whenClosed(response => {
                return response;
            });

        //return null;
    }

    delete(id: number): void {
        const modalOptions = new ModalOptions();
        modalOptions.Title = 'Delete applicant';
        modalOptions.ModalBody = ['Are you sure you want to delete this user?'];
        modalOptions.ButtonOneText = 'Yes';
        modalOptions.ButtonTwoText = 'No';

        this.openDialog(modalOptions)
            .then((result: DialogCloseResult) => {
                if (!result.wasCancelled) {
                    this._deleteUser(id);
                }
            });


    }

    private _deleteUser(id: number): void {
        this.apiService.deleteApplicant(id)
            .then((data: boolean) => {
                if (!data) {
                    const modalOptions = new ModalOptions();
                    modalOptions.Title = 'Delete applicant';
                    modalOptions.ModalBody = ['There was some error deleting this applicant. Please try again.'];
                    modalOptions.ButtonOneText = 'Ok';

                    this.openDialog(modalOptions)
                }
                else {
                    this.router.navigateToRoute('applicants');
                }
            })
    }

    canDeactivate(): boolean {
        //debugger;
        /*if (!areEqual(this.originalContact, this.contact)) {
            const result = confirm('You have unsaved changes. Are you sure you wish to leave?');

            if (!result) {
                this.ea.publish(new ContactViewed(this.contact));
            }

            return result;
        } */

        return true;
    }
}

