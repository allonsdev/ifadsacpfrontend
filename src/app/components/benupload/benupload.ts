import { Component } from '@angular/core';
import * as XLSX from 'xlsx'; // Import XLSX for reading Excel files
import { HttpClient } from '@angular/common/http'; // Import HttpClient for making API calls
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

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
  templateUrl: './benupload.html',
})
export class Benupload {
  selectedcolumns: string[] = [];
  beneficiaries: any[] = [];
  fileToUpload: File | null = null; // Store the selected file

  // Define the structure of the columns
  columns = [
    {
      data: 'Household Identifier Number',
      title: 'Household Identifier Number',
    },
    { data: 'Province', title: 'Province' },
    { data: 'District', title: 'District' },
    { data: 'Ward', title: 'Ward' },
    { data: 'Village', title: 'Village' },
    { data: 'Name', title: 'Name' },
    { data: 'Surname', title: 'Surname' },
    { data: 'Sex', title: 'Sex' },
    { data: 'Age', title: 'Age' },
    { data: 'Date of Birth', title: 'Date of Birth' },
    { data: 'Sex of Household', title: 'Sex of Household' },
    { data: 'Contact Number', title: 'Contact Number' },
    { data: 'Disability Status', title: 'Disability Status' },
    { data: 'Youth Status', title: 'Youth Status' },
    { data: 'Land Size', title: 'Land Size' },
    { data: 'Value Chain', title: 'Value Chain' },
    { data: 'APG Group', title: 'APG Group' },
    { data: 'Chairperson', title: 'Chairperson' },
    { data: 'Status', title: 'Status' },
    { data: 'FileName', title: 'FileName' },
    { data: 'FileType', title: 'FileType' },
    { data: 'FileSize', title: 'FileSize' },
    { data: 'FileData', title: 'FileData' },
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
    return data.map((row: any) => ({
      'Household Identifier Number': row[0],
      Province: row[1],
      District: row[2],
      Ward: row[3],
      Village: row[4],
      Name: row[5],
      Surname: row[6],
      Sex: row[7],
      Age: row[8],
      'Date of Birth': row[9],
      'Sex of Household': row[10],
      'Contact Number': row[11],
      'Disability Status': row[12],
      'Youth Status': row[13],
      'Land Size': row[14],
      'Value Chain': row[15],
      'APG Group': row[16],
      Chairperson: row[17],
      Status: row[18],
      FileName: row[19],
      FileType: row[20],
      FileSize: row[21],
      FileData: row[22],
    }));
  }

  beneficiariesData: any[] = [];
  // Function to upload the file and send selected data to the API
  sendSelectedData() {
    if (!this.fileToUpload) {
      console.error('No file selected for upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.fileToUpload, this.fileToUpload.name); // Append the file to formData

    this.http
      .post<BeneficiaryResponse>(
        environment.apiUrl + '/api/beneficiary/ExcelUpload',
        formData
      )
      .pipe(
        catchError(this.handleError) // Error handling
      )
      .subscribe(
        (response) => {
          console.log('Data successfully uploaded:', response);
          this.beneficiariesData = response.data;
        },
        (error) => {
          console.error('Error uploading file:', error);
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
