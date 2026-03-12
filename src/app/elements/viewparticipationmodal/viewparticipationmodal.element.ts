import { Component, Input, OnChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

declare var $: any;
const apiUrl = environment.apiUrl;
@Component({
  selector: 'viewparticipationmodal',
  templateUrl: './viewparticipationmodal.element.html'
})
export class ViewparticipationmodalElement implements OnChanges {

  @Input() id: number = 0;
  @Input() objectId: number = 0;
  organisations: any;
  dataTable: any;
  table: any;
  header: any;
  search: any;
  value: any;
  editObject: any = {};
  router: Router = new Router();
  selection: boolean = false;
  FDtable: any;

  constructor(private http: HttpClient) { }

  ngOnChanges() {

    if (this.id > 0 && this.objectId > 0) {
      this.getRegister();
      if (this.objectId == 2) {
        this.selectionchanged();
      }
    }
  }

  public getRegister() {
    const apiEndpoint = `${apiUrl}/GeneralActivityParticipant/Participation/${this.id}/${this.objectId}`;
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

    this.dataTable = $('#dtViewParticipation').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  selectionchanged() {
    if (!this.id) {
      return;
    }
    var apiEndpoint = `${apiUrl}/GroupMember/${this.id}`;
    if (this.selection) {
      apiEndpoint = `${apiUrl}/Beneficiaries`;
    }
    this.Register(apiEndpoint)
  }

  public Register(apiEndpoint: string) {

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        if (!this.table) {
          setTimeout(() => {
            this.initializeTable(data);
          }, 1);
        } else {
          this.table.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const columns: any[] = Object.keys(data[0]).map((key) => ({ data: key, title: key, }));

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

    this.table = $('#dtGroupMembers').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.table.rows.add(data).draw();
    }
  }

  add() {
    this.sendSelectedData(`${apiUrl}/GroupMember/${this.id}`);
  }

  remove() {
    this.sendSelectedData(`${apiUrl}/GroupMember/remove/${this.id}`);

  }

  sendSelectedData(endpoint: string) {
    if (this.table) {
      const selectedRowsData = this.table.rows({ selected: true }).data().toArray();
      const participantIds = selectedRowsData.map((row: { id: any; }) => row.id); // Assuming the property is named 'koboBeneficiaryId'
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.post(endpoint, participantIds, { headers }).subscribe(
        (response) => {
          this.selectionchanged();
          Swal.fire({
            icon: "success",
            title: "Group Members",
            text: "Records Saved Successfully",
          });
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Group Members",
            text: "Error saving Members",
          });
          console.error('Error posting selected members:', error);
        }
      );
    }
  }

  onSelect(event: any) {

    const apiEndpoint = `${apiUrl}/FarmerDiary/${event.target.value}/${this.id}`;

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        if ($.fn.DataTable.isDataTable('#dtfarmerDiary')) {
          $('#dtfarmerDiary').DataTable().destroy();
          $('#dtfarmerDiary').empty();
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

    this.FDtable = $('#dtfarmerDiary').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.FDtable.rows.add(data).draw();
    }
  }
}
