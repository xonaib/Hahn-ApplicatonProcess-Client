import { HttpClient } from 'aurelia-fetch-client';
import { inject, NewInstance } from 'aurelia-framework';
import { Http2ServerResponse } from 'http2';
import { Applicant } from '../interfaces/applicant.interface';

@inject(HttpClient, NewInstance.of(HttpClient))
export class ApplicantsAPI {
    //httpClient: HttpClient;
    applicants: Applicant[];

    // added two http clients, because did not want to configure to switch base url's
    constructor(private httpClient: HttpClient,
        private countryHttpClient: HttpClient) {
        //this.httpClient = httpClient;

        this.httpClient.isRequesting
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

    /** return if any of the http client is requesting */
    get isRequesting(): boolean {        
        return this.httpClient.isRequesting || this.countryHttpClient.isRequesting;
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
                if (response.status == 200) {
                    return true;
                }
                return false;
            })
        //.then(result => {
        //    return result;
        //});
    }

    getCountry(query: string): Promise<any> {
        const url = `https://restcountries.eu/rest/v2/name/${query}?fullText=true`;
        return this.countryHttpClient.get(url)
            .then(response => { 
                return response.json();
            })
            .then(result => {
                return result;
            });

    }
}