import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
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
  dateEstablished: any = null;  // CHANGED: use any to handle string from API
  totalDevelopedAreaToDate: number | null = null;
  areaUnderIrrigation: number | null = null;
  potentialAreaOfScheme: number | null = null;
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
    this.dateEstablished = null;
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
export class IrrigationschemesmodalElement implements OnInit, OnChanges {  // CHANGED: added OnChanges
  currentUser: any;

  @Input() irrigationSchemeId: number = 0;  // CHANGED: was irrigationScheme object
  @Output() refresh: EventEmitter<any> = new EventEmitter();

  irrigationScheme: IrrigationScheme = new IrrigationScheme();  // CHANGED: now internal, not @Input

  filteredDistricts: any[] = [];
  filteredWards: any[] = [];
  districts: any[] = [];
  provinces: any[] = [];
  wards: any[] = [];
  irrigationSchemeStatuses: any;
  agroEcologicalRegions: any;
  schemeManagementModels: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }

  // CHANGED: added ngOnChanges to react to id changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['irrigationSchemeId']) {
      if (this.irrigationSchemeId > 0) {
        this.fetchScheme(this.irrigationSchemeId);
      } else {
        // Reset for add new
        this.irrigationScheme = new IrrigationScheme();
        this.filteredDistricts = [];
        this.filteredWards = [];
      }
    }
  }

  fetchScheme(id: number): void {
    this.http.get<any>(`${apiUrl}/IrrigationScheme/${id}`).subscribe(
      (response) => {
        // Map response onto an IrrigationScheme instance to preserve methods
        const scheme = new IrrigationScheme();
        Object.assign(scheme, response);

        if (response.dateEstablished) {
          scheme.dateEstablished = new Date(response.dateEstablished)
            .toISOString()
            .split('T')[0];
        }

        this.irrigationScheme = scheme;
        this.prefillDependentDropdowns();
      },
      (error) => {
        Swal.fire({ icon: "error", title: "Error", text: "Failed to load scheme." });
      }
    );
  }

  // CHANGED: new method to populate filtered dropdowns from loaded scheme
  prefillDependentDropdowns(): void {
    if (!this.provinces.length || !this.districts.length || !this.wards.length) return;

    if (this.irrigationScheme.province) {
      const province = this.provinces.find(p => p.Name === this.irrigationScheme.province);
      if (province) {
        this.filteredDistricts = this.districts.filter(d => d.ProvinceId == province.Id);
      }
    }

    if (this.irrigationScheme.district) {
      const district = this.districts.find(d => d.Name === this.irrigationScheme.district);
      if (district) {
        this.filteredWards = this.wards.filter(w => w.DistrictId == district.Id);
      }
    }
  }

  refreshdata() {
    this.refresh.emit();
  }

  onProvinceSelect(event: any) {
    const province = this.provinces.find(p => p.Name === this.irrigationScheme.province);
    if (province) {
      this.filteredDistricts = this.districts.filter(d => d.ProvinceId == province.Id);
      // Reset dependent fields when province changes
      this.irrigationScheme.district = '';
      this.irrigationScheme.ward = '';
      this.filteredWards = [];
    }
  }

  onDistrictSelect(event: any) {
    const district = this.districts.find(d => d.Name === this.irrigationScheme.district);
    if (district) {
      this.filteredWards = this.wards.filter(w => w.DistrictId == district.Id);
      // Reset ward when district changes
      this.irrigationScheme.ward = '';
    }
  }

  createIrrigationScheme(): void {
    if (!this.irrigationScheme.isValid()) {
      Swal.fire({
        icon: "error",  // FIXED: was wrongly "success"
        title: "Irrigation Schemes",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<any>(`${apiUrl}/IrrigationScheme`, this.irrigationScheme, { headers }).subscribe(
      (response) => {
        this.refreshdata();
        this.irrigationScheme.clear();
        Swal.fire({ icon: "success", title: "IrrigationScheme", text: "Record Saved Successfully" });
      },
      (error) => {
        Swal.fire({ icon: "error", title: "IrrigationScheme", text: "Error saving record" });
      }
    );
  }

  updateIrrigationScheme(): void {
    if (!this.irrigationScheme.isValid()) {  // CHANGED: reuse isValid() instead of duplicating checks
      Swal.fire({
        icon: "error",  // FIXED: was wrongly "success"
        title: "Irrigation Schemes",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.put<any>(`${apiUrl}/IrrigationScheme/${this.irrigationScheme.id}`, this.irrigationScheme, { headers }).subscribe(
      (response) => {
        this.refreshdata();
        Swal.fire({ icon: "success", title: "IrrigationScheme", text: "Record Saved Successfully" });
      },
      (error) => {
        Swal.fire({ icon: "error", title: "IrrigationScheme", text: "Error saving record" });
      }
    );
  }

  // CHANGED: use forkJoin so all lookups load together before prefill
  getAllParameters(): void {
    forkJoin({
      statuses: this.http.get(`${apiUrl}/Parameter/luIrrigationSchemeStatuses`),
      districts: this.http.get(`${apiUrl}/Parameter/luDistricts`),
      provinces: this.http.get(`${apiUrl}/Parameter/luProvinces`),
      regions: this.http.get(`${apiUrl}/Parameter/luAgroEcologicalRegions`),
      models: this.http.get(`${apiUrl}/Parameter/luSchemeManagementModels`),
      wards: this.http.get(`${apiUrl}/Parameter/luWards`),
    }).subscribe((results: any) => {
      this.irrigationSchemeStatuses = JSON.parse(results.statuses);
      this.districts = JSON.parse(results.districts);
      this.provinces = JSON.parse(results.provinces);
      this.agroEcologicalRegions = JSON.parse(results.regions);
      this.schemeManagementModels = JSON.parse(results.models);
      this.wards = JSON.parse(results.wards);

      // In case scheme was fetched before lookups finished
      if (this.irrigationScheme?.id > 0) {
        this.prefillDependentDropdowns();
      }
    });
  }
}