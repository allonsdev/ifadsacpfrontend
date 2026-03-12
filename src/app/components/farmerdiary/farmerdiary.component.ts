import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;
const apiUrl = environment.apiUrl;
@Component({
  selector: 'farmerdiary',
  templateUrl: './farmerdiary.component.html'
})
export class FarmerdiaryComponent implements OnInit {
  FDtable: any;
  currentUser: any;
  dataTable: any;
  participantTypes: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  onSelect(event: any) {

    const apiEndpoint = `${apiUrl}/FarmerDiary/${event.target.value}`;

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        if (this.FDtable) {
          this.FDtable.clear().destroy();
          const dataTableElement = $('#dtFarmerDiaries');
          if (dataTableElement.length) {
            dataTableElement.empty();
          }
        }

        const columns: any[] = Object.keys(data[0]).map((key) => ({ data: key, title: key }));
        this.initializeFDTable(data, columns);

      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeFDTable(data: any[], columns: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      select: 'multi',
      columns: columns,
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

    this.FDtable = $('#dtFarmerDiaries').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.FDtable.rows.add(data).draw();
    }
  }
}
