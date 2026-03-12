import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare interface DataTableSettings {
  processing: boolean;
  dom: string;
  
  select: any;
  buttons: any
}
const apiUrl = environment.apiUrl;
@Component({
  selector: 'msmeregister',
  templateUrl: './msmeregister.component.html'
})
export class MsmeregisterComponent implements OnInit {
  currentUser: any;
  dataTable: any;
  columns: any[] = [];
  tablecolumns: any[] = [];
  selectedcolumns: any[] = [];
  data: any[] = [];
  selectedRowIds: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  showData() {
    if (!this.selectedcolumns.includes('koboEnterpriseId')) {
      this.selectedcolumns = [...this.selectedcolumns, 'koboEnterpriseId']
    }
    this.tablecolumns = this.columns.filter((d) => {
      return this.selectedcolumns.includes(d.title);
    });

    if (this.dataTable) {
      this.dataTable.clear().destroy();
      const dataTableElement = $('#dtMSMERegister');
      if (dataTableElement.length) {
        dataTableElement.empty();
      }
    }
    this.initializeDataTable(this.data, this.tablecolumns);
  }

  public getRegister() {

    this.http.get<any[]>(apiUrl + '/MSME/array').subscribe(
      (data: any[]) => {
        this.selectedRowIds = data
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    const apiEndpoint = apiUrl + '/MSMERegister'; //change here

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        this.data = data
        this.columns = Object.keys(data[0]).map((key) => ({ data: key, title: key, }));
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeDataTable(data: any[], columns: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      select: 'multi',
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

    try {
      this.dataTable = $('#dtMSMERegister').DataTable(dtOptions);
      if (data && data.length > 0) {
        this.dataTable.rows.add(data).draw();

        if (this.selectedRowIds && this.selectedRowIds.length > 0) {
          const indexesToSelect: number[] = [];
          data.forEach((row, index) => {
            if (this.selectedRowIds.includes(row.koboEnterpriseId)) {
              indexesToSelect.push(index);
            }
          });
          this.dataTable.rows(indexesToSelect).select();
        }
      }
    } catch (error) {
      console.error('Error initializing DataTable', error);
    }

  }

  sendSelectedData() {
    if (this.dataTable) {
      const selectedRowsData = this.dataTable.rows({ selected: true }).data().toArray();
      const koboEnterpriseIds = selectedRowsData.map((row: { koboEnterpriseId: any; }) => row.koboEnterpriseId); // Assuming the property is named 'koboBeneficiaryId'

      const postEndpoint = apiUrl + '/MSME';


      this.http.post(postEndpoint, koboEnterpriseIds).subscribe(
        (response) => {
          Swal.fire({
            icon: "success",
            title: "MSMEs",
            text: "Records Saved Successfully",
          });
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "MSMEs",
            text: "Error saving records",
          });
        }
      );
    }
  }
}
