import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'indicatordisaggregation',
  templateUrl: './indicatordisaggregation.component.html'
})

export class IndicatordisaggregationComponent implements OnInit {
  disaggregationLabel: any;
  unitOfMeasurement: any;
  unitsOfMeasurements: any;
  currentUser: any;
  dataTable: any;

  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }

  public getRegister() {
    this.http.get<any[]>(`${apiUrl}/DisaggregationLabel/${this.unitOfMeasurement}`).subscribe(
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
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" >delete</button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.delete(`${apiUrl}/DisaggregationLabel/${rowData.id}`)
            .subscribe(
              (response: any) => {
                this.getRegister()
                Swal.fire({
                  icon: "success",
                  title: "Outcomes",
                  text: "Records Deleted Successfully",
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Outcomes",
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

    this.dataTable = $('#dtDisaggregationLabels').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  save(): void {
    var data = {
      name: this.disaggregationLabel,
      unitOfMeasurement: this.unitOfMeasurement
    }

    console.log(data)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(`${apiUrl}/DisaggregationLabel`, data, { headers })
      .subscribe(
        (response) => {
          this.getRegister();
          Swal.fire({
            icon: "success",
            title: "Disaggregation Labels",
            text: "Records Saved Successfully",
          });
        },
        (error) => {

          Swal.fire({
            icon: "error",
            title: "Disaggregation Labels",
            text: "Error while saving record",
          });
        }
      );
  }

  getAllParameters(): void {
    this.http.get(`${apiUrl}/Parameter/luUnitsOfMeasurement`)
      .subscribe(
        (response: any) => {
          this.unitsOfMeasurements = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}
