import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

declare interface DataTableSettings {
  dom: string;
  
  select: any;
  buttons: any,
  scroller: any
}
const apiUrl = environment.apiUrl;
@Component({
  selector: 'projectobjectives',
  templateUrl: './projectobjectives.component.html'
})
export class ProjectobjectivesComponent implements OnInit {
  currentUser: any;
  search: any;
  Project: any;
  Objective: any;
  constructor(private http: HttpClient) { }

  dataTable: any;

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/Objective';

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

    const editButtonColumn = [{
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.delete(apiUrl + '/Objective/' + rowData.id)
            .subscribe(
              (response: any) => {
                this.getRegister()
                Swal.fire({
                  icon: "success",
                  title: "Objectives",
                  text: "Records Deleted Successfully",
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Objectives",
                  text: "Error while deleting record",
                });
              }
            );
        });
      }
    }];

    const updatedColumns = [...columns, ...editButtonColumn];

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

    this.dataTable = $('#dtObjective').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }

  save(): void {
    var data = {
      name: this.Objective
    }

    const url = apiUrl + '/Objective';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(url, data, { headers })
      .subscribe(
        (response) => {
          this.getRegister();
          this.Objective = null;
          Swal.fire({
            icon: "success",
            title: "Objectives",
            text: "Records Saved Successfully",
          });
        },
        (error) => {

          Swal.fire({
            icon: "error",
            title: "Objectives",
            text: "Error while saving record",
          });
        }
      );
  }

}
