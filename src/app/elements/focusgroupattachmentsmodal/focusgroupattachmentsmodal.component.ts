import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { FileuploadService } from '../../services/fileupload.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'focusgroupattachmentsmodal',
  templateUrl: './focusgroupattachmentsmodal.component.html'
})
export class FocusgroupattachmentsmodalComponent implements OnInit, OnChanges {
  @Input() id: number = 0;
  selectedFile: File | undefined;
  fileType: number = 0;
  title: string = '';
  author: string = '';
  authorOrganization: string = '';
  description: string = '';
  uploadDate: Date = new Date();
  applySecurity: boolean = false;
  fileTypes: any[] = [];
  apiUrl: any = apiUrl + '/Parameter';
  dataTable: any;
  currentUser: any;

  constructor(private FileuploadService: FileuploadService, private http: HttpClient) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.id > 0) {

      this.getRegister()
    }
  }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.http.get(`${this.apiUrl}/luFileTypes`)
      .subscribe(
        (response: any) => {

          this.fileTypes = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }
  validateForm(): boolean {
    if (!this.selectedFile || !this.title || !this.author || !this.authorOrganization || !this.description || !this.uploadDate) {
      return false;
    }

    return true;
  }

  onSubmit() {
    if (this.validateForm()) {
      const fileDetails = {
        fileType: this.fileType,
        title: this.title,
        author: this.author,
        authorOrganization: this.authorOrganization,
        description: this.description,
        uploadDate: this.uploadDate,
        applySecurity: this.applySecurity,
        objectTypeId: 1022,
        objectId: this.id,
        staffFullname: this.currentUser.fullname
      };

      if (this.selectedFile) {

        this.FileuploadService.uploadFile(this.selectedFile, fileDetails)
          .subscribe(
            (response: any) => {
              Swal.fire({
                icon: "success",
                title: "FGD Files",
                text: "Record Saved Successfully",
              });
            },
            (error: any) => {
              Swal.fire({
                icon: "error",
                title: "FGD Files",
                text: "Error while saving record",
              });
            }
          );
      } else {
        Swal.fire({
          icon: "error",
          title: "FGD Files",
          text: "Please select a File",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "FGD Files",
        text: "Please fill out all required fields.",
      });
    }

  }

  public getRegister() {

    this.http.get(`${apiUrl}/File/byobject/${this.id}/1022`).subscribe(
      (response: any) => {
        var data = JSON.parse(response);
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

  private initializeDataTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const columns: any[] = Object.keys(data[0]).map((key) => ({ data: key, title: key, }));

    const editButtonColumn = [{ data: "action", defaultContent: '' }, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
      title: "delete",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {

          this.deleteFile(rowData.FileID);
        });
      }
    }, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-download" aria-hidden="true"></i></button>',
      title: "download",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {

          this.downloadFile(rowData.FileID, rowData.ContentType);
        });
      }
    }];

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
      }
    };

    this.dataTable = $('#dtFGD').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }

  deleteFile(fileId: number) {
    const deleteUrl = `${apiUrl}/File/${fileId}`; // Assuming the API endpoint for file deletion

    this.http.delete(deleteUrl).subscribe(
      (response: any) => {

        this.getRegister();
        Swal.fire({
          icon: "success",
          title: "Files",
          text: "File Deleted Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Files",
          text: "Error Deleting File",
        });
      }
    );
  }

  downloadFile(id: number, contentType: string) {
    this.http.get(`${apiUrl}/File/${id}`, { responseType: 'blob', observe: 'response' })
      .subscribe((response: any) => {
        const contentDispositionHeader = response.headers.get('content-disposition');
        let fileName = 'file'; // Default filename if not found in headers

        if (contentDispositionHeader) {
          const matches = contentDispositionHeader.match(/filename="?([^"]+)"?;/);
          if (matches && matches.length > 1) {
            fileName = matches[1];
          }
        }

        const blob = new Blob([response.body], { type: contentType });
        const url = window.URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName; // Set the downloaded file name

        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);


      });
  }
}

