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
  selector: 'irrigation-upload',
  templateUrl: 'scheme.html',
})
export class IrrigationSchemesComponent implements OnInit, AfterViewInit {

  fileToUpload: File | null = null;
  failedRecords: any[] = [];
  allIrrigationSchemes: any[] = [];
  dataTable: any;
  id: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchAllIrrigationSchemes();
  }

  ngAfterViewInit() {}

  // ✅ DataTable Setup
  private initializeDataTable(data: any[]) {
    if (!data || data.length === 0) return;

    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const actionColumns = [
      {
        data: null,
        defaultContent:
          '<button class="btn btn-sm btn-outline-primary">View</button>',
        title: '',
        createdCell: (cell: any, cellData: any, rowData: any) => {
          $(cell).on('click', () => {
            this.id = rowData.id;
          });
        },
      },
      {
        data: null,
        defaultContent:
          '<button class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></button>',
        title: '',
        createdCell: (cell: any, cellData: any, rowData: any) => {
          $(cell).on('click', () => {
            this.deleteRecord(rowData.id);
          });
        },
      },
    ];

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: [...actionColumns, ...columns],
      dom: 'Bfrtip',
      buttons: ['copy', 'print', 'excel', 'colvis'],
    };

    this.dataTable = $('#dtIrrigationSchemes').DataTable(dtOptions);

    if (data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  // ✅ Delete
  deleteRecord(id: number) {
    this.http.delete(`${apiUrl}/api/irrigation/${id}`).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'Record removed.', 'success');
        this.fetchAllIrrigationSchemes();
      },
      error: () => {
        Swal.fire('Error', 'Delete failed.', 'error');
      },
    });
  }

  // ✅ File Upload
  onFileChange(evt: any) {
    const target: DataTransfer = evt.target;

    if (target.files.length !== 1) {
      Swal.fire('Error', 'Only one file allowed', 'error');
      return;
    }

    this.fileToUpload = target.files[0];

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const wb: XLSX.WorkBook = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.allIrrigationSchemes = this.mapExcelToIrrigation(rawData);

      console.log('Mapped Irrigation Data:', this.allIrrigationSchemes);
    };

    reader.readAsBinaryString(this.fileToUpload);
  }

  // ✅ Excel Mapping (IMPORTANT)
  mapExcelToIrrigation(data: any[]): any[] {
    return data.slice(1).map((row: any) => ({
      householdIdentifierNumber: row[0],
      province: row[1],
      district: row[2],
      ward: row[3],
      village: row[4],
      name: row[5],
      surname: row[6],
      sex: row[7],
      age: row[8],
      dateOfBirth: row[9],
      sexOfHousehold: row[10],
      contactNumber: row[11],
      disabilityStatus: row[12],
      youthStatus: row[13],
      landSize: row[14],
      valueChain: row[15],
      irrigationSchemes: row[16],
      chairperson: row[17],
      contact: row[18],
    }));
  }

  // ✅ Send to API
  sendSelectedData() {
    if (!this.fileToUpload) {
      Swal.fire('Error', 'Select a file first', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.fileToUpload);

    this.http
      .post<UploadResponse>(`${apiUrl}/api/beneficiary/IrrigationExcelUpload`, formData)
      .pipe(
        catchError((err) => {
          Swal.fire('Error', err.message, 'error');
          return throwError(() => err);
        })
      )
      .subscribe((res) => {
        Swal.fire(
          'Success',
          `Inserted: ${res.inserted} | Updated: ${res.updated} | Failed: ${res.failed}`,
          'success'
        );

        this.failedRecords = res.failedRecords;
        this.fetchAllIrrigationSchemes();
      });
  }

  // ✅ Fetch All
  fetchAllIrrigationSchemes() {
    this.http
      .get<any[]>(`${apiUrl}/api/beneficiary/irrigation`)
      .pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      )
      .subscribe((data) => {
        this.allIrrigationSchemes = data;

        if (!this.dataTable) {
          setTimeout(() => this.initializeDataTable(data), 1);
        } else {
          this.dataTable.clear().rows.add(data).draw();
        }
      });
  }
}