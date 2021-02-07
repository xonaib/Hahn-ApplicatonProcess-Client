import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { Http2ServerResponse } from 'http2';
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
            config.withDefaults({
                headers: {
                    'Content-Type': 'application/json',
                }
            });
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

    saveApplicant(applicant: Applicant): Promise<any> {
        const body = JSON.stringify(applicant);
        return this.httpClient.post('applicants', body)
            .then((response: any) => {
                //const reqStatus = response.status;
                //const resultJson = response.json();
                //return { status: reqStatus, json: resultJson };
                return response.json();
            })
            .then(response => {
                return response;
            });

    }

    putApplicant(id: number, applicant: Applicant): Promise<any> {
        const body = JSON.stringify(applicant);
        return this.httpClient.put(`applicants/${id}`, body)
            .then(response => {
                if (response.status == 200) {
                    return true;
                }
                return response.json();
            })
            .then(response => {
                return response;
            })
    }


    deleteApplicant(id: number): Promise<any> {
        return this.httpClient.delete(`applicants/${id}`)
            .then(response => {
                console.log(response.status);
                return response.json();
            })
            .then(result => {
                return result;
            });
    }
}