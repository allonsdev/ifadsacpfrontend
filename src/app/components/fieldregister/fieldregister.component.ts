import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare interface DataTableSettings {
  pagingType: string;
  pageLength: number;
  dom: string;
  
  select: any;
  colReorder: any,
  buttons: any,
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'fieldregister',
  templateUrl: './fieldregister.component.html'
})
export class FieldregisterComponent implements OnInit {
  currentUser: any;
  beneficiaries: any;
  dataTable: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/FieldRegisterBeneficiary';

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

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      select: 'multi',
      dom: 'BfrtipP',
      
      buttons: ['copy', 'print', 'excel', 'colvis'],
    };

    this.dataTable = $('#dtFieldRegister').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }

  // Function to handle sending selected rows to an endpoint
  sendSelectedData() {
    if (this.dataTable) {
      const selectedRowsData = this.dataTable.rows({ selected: true }).data().toArray();
      const tableHeaders = this.dataTable.columns().header().toArray().map((header: { innerText: string; }) => header.innerText.trim());

      const selectedDataWithHeaders = selectedRowsData.map((row: { [x: string]: any; }) => {
        const rowDataWithHeaders: any = {};
        tableHeaders.forEach((header: string | number, index: string | number) => {
          rowDataWithHeaders[header] = row[index];
        });
        return rowDataWithHeaders;
      });
      const postEndpoint = apiUrl + '/ActivityAttendant';


      this.http.post(postEndpoint, selectedDataWithHeaders).subscribe(
        (response) => {

          Swal.fire({
            icon: "success",
            title: "Field Register",
            text: "Records Saved Successfully",
          });
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Field Register",
            text: "Error saving records",
          });
          console.error('Error posting selected rows:', error);
        }
      );
    }
  }
}