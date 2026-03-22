import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
declare var $: any;

const apiUrl = environment.apiUrl;

interface UploadResponse {
  message: string;
  totalRecords: number;
  inserted: number;
  updated: number;
  failed: number;
  failedRecords: any[];
}

@Component({
  selector: 'sbu-upload',
  templateUrl: './sbu.html',
})
export class SBUComponent implements OnInit, AfterViewInit {
  fileToUpload: File | null = null;
  failedRecords: any[] = [];
  allSBU: any[] = [];
   dataTable: any;
   id: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchAllSBU();
  }

  ngAfterViewInit() {
  }


  

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;
    if (target.files.length !== 1) return;

    this.fileToUpload = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      this.allSBU = this.mapExcelToSBU(rawData);
      console.log('Mapped SBU:', this.allSBU);
    };

    reader.readAsBinaryString(this.fileToUpload);
  }


  private initializeDataTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const editButtonColumn = [
      { data: 'action', defaultContent: '' },
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" data-bs-toggle="modal" data-bs-target="#viewparticipationmodal">Profiling</button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.id = rowData.id;
          });
        },
      },
    ];

    const updatedColumns = [
      ...editButtonColumn,
      ...columns,
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.http
              .delete(apiUrl + '/vwBeneficiaries/' + rowData.id)
              .subscribe(
                (response: any) => {
                  this.fetchAllSBU();
                  Swal.fire({
                    icon: 'success',
                    title: 'Beneficiary',
                    text: 'Records Deleted Successfully',
                  });
                },
                (error) => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Beneficiary',
                    text: 'Error while deleting record',
                  });
                }
              );
          });
        },
      },
    ];

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: updatedColumns,
      dom: 'BfrtipP',

      buttons: ['copy', 'print', 'excel', 'colvis'],
      initComplete: function (this: any) {
        const api = this.api();

        const headerRow = api.table().header().querySelector('tr');
        const searchRow = document.createElement('tr');
        api.columns().every(function (this: any) {
          const column = this;
          const searchCell = document.createElement('th');
          const input = document.createElement('input');
          input.placeholder = 'Search';
          input.className = 'form-control form-control-sm';
          input.addEventListener('keyup', function () {
            column.search(this.value).draw();
          });
          searchCell.appendChild(input);
          searchRow.appendChild(searchCell);
        });

        headerRow.insertAdjacentElement('afterend', searchRow);
      },
    };

    this.dataTable = $('#dtBeneficiaries').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }
  
  mapExcelToSBU(data: any[]): any[] {
    return data.slice(1).map(row => ({
      province: row[0],
      district: row[1],
      ward: row[2],
      nameOfSchoolBusinessUnit: row[3],
      numberOfFemaleStudents: row[4],
      numberOfMaleStudents: row[5],
      totalNumberOfStudents: row[6],
      nameOfSchoolHead: row[7],
      contactNumberOfTheSchoolHead: row[8],
      latitude: row[9],
      longitude: row[10],
      createdAt: row[11],
    }));
  }

  sendSelectedData() {
    if (!this.fileToUpload) {
      Swal.fire({ icon:'error', title:'No File Selected', text:'Please select a file to upload.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.fileToUpload, this.fileToUpload.name);

    this.http.post<UploadResponse>(`${environment.apiUrl}/api/beneficiary/SBUExcelUpload`, formData)
      .pipe(catchError(err => { Swal.fire({icon:'error', title:'Upload Failed', text: err.message || 'Error uploading file.'}); return throwError(() => err); }))
      .subscribe(response => {
        Swal.fire({
          icon:'success',
          title:'Upload Successful',
          html:`Total Records: ${response.totalRecords} <br/>Inserted: ${response.inserted} <br/>Updated: ${response.updated} <br/>Failed: ${response.failed}`
        });

        this.failedRecords = response.failedRecords;
        this.fetchAllSBU();
      });
  }

  fetchAllSBU() {
    this.http.get<any[]>(`${environment.apiUrl}/api/beneficiary/sbu`)
      .pipe(catchError(err => { console.error('Failed to fetch SBU', err); return throwError(() => err); }))
      .subscribe(data => {
        this.allSBU = data;

        if (!this.dataTable) {
          setTimeout(() => {
            this.initializeDataTable(data);
          }, 1);
        } else {
          this.dataTable.clear().rows.add(data).draw();
        }
      });
  }
}