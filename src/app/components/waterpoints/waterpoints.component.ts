import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;

const apiUrl = environment.apiUrl;

export class WaterPoint {
  id: number = 0;
  name: string = '';
  province: string = '';
  district: string = '';
  ward: string = '';
  village: string = '';
  latitude: number | null = null;
  longitude: number | null = null;
  numberOfHouseholds: number | null = null;
  numberOfIndividuals: number | null = null;
  men: number | null = null;
  women: number | null = null;
  youth: number | null = null;

  isValid(): boolean {
    // Basic validation: Check if required fields are not null or undefined
    if (
      !this.province || !this.district || !this.name ||
      !this.ward || !this.village ||
      this.latitude === null || this.longitude === null ||
      this.numberOfHouseholds === null || this.numberOfIndividuals === null ||
      this.men === null || this.women === null || this.youth === null
    ) {
      return false;
    }

    return true;
  }

  clear(): void {
    this.id = 0;
    this.name = '';
    this.province = '';
    this.district = '';
    this.ward = '';
    this.village = '';
    this.latitude = null;
    this.longitude = null;
    this.numberOfHouseholds = null;
    this.numberOfIndividuals = null;
    this.men = null;
    this.women = null;
    this.youth = null;
  }
}
@Component({
  selector: 'waterpoints',
  templateUrl: './waterpoints.component.html'
})
export class WaterpointsComponent implements OnInit {
  currentUser: any;
  dataTable: any;
  editObject: WaterPoint = new WaterPoint;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/WaterPoint';

    this.http.get<any[]>(apiEndpoint).subscribe(
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

    const editButtonColumn = [{
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-icon-only btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" data-bs-toggle="modal" data-bs-target="#waterpointsmodal"><i class="fa fa-pencil" aria-hidden="true"></i></button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.editObject = rowData
        });
      }
    }];

    const updatedColumns = [...editButtonColumn, ...columns, {
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
      title: "",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.delete(apiUrl + '/WaterPoint/' + rowData.id)
            .subscribe(
              (response: any) => {
                this.getRegister();
                Swal.fire({
                  icon: "success",
                  title: "Water Points",
                  text: "Records Deleted Successfully",
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Water Points",
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

    this.dataTable = $('#dtWaterpoints').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }

  addnew(): void {
    this.editObject.id = 0;
    this.editObject.name = '';
    this.editObject.province = '';
    this.editObject.district = '';
    this.editObject.ward = '';
    this.editObject.village = '';
    this.editObject.latitude = null;
    this.editObject.longitude = null;
    this.editObject.numberOfHouseholds = null;
    this.editObject.numberOfIndividuals = null;
    this.editObject.men = null;
    this.editObject.women = null;
    this.editObject.youth = null;
  }
}