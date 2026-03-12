import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

export class ProjectSite {
  id: number = 0;
  name: string = '';
  siteType: string = '';
  latitude: number = 0;
  longitude: number = 0;
  province: string = '';
  district: string = '';

  isValid(): boolean {
    // Check if any property is null or empty
    if (
      !this.name || !this.siteType ||
      !this.latitude || !this.longitude ||
      !this.province || !this.district
    ) {
      return false;
    }

    // Additional validation logic if needed

    return true;
  }
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'sitedetailsmodal',
  templateUrl: './sitedetailsmodal.element.html'
})
export class SitedetailsmodalElement implements OnInit {
  currentUser: any;
  dataTable: any;
  selectedValue: any;
  sendDistrictData() {
    throw new Error('Method not implemented.');
  }
  sendProvinceData() {
    throw new Error('Method not implemented.');
  }

  @Input() projectSite: ProjectSite = new ProjectSite();
  @Output() refresh: EventEmitter<any> = new EventEmitter();

  siteTypes: any[] = [];
  private apiUrl = apiUrl;
  participantTypes: any;
  filteredDistricts: any[] = [];
  districts: any[] = [];
  provinces: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }

  refreshdata() {
    this.refresh.emit();
  }

  onProvinceSelect(event: any) {
    const selectedProvinceName = event.target.value; // Assuming event.target.value contains the province name
    const selectedProvince = this.provinces.find((province: { Name: string }) => province.Name === selectedProvinceName);
    if (selectedProvince) {
      const selectedProvinceId = selectedProvince.Id;
      this.filteredDistricts = this.districts.filter((district: { ProvinceId: number }) => district.ProvinceId === selectedProvinceId);
    } else {
      // Handle case when selected province is not found
      console.error('Selected province not found.');
    }
  }

  isProjectSiteValid(): boolean {
    return (
      this.projectSite.id !== 0 &&
      this.projectSite.name.trim() !== '' &&
      this.projectSite.siteType.trim() !== '' &&
      this.projectSite.latitude !== 0 &&
      this.projectSite.longitude !== 0 &&
      this.projectSite.province !== '' &&
      this.projectSite.district !== ''
    );
  }

  createProjectSite(): void {
    if (!this.isProjectSiteValid()) {
      Swal.fire({
        icon: "success",
        title: "Project Sites",
        text: "Please fill out all required fields.",
      });
      return;
    }


    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(`${this.apiUrl}/ProjectSite`, this.projectSite, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "ProjectSite",
          text: "Record Saved Successfully",
        });
      },
      (error) => {

        Swal.fire({
          icon: "error",
          title: "ProjectSite",
          text: "Error saving record",
        });
      }
    );
  }

  updateProjectSite(): void {
    if (!this.isProjectSiteValid()) {
      Swal.fire({
        icon: "success",
        title: "Project Sites",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.put<any>(`${this.apiUrl}/ProjectSite/${this.projectSite.id}`, this.projectSite, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "ProjectSite",
          text: "Record Saved Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "ProjectSite",
          text: "Error saving record",
        });
      }
    );
  }

  getAllParameters(): void {
    this.http.get(`${this.apiUrl}/Parameter/luSiteTypes`)
      .subscribe(
        (response: any) => {
          this.siteTypes = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/Parameter/luDistricts`)
      .subscribe(
        (response: any) => {

          this.districts = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/Parameter/luProvinces`)
      .subscribe(
        (response: any) => {
          this.provinces = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  onSelect(event: any) {
    this.selectedValue = event.target.value
    var endpoint = "";
    if (this.selectedValue == 1) {
      endpoint = "luProvinces"
    } else if (this.selectedValue == 2) {
      endpoint = "luDistricts"
    } else if (this.selectedValue == 3) {
      endpoint = "DetailedWardsAll"
    } else if (this.selectedValue == 4) {
      endpoint = "luClusters"
    }

    const apiEndpoint = `${this.apiUrl}/Parameter/${endpoint}`;

    this.http.get<any[]>(apiEndpoint).subscribe(
      (response: any) => {
        var data = JSON.parse(response);
        var columns = [{ data: 'Id', title: 'Id' }, { data: 'Name', title: 'Name' }]
        if (this.selectedValue == 3) {
          columns.push({ data: 'District', title: 'District' },{ data: 'WardCode', title: 'WardCode' })
        }
        if (this.dataTable) {
          this.dataTable.clear().destroy();
          const dataTableElement = $('#dtRegion');
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

    this.dataTable = $('#dtRegion').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  sendSelectedData() {
    if (this.dataTable) {
      const selectedRowsData = this.dataTable.rows({ selected: true }).data().toArray();
      var ids;
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      var endpoint = "";
      if (this.selectedValue == 1) {
        ids = selectedRowsData.map((row: { Id: any; }) => row.Id);
        endpoint = "CoveredProvince"
      } else if (this.selectedValue == 2) {
        ids = selectedRowsData.map((row: { Id: any; }) => row.Id);
        endpoint = "CoveredDistrict"
      } else if (this.selectedValue == 3) {
        ids = selectedRowsData.map((row: { WardCode: any; }) => row.WardCode);
        endpoint = "CoveredWard"
      } else if (this.selectedValue == 4) {
        ids = selectedRowsData.map((row: { Id: any; }) => row.Id);
        endpoint = "CoveredCluster"
      }
      const url = `${this.apiUrl}/${endpoint}`;


      this.http.post(url, ids, { headers }).subscribe(
        (response) => {
          Swal.fire({
            icon: "success",
            title: "Geo Coverage",
            text: "Records Saved Successfully",
          });
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Geo Coverage",
            text: "Error while saving record/s",
          });
        }
      );
    }
  }
}
