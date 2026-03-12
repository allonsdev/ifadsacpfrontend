import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { AppointmentElement } from 'src/app/elements/appointmentv2/appointment';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';
const apiUrl = environment.apiUrl;

declare var $: any;

@Component({
  selector: 'appointments',
  templateUrl: './appointments.component.html',
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('appointmentdetailsmodal')
  appointmentdetailsmodal!: AppointmentElement;
  currentUser: any;
  organisations: any;
  dataTable: any;
  header: any;
  search: any;
  value: any;
  editObject: any;
  otherfacilitators: any[] = [];
  startDate: any;
  endDate: any;
  data: any;


  constructor(private http: HttpClient) {}

  private apiUrl = apiUrl;

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
  
  }




  filter(): void {
    console.log('GG');

    // Checking if both start and end dates are provided
    if (!this.startDate || !this.endDate) {
      return;
    }
    console.log('G2');

    // Converting start and end dates to Date objects
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);

    // Filtering activities by end date within the specified date range
    const filteredData = this.data.filter((activity: any) => {
      // Converting activity's end date to a Date object
      const activityEndDate = new Date(activity.EndDate);

      // Comparing activity's end date with the specified date range
      console.log(startDate, activity.EndDate, endDate, activityEndDate);
      return activityEndDate >= startDate && activityEndDate <= endDate;
    });

    console.log(filteredData);

    // Clearing existing rows in the datatable and adding filtered rows
    this.dataTable.clear().rows.add(filteredData).draw();
  }

  resetFilter(): void {
    // Clearing start and end dates
    this.startDate = null;
    this.endDate = null;

    // Resetting the DataTable to display the original data
    this.getRegister(); // Reload original data
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/GeneralActivity/detailed';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (response: any) => {
        this.data = JSON.parse(response);
        if (!this.dataTable) {
          setTimeout(() => {
            this.initializeDataTable(this.data);
          }, 1);
        } else {
          this.dataTable.clear().rows.add(this.data).draw();
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

    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const actionButtons = [
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-icon-only btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" data-bs-toggle="modal" data-bs-target="#appointmentdetailsmodal"><i class="fa fa-pencil" aria-hidden="true"></i></button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.getFacilitators(rowData.Id);
            this.editObject = rowData.Id;
            console.log(rowData.Id, rowData);
          });
        },
      },
    {
  data: 'action',
  title: '',
  defaultContent:
    '<button class="btn btn-sm btn-success d-flex align-items-center justify-content-center px-3"><i class="fa fa-download" aria-hidden="true"></i></button>',
  createdCell: (
    cell: any,
    cellData: any,
    rowData: any,
    rowIndex: number,
    colIndex: number
  ) => {

    $(cell).on('click', () => {

      const url = apiUrl + '/GeneralActivity/DownloadParticipants/' + rowData.Id;

      this.http.get(url, { responseType: 'blob' }).subscribe(
        (response: Blob) => {

          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          const downloadUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'Participants_' + rowData.Id + '.xlsx';
          link.click();

          window.URL.revokeObjectURL(downloadUrl);

          Swal.fire({
            icon: 'success',
            title: 'Participants',
            text: 'Excel download started successfully'
          });

        },
        (error) => {

          Swal.fire({
            icon: 'error',
            title: 'Participants',
            text: 'Error downloading Excel file'
          });

        }
      );

    });

  }
}
      
    ];

    // Ensure action buttons come FIRST
    const updatedColumns = [...actionButtons, ...columns];

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

    this.dataTable = $('#dtGeneralActivity').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  addnew(): void {
    this.appointmentdetailsmodal.clearForm();
    this.editObject = {};
    this.otherfacilitators = [];
  }

  getFacilitators(id: number): void {
    this.http.post(`${this.apiUrl}/GeneralActivity/${id}`, {}, {}).subscribe(
      (response: any) => {
        this.otherfacilitators = response;
        console.log(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }
}
