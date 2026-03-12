import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'activitiessubcomponent',
  templateUrl: './activitiessubcomponent.component.html'
})
export class ActivitiessubcomponentComponent implements OnInit {

  componentId: any;
  components: any;
  subComponentId: any;
  subComponents: any;
  currentUser: any;
  selectedvalue: any;
  dataTable: any;
  selectedRowIds: any;
  columns: any;
  filteredSubComponents: any;
  activities: any;
  filteredActvities:any ;
  activityId: number =0;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
    this.getRegister();
  }

  onComponentSelect(event: any) {
    this.filteredSubComponents = this.subComponents.filter((sc: any) => sc.ComponentId == event.target.value)
  }
onSubComponentSelect(event: any) {
  const selectedId = +event.target.value; // ensure it's a number

  console.log(selectedId)
  this.filteredActvities = this.activities.filter(
    (activity: any) => parseInt(activity.subComponentId, 10) === selectedId
  );
  console.log(this.filteredActvities)
}

onActivitySelect(activityId: number) {
  if (!this.dataTable) {
    console.error("DataTable instance does not exist.");
    return;
  }

  this.http.get<any[]>(apiUrl + '/Mapping/subActivities')
    .subscribe(
      (response: any[]) => {
        // filter subActivities belonging to the selected activity
        const mappedSubActivities = response.filter(sa => sa.activityId === activityId);
        this.selectedRowIds = mappedSubActivities.map(sa => sa.id);

        if (this.selectedRowIds.length > 0) {
          this.dataTable.rows().deselect();

          // get all data from DataTable
          const allData = this.dataTable.rows().data().toArray();

          // reorder so that selected ones come first
          const reorderedData = [
            ...allData.filter((row: any) => this.selectedRowIds.includes(row.id)), // selected first
            ...allData.filter((row: any) => !this.selectedRowIds.includes(row.id)) // then rest
          ];

          // clear + reload table with new order
          this.dataTable.clear().rows.add(reorderedData).draw();

          // select the reordered ones
          this.dataTable.rows((idx: number, data: any) => this.selectedRowIds.includes(data.id)).select();
        }
      },
      (error) => {
        console.error("Error occurred:", error);
      }
    );
}



  public getRegister() {
    const apiEndpoint = apiUrl + '/Mapping/subActivities';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
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
      this.dataTable = $('#dtActivitiesSubComponent').DataTable(dtOptions);
      if (data && data.length > 0) {
        this.dataTable.rows.add(data).draw();
      }
    } catch (error) {
      console.error('Error initializing DataTable', error);
    }
  }

  getAllParameters(): void {
    this.http.get(apiUrl + '/Parameter/luComponents')
      .subscribe(
        (response: any) => {
          this.components = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(apiUrl + '/Parameter/luSubComponents')
      .subscribe(
        (response: any) => {
          this.subComponents = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );

       this.http.get(apiUrl + '/Mapping/awpActivities')
      .subscribe((response: any) => {
        this.activities = response;

        console.log(this.activities)
      }, error => console.error("Error fetching activities", error));
  }

  sendSelectedData() {
    if (this.dataTable || !this.subComponentId) {
      const selectedRowsData = this.dataTable.rows({ selected: true }).data().toArray();
      const Ids = selectedRowsData.map((row: { id: any; }) => row.id);
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const postEndpoint = apiUrl + '/Mapping/activitiessubcomponent/' + this.subComponentId;
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
            text: "Error saving records",
          });
          console.error('Error posting selected Ids:', error);
        }
      );
    }
  }
}
