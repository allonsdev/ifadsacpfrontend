import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

export class Organisation {
  id: number = 0;
  name: string = '';
  type: number = 0;
  description: string = '';
  address: string = '';
  districtId: number = 0;
  latitude: number = 0;
  longitude: number = 0;
  contactName: string = '';
  contactNo: number = 0;
  emailAddress: string = '';
  createdBy: string = '';
  createdDate: Date = new Date();
  updatedBy: string = '';
  updatedDate: Date = new Date();

  isValid(): boolean {
    // Check if any property is null or empty
    if (
      !this.name || !this.type ||
      !this.description || !this.address ||
      !this.districtId || !this.latitude ||
      !this.longitude || !this.contactName ||
      !this.contactNo || !this.emailAddress
    ) {
      return false;
    }

    // Additional validation logic if needed

    return true;
  }
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'organisationalstakeholderdetailsmodal',
  templateUrl: './organisationalstakeholderdetailsmodal.element.html'
})
export class OrganisationalstakeholderdetailsmodalElement implements OnInit, OnChanges {
  @Input() editid: number = 0;

  organisation: Organisation = new Organisation();
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  districts: any[] = [];
  organisationTypes: any[] = [];

  private apiUrl = apiUrl + '';
  currentUser: any;
  constructor(private http: HttpClient) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editid != 0) {
      this.getitem()
    }
  }
  getitem() {
    this.http.get(`${this.apiUrl}/Organisation/${this.editid}`)
      .subscribe(
        (response: any) => {
          this.organisation = response
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }
  refreshdata() {
    this.refresh.emit(); // Emit an event to call the parent method
  }
  createOrganisation(): void {
    if (this.organisation &&
      this.organisation.name == '' &&
      this.organisation.type == 0 &&
      this.organisation.description == '' &&
      this.organisation.address == '' &&
      this.organisation.districtId == 0 &&
      this.organisation.latitude == 0 &&
      this.organisation.longitude == 0 &&
      this.organisation.contactName == '' &&
      this.organisation.contactNo == 0 &&
      this.organisation.emailAddress == '') {
      Swal.fire({
        icon: "success",
        title: "Organisations",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(`${this.apiUrl}/Organisation`, this.organisation, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "Organisations",
          text: "Record Saved Successfully",
        });
      },
      (error) => {

        Swal.fire({
          icon: "error",
          title: "Organisations",
          text: `${error.error && error.error}`,
        });
      }
    );
  }
  clearForm(): void {
    this.organisation.id = 0;
    this.organisation.name = '';
    this.organisation.type = 0;
    this.organisation.description = '';
    this.organisation.address = '';
    this.organisation.districtId = 0;
    this.organisation.latitude = 0;
    this.organisation.longitude = 0;
    this.organisation.contactName = '';
    this.organisation.contactNo = 0;
    this.organisation.emailAddress = '';
    this.organisation.createdBy = '';
    this.organisation.createdDate = new Date();
    this.organisation.updatedBy = '';
    this.organisation.updatedDate = new Date();
  }

  updateOrganisation(): void {
    if (!this.organisation.isValid()) {
      Swal.fire({
        icon: "success",
        title: "Organisations",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.put<any>(`${this.apiUrl}/Organisation/${this.organisation.id}`, this.organisation, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "Organisations",
          text: "Record Saved Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Organisations",
          text: "Error saving records",
        });
      }
    );
  }

  getAllParameters(): void {
    this.http.get(`${this.apiUrl}/Parameter/luDistricts`)
      .subscribe(
        (response: any) => {
          this.districts = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/Parameter/luOrganisationTypes`)
      .subscribe(
        (response: any) => {
          this.organisationTypes = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}
