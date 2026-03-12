import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileuploadService } from '../../services/fileupload.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs/internal/Observable';

declare var $: any;

const apiUrl = environment.apiUrl;

export class File {
  id: number = 0;
  fileType: string = '';
  author: string = '';
  title: string = '';
  description: string = '';
  date: Date | undefined;
  filePath: string = '';
  fileExtension: string = '';
  authorOrganization: string = '';
  deoApproved: boolean = false; // Track DEO approval
  ppiApproved: boolean = false; // Track PPI approval
}

@Component({
  selector: 'app-approvefiles',
  templateUrl: './approvefiles.component.html',
})
export class ApprovefilesComponent implements OnInit {
  currentUser: any;
  currentRole: any;
  file: File = new File();
  dataTable: any;
  editObject: any = {};

  private apiEndpoint = apiUrl + '/File/Submitted';
  originalFile: any;
  table: any;
  staff: any;

  constructor(
    private http: HttpClient,
    private FileuploadService: FileuploadService
  ) {}

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    var data2 = localStorage.getItem('position');
    this.currentRole = data2 ? JSON.parse(data2) : null;
    this.currentUser = data ? JSON.parse(data) : null;
    console.log(this.currentUser.position);

    this.getRegister();
    this.getDeclinedFiles();
    this.originalFile = { ...this.file };
  }

  public getRegister() {
    this.http.get(this.apiEndpoint).subscribe(
      (data: any) => {
        if (!this.dataTable) {
          setTimeout(() => {
            this.initializeDataTable(data);
          }, 1);
        } else {
          this.dataTable.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  public getDeclinedFiles() {
    this.http.get(apiUrl + '/File/Disapproved').subscribe(
      (data: any) => {
        if (!this.table) {
          setTimeout(() => {
            this.initializeTable(data);
          }, 1);
        } else {
          this.table.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3">Select</button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.file = rowData;
            this.http
              .get(`${apiUrl}/File/GetPermissions/${rowData.id}`)
              .subscribe(
                (response: any) => {
                  this.staff = response;
                  console.log(response);
                },
                (error) => {
                  console.error('Error occurred:', error);
                }
              );
          });
        },
      },
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-download" aria-hidden="true"></i></button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.downloadFile(rowData.id, rowData.contentType, rowData.title);
          });
        },
      },
    ];

    const updatedColumns = [...editButtonColumn, ...columns];

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

    this.dataTable = $('#dtFileApproval').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  private initializeTable(data: any[]) {
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
          '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3">Select</button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.file = rowData;
            this.http
              .get(`${apiUrl}/File/GetPermissions/${rowData.id}`)
              .subscribe((response: any) => {
                this.staff = response;
                console.log(response);
              });
          });
        },
      },
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-download" aria-hidden="true"></i></button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.downloadFile(rowData.id, rowData.contentType, rowData.title);
          });
        },
      },
    ];

    const updatedColumns = [...editButtonColumn, ...columns];

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

    this.table = $('#dtDeclinedFile').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.table.rows.add(data).draw();
    }
  }

  actionfile(value: any, approverType: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      if (value === 'Approve') {
        this.file.ppiApproved = true; // Set PPI approval
         this.file.deoApproved = true;
      } else {
        this.file.ppiApproved = false;
         this.file.deoApproved = false; // Reset if declined
      }

    this.http
      .put<any>(
        `${apiUrl}/File/${value}/${this.file.id}/${this.currentUser.staffId}`,
        this.file,
        { headers }
      )
      .subscribe(
        (response) => {
          this.getRegister();
          this.file = this.originalFile; // Reset file object

          if (value === 'Approve') {
            Swal.fire({
              icon: 'success',
              title: 'Files',
              text: 'File Approved',
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Files',
              text: 'File Declined',
            });
          }
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Files',
            text: 'Error actioning file',
          });
        }
      );
  }

  deleteFile(fileId: number) {
    const deleteUrl = apiUrl + `/File/${fileId}`;
    this.http.delete(deleteUrl).subscribe(
      (response: any) => {
        this.getRegister();
        Swal.fire({
          icon: 'success',
          title: 'Files',
          text: 'File Deleted Successfully',
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Files',
          text: 'Error Deleting File',
        });
      }
    );
  }

  downloadFile(id: number, contentType: string, fileName: string) {
    console.log(contentType);
    this.http
      .get(`${apiUrl}/File/Download/${id}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: contentType });
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      });
  }
}
