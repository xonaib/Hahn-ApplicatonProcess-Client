import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationRules, ValidationControllerFactory, ValidationController } from 'aurelia-validation';

import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';
import { areEqual, isNullOrEmpty } from './resources/utility';
import { Applicant } from 'interfaces/applicant.interface';

@inject(WebAPI, EventAggregator, ValidationControllerFactory, NewInstance.of(ValidationController))
export class ContactDetail {
    public api: any;
    public routeConfig: any;
    public contact: any;
    public originalContact: any;
    public ea: EventAggregator;
    public isEditMode = false;

    public applicant: Applicant = new Applicant();
    //public validationController: ValidationController;

    constructor(api: WebAPI, ea: EventAggregator,
        validationControllerFactory: ValidationControllerFactory,
        private validationController: ValidationController) {

        this.contact = {
            id: 0,
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: 0,
        }

        this.api = api;
        this.ea = ea;
        //this.validationController = validationControllerFactory.createForCurrentScope();
        this.getNewApplicant();

        //ValidationRules.ensureObject<Applicant>()
        //    .satisfies(.)

        ValidationRules
            .ensure('email').required().withMessage('Required errror')
            .ensure('phoneNumber').minLength(3).withMessage('Length error')
            .on(this.contact);

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

        /*ValidationRules.ensureObject()
            .satisfies(d => d.Name.length > 3)
            .on(this.applicant);*/
        /*
        ValidationRules.ensureObject()
            .satisfies(obj => obj.Name.length > 3)
            .satisfies(obj => obj.FamilyName.length > 10)
            .on(Applicant);
        */
    }
    validateMe(): void {
        this.validationController.validate();
    }

    activate(params, routeConfig): void {
        this.routeConfig = routeConfig;


        if (params.id) {
            this.isEditMode = true;
            this.getApplicant(params.id);
        }
        else {
            console.log('@@ no param for id');
        }
    }

    getNewApplicant(): void {
        const applicant = new Applicant();
        applicant.Name = '';
        applicant.FamilyName = '';
        applicant.EmailAdress = '';
        applicant.Age = 0;
        applicant.CountryOfOrigin = '';
        /*const applicant2: Applicant = {
            Name: '',
            FamilyName: '',
            EmailAdress: '',
            Address: '',
            Age: 0,
            CountryOfOrigin: '',
        };*/

        this.applicant = applicant;
    }

    getApplicant(id: number): void {
        return this.api.getContactDetails(id)
            .then(contact => {
                this.contact = contact;
                this.routeConfig.navModel.setTitle(contact.firstName);
                this.originalContact = JSON.parse(JSON.stringify(contact));
                this.ea.publish(new ContactViewed(this.contact));
            });
    }

    createFormForApplicant(applicant: Applicant): void {
        console.log(1);
    }

    get canReset(): boolean {
        return (!isNullOrEmpty(this.applicant.Name) || !isNullOrEmpty(this.applicant.FamilyName) 
            || !isNullOrEmpty(this.applicant.Address) || !isNullOrEmpty(this.applicant.CountryOfOrigin));
    }

    get canSave(): boolean {
        //return true;
        return (!isNullOrEmpty(this.applicant.Name) && !isNullOrEmpty(this.applicant.FamilyName) 
            && !isNullOrEmpty(this.applicant.Address));
    }

    save(): void {
        this.api.saveContact(this.contact).then(contact => {
            this.contact = contact;
            this.routeConfig.navModel.setTitle(contact.firstName);
            this.originalContact = JSON.parse(JSON.stringify(contact));
            this.ea.publish(new ContactUpdated(this.contact));
        });
    }

    canDeactivate(): boolean {
        if (!areEqual(this.originalContact, this.contact)) {
            const result = confirm('You have unsaved changes. Are you sure you wish to leave?');

            if (!result) {
                this.ea.publish(new ContactViewed(this.contact));
            }

            return result;
        }

        return true;
    }
}

