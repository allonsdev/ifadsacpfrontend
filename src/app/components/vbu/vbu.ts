import { Component } from '@angular/core';
import * as XLSX from 'xlsx'; // Import XLSX for reading Excel files
import { HttpClient } from '@angular/common/http'; // Import HttpClient for making API calls
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';
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



interface UploadResponse {
  message: string;
  totalRecords: number;
  inserted: number;
  updated: number;
  failed: number;
  failedRecords: any[];
}


@Component({
  selector: 'benupload',
  templateUrl: './vbu.html',
})
export class Vbu {
  selectedcolumns: string[] = [];
  beneficiaries: any[] = [];
  fileToUpload: File | null = null; // Store the selected file
  failedRecords: any[] = [];
  uploadSummary: any = null;
  showModal: boolean = false;

  // Define the structure of the columns
columns = [
  { data: 'HhdIdentifierNo', title: 'HhdIdentifierNo' },
  { data: 'Province', title: 'Province' },
  { data: 'District', title: 'District' },
  { data: 'Ward', title: 'Ward' },
  { data: 'Village', title: 'Village' },
  { data: 'Name', title: 'Name' },
  { data: 'Surname', title: 'Surname' },
  { data: 'Sex', title: 'Sex' },
  { data: 'Age', title: 'Age' },
  { data: 'DateOfBirth', title: 'DateOfBirth' },
  { data: 'IdNumber', title: 'IdNumber' },
  { data: 'ContactNumber', title: 'ContactNumber' },
  { data: 'MaritalStatus', title: 'MaritalStatus' },
  { data: 'Disability', title: 'Disability' },
  { data: 'HouseholdHeadSex', title: 'HouseholdHeadSex' },
  { data: 'VbuLandSize', title: 'VbuLandSize' },
  { data: 'AreaUnderProduction', title: 'AreaUnderProduction' },
  { data: 'IsVbuMember', title: 'IsVbuMember' },
  { data: 'VbuName', title: 'VbuName' },
  { data: 'LeadershipPosition', title: 'LeadershipPosition' },
  { data: 'SpecifyPosition', title: 'SpecifyPosition' },
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
    HhdIdentifierNo: row[0],
    Province: row[1],
    District: row[2],
    Ward: row[3],
    Village: row[4],
    Name: row[5],
    Surname: row[6],
    Sex: row[7],
    Age: row[8],
    DateOfBirth: row[9],
    IdNumber: row[10],
    ContactNumber: row[11],
    MaritalStatus: row[12],
    Disability: row[13],
    HouseholdHeadSex: row[14],
    VbuLandSize: row[15],
    AreaUnderProduction: row[16],
    IsVbuMember: row[17],
    VbuName: row[18],
    LeadershipPosition: row[19],
    SpecifyPosition: row[20],
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
    .post<UploadResponse>(
      `${environment.apiUrl}/api/beneficiary/VBUExcelUpload`,
      formData
    )
    .pipe(
      catchError((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: err.message || 'An error occurred while uploading the file.',
        });
        return throwError(() => err);
      })
    )
    .subscribe((response) => {
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful',
        html: `
          Total Records: ${response.totalRecords} <br/>
          Inserted: ${response.inserted} <br/>
          Updated: ${response.updated} <br/>
          Failed: ${response.failed}
        `,
      });

      // Save failed records for table if needed
      this.failedRecords = response.failedRecords;

      // Save summary info
      this.uploadSummary = {
        totalRecords: response.totalRecords,
        inserted: response.inserted,
        updated: response.updated,
        failed: response.failed,
      };

      // Optional: remove modal if using Swal
      this.showModal = false;
    });
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
