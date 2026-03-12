import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
const apiUrl = environment.apiUrl;

export class IrrigationScheme {
  id: number = 0;
  name: string = '';
  province: string = '';
  agroEcologicalRegion: string = '';
  district: string = '';
  ward: string = '';
  schemeManagementModel: string = '';
  dateEstablished: Date = new Date(); // You might want to use an appropriate date type

  totalDevelopedAreaToDate: number | null = null; // Replace with the appropriate numeric type
  areaUnderIrrigation: number | null = null; // Replace with the appropriate numeric type

  potentialAreaOfScheme: number | null = null; // Replace with the appropriate numeric type
  irrigationSchemeStatus: string = '';

  longitude: number | null = null;
  latitude: number | null = null;

  women: number | null = null;
  men: number | null = null;
  numberOfIndividuals: number | null = null;
  youth: number | null = null;

  isValid(): boolean {

    if (
      !this.name || !this.province ||
      !this.agroEcologicalRegion || !this.district ||
      !this.ward || !this.schemeManagementModel ||
      !this.dateEstablished || !this.irrigationSchemeStatus
    ) {
      return false;
    }

    return true;
  }

  clear(): void {
    this.id = 0;
    this.name = '';
    this.province = '';
    this.agroEcologicalRegion = '';
    this.district = '';
    this.ward = '';
    this.schemeManagementModel = '';
    this.dateEstablished = new Date();

    this.totalDevelopedAreaToDate = null;
    this.areaUnderIrrigation = null;

    this.potentialAreaOfScheme = null;
    this.irrigationSchemeStatus = '';

    this.longitude = null;
    this.latitude = null;

    this.women = null;
    this.men = null;
    this.numberOfIndividuals = null;
    this.youth = null;
  }
}

@Component({
  selector: 'irrigationschemesmodal',
  templateUrl: './irrigationschemesmodal.element.html'
})
export class IrrigationschemesmodalElement implements OnInit {
  currentUser: any;

  @Input() irrigationScheme: IrrigationScheme = new IrrigationScheme();

  @Output() refresh: EventEmitter<any> = new EventEmitter();

  filteredDistricts: any[] = [];
  filteredWards: any[] = [];
  districts: any[] = [];
  provinces: any[] = [];
  wards: any;
  irrigationSchemeStatuses: any;
  agroEcologicalRegions: any;
  schemeManagementModels: any;

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
    const id = this.provinces.find((province) => province.Name === event.target.value)?.Id;
    this.filteredDistricts = this.districts.filter((d: { ProvinceId: any; }) => d.ProvinceId == id);
  }

  onDistrictSelect(event: any) {
    const id = this.districts.find((district) => district.Name === event.target.value)?.Id;
    this.filteredWards = this.wards.filter((d: { DistrictId: any; }) => d.DistrictId == id);
  }

  createIrrigationScheme(): void {
    if (!this.irrigationScheme.isValid()) {
      Swal.fire({
        icon: "success",
        title: "Irrigation Schemes",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(`${apiUrl}/IrrigationScheme`, this.irrigationScheme, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        this.irrigationScheme.clear()
        Swal.fire({
          icon: "success",
          title: "IrrigationScheme",
          text: "Record Saved Successfully",
        });
      },
      (error) => {

        Swal.fire({
          icon: "error",
          title: "IrrigationScheme",
          text: "Error saving record",
        });
      }
    );
  }

  updateIrrigationScheme(): void {
    if (
      this.irrigationScheme.name === null || this.irrigationScheme.name === undefined ||
      this.irrigationScheme.province === null || this.irrigationScheme.province === undefined ||
      this.irrigationScheme.agroEcologicalRegion === null || this.irrigationScheme.agroEcologicalRegion === undefined ||
      this.irrigationScheme.district === null || this.irrigationScheme.district === undefined ||
      this.irrigationScheme.ward === null || this.irrigationScheme.ward === undefined ||
      this.irrigationScheme.schemeManagementModel === null || this.irrigationScheme.schemeManagementModel === undefined ||
      this.irrigationScheme.dateEstablished === null || this.irrigationScheme.dateEstablished === undefined ||
      this.irrigationScheme.totalDevelopedAreaToDate === null || this.irrigationScheme.totalDevelopedAreaToDate === undefined ||
      this.irrigationScheme.areaUnderIrrigation === null || this.irrigationScheme.areaUnderIrrigation === undefined ||
      this.irrigationScheme.potentialAreaOfScheme === null || this.irrigationScheme.potentialAreaOfScheme === undefined ||
      this.irrigationScheme.irrigationSchemeStatus === null || this.irrigationScheme.irrigationSchemeStatus === undefined ||
      this.irrigationScheme.longitude === null || this.irrigationScheme.longitude === undefined ||
      this.irrigationScheme.latitude === null || this.irrigationScheme.latitude === undefined ||
      this.irrigationScheme.women === null || this.irrigationScheme.women === undefined ||
      this.irrigationScheme.men === null || this.irrigationScheme.men === undefined ||
      this.irrigationScheme.youth === null || this.irrigationScheme.youth === undefined ||
      this.irrigationScheme.numberOfIndividuals === null || this.irrigationScheme.numberOfIndividuals === undefined) {
      Swal.fire({
        icon: "success",
        title: "Irrigation Schemes",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.put<any>(`${apiUrl}/IrrigationScheme/${this.irrigationScheme.id}`, this.irrigationScheme, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "IrrigationScheme",
          text: "Record Saved Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "IrrigationScheme",
          text: "Error saving record",
        });
      }
    );
  }

  getAllParameters(): void {
    this.http.get(`${apiUrl}/Parameter/luIrrigationSchemeStatuses`)
      .subscribe(
        (response: any) => {
          this.irrigationSchemeStatuses = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${apiUrl}/Parameter/luDistricts`)
      .subscribe(
        (response: any) => {

          this.districts = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${apiUrl}/Parameter/luProvinces`)
      .subscribe(
        (response: any) => {
          this.provinces = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${apiUrl}/Parameter/luAgroEcologicalRegions`)
      .subscribe(
        (response: any) => {
          this.agroEcologicalRegions = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${apiUrl}/Parameter/luSchemeManagementModels`)
      .subscribe(
        (response: any) => {
          this.schemeManagementModels = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${apiUrl}/Parameter/luWards`)
      .subscribe(
        (response: any) => {
          this.wards = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}
