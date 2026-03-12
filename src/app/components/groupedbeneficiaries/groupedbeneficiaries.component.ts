import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;

const apiUrl = environment.apiUrl;
@Component({
  selector: 'groupedbeneficiaries',
  templateUrl: './groupedbeneficiaries.component.html'
})
export class GroupedbeneficiariesComponent implements OnInit {
  currentUser: any;

  dataTable: any;
  id: number = 0;
  valuechains: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getParameters();
    this.getRegister(apiUrl + '/Group');
  }

  getParameters() {
    this.http.get(`${apiUrl}/Group/valuechains`)
      .subscribe(
        (response: any) => {

          this.valuechains = response
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  onSelect(event: any) {
    var apiEndpoint = apiUrl + '/Group';
    if (event.target.value) {

      apiEndpoint = apiUrl + '/Group/' + event.target.value;
    }
    this.getRegister(apiEndpoint)
  }

  public getRegister(apiEndpoint: any) {

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

    const editButtonColumn = [{ data: "action", defaultContent: '' }, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" data-bs-toggle="modal" data-bs-target="#viewparticipationmodal">Profiling</button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.id = rowData.id
        });
      }
    },
    ];

    const updatedColumns = [...editButtonColumn, ...columns, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
      title: "delete",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.delete(apiUrl + '/Group/' + rowData.id)
            .subscribe(
              (response: any) => {
                this.getRegister(apiUrl + '/Group');
                Swal.fire({
                  icon: "success",
                  title: "Group",
                  text: "Records Deleted Successfully",
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Group",
                  text: "Error while deleting record",
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
      columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
      }]
    };

    this.dataTable = $('#dtGroup').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }
}
