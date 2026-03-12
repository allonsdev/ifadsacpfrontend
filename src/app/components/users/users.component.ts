import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;
const apiUrl = environment.apiUrl;
@Component({
  selector: 'users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  currentUser: any;
  staffMembers: any;
  dataTable: any;
  header: any;
  search: any;
  value: any;
  editObject: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/User';

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

  private initializeDataTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const columns: any[] = Object.keys(data[0]).map((key) => ({ data: key, title: key, }));
    console.log(columns)
    const updatedColumns = [...columns, {
      data: "action",
      defaultContent: '',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        console.log(rowData.isActivated)
        if (rowData.isActivated) {
          cell.innerHTML = '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3">Deactivate</button>';
        } else {
          cell.innerHTML = '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3">Activate</button>';
        }

        $(cell).on('click', () => {
          const activationUrl = rowData.isActivated ? '/User/deactivate/' : '/User/activate/';

          this.http.get(apiUrl + activationUrl + rowData.userId)
            .subscribe(
              (response: any) => {
                this.getRegister();
                const successText = rowData.isActivated ? "Account Deactivated Successfully" : "Account Activated Successfully";
                Swal.fire({
                  icon: "success",
                  title: "Users",
                  text: successText,
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Users",
                  text: `${error.error && error.error}`,
                });
              }
            );
        });
      }
    }, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3">Reset</button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          Swal.fire({
            title: 'Resetting Account...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          this.http.get(apiUrl + '/User/resetpassword/' + rowData.userId)
            .subscribe(
              (response: any) => {
                Swal.close();
                this.getRegister();
                Swal.fire({
                  icon: "success",
                  title: "Users",
                  text: "Password reset Successfully",
                });
              },
              (error) => {
                Swal.close(); // Close the loading spinner
                Swal.fire({
                  icon: "error",
                  title: "Users",
                  text: `${error.error && error.error}`,
                });
              }
            );
        });

      }
    }];

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: updatedColumns,
      dom: 'BfrtipP',
      columnDefs: [{
        targets: updatedColumns.findIndex(col => col.data === 'isActivated'),
        visible: false,
      }],
      
      buttons: ['copy', 'print', 'excel', 'colvis'],
      initComplete: function (this: any) {
        const api = this.api();
        const headerRow = api.table().header().querySelector('tr');
        const searchRow = document.createElement('tr');

        api.columns().every(function (this: any) {
          const column = this;

          if (column.visible()) {
            const searchCell = document.createElement('th');
            const input = document.createElement('input');
            input.placeholder = 'Search';
            input.className = 'form-control form-control-sm';
            input.addEventListener('keyup', function () {
              column.search(this.value).draw();
            });
            searchCell.appendChild(input);
            searchRow.appendChild(searchCell);
          }
        });

        headerRow.insertAdjacentElement('afterend', searchRow);
      }

    };

    this.dataTable = $('#dtUsers').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  addnew(): void {
    this.editObject = {}
  }
}
