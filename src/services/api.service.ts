import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { Applicant } from '../interfaces/applicant.interface';

@inject(HttpClient)
export class ApplicantsAPI {
    httpClient: HttpClient;

    constructor(httpClient) {
        this.httpClient = httpClient;

        const baseUrl = 'https://localhost:44350/';
        this.httpClient.configure(config => {
            config.withBaseUrl(baseUrl);
        });
    }

    getApplicants(): Promise<Applicant[]> {

        return this.httpClient.get('applicants')
            .then(response => response.json())
            .then(applicants => {
                return applicants;
            });

    }
}