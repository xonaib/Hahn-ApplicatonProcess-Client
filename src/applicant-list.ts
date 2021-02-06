import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';

import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';

import { ApplicantsAPI } from './services/api.service';
import { Applicant } from './interfaces/applicant.interface';

@inject(WebAPI, EventAggregator, ApplicantsAPI)
export class ApplicantList {
    public api: any;
    public contacts: any[];
    public selectedId: number;
    public ea: EventAggregator;
    public applicantsAPI: ApplicantsAPI;

    constructor(api, ea: EventAggregator, applicantsAPI: ApplicantsAPI) {
        this.api = api;
        this.ea = ea;
        this.applicantsAPI = applicantsAPI;
        this.contacts = [];

        ea.subscribe(ContactViewed, msg => this.select(msg.contact));
        ea.subscribe(ContactUpdated, msg => {
            const id = msg.contact.id;
            const found = this.contacts.find(x => x.id == id);
            Object.assign(found, msg.contact);
        });
    }

    created(): void {
        this.api.getContactList().then(contacts => this.contacts = contacts);


        this.applicantsAPI.getApplicants()
            .then((applicants: Applicant[]) => {
                console.log('applicants from server', applicants);
            });
    }

    select(contact): boolean {
        this.selectedId = contact.id;
        return true;
    }
}


