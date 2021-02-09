import { inject, NewInstance, bindable, observable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import {
    ValidationRules, ValidationControllerFactory, ValidationController,
    ControllerValidateResult, validateTrigger
} from 'aurelia-validation';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';

import { Prompt } from './prompt';
import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';
import { areEqual, isNullOrEmpty, isNull } from './resources/utility';
import { Applicant } from './interfaces/applicant.interface';
import { ModalOptions } from './interfaces/modal.interface';
import { ApplicantsAPI } from './services/api.service';
@inject(WebAPI, EventAggregator,
    NewInstance.of(ValidationController), ApplicantsAPI,
    DialogService, Router, I18N)
export class ContactDetail {
    //public api: any;
    public routeConfig: any;
    //public contact: any;
    public originalApplicant: Applicant;
    //public ea: EventAggregator;
    public applicantId: number;
    public isEditMode = false;

    public applicant: Applicant = new Applicant();
    //@observable country ;

    //public validationController: ValidationController;
    static inject = [DialogService];
    constructor(private api: WebAPI, private ea: EventAggregator,
        private validationController: ValidationController,
        private apiService: ApplicantsAPI, private dialogService: DialogService,
        private router: Router, private i18n: I18N) {

    }

    /*countryChanged(newValue: string, oldValue: string): void {
        console.log('@@2', newValue, oldValue);
        this.apiService.getCountry(newValue)
            .then(result => {
                console.log(result);
            });
    }*/

    validateCountry(): void {
        const query = this.applicant.CountryOfOrigin;
        if (isNullOrEmpty(query)) {
            this.applicant.isValidCountry = false;
            const errorMsg = this.i18n.tr('messages.valid', { 'field_name': 'Country' })
            this.validationController.revalidateErrors();
            this.validationController.addError(errorMsg, this.applicant, 'CountryOfOrigin');
            return;
        }
        this.apiService.getCountry(query)
            .then(result => {
                if (result.status === 404) {
                    // no data was found for country
                    // show erorr
                    this.applicant.isValidCountry = false;
                    // revalidate errors
                    this.validationController.revalidateErrors();
                    //this.validationController.removeError({ propertyName: 'CountryOfOrigin' })
                    const errorMsg = this.i18n.tr('messages.valid', { 'field_name': 'Country' })
                    this.validationController.addError(errorMsg, this.applicant, 'CountryOfOrigin');
                    return;
                }
                // else valid country
                this.applicant.isValidCountry = true;
            });
    }

    /** Define rulse for object validation */
    addFormValidation(): void {
        this.validationController.reset();
        this.validationController.validateTrigger = validateTrigger.change;

        const emailPattern = /^[a-z][a-zA-Z0-9_.]*(\.[a-zA-Z][a-zA-Z0-9_.]*)?@[a-z][a-zA-Z-0-9_\-\.]*$/;
        const emailRegex = new RegExp(emailPattern);
        ValidationRules
            .ensure('Name')
            .required().withMessage(this.i18n.tr('messages.required', { 'field_name': 'Name' }))
            .minLength(5).withMessage(this.i18n.tr('messages.min_length', { 'count': 5 }))
            .ensure('FamilyName')
            .required().withMessage(this.i18n.tr('messages.required', { 'field_name': 'Family Name' }))
            .minLength(5).withMessage(this.i18n.tr('messages.min_length', { 'count': 5 }))
            .ensure('Address')
            .required().withMessage(this.i18n.tr('messages.required', { 'field_name': 'Address' }))
            .minLength(10).withMessage(this.i18n.tr('messages.min_length', { 'count': 10 }))
            .ensure('isValidCountry')
            .equals(true).withMessage(this.i18n.tr('messages.required', { 'field_name': 'Country' }))
            .ensure('EmailAdress')
            .required().withMessage(this.i18n.tr('messages.required', { 'field_name': 'Email' }))
            .matches(emailRegex).withMessage(this.i18n.tr('messages.valid', { 'field_name': 'Email' }))
            .ensure('Age')
            //.required().withMessage(this.i18n.tr('messages.required', { 'field_name': 'Age' }))
            .range(20, 60).withMessage(this.i18n.tr('messages.range',
                { 'field_name': 'Age', 'min_count': 20, 'max_count': 60 }))
            .on(this.applicant);

    }

    inputFieldBlur(fieldName: string): void {
        console.log('@@ blur from ' + fieldName);
    }


    activate(params, routeConfig): void {
        this.routeConfig = routeConfig;

        this.applicantId = params.id || 0;
        this.fetchPageData(params.id);
    }

    /** Fetch Data from server if need be */
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
                // if no such applicant exists
                if (isNull(applicant)) {
                    this.applicant = null;
                    return;
                }

                // if applicant exists on server, 
                // we can trust that this would be a valid applicant
                applicant.isValidCountry = true;
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
            && this.applicant.isValidCountry
            //&& !isNullOrEmpty(this.applicant.CountryOfOrigin)
            && !isNullOrEmpty(this.applicant.Address)
            && !isNullOrEmpty(this.applicant.EmailAdress)
            && this.applicant.Age > 0;
            //&& !areEqual(this.originalApplicant, this.applicant);

        return formHasData
    }

    resetForm(): void {
        const modalOptions = new ModalOptions();
        modalOptions.Title = this.i18n.tr('reset');
        modalOptions.ButtonOneText = this.i18n.tr('yes');
        modalOptions.ModalBody = [this.i18n.tr('confirmation_reset')];

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

                        this._displayErrorMessages(errorMsgs);
                    }
                    return;
                }

                this.originalApplicant = this.applicant;
                this.router.navigateToRoute('appicant-success');
            });
    }

    /** Updating an existing applicant, use PUT */
    private _updateExistingApplicant(applicant: Applicant): void {
        this.apiService.putApplicant(this.applicant.ID, this.applicant)
            .then(result => {
                if (result === true) {
                    this.originalApplicant = this.applicant;
                    this.router.navigateToRoute('appicant-success');
                    return;
                }
                // there was some error while saving
                if (result.errors) {
                    // compose error message to display
                    const errorMsgs = this._composeErrorMessage(result.errors);

                    this._displayErrorMessages(errorMsgs);
                }

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
        modalOptions.Title = this.i18n.tr('error_api');
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
        modalOptions.Title = this.i18n.tr('delete_applicant');
        modalOptions.ModalBody = [this.i18n.tr('confirmation_delete')];
        modalOptions.ButtonOneText = this.i18n.tr('yes');
        modalOptions.ButtonTwoText = this.i18n.tr('no');

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
                    modalOptions.Title = this.i18n.tr('confirmation_delete');
                    modalOptions.ModalBody = [this.i18n.tr('error_deletion_api')];
                    modalOptions.ButtonOneText = this.i18n.tr('ok');

                    this.openDialog(modalOptions)
                }
                else {
                    this.router.navigateToRoute('applicants');
                }
            })
    }

    areEqualApplicant(applicant1: Applicant, applicant2: Applicant): boolean {
        if(applicant1.Name == applicant2.Name 
            && applicant1.FamilyName == applicant2.FamilyName
            && applicant1.Address == applicant2.Address
            && applicant1.Age == applicant2.Age
            && applicant1.CountryOfOrigin == applicant2.CountryOfOrigin
            && applicant1.EmailAdress == applicant2.EmailAdress){
                return true;
            }

            return false;
    }

    canDeactivate(): boolean {

        if (!this.areEqualApplicant(this.originalApplicant, this.applicant)) {
            const result = confirm(this.i18n.tr('unsaved_changes'));

            //if (!result) {
            //    this.ea.publish(new ContactViewed(this.contact));
            //}

            return result;
        }

        return true;
    }
}

