import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import { I18N } from 'aurelia-i18n';
import { inject } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
export class App {
  public message = 'Hello World!';
  public router: any;

  static inject = [I18N];

  constructor(private i18n: I18N) {

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
      { route: 'applicant/:id?', moduleId: PLATFORM.moduleName('applicant-detail'), name: 'applicant-edit' }
    ]);

    this.router = router;
  }

}
