import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileuploadService } from '../../services/fileupload.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs/internal/Observable';

declare var $: any;

const apiUrl = environment.apiUrl;
@Component({
  selector: 'projectfiles',
  templateUrl: './projectfiles.component.html'
})
export class ProjectfilesComponent implements OnInit {
  currentUser: any;
  dataTable: any;

  editObject: any = {};

  constructor(private http: HttpClient, private FileService: FileuploadService) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {

    this.http.get(`${apiUrl}/File/${this.currentUser.staffId}`).subscribe(
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

          this.deleteFile(rowData.id);
        });
      }
    }, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-download" aria-hidden="true"></i></button>',
      title: "download",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {

          this.downloadFile(rowData.id, rowData.fileExtension, rowData.title);
        });
      }
    }];

    const iconColumn = {
      data: "fileExtension", // Assuming you have a property called FileExtension in your data
      title: "Icon",
      render: (data: string, type: string, row: any, meta: any) => {
        if (type === "display") {
          const fileExtension = data.toLowerCase();
          let iconClass = "fa fa-file-o"; // Default icon class
          let iconColor = "black"; // Default icon color

          // Set icon class and color based on file extension
          if (fileExtension === ".png" || fileExtension === ".jpg" || fileExtension === ".jpeg") {
            iconClass = "fa fa-file-image-o";
            iconColor = "#008272";
          } else if (fileExtension === ".mp4" || fileExtension === ".avi" || fileExtension === ".mov") {
            iconClass = "fa fa-file-video-o";
            iconColor = "#008272";
          } else if (fileExtension === ".ppt" || fileExtension === ".pptx") {
            iconClass = "fa fa-file-powerpoint-o";
            iconColor = "#E81123"; // Set color for PowerPoint files
          } else if (fileExtension === ".pdf") {
            iconClass = "fa fa-file-pdf-o";
            iconColor = "#E81123"; // Set color for PDF files
          } else if (
            fileExtension === ".doc" ||
            fileExtension === ".docx"
          ) {
            iconClass = "fa fa-file-word-o";
            iconColor = "#0078D4";
          } else if (

            fileExtension === ".xls" ||
            fileExtension === ".xlsx"
          ) {
            iconClass = "fa fa-file-excel-o";
            iconColor = "#00A300";
          }

          return `<i class="${iconClass}" aria-hidden="true" style="color:${iconColor};font-size:20px;"></i>`;
        }
        return data;
      },
    };

    const updatedColumns = [...editButtonColumn, iconColumn, ...columns];


    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: updatedColumns,
      dom: 'BfrtipP',
      
      buttons: ['copy', 'print', 'excel', 'colvis']
    };

    this.dataTable = $('#dtFiles').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }

  deleteFile(fileId: number) {
    const deleteUrl = `${apiUrl}/File/Delete/${fileId}`; // Assuming the API endpoint for file deletion

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

  downloadFile(id: number, fileExtension: string, fileName: string) {
    this.http.get(`${apiUrl}/File/Download/${id}`, { responseType: 'blob', observe: 'response' })
      .subscribe((response: any) => {
        const blob = new Blob([response.body]);
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName + fileExtension;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      });
  }
}