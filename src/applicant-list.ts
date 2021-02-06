import { EventAggregator } from 'aurelia-event-aggregator';
import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';
import { inject } from 'aurelia-framework';

@inject(WebAPI, EventAggregator)
export class ApplicantList {
    public api: any;
    public contacts: any[];
    public selectedId: number;
    public ea: EventAggregator;

    constructor(api, ea) {
        this.api = api;
        this.ea = ea;
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
    }

    select(contact): boolean {
        this.selectedId = contact.id;
        return true;
    }
}


