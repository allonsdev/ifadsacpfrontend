import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WaterPoint } from 'src/app/components/waterpoints/waterpoints.component';
import Swal from 'sweetalert2';
const apiUrl = environment.apiUrl;

@Component({
  selector: 'waterpointsmodal',
  templateUrl: './waterpointsmodal.element.html'
})
export class WaterpointsmodalElement implements OnInit {
  currentUser: any;
  @Input() waterPoint: WaterPoint = new WaterPoint();

  @Output() refresh: EventEmitter<any> = new EventEmitter();

  filteredDistricts: any[] = [];
  districts: any[] = [];
  provinces: any[] = [];
  wards: any[] = [];
  filteredWards: any[] = [];

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

  createWaterPoint(): void {
    if (!this.waterPoint.isValid()) {
      Swal.fire({
        icon: "success",
        title: "Water Points",
        text: "Please fill out all required fields.",
      });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(`${apiUrl}/WaterPoint`, this.waterPoint, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        this.waterPoint.clear()
        Swal.fire({
          icon: "success",
          title: "WaterPoint",
          text: "Record Saved Successfully",
        });
      },
      (error) => {

        Swal.fire({
          icon: "error",
          title: "WaterPoint",
          text: `${error.error && error.error}`,
        });
      }
    );
  }

  updateWaterPoint(): void {
    if (this.waterPoint.id == 0 ||
      this.waterPoint.name === '' ||
      this.waterPoint.province === '' ||
      this.waterPoint.district === '' ||
      this.waterPoint.ward === '' ||
      this.waterPoint.village === '' ||
      this.waterPoint.latitude === null ||
      this.waterPoint.longitude === null ||
      this.waterPoint.numberOfHouseholds === null ||
      this.waterPoint.numberOfIndividuals === null ||
      this.waterPoint.men === null ||
      this.waterPoint.women === null ||
      this.waterPoint.youth === null) {
      Swal.fire({
        icon: "success",
        title: "Water Points",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.put<any>(`${apiUrl}/WaterPoint/${this.waterPoint.id}`, this.waterPoint, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "WaterPoint",
          text: "Record Saved Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "WaterPoint",
          text: "Error saving record",
        });
      }
    );
  }

  getAllParameters(): void {
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
