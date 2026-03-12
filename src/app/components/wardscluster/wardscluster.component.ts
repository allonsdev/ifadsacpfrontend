import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'app-wardscluster',
  templateUrl: './wardscluster.component.html'
})
export class WardsclusterComponent implements OnInit {

  components: any;
  clusterId: any;
  clusters: any;
  currentUser: any;
  dataTable: any;
  selectedRowIds: any;
  columns: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
    this.getRegister();
  }

  onclusterselect() {
    if (!this.dataTable) {
      console.error("DataTable instance does not exist.");
      return;
    }
    this.http.get(apiUrl + '/Mapping/clusterwards/' + this.clusterId)
      .subscribe(
        (response: any) => {
          this.selectedRowIds = response;
          if (this.selectedRowIds && this.selectedRowIds.length > 0) {
            const indexesToSelect: number[] = [];
            this.dataTable.rows().deselect();
            this.dataTable.rows().every((rowIdx: number, tableLoop: any, rowLoop: any) => {
              const rowData = this.dataTable.row(rowIdx).data();
              if (this.selectedRowIds.includes(rowData.WardCode)) {
                indexesToSelect.push(rowIdx);
              }
            });
            this.dataTable.rows(indexesToSelect).select();
          }
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/Parameter/DetailedWardsAll';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (response: any) => {
        const data = JSON.parse(response)
        this.columns = Object.keys(data[0]).map((key) => ({ data: key, title: key }));
        if (!this.dataTable) {
          setTimeout(() => {
            this.initializeDataTable(data, this.columns);
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
      this.dataTable = $('#dtClusterWards').DataTable(dtOptions);
      if (data && data.length > 0) {
        this.dataTable.rows.add(data).draw();
      }
    } catch (error) {
      console.error('Error initializing DataTable', error);
    }
  }

  getAllParameters(): void {
    this.http.get(apiUrl + '/Parameter/luClusters')
      .subscribe(
        (response: any) => {
          this.clusters = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  sendSelectedData() {
    if (this.dataTable || !this.clusterId) {
      const selectedRowsData = this.dataTable.rows({ selected: true }).data().toArray();
      const Ids = selectedRowsData.map((row: { WardCode: any; }) => row.WardCode);
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const postEndpoint = apiUrl + '/Mapping/clusterwards/' + this.clusterId;
      this.http.post(postEndpoint, Ids, { headers }).subscribe(
        (response) => {
          Swal.fire({
            icon: "success",
            title: "Mapping",
            text: "Records Saved Successfully",
          });
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Mapping",
            text: "Error saving reocrds",
          });
          console.error('Error posting selected Ids:', error);
        }
      );
    }
  }
}
