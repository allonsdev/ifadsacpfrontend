import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IndicatordetailsmodalElement } from 'src/app/elements/indicatordetailsmodal/indicatordetailsmodal.element';
import Swal from 'sweetalert2';

declare var $: any;
const apiUrl = environment.apiUrl;
@Component({
  selector: 'indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent implements OnInit {
  @ViewChild('indicatorDetailsModal')
  indicatorDetailsModal!: IndicatordetailsmodalElement;
  currentUser: any;
  dataTable: any;
  editObject: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/Indicator/detailed';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (response: any) => {
        var data = JSON.parse(response)
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
      defaultContent: '<button class="btn btn-sm btn-icon-only btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" data-bs-toggle="modal" data-bs-target="#indicatordetailsmodal"><i class="fa fa-pencil" aria-hidden="true"></i></button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.get(`${apiUrl}/Achievements`);
          this.editObject = rowData.Id
        });
      }
    }];

    const updatedColumns = [...editButtonColumn, ...columns, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-pencil" aria-hidden="true"></i></button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.delete(apiUrl + '/Indicator/' + rowData.id)
            .subscribe(
              (response: any) => {
                this.getRegister();
                Swal.fire({
                  icon: "success",
                  title: "Indicator",
                  text: "Records Deleted Successfully",
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Indicator",
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
      }
    };

    this.dataTable = $('#dtIndicators').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }
  addnew(): void {
    this.indicatorDetailsModal.clearForm();
  }
}