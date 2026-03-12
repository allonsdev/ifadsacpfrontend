import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';


export class StaffMember {
  id: number = 0;
  firstName: string = '';
  surname: string = '';
  nationalIdNumber: string = '';
  sex: string = '';
  address: string = '';
  districtId: number = 0;
  contactNo: number = 0;
  emailAddress: string = '';
  organisationId: number = 0;
  departmentId: number = 0;
  positionId: number = 0;
  createdBy: string | null = '';
  createdDate: Date = new Date();
  updatedBy: string | null = '';
  updatedDate: Date = new Date();

  isValid(): boolean {
    // Check if any property is null
    if (
      this.firstName === null ||
      this.surname === null || this.nationalIdNumber === null ||
      this.sex === null ||
      this.address === null || this.districtId === null ||
      this.contactNo === null || this.emailAddress === null ||
      this.organisationId === null || this.departmentId === null ||
      this.positionId === null
    ) {
      return false;
    }

    return true;
  }
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'individualstakeholderdetailsmodal',
  templateUrl: './individualstakeholderdetailsmodal.element.html'
})

export class IndividualstakeholderdetailsmodalElement implements OnInit, OnChanges {
  @Input() editid: number = 0;
  staffMember: StaffMember = new StaffMember();
  districts: any[] = [];
  organisations: any[] = [];
  departments: any[] = [];
  positions: any[] = [];

  @Output() refresh: EventEmitter<any> = new EventEmitter();
  private apiUrl = apiUrl + '';
  currentUser: any;
  constructor(private http: HttpClient) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editid != 0) {
      this.getitem()
    }
  }
  getitem() {
    this.http.get(`${this.apiUrl}/StaffMember/${this.editid}`)
      .subscribe(
        (response: any) => {
          this.staffMember = response
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
  refreshdata() {
    this.refresh.emit(); // Emit an event to call the parent method
  }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }

  createStaffMember(): void {
    if (!this.staffMember.isValid()) {
      Swal.fire({
        icon: "success",
        title: "StaffMembers",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<any>(`${this.apiUrl}/StaffMember`, this.staffMember, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "StaffMember",
          text: "Record Saved Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Staffmembers",
          text: `${error.error && error.error}`,
        });
      }
    );
  }
  clearForm(): void {
    this.staffMember.id = 0;
    this.staffMember.firstName = '';
    this.staffMember.surname = '';
    this.staffMember.nationalIdNumber = '';
    this.staffMember.sex = '';
    this.staffMember.address = '';
    this.staffMember.districtId = 0;
    this.staffMember.contactNo = 0;
    this.staffMember.emailAddress = '';
    this.staffMember.organisationId = 0;
    this.staffMember.departmentId = 0;
    this.staffMember.positionId = 0;
    this.staffMember.createdBy = '';
    this.staffMember.createdDate = new Date();
    this.staffMember.updatedBy = '';
    this.staffMember.updatedDate = new Date();
}


  updateStaffMember(): void {
    if (this.staffMember.firstName == '' &&
      this.staffMember.surname == '' &&
      this.staffMember.nationalIdNumber == '' &&
      this.staffMember.sex == '' &&
      this.staffMember.address == '' &&
      this.staffMember.districtId == 0 &&
      this.staffMember.contactNo == 0 &&
      this.staffMember.emailAddress == '' &&
      this.staffMember.organisationId == 0 &&
      this.staffMember.departmentId == 0 &&
      this.staffMember.positionId == 0) {
      Swal.fire({
        icon: "success",
        title: "StaffMembers",
        text: "Please fill out all required fields.",
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.put<any>(`${this.apiUrl}/StaffMember/${this.staffMember.id}`, this.staffMember, { headers }).subscribe(
      (response) => {
        this.refreshdata()
        Swal.fire({
          icon: "success",
          title: "Staffmembers",
          text: "Record Saved Successfully",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Staffmembers",
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
    this.http.get(`${this.apiUrl}/Organisation`)
      .subscribe(
        (response: any) => {
          this.organisations = response;
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/Parameter/luDepartments`)
      .subscribe(
        (response: any) => {
          this.departments = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
    this.http.get(`${this.apiUrl}/Parameter/luStaffPositions`)
      .subscribe(
        (response: any) => {
          this.positions = JSON.parse(response);
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}
