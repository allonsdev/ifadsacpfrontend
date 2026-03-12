import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'viewdatafromdashboard',
  templateUrl: './viewdatafromdashboard.html',
})
export class ViewDataFromDashboardComponent implements OnInit, AfterViewInit {
  @Input() apiUrl: string = '';
  @Input() headers: string[] = [];

  dataTable: any;
  data: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit(): void {
    this.initializeDataTable();
  }

  fetchData() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (response) => {
        this.data = response;
        this.refreshDataTable();
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  initializeDataTable() {
    setTimeout(() => {
      if (!$.fn.DataTable.isDataTable('#dataTable')) {
        this.dataTable = $('#dataTable').DataTable({
          processing: true,
          pagingType: 'full_numbers',
          pageLength: 10,
          columns: [
            ...this.headers.map((header) => ({
              data: header,
              title: header.toUpperCase(),
            })),
            {
              data: null,
              title: 'Action',
              defaultContent:
                '<button class="btn btn-sm btn-danger delete-btn">Delete</button>',
              orderable: false,
            },
          ],
          dom: 'Bfrtip',
          buttons: ['copy', 'print', 'excel', 'colvis'],
        });
      }
    }, 500);
  }

  refreshDataTable() {
    if (this.dataTable) {
      this.dataTable.clear();
      this.dataTable.rows.add(this.data);
      this.dataTable.draw();
    } else {
      this.initializeDataTable();
    }
  }

  deleteRecord(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(
          () => {
            this.fetchData();
            Swal.fire('Deleted!', 'Record has been deleted.', 'success');
          },
          () => {
            Swal.fire('Error!', 'Error while deleting record.', 'error');
          }
        );
      }
    });
  }
}
