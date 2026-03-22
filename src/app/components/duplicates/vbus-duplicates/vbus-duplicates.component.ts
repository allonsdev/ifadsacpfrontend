import { Component, OnInit } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-vbus-duplicates',
  templateUrl: './vbus-duplicates.component.html',
})
export class VbusDuplicatesComponent implements OnInit {
  currentUser: any;
  dataTable: any;
  selectedIds: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getDuplicates();
  }

  public getDuplicates() {
    const apiEndpoint = apiUrl + '/api/Duplicates/vbus';
    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        if (!data || data.length === 0) {
          if (this.dataTable) {
            this.dataTable.clear().draw();
          } else {
            setTimeout(() => this.initializeDataTable([]), 1);
          }
          return;
        }
        if (!this.dataTable) {
          setTimeout(() => this.initializeDataTable(data), 1);
        } else {
          this.dataTable.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching duplicates:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load duplicate records.' });
      }
    );
  }

  public bulkDelete() {
    this.selectedIds = [];
    $('.row-checkbox:checked').each((_: any, el: any) => {
      if (el.value) this.selectedIds.push(el.value);
    });

    if (this.selectedIds.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select records to delete.' });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Bulk Delete',
      text: `Are you sure you want to delete ${this.selectedIds.length} record(s)?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .delete(apiUrl + '/api/Duplicates/vbus/bulk', { body: this.selectedIds })
          .subscribe(
            () => {
              this.selectedIds = [];
              this.getDuplicates();
              Swal.fire({ icon: 'success', title: 'Deleted', text: 'Selected records deleted successfully.' });
            },
            () => Swal.fire({ icon: 'error', title: 'Error', text: 'Error while deleting records.' })
          );
      }
    });
  }

  private initializeDataTable(data: any[]) {
    const columns: any[] =
      data.length > 0
        ? Object.keys(data[0]).map((key) => ({
          data: key,
          title: key,
          defaultContent: '-',
          render: (value: any) => {
            if (value === null || value === undefined || value === '')
              return '<span class="text-muted">-</span>';
            return value;
          },
        }))
        : [{ data: 'ID', title: 'ID', defaultContent: '-' }];

    const checkboxColumn = {
      data: null,
      title: '<div style="text-align:center;"><input type="checkbox" id="selectAll" style="width:18px;height:18px;cursor:pointer;" /></div>',
      defaultContent: '',
      orderable: false,
      createdCell: (cell: any, cellData: any, rowData: any) => {
        const id = rowData?.id ?? rowData?.ID ?? rowData?.Id;
        if (id === null || id === undefined) return;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkbox.value = id;
        checkbox.style.width = '18px';
        checkbox.style.height = '18px';
        checkbox.style.cursor = 'pointer';
        $(cell).css({ 'text-align': 'center', 'vertical-align': 'middle' });
        $(cell).empty().append(checkbox);
      },
    };

    const deleteColumn = {
      data: null,
      title: '',
      defaultContent: '',
      orderable: false,
      createdCell: (cell: any, cellData: any, rowData: any) => {
        const id = rowData?.id ?? rowData?.ID ?? rowData?.Id;
        if (id === null || id === undefined) return;
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-danger';
        btn.innerHTML = '<i class="fa fa-trash"></i>';
        btn.addEventListener('click', () => {
          Swal.fire({
            icon: 'warning',
            title: 'Delete Record',
            text: `Are you sure you want to delete record ${id}?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#d33',
          }).then((result) => {
            if (result.isConfirmed) {
              this.http.delete(apiUrl + '/api/Duplicates/vbus/' + id).subscribe(
                () => {
                  this.getDuplicates();
                  Swal.fire({ icon: 'success', title: 'Deleted', text: 'Record deleted successfully.' });
                },
                () => Swal.fire({ icon: 'error', title: 'Error', text: 'Error while deleting record.' })
              );
            }
          });
        });
        $(cell).css({ 'text-align': 'center', 'vertical-align': 'middle' });
        $(cell).empty().append(btn);
      },
    };

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: [checkboxColumn, ...columns, deleteColumn],
      dom: 'BfrtipP',
      buttons: ['copy', 'print', 'excel', 'colvis'],
      language: {
        emptyTable: 'No duplicate records found.',
        zeroRecords: 'No matching duplicate records found.',
        processing: 'Loading duplicate records...',
      },
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
            column.search((this as HTMLInputElement).value).draw();
          });
          searchCell.appendChild(input);
          searchRow.appendChild(searchCell);
        });
        headerRow.insertAdjacentElement('afterend', searchRow);
      },
    };

    this.dataTable = $('#dtVbusDuplicates').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

    $(document).on('change', '#selectAll', (e: any) => {
      const checked = e.target.checked;
      $('.row-checkbox').each((_: any, el: any) => {
        el.checked = checked;
      });
    });
  }
}