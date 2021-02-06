import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';

import { PLATFORM } from 'aurelia-pal';
export class App {
  public message = 'Hello World!';
  public router: any;

  configureRouter(config, router): void {
    config.options.pushState = true;
    config.options.root = '/';

    config.map([
      { route: '',              moduleId: PLATFORM.moduleName('no-selection'),   title: 'Select' },
      { route: 'applicant/:id?',  moduleId: PLATFORM.moduleName('applicant-detail'), name:'applicant-edit' }
    ]);

    this.router = router; 
  }

}
