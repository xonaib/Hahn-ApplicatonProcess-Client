import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import { I18N } from 'aurelia-i18n';
import { inject } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

import { ApplicantsAPI } from './services/api.service';

@inject(I18N, ApplicantsAPI)
export class App {
  public message = 'Hello World!';
  public router: any;
  public apiService: ApplicantsAPI
  //static inject = [I18N];

  constructor(private i18n: I18N,
    apiService: ApplicantsAPI) {
    this.apiService = apiService;

    this.i18n
      .setLocale('en-EN')
      .then(() => {
        // locale is loaded
      });
  }
  configureRouter(config, router): void {
    //config.options.pushState = true;
    //config.options.root = '/';

    // { route: '',              moduleId: PLATFORM.moduleName('no-selection'),   title: 'Select' },
    config.map([
      { route: '', moduleId: PLATFORM.moduleName('applicant-list'), name: 'applicants' },
      { route: 'applicant/:id?', moduleId: PLATFORM.moduleName('applicant-detail'), name: 'applicant-edit' },
      { route: 'success', moduleId: PLATFORM.moduleName('applicant-save-success'), name: 'appicant-success' }
    ]);

    this.router = router;
  }

}
