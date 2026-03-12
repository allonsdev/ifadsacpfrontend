import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;
const apiUrl = environment.apiUrl;
@Component({
  selector: 'matrix',
  templateUrl: './matrix.html',
})
export class Matrix implements OnInit {
  currentUser: any;
  dataTable: any;
  id: number = 0;

constructor(private http: HttpClient) {}
  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/api/participant-activity/json';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
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

downloadMatrix(): void {
  const endpoint = apiUrl + '/api/participant-activity/excel';

  this.http.get(endpoint, { responseType: 'blob' }).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Beneficiary_Matrix.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Download Complete',
        text: 'Beneficiary Matrix downloaded successfully',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (error) => {
      // If backend returns a blob (like your 500 errors)
      if (error.error instanceof Blob) {
        error.error.text().then((text: string) => {
          console.error('BACKEND ERROR DETAILS:\n', text);
          Swal.fire({
            icon: 'error',
            title: 'Download Failed',
            html: `<pre style="text-align:left;white-space:pre-wrap;">${text}</pre>`
          });
        });
      } else {
        console.error('Matrix download failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'Unable to download Beneficiary Matrix'
        });
      }
    }
  });
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
                  this.getRegister();
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
}
