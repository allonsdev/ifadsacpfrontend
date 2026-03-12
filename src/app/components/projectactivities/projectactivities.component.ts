import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'projectactivities',
  templateUrl: './projectactivities.component.html'
})
export class ProjectactivitiesComponent implements OnInit {
  currentUser: any;
  search: any;
  Project: any;
  Objective: any;
  Objectives: any;
  Outcome: any;
  Outcomes: any;
  filteredOutcomes: any;
  Output: any;
  Outputs: any;
  filteredOutputs: any;
  Activity: any;
  selectedvalue: number = 0;
  ActivityInShort: any;
  
  constructor(private http: HttpClient) { }

  dataTable: any;

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }

  onselect(event: any) {
    this.selectedvalue = event.target.value
    this.getRegister();
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/Activity/' + this.selectedvalue;

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

    const editButtonColumn = [{
      data: "action",
      defaultContent: '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
      title: "delete",
      createdCell: (cell: any, cellData: any, rowData: any, rowIndex: number, colIndex: number) => {
        $(cell).on('click', () => {
          this.http.delete(apiUrl + '/Activity/' + rowData.id)
            .subscribe(
              (response: any) => {
                this.getRegister();
                Swal.fire({
                  icon: "success",
                  title: "Activities",
                  text: "Records Deleted Successfully",
                });
              },
              (error) => {
                Swal.fire({
                  icon: "error",
                  title: "Activities",
                  text: "Error while deleting record",
                });
              }
            );
        });
      }
    }];

    const updatedColumns = [...columns, ...editButtonColumn];

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
      }
    };

    this.dataTable = $('#dtActivity').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }

  }

  save(): void {
    if (this.ActivityInShort.length > 128) {
      Swal.fire({
        icon: "error",
        title: "Activity",
        text: "Activity In Short should not exceed 128 characters.",
      });
      return;
    }
    var data = {
      name: this.Activity,
      outputId: this.Output,
      nameInShort: this.ActivityInShort
    }

    const url = apiUrl + '/Activity';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(url, data, { headers })
      .subscribe(
        (response) => {
          this.getRegister();
          this.Activity = null;
          this.ActivityInShort = null;
          Swal.fire({
            icon: "success",
            title: "Activity",
            text: "Records Saved Successfully",
          });
        },
        (error) => {

          Swal.fire({
            icon: "error",
            title: "Activity",
            text: "Error while saving record",
          });
        }
      );
  }

  private addEditBtnEvent(): void {
    $('#dtActivity').on('click', '.edit-btn', (event) => {
      const $button = $(event.target);
      const $row = $button.closest('tr');
      const rowData = this.dataTable.row($row).data();
    });
  }

  onObjectiveSelect(event: any): void {
    this.filteredOutcomes = this.Outcomes.filter((d: { objectiveId: any; }) => d.objectiveId == event.target.value);
  }

  onOutcomeSelect(event: any): void {
    this.filteredOutputs = this.Outputs.filter((d: { outcomeId: any; }) => d.outcomeId == event.target.value);
  }

  getAllParameters(): void {
    this.http.get(apiUrl + '/Objective')
      .subscribe(
        (response: any) => {

          this.Objectives = response;
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(apiUrl + '/Outcome')
      .subscribe(
        (response: any) => {

          this.Outcomes = response;
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(apiUrl + '/Output')
      .subscribe(
        (response: any) => {

          this.Outputs = response;
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}

