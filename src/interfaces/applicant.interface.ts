
export class Applicant {
    public constructor(){
        this.ID = 0;
        this.Name = '';
        this.FamilyName = '';
        this.Address = '';
        this.CountryOfOrigin = '';
        this.EmailAdress = '';
        this.Age = 21;
        this.Hired = false; 
        this.isValidCountry = false;
    }
    ID?: number;
    Name: string;
    FamilyName: string;
    Address: string;
    CountryOfOrigin: string;
    EmailAdress: string;
    Age: number;
    Hired?: boolean;
    isValidCountry: boolean;
}
