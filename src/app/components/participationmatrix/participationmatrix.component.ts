import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';

declare var $: any;

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-participationmatrix',
  templateUrl: './participationmatrix.component.html'
})
export class ParticipationmatrixComponent implements OnInit {
  currentUser: any;
  dataTable: any;
  selectedValue: any;
  participantTypes: any;
  checked: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }

  LoadMatrix() {
    if (!this.selectedValue) {
      return;
    }
    var endpoint = "";
    var countmethod = 0
    if (this.selectedValue == 1) {
      endpoint = "beneficiaries";
    } else if (this.selectedValue == 6) {
      endpoint = "vbus";
    } else if (this.selectedValue == 3) {
      endpoint = "msmes";
    } else if (this.selectedValue == 4) {
      endpoint = "staffmembers";
    } else if (this.selectedValue == 5) {
      endpoint = "organisations";
    }

    if (this.checked) {
      countmethod = 1
    } else {
      countmethod = 0
    }

    const apiEndpoint = `${apiUrl}/ParticipationMatrix/${endpoint}/${countmethod}`;

    // Show SweetAlert signing in...
    Swal.fire({
      title: 'Loading Matrix...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    } as SweetAlertOptions);

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        // Close SweetAlert once data is fetched
        Swal.close();

        const columns: any[] = Object.keys(data[0]).map((key) => ({ data: key, title: key }));
        if (this.dataTable) {
          this.dataTable.clear().destroy();
          const dataTableElement = $('#dtParticipantMatrix');
          if (dataTableElement.length) {
            dataTableElement.empty();
          }
        }
        this.initializeDataTable(data, columns);
      },
      (error) => {
        // Close SweetAlert on error
        Swal.close();

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
      dom: 'BfrtipP',
      select: "multi",
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

    this.dataTable = $('#dtParticipantMatrix').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  getAllParameters(): void {

    this.http.get(`${apiUrl}/Parameter/luParticipantTypes`)
      .subscribe(
        (response: any) => {
          this.participantTypes = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}
