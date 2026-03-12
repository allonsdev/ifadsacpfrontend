import { Component } from '@angular/core';
import * as XLSX from 'xlsx'; // Import XLSX for reading Excel files
import { HttpClient } from '@angular/common/http'; // Import HttpClient for making API calls
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

export class FailedRecord {
  NameOfBusiness: string;
  TradingName: string;
  Province: string;
  Ward: string;
  ContactPerson: string;

  constructor(
    NameOfBusiness: string,
    TradingName: string,
    Province: string,
    Ward: string,
    ContactPerson: string
  ) {
    this.NameOfBusiness = NameOfBusiness;
    this.TradingName = TradingName;
    this.Province = Province;
    this.Ward = Ward;
    this.ContactPerson = ContactPerson;
  }
}

// Define an interface for the response structure
interface BeneficiaryResponse {
  message: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  data: {
    HouseholdIdentifierNumber: string;
    Name: string;
    Surname: string;
    Status: string;
  }[];
}

@Component({
  selector: 'benupload',
  templateUrl: './mse.html',
})
export class Mse {
  selectedcolumns: string[] = [];
  beneficiaries: any[] = [];
  fileToUpload: File | null = null; // Store the selected file
  failedRecords: FailedRecord[] = [];

  // Define the structure of the columns
 columns = [
  { data: 'NameOfBusiness', title: 'NameOfBusiness' },
  { data: 'TradingName', title: 'TradingName' },
  { data: 'RegistrationStatus', title: 'RegistrationStatus' },
  { data: 'ContactPerson', title: 'ContactPerson' },
  { data: 'PhysicalAddress', title: 'PhysicalAddress' },
  { data: 'YearsOfOperation', title: 'YearsOfOperation' },
  { data: 'OwnerSex', title: 'OwnerSex' },
  { data: 'OwnerAge', title: 'OwnerAge' },
  { data: 'OwnerDOB', title: 'OwnerDOB' },
  { data: 'ContactNo', title: 'ContactNo' },
  { data: 'Province', title: 'Province' },
  { data: 'District', title: 'District' },
  { data: 'Ward', title: 'Ward' },
  { data: 'GPS', title: 'GPS' },
  { data: 'GPSLatitude', title: 'GPSLatitude' },
  { data: 'GPSLongitude', title: 'GPSLongitude' },
  { data: 'GPSAltitude', title: 'GPSAltitude' },
  { data: 'GPSPrecision', title: 'GPSPrecision' },
  { data: 'NumberOfMales', title: 'NumberOfMales' },
  { data: 'NumberOfFemales', title: 'NumberOfFemales' },
  { data: 'Total', title: 'Total' },
  { data: 'MaleBeneficiaries', title: 'MaleBeneficiaries' },
  { data: 'FemaleBeneficiaries', title: 'FemaleBeneficiaries' },
];

  constructor(private http: HttpClient) {} // Inject HttpClient

  // Function to handle file input change
  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;

    // Handle the case where multiple files are selected
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    // Store the file for later upload
    this.fileToUpload = target.files[0];

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.beneficiaries = this.mapDataToBeneficiaries(rawData);

      console.log('Beneficiaries Data:', this.beneficiaries);
    };

    // Read the file as binary string
    reader.readAsBinaryString(this.fileToUpload);
  }

  // Map Excel data to beneficiaries structure
mapDataToBeneficiaries(data: any[]): any[] {
  return data.slice(1).map((row: any) => ({  // skip header row
    NameOfBusiness: row[0],
    TradingName: row[1],
    RegistrationStatus: row[2],
    ContactPerson: row[3],
    PhysicalAddress: row[4],
    YearsOfOperation: row[5],
    OwnerSex: row[6],
    OwnerAge: row[7],
    OwnerDOB: row[8],
    ContactNo: row[9],
    Province: row[10],
    District: row[11],
    Ward: row[12],
    GPS: row[13],
    GPSLatitude: row[14],
    GPSLongitude: row[15],
    GPSAltitude: row[16],
    GPSPrecision: row[17],
    NumberOfMales: row[18],
    NumberOfFemales: row[19],
    Total: row[20],
    MaleBeneficiaries: row[21],
    FemaleBeneficiaries: row[22],
  }));
}
  beneficiariesData: any[] = [];
  // Function to upload the file and send selected data to the API
sendSelectedData() {
  if (!this.fileToUpload) {
    Swal.fire({
      icon: 'error',
      title: 'No File Selected',
      text: 'Please select a file to upload.',
    });
    return;
  }

  const formData = new FormData();
  formData.append('file', this.fileToUpload, this.fileToUpload.name);

  this.http
    .post<any>(
      environment.apiUrl + '/api/beneficiary/MseExcelUpload',
      formData
    )
    .pipe(catchError(this.handleError))
    .subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Upload Complete',
          html: `
            Total Records: ${response.totalRecords} <br/>
            Inserted: ${response.inserted} <br/>
            Updated: ${response.updated} <br/>
            Failed: ${response.failed}
          `,
        });

        // Populate failed records table
        this.failedRecords = response.failedRecords || [];
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error.message || 'An error occurred while uploading the file.',
        });
      }
    );
}

  // Error handling function
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  // Function to display selected columns' data (for testing)
  showData() {
    if (this.selectedcolumns.length === 0) {
      console.warn('No columns selected!');
      return;
    }

    const displayedData = this.beneficiaries.map((beneficiary) =>
      this.selectedcolumns.reduce((result: any, col: string) => {
        result[col] = beneficiary[col];
        return result;
      }, {})
    );

    console.log('Filtered Data based on selected columns:', displayedData);
  }
}
