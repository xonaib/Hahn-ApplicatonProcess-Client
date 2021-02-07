import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { Prompt } from './prompt';

import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';
import { areEqual, isNullOrEmpty, isNull } from './resources/utility';
import { Applicant } from 'interfaces/applicant.interface';
import { ApplicantsAPI } from './services/api.service';

@inject(WebAPI, EventAggregator,
    NewInstance.of(ValidationController), ApplicantsAPI, DialogService)
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
        private apiService: ApplicantsAPI, private dialogService: DialogService) {

    }

    addFormValidation(): void {
        this.validationController.reset();

        const emailPattern = /^[a-z][a-zA-Z0-9_.]*(\.[a-zA-Z][a-zA-Z0-9_.]*)?@[a-z][a-zA-Z-0-9_\-\.]*$/;
        const emailRegex = new RegExp(emailPattern);
        ValidationRules
            .ensure('Name')
            .required().withMessage('Name is required.')
            .minLength(5).withMessage('Minimum Length should be 5 charcters.')
            .ensure('FamilyName')
            .required().withMessage('Family Name is required.')
            .minLength(5).withMessage('Minimum Length should be 5 charcters.')
            .ensure('Address')
            .required().withMessage('Address is required')
            .minLength(10).withMessage('Minimum Length should be 10 charcters.')
            .ensure('EmailAdress')
            .matches(emailRegex).withMessage('Email should be valid.')
            .ensure('Age')
            .range(20, 60).withMessage('Age should be between 20 and 60')
            .on(this.applicant);

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

        if (id) {
            this.isEditMode = true;
            this.fetchApplicant(id);
        }
        else {
            const applicant = this.getNewApplicant();
            this.prepareApplicantForm(applicant);
        }
    }


    prepareApplicantForm(applicant: Applicant): void {
        this.applicant = applicant;

        this.originalApplicant = this.cloneApplicant(applicant);

        this.addFormValidation();
    }

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

        /*
    return this.api.getContactDetails(id)
        .then(contact => {
            this.contact = contact;
            this.routeConfig.navModel.setTitle(contact.firstName);
            this.originalContact = JSON.parse(JSON.stringify(contact));
            this.ea.publish(new ContactViewed(this.contact));
        }); */
    }

    createFormForApplicant(applicant: Applicant): void {
        console.log(1);
    }

    /** can reset if there is some data in form */
    get canReset(): boolean {
        return (!isNullOrEmpty(this.applicant.Name) || !isNullOrEmpty(this.applicant.FamilyName)
            || !isNullOrEmpty(this.applicant.Address) || !isNullOrEmpty(this.applicant.CountryOfOrigin));
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
            && !isNullOrEmpty(this.applicant.EmailAdress);

        return formHasData
    }

    resetForm(): void {
        //console.log('reset');
        this.openDialog('Are you sure you want to reset form?')
            .then((result: DialogCloseResult) => {
                debugger;
                if (!result.wasCancelled) {
                    // reset stuff
                    this.fetchPageData(this.applicantId);
                }
            });
    }

    save(): void {
        console.log('save');
        /*this.api.saveContact(this.contact).then(contact => {
            this.contact = contact;
            this.routeConfig.navModel.setTitle(contact.firstName);
            this.originalContact = JSON.parse(JSON.stringify(contact));
            this.ea.publish(new ContactUpdated(this.contact));
        });*/
    }

    openDialog(msg: string): Promise<DialogCloseResult> {
        return this.dialogService.open({ viewModel: Prompt, model: msg, lock: false })
            .whenClosed(response => {

                /*if (!response.wasCancelled) {
                    console.log('good');
                } else {
                    console.log('bad');
                }
                console.log(response.output);*/
                return response;
            });

        //return null;
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

