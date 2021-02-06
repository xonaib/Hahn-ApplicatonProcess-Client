import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WebAPI } from './resources/web-api';
import { ContactUpdated, ContactViewed } from './messages';
import { areEqual } from './resources/utility';

@inject(WebAPI, EventAggregator)
export class ContactDetail {
    public api: any;
    public routeConfig: any;
    public contact: any;
    public originalContact: any;
    public ea: EventAggregator;

    constructor(api, ea) {
        this.api = api;
        this.ea = ea;
    }

    activate(params, routeConfig): void {
        this.routeConfig = routeConfig;

        return this.api.getContactDetails(params.id).then(contact => {
            this.contact = contact;
            this.routeConfig.navModel.setTitle(contact.firstName);
            this.originalContact = JSON.parse(JSON.stringify(contact));
            this.ea.publish(new ContactViewed(this.contact));
        });
    }

    get canSave(): boolean {
        return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
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
        if(!areEqual(this.originalContact, this.contact)){
            const result = confirm('You have unsaved changes. Are you sure you wish to leave?');
      
            if(!result) {
              this.ea.publish(new ContactViewed(this.contact));
            }
      
            return result;
          }
      
          return true;
    }
}

