import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

declare interface DataTableSettings {
  dom: string;
  select: any;
  buttons: any,
  scroller: any
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'groupdetailsmodal',
  templateUrl: './groupdetailsmodal.element.html',
})
export class GroupdetailsmodalElement implements OnInit, OnDestroy, OnChanges {
  beneficiaries: any[] = [];
  apiUrl: any = apiUrl + '/Parameter';
  search: any;
  Province: string = '';
  District: string = '';
  Ward: string = '';
  groupName: string = '';
  GroupType: string = '';
  groupSize: number = 0;
  groupDescription: string = '';
  Provinces: any[] = [];
  Districts: any[] = [];
  filteredDistricts: any[] = [];
  Wards: any[] = [];
  filteredWards: any[] = [];
  GroupTypes: any[] = [];
  @Input() isEditMode: boolean | undefined;
  @Input() selectedItem: any;
  currentUser: any;

  constructor(private http: HttpClient) { }

  dataTable: any;

  ngOnInit() {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
    this.getRegister();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedItem'] && this.isEditMode) {

      this.Province = this.selectedItem.provinceID;
      this.District = this.selectedItem.districtID;
      this.Ward = this.selectedItem.wardID;
      this.groupName = this.selectedItem.groupName;
      this.GroupType = this.selectedItem.groupTypeID;
      this.groupSize = this.selectedItem.groupSize;
      this.groupDescription = this.selectedItem.description;
    }
  }

  saveGroup(): void {
    const formData = {
      DistrictID: this.District,
      WardID: this.Ward,
      GroupName: this.groupName,
      GroupTypeID: this.GroupType,
      GroupSize: this.groupSize,
      GroupDescription: this.groupDescription
    };

    const url = apiUrl + '/Group';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(url, formData, { headers })
      .subscribe(
        (response) => {
          Swal.fire({
            icon: "success",
            title: "Group",
            text: "Records Saved Successfully",
          });
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Group",
            text: "Error while saving record",
          });
        }
      );
  }

  ngOnDestroy() {
    if (this.dataTable) {
      const visibleColumns = this.dataTable.columns().visible().toArray();
      localStorage.setItem('dtBeneficiariesvisibleColumns', JSON.stringify(visibleColumns));
    }
  }

  private getRegister() {
    const apiEndpoint = apiUrl + '/Beneficiaries';
    this.dataTable = $('#dtMembers').DataTable(<DataTableSettings>{
      processing: true,
      serverSide: true,
      ajax: {
        url: apiEndpoint,
        dataSrc: "",
        data: function (params: { draw: any; start: any; length: any; search: { value: any; }; }) {
          return {
            draw: params.draw,
            start: params.start,
            length: params.length,
            search: params.search.value
          };
        }
      },
      dom: 'BfrtipP',
      
      select: 'multi',
      scrollY: 400,
      scroller: {
        loadingIndicator: true,
        displayBuffer: 20,
        boundaryScale: 0.5
      },
      columns: [
        { data: "id", title: "id" },
        { data: "koboBeneficiaryId", title: "koboBeneficiaryId" },
        { data: "province", title: "province" },
        { data: "district", title: "district" },
        { data: "ward", title: "ward" },
        { data: "village", title: "village" },
        { data: "latitude", title: "latitude" },
        { data: "longitude", title: "longitude" },
        { data: "farmerName", title: "farmerName" },
        { data: "gender", title: "gender" },
        { data: "dateOfBirth", title: "dateOfBirth" },
        { data: "idNumber", title: "idNumber" },
        { data: "contactNumber", title: "contactNumber" },
        { data: "disabled", title: "disabled" },
        { data: "disability", title: "disability" },
        { data: "ownsCattle", title: "ownsCattle" },
        { data: "cattleNo", title: "cattleNo" },
        { data: "ownsDonkeys", title: "ownsDonkeys" },
        { data: "donkeysNo", title: "donkeysNo" },
        { data: "ownsGoats", title: "ownsGoats" },
        { data: "goatsNo", title: "goatsNo" },
        { data: "ownsSheep", title: "ownsSheep" },
        { data: "sheepNo", title: "sheepNo" },
        { data: "ownsPoultry", title: "ownsPoultry" },
        { data: "poultryNo", title: "poultryNo" },
      ],
      buttons: [
        'copy',
        'print',
        'excel', 'colvis',
      ],
      drawCallback: () => {
        if (this.dataTable) {
          const visibleColumns = this.dataTable.columns().visible().toArray();
          localStorage.setItem('dtBeneficiariesvisibleColumns', JSON.stringify(visibleColumns));
        }
      }
    });
  }

  getAllParameters(): void {
    this.http.get(`${this.apiUrl}/luProvinces`)
      .subscribe(
        (response: any) => {

          this.Provinces = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/luDistricts`)
      .subscribe(
        (response: any) => {

          this.Districts = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/luWards`)
      .subscribe(
        (response: any) => {

          this.Wards = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/luGroupTypes`)
      .subscribe(
        (response: any) => {

          this.GroupTypes = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  onProvinceSelect(event: any): void {
    this.filteredDistricts = this.Districts.filter(d => d.ProvinceID == event.target.value);
  }

  onDistrictSelect(event: any): void {
    this.filteredWards = this.Wards.filter(d => d.DistrictID == event.target.value);
  }

}
