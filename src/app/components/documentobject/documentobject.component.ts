import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';

declare var $: any;

const apiUrl = environment.apiUrl;
@Component({
  selector: 'app-documentobject',
  templateUrl: './documentobject.component.html',
})
export class DocumentobjectComponent implements OnInit {
  selectedValue: any;
  dataTable: any;
  fileId: any;
  objectTypes: any;
  table: any;
  selectedRowIds: any;
  currentUser: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getRegister();
    this.getAllParameters();
  }

  highlightMapped(): void {
    if (this.dataTable && this.table) {
      if (this.selectedValue) {
        const selectedFile = this.table
          .rows({ selected: true })
          .data()
          .toArray();
        const fileIds = selectedFile.map((row: { FileID: any }) => row.FileID);
        this.fileId = 0;
        this.fileId = fileIds[0];
        if (!this.fileId) {
          return;
        }
        this.http
          .get(
            `${apiUrl}/Mapping/documentobject/${this.selectedValue}/${this.fileId}`
          )
          .subscribe(
            (response: any) => {
              this.selectedRowIds = response;
              if (this.selectedRowIds && this.selectedRowIds.length > 0) {
                const indexesToSelect: number[] = [];
                this.dataTable.rows().deselect();
                this.dataTable
                  .rows()
                  .every((rowIdx: number, tableLoop: any, rowLoop: any) => {
                    const rowData = this.dataTable.row(rowIdx).data();
                    if (this.selectedRowIds.includes(rowData.id)) {
                      indexesToSelect.push(rowIdx);
                    }
                  });
                this.dataTable.rows(indexesToSelect).select();
              }
            },
            (error) => {
              console.error('Error occurred:', error);
            }
          );
      }
    }
  }

  public getRegister() {
    this.http.get(apiUrl + '/File/' + this.currentUser.staffId).subscribe(
      (data: any) => {
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

    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 5,
      columns: columns,
      dom: 'BfrtipP',
      select: 'single',
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
      rowCallback: (row: any, data: any) => {
        $(row).on('click', () => {
          this.highlightMapped();
        });
      },
    };

    this.table = $('#dtDocuments').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.table.rows.add(data).draw();
    }
  }

  onSelect() {
    var endpoint = '';
    if (this.selectedValue == 1) {
      endpoint = 'api/Beneficiary/GetBeneficiaries';
    } else if (this.selectedValue == 2) {
      endpoint = 'api/Beneficiary/GetDistinctAPGGroups';
    } else if (this.selectedValue == 3) {
      endpoint = 'MSME';
    } else if (this.selectedValue == 4) {
      endpoint = 'StaffMember';
    } else if (this.selectedValue == 5) {
      endpoint = 'Organisation';
    }

    const apiEndpoint = `${apiUrl}/${endpoint}`;

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        const columns: any[] = Object.keys(data[0]).map((key) => ({
          data: key,
          title: key,
        }));
        if (this.dataTable) {
          this.dataTable.clear().destroy();
          const dataTableElement = $('#dtObjects');
          if (dataTableElement.length) {
            dataTableElement.empty();
          }
        }
        this.initializeDataTable(data, columns);
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
      dom: 'BfrtipP',
      select: 'multi',

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

    this.dataTable = $('#dtObjects').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

    this.highlightMapped();
  }

  getAllParameters(): void {
    this.http.get(`${apiUrl}/Parameter/luObjectTypes`).subscribe(
      (response: any) => {
        this.objectTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  sendSelectedData() {
    if (this.dataTable) {
      const selectedFile = this.table.rows({ selected: true }).data().toArray();
      const fileIds = selectedFile.map((row: { FileID: any }) => row.FileID);
      this.fileId = fileIds[0];

      if (!this.fileId) {
        Swal.fire({
          icon: 'error',
          title: 'Mapping',
          text: 'Please select a File',
        });
        return;
      }
      const selectedRowsData = this.dataTable
        .rows({ selected: true })
        .data()
        .toArray();
      const ids = selectedRowsData.map((row: { id: any }) => row.id);
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const postEndpoint = `${apiUrl}/Mapping/documentobject/${this.selectedValue}/${this.fileId}`;

      this.http.post(postEndpoint, ids, { headers }).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Mapping',
            text: 'Records Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Mapping',
            text: 'Error saving records',
          });
          console.error('Error posting selected ids:', error);
        }
      );
    }
  }
}
