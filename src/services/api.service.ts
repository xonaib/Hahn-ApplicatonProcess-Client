import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { Applicant } from '../interfaces/applicant.interface';

@inject(HttpClient)
export class ApplicantsAPI {
    httpClient: HttpClient;
    applicants: Applicant[];

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
                //this.applicants = applicants;
                return applicants;
            });
    }

    getApplicant(id: number): Promise<Applicant> {
        return this.httpClient.get(`applicants/${id}`)
            .then(response => response.json())
            .then(applicants => {
                //this.applicants = applicants;
                return applicants;
            });
    }
}