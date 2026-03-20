import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { environment } from '../../environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { FileuploadService } from '../../services/fileupload.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export class GeneralActivity {
  id: number = 0;
  projectId: number = 1;
  organisationId: number = 0;
  subComponentId: number = 0;
  interventionId: number = 0;
  activityTypeId: number = 0;
  activityId: number = 0;
  activeStatusId: number = 0;
  districtId: number = 0;
  site: string = '';
  siteType: string = '';
  irrigationSchemeId: number = 0;
  waterpointId: number = 0;
  leadFacilitatorId: number = 0;
  details: string = '';
  issuesComments: string = '';
  startDate: Date = new Date();
  endDate: Date = new Date();
  createdBy: string = '';
  createdDate: Date = new Date();
  updatedBy: string = '';
  updatedDate: Date = new Date();
  subActivityId: number = 0;
}
export class StakeholderParticipantModel {
  gtid: string;
  nameOfParticipant: string;
  sex: string;
  organisation: string;
  position: string;
  contactNumber: string;
  emailAddress: string;
  uploadedBy: string;
  uploadedDate: Date;

  constructor() {
    this.gtid = '';
    this.nameOfParticipant = '';
    this.sex = '';
    this.organisation = '';
    this.position = '';
    this.contactNumber = '';
    this.emailAddress = '';
    this.uploadedBy = '';
    this.uploadedDate = new Date(); // now
  }
}

export class StakeholderUploadComponent {

  file: any;
  excelData: any[] = [];
  uploadedBy: string = "";
  uploadResults: any;
}

declare var $: any;

const apiUrl = environment.apiUrl;
@Component({
  selector: 'appointmentdetailsmodal',
  templateUrl: './appointmentdetailsmodal.element.html',
})

export class AppointmentdetailsmodalElement implements OnInit, OnChanges {
  generalActivity: GeneralActivity = new GeneralActivity();
  stakeholder: StakeholderUploadComponent = new StakeholderUploadComponent();
  participants: StakeholderParticipantModel[] = [];
  participant: {
    gtid: number | null;
    hhNationalId: string;
    firstName: string;
    surname: string;
    gender: string;
    yearOfBirth: number | null;
    groupType: string;
    categoryName: string;
    participantNationalId: string;
    pwdTin: string;
    hhGender: string;
    contactNumber: string;

  } = {
      gtid: null,
      hhNationalId: '',
      firstName: '',
      surname: '',
      gender: '',
      yearOfBirth: null,
      groupType: '',
      categoryName: '',
      participantNationalId: '',
      pwdTin: '',
      hhGender: '',
      contactNumber: '',
    };

  @Output() refresh: EventEmitter<any> = new EventEmitter();
  @Input() otherFacilitatorIds: number[] = [];
  @Input() editid: number = 0;
  dataTable: any;
  header: any;
  selectedValue: any;
  selectedFile: any;
  fileType: string = '';
  title: string = '';
  author: string = '';
  authorOrganization: string = '';
  description: string = '';
  uploadDate: Date = new Date();
  applySecurity: boolean = false;
  fileTypes: any[] = [];
  organisations: any[] = [];
  subComponents: any[] = [];
  interventions: any[] = [];
  activityTypes: any[] = [];
  activities: any[] = [];
  activityStatuses: any[] = [];
  districts: any[] = [];
  facilitators: any[] = [];
  otherfacilitators: any[] = [];
  uploadResults: any;
  uploadStakeholdersResults: any;
  private apiUrl = apiUrl;
  participantTypes: any;
  siteTypes: any;
  waterpoints: any;
  irrigationSchemes: any;
  Table: any;
  currentUser: any;
  file: any;
  activitiessubcomponents: any;
  filteredActivities: any;
  filteredSubComponents: any;
  excelData: any;
  excelDataTable: any;
  selectedRowIds: any;
  participantType: any;
  data: any;
  minEndDate: any;
  subActivities: any[] = [];      // list of all sub-activities
  filteredSubActivities: any[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private FileuploadService: FileuploadService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetUploadSection(); // add this
    if (this.editid != 0) {
      this.getitem();
      this.getRegister();
      this.loadActivities();
    }
  }

  resetParticipantForm(): void {
    this.participant = {
      gtid: 0,
      hhNationalId: '',
      firstName: '',
      surname: '',
      gender: '',
      yearOfBirth: null,
      groupType: '',
      categoryName: '',
      participantNationalId: '',
      pwdTin: '',
      hhGender: '',
      contactNumber: '',
    };
  }

  loadActivities(): void {
    console.log("hieeeeeee")
    const selectedSubCompId = +this.generalActivity.subComponentId!;
    console.log("Selected SubComponent:", selectedSubCompId);

    // ✅ Filter activities that belong to the selected subcomponent
    this.filteredSubActivities = this.activities.filter(
      (activity: any) => Number(activity.id) === this.generalActivity.activityId
    );

    console.log("Selected filtered:", this.filteredSubActivities);

    // ✅ Reset activity if current selection doesn't belong to this subcomponent
    const currentActivityId = this.generalActivity.activityId;
    console.log("Selected aCTIVITT:", currentActivityId);

  }

  onSubComponentSelect(event: any) {
    const selectedId = Number(event.target.value);
    console.log("Selected ID:", selectedId, typeof selectedId);

    this.filteredSubActivities = this.activities.filter(
      (activity: any) => Number(activity.activityId) === selectedId
    );

    console.log("Filtered Activities:", this.filteredSubActivities);
  }


  onActivitySelect(): void {
    const selectedActivityId = Number(this.generalActivity.activityId);

    // Filter sub-activities for selected activity
    this.filteredSubActivities = this.subActivities.filter(
      sa => Number(sa.activityId) === selectedActivityId
    );

    // Auto-select first sub-activity or clear
    this.generalActivity.subActivityId = this.filteredSubActivities.length > 0
      ? this.filteredSubActivities[0].id
      : null;
  }

  readExcelFile(event: any) {
    if (event.target.files.length === 0) {
      console.log('No file selected!');
      return;
    }

    const file = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const data = new Uint8Array(fileReader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Get the sheet range to know how many columns exist
      const range = XLSX.utils.decode_range(worksheet['!ref']!);

      // Read headers from row 0 (the actual header row in the sheet)
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        const headerValue = cell ? String(cell.v).trim() : `Column${col + 1}`;
        // camelCase the first letter to match your existing convention
        headers.push(headerValue.charAt(0).toLowerCase() + headerValue.slice(1));
      }

      if (headers.length === 0) {
        console.log('No headers found in the Excel file!');
        return;
      }

      // Start from row 1 (skip header row), defval: null ensures missing cells aren't dropped
      this.excelData = XLSX.utils.sheet_to_json(worksheet, {
        header: headers,
        range: 1,
        defval: null,         // <-- key fix: missing cells become null instead of being omitted
        dateNF: 'yyyy-mm-dd',
      });

      console.log('Excel File Data', this.excelData);
    };

    fileReader.readAsArrayBuffer(file);
  }

  resetUploadSection(): void {
    // Clear excel data
    this.excelData = [];
    this.stakeholder.uploadResults = null;

    // Destroy and clear both preview DataTables
    if ($.fn.DataTable.isDataTable('#dtPreview')) {
      $('#dtPreview').DataTable().clear().destroy();
      $('#dtPreview').empty();
    }

    if ($.fn.DataTable.isDataTable('#dtPreview1')) {
      $('#dtPreview1').DataTable().clear().destroy();
      $('#dtPreview1').empty();
    }

    // Destroy and clear results DataTable
    if ($.fn.DataTable.isDataTable('#dtResults')) {
      $('#dtResults').DataTable().clear().destroy();
      $('#dtResults').empty();
    }

    // Reset file inputs
    const fileInput1 = document.getElementById('formFile') as HTMLInputElement;
    if (fileInput1) fileInput1.value = '';

    const fileInput2 = document.getElementById('formFile1') as HTMLInputElement;
    if (fileInput2) fileInput2.value = '';

    // Reset file references
    this.file = null;
    this.selectedFile = null;

    setTimeout(() => {
      // Switch the tab link
      $('a[href="#generalactivitydetails"]').tab('show');

      // Force the pane visibility
      $('.tab-pane').removeClass('show active');
      $('#generalactivitydetails').addClass('show active');
    }, 100);
  }

  displayData() {
    if (!this.excelData || this.excelData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No Excel data available to display.'
      });
      return;
    }

    Swal.fire({
      title: 'Generating Preview...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Prepare columns dynamically based on keys from the first record
    const columns: any[] = Object.keys(this.excelData[0]).map((key) => ({
      data: key,
      title: key,
    }));

    // Clear and destroy previous DataTable if exists
    if (this.excelDataTable) {
      this.excelDataTable.clear().destroy();
      const dataTableElement = $('#dtPreview');
      if (dataTableElement.length) {
        dataTableElement.empty();
      }
    }

    // Initialize your DataTable with the Excel data and columns
    this.initializeExcelDataTable(this.excelData);

    Swal.close();
  }

  displayData2() {
    if (!this.excelData || this.excelData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No Excel data available to display.'
      });
      return;
    }

    Swal.fire({
      title: 'Generating Preview...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Prepare columns dynamically based on keys from the first record
    const columns: any[] = Object.keys(this.excelData[0]).map((key) => ({
      data: key,
      title: key,
    }));

    // Clear and destroy previous DataTable if exists
    if (this.excelDataTable) {
      this.excelDataTable.clear().destroy();
      const dataTableElement = $('#dtPreview1');
      if (dataTableElement.length) {
        dataTableElement.empty();
      }
    }

    // Initialize your DataTable with the Excel data and columns
    this.initializeExcelDataTable2(this.excelData);
    console.log(this.excelData)

    Swal.close();
  }


  uploadStakeholders() {
    const formData = new FormData();
    const fileInput = document.getElementById('formFile1') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: 'Please select a file before uploading.',
      });
      return;
    }

    formData.append('file', file);

    Swal.fire({
      title: 'Uploading Stakeholders...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.http
      .post<any>(
        `${this.apiUrl}/GeneralActivityParticipant/UploadStakeholderTemplate/${this.generalActivity.id}`,
        formData
      )
      .subscribe(
        (response) => {
          Swal.close();

          Swal.fire({
            icon: 'success',
            title: 'Upload Complete',
            html: `
            <p>${response.message}</p>
            <p><strong>Success:</strong> ${response.totalSuccess}</p>
            <p><strong>Failed:</strong> ${response.totalFailed}</p>
          `,
          });

          this.uploadStakeholdersResults = response;

          this.loadResultsTable(response.results);
        },
        (error) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error?.error || 'An error occurred during upload.',
          });
        }
      );
  }

  submitData(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select an Excel file before uploading.'
      });
      return;
    }

    // Show loading
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we process your file.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const fd = new FormData();
    fd.append('file', this.selectedFile);

    this.http.post(
      `${this.apiUrl}/GeneralActivityParticipant/upload-file/${this.generalActivity.id}/${this.stakeholder.uploadedBy}`,
      fd
    ).subscribe({
      next: () => {
        // Upload parsed data
        this.http.post(
          `${this.apiUrl}/GeneralActivityParticipant/stakeholdertemplate/save-data/${this.generalActivity.id}/${this.stakeholder.uploadedBy}`,
          this.participants
        ).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Upload Successful',
              text: 'Stakeholder data has been uploaded successfully.'
            });
          },
          error: err => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Data Upload Failed',
              text: 'File was uploaded but data saving failed.'
            });
          }
        });
      },
      error: err => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'File Upload Failed',
          text: 'Unable to upload the Excel file. Please try again.'
        });
      }
    });
  }

  UploadData() {
    const formData = new FormData();
    const fileInput = document.getElementById('formFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: 'Please select a file before uploading.',
      });
      return;
    }

    formData.append('file', file);

    Swal.fire({
      title: 'Uploading Participants...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.http
      .post<any>(
        `${this.apiUrl}/GeneralActivityParticipant/UploadParticipantsTemplate/${this.generalActivity.id}`,
        formData
      )
      .subscribe(
        (response) => {
          Swal.close();

          Swal.fire({
            icon: 'success',
            title: 'Upload Complete',
            html: `
            <p>${response.message}</p>
            <p><strong>Success:</strong> ${response.totalSuccess}</p>
            <p><strong>Failed:</strong> ${response.totalFailed}</p>
          `,
          });

          this.uploadResults = response;

          this.loadResultsTable(response.results);
        },
        (error) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error?.error || 'An error occurred during upload.',
          });
        }
      );
  }

  saveParticipant(): void {
    console.log(this.participant);
    this.participant.gtid = this.generalActivity.id;

    // Basic validation
    if (
      !this.participant.hhNationalId ||
      !this.participant.firstName ||
      !this.participant.surname
    ) {
      Swal.fire(
        'Validation',
        'Please enter required participant fields.',
        'error'
      );
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    Swal.fire({
      title: 'Saving Participant...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    } as SweetAlertOptions);

    console.log(this.participant);

    this.http
      .post<any>(
        `${this.apiUrl}/GeneralActivityParticipant/CreateParticipants`,
        this.participant,
        { headers }
      )
      .subscribe({
        next: (res) => {
          Swal.close();
          Swal.fire('Participant', 'Saved successfully', 'success');
          this.resetParticipantForm();
        },
        error: (err) => {
          Swal.close();
          Swal.fire('Participant', 'Error saving participant', 'error');
          console.error('Error saving participant:', err);
        },
      });
  }

  private loadResultsTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    // Clear previous DataTable if it exists
    if ($.fn.DataTable.isDataTable('#dtResults')) {
      $('#dtResults').DataTable().clear().destroy();
    }

    // Build columns based on the actual data
    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      dom: 'BfrtipP',
      select: 'multi',
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
      },
    };

    this.excelDataTable = $('#dtResults').DataTable(dtOptions);

    this.excelDataTable.rows.add(data).draw();
  }


  private initializeExcelDataTable2(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }
    var columns: any[] = Object.keys(this.excelData[0]).map((key) => ({
      data: key,
      title: key,
    }));
    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      dom: 'BfrtipP',
      select: 'multi',
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
      },
    };

    this.excelDataTable = $('#dtPreview1').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.excelDataTable.rows.add(data).draw();
    }
  }


  private initializeExcelDataTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }
    var columns: any[] = Object.keys(this.excelData[0]).map((key) => ({
      data: key,
      title: key,
    }));
    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      dom: 'BfrtipP',
      select: 'multi',
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
      },
    };

    this.excelDataTable = $('#dtPreview').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.excelDataTable.rows.add(data).draw();
    }
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  validateForm(): boolean {
    if (
      !this.selectedFile ||
      !this.fileType ||
      !this.title ||
      !this.author ||
      !this.authorOrganization ||
      !this.description ||
      !this.uploadDate
    ) {
      return false;
    }

    return true;
  }

  updateEndDateMin() {
    // Enable end date input
    if (this.generalActivity.startDate) {
      const startDate = new Date(this.generalActivity.startDate);
      // Set minimum end date as start date
      this.minEndDate = this.generalActivity.startDate;
    }
  }

  onSubmit() {
    if (this.validateForm()) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('fileType', this.fileType.toString());
      formData.append('title', this.title);
      formData.append('author', this.author);
      formData.append('authorOrganization', this.authorOrganization);
      formData.append('description', this.description);
      formData.append('date', this.uploadDate.toString());
      formData.append('applySecurity', this.applySecurity.toString());
      formData.append('objectTypeId', '10');
      formData.append('objectId', this.generalActivity.id.toString());
      formData.append('createdBy', this.currentUser.fullname);
      formData.append('ApprovalStatus', 'Approved');
      console.log(formData);

      if (this.selectedFile) {
        Swal.fire({
          title: 'Uploading File...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        } as SweetAlertOptions);

        this.http.post(`${apiUrl}/File/Upload`, formData).subscribe(
          (response: any) => {
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Files',
              text: 'Record Saved Successfully',
            });
          },
          (error: any) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Files',
              text: 'Error while saving record',
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Files',
          text: 'Please select a File',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Files',
        text: 'Please fill out all required fields.',
      });
    }
  }

  getitem() {
    this.http.get(`${this.apiUrl}/GeneralActivity/${this.editid}`).subscribe(
      (response: any) => {
        // Convert dates to YYYY-MM-DD
        const formatToYMD = (dateStr: string) => {
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        this.generalActivity = {
          ...response,
          startDate: formatToYMD(response.startDate),
          endDate: formatToYMD(response.endDate)
        };

        console.log("Activity details:", this.generalActivity);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
    this.loadActivities();
    // Set default projectId after modal is loaded
    this.generalActivity.projectId = 1;

  }

  refreshdata() {
    this.refresh.emit();
  }

  createGeneralActivity(): void {

    if (!this.isGeneralActivityValid()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!this.isDateRangeValid()) {
      Swal.fire({ icon: 'error', title: 'Invalid Date Range', text: 'End date cannot be before start date.' });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http
      .post<any>(
        `${this.apiUrl}/GeneralActivity`,
        {
          generalActivity: this.generalActivity,
          facilitatorIds: this.otherFacilitatorIds,
        },
        { headers }
      )
      .subscribe(
        (response) => {
          this.generalActivity = {
            ...this.generalActivity,
            id: response.id  // keeps all form values, just adds the id
          };
          this.cdRef.detectChanges(); // force Angular to see the id change
          this.refreshdata();
          Swal.fire({
            icon: 'success',
            title: 'GeneralActivity',
            text: 'Record Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'GeneralActivity',
            text: 'Error saving record',
          });
        }
      );
  }

  isDateRangeValid(): boolean {
    const start = new Date(this.generalActivity.startDate);
    const end = new Date(this.generalActivity.endDate);
    return end >= start;
  }

  isGeneralActivityValid(): boolean {
    if (this.generalActivity.projectId !== 1) {
      this.generalActivity.projectId = 1;
    }
    if (this.generalActivity.startDate && this.generalActivity.endDate) {
      const start = new Date(this.generalActivity.startDate);
      const end = new Date(this.generalActivity.endDate);
      if (end < start) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date Range',
          text: 'End date cannot be before start date.',
        });
        return false;
      }
    }
    return (
      this.generalActivity.projectId !== 0 &&
      this.generalActivity.organisationId !== 0 &&
      this.generalActivity.subComponentId !== 0 &&
      this.generalActivity.activityId !== 0 &&
      this.generalActivity.activeStatusId !== 0 &&
      this.generalActivity.districtId !== 0 &&
      this.generalActivity.site.trim() !== '' &&
      this.generalActivity.leadFacilitatorId !== 0 &&
      this.generalActivity.details.trim() !== '' &&
      this.generalActivity.startDate !== null &&
      this.generalActivity.endDate !== null
    );
  }

  clearForm(): void {
    this.generalActivity = {
      // Reset the generalActivity object to its initial state
      projectId: 1,
      organisationId: 0,
      subComponentId: 0,
      subActivityId: 0,
      interventionId: 0,
      activityTypeId: 0,
      activityId: 0,
      activeStatusId: 0,
      districtId: 0,
      site: '',
      siteType: '',
      irrigationSchemeId: 0,
      waterpointId: 0,
      leadFacilitatorId: 0,
      details: '',
      issuesComments: '',
      startDate: new Date(),
      endDate: new Date(),
      id: 0,
      createdBy: '',
      createdDate: new Date(),
      updatedBy: '',
      updatedDate: new Date(),
    };
  }

  updateGeneralActivity(): void {
    if (!this.isGeneralActivityValid()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    console.log("Activity to update:", this.generalActivity);

    this.http
      .put<any>(
        `${this.apiUrl}/GeneralActivity/${this.generalActivity.id}`,
        {
          generalActivity: this.generalActivity,
          facilitatorIds: this.otherFacilitatorIds,
        },
        { headers }
      )
      .subscribe(
        (response) => {
          this.refreshdata();
          Swal.fire({
            icon: 'success',
            title: 'GeneralActivity',
            text: 'Record Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'GeneralActivity',
            text: 'Error saving record',
          });
        }
      );
  }

  getAllParameters(): void {
    this.http.get(apiUrl + '/Mapping/activitiessubcomponent').subscribe(
      (response: any) => {
        this.activitiessubcomponents = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luFileTypes`).subscribe(
      (response: any) => {
        this.fileTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Organisation`).subscribe(
      (response: any) => {
        this.organisations = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Mapping/awpActivities`).subscribe(
      (response: any) => {
        this.subComponents = response;

        console.log(this.subComponents)
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luParticipantTypes`).subscribe(
      (response: any) => {
        this.participantTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luInterventions`).subscribe(
      (response: any) => {
        this.interventions = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luActivityTypes`).subscribe(
      (response: any) => {
        this.activityTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Mapping/subActivities`).subscribe(
      (response: any) => {
        this.activities = response;
        console.log(this.activities)
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luDistricts`).subscribe(
      (response: any) => {
        this.districts = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luActivityStatuses`).subscribe(
      (response: any) => {
        this.activityStatuses = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luSiteTypes`).subscribe(
      (response: any) => {
        this.siteTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/StaffMember`).subscribe(
      (response: any) => {
        this.facilitators = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/IrrigationScheme`).subscribe(
      (response: any) => {
        this.irrigationSchemes = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/WaterPoint`).subscribe(
      (response: any) => {
        this.waterpoints = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  onSelect(event: any) {
    this.selectedValue = event.target.value;
    var endpoint = '';
    if (this.selectedValue == 1) {
      endpoint = 'api/Beneficiary/GetBeneficiaries';
    } else if (this.selectedValue == 6) {
      endpoint = 'api/VBUS/GetVBUS';
    } else if (this.selectedValue == 3) {
      endpoint = 'MSME';
    } else if (this.selectedValue == 4) {
      endpoint = 'StaffMember';
    } else if (this.selectedValue == 5) {
      endpoint = 'Organisation';
    }

    this.http
      .get<any[]>(
        `${this.apiUrl}/GeneralActivityParticipant/ids/${this.generalActivity.id}/${this.selectedValue}`
      )
      .subscribe(
        (data: any[]) => {
          this.selectedRowIds = data;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );

    const apiEndpoint = `${this.apiUrl}/${endpoint}`;

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        this.data = data;
        const columns: any[] = Object.keys(data[0]).map((key) => ({
          data: key,
          title: key,
        }));
        if (this.dataTable) {
          this.dataTable.clear().destroy();
          const dataTableElement = $('#dtParticipants');
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
      select: 'multi',

      buttons: ['copy', 'print', 'excel', 'colvis', 'showSelected'],
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
      },
    };

    try {
      this.dataTable = $('#dtParticipants').DataTable(dtOptions);
      if (data && data.length > 0) {
        this.dataTable.rows.add(data).draw();

        // Select rows based on the array of IDs
        if (this.selectedRowIds && this.selectedRowIds.length > 0) {
          const indexesToSelect: number[] = [];
          data.forEach((row, index) => {
            if (this.selectedRowIds.includes(row.id)) {
              indexesToSelect.push(index);
            }
          });
          this.dataTable.rows(indexesToSelect).select();
        }
      }
    } catch (error) {
      console.error('Error initializing DataTable', error);
    }
  }

  sendSelectedData() {
    if (this.dataTable) {
      const selectedRowsData = this.dataTable
        .rows({ selected: true })
        .data()
        .toArray();
      const participantIds = selectedRowsData.map((row: { id: any }) => row.id);
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const postEndpoint = `${this.apiUrl}/GeneralActivityParticipant/${this.generalActivity.id}/${this.selectedValue}`;

      this.http.post(postEndpoint, participantIds, { headers }).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Participant Selection',
            text: 'Records Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Participant Selection',
            text: 'Error saving records',
          });
          console.error('Error posting selected ids:', error);
        }
      );
    }
  }

  public getRegister() {
    console.log(this.editid);
    this.http.get(`${apiUrl}/File/byobject/${this.editid}/1021`).subscribe(
      (response: any) => {
        var data = JSON.parse(response);
        if (!this.Table) {
          setTimeout(() => {
            this.initializeTable(data);
          }, 1);
        } else {
          this.Table.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const editButtonColumn = [
      { data: 'action', defaultContent: '' },
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
        title: 'delete',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.deleteFile(rowData.FileID);
          });
        },
      },
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-download" aria-hidden="true"></i></button>',
        title: 'download',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.downloadFile(rowData.FileID, rowData.ContentType);
          });
        },
      },
    ];

    const updatedColumns = [...editButtonColumn, ...columns];

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
      },
    };

    this.Table = $('#dtActivityFiles').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.Table.rows.add(data).draw();
    }
  }

  deleteFile(fileId: number) {
    const deleteUrl = `${apiUrl}/File/${fileId}`; // Assuming the API endpoint for file deletion

    this.http.delete(deleteUrl).subscribe(
      (response: any) => {
        this.getRegister();
        Swal.fire({
          icon: 'success',
          title: 'Activity Files',
          text: 'File Deleted Successfully',
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Activity Files',
          text: 'Error Deleting File',
        });
      }
    );
  }

  downloadFile(id: number, contentType: string) {
    this.http
      .get(`${apiUrl}/File/${id}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe((response: any) => {
        const contentDispositionHeader = response.headers.get(
          'content-disposition'
        );
        let fileName = 'file'; // Default filename if not found in headers

        if (contentDispositionHeader) {
          const matches = contentDispositionHeader.match(
            /filename="?([^"]+)"?;/
          );
          if (matches && matches.length > 1) {
            fileName = matches[1];
          }
        }

        const blob = new Blob([response.body], { type: contentType });
        const url = window.URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName; // Set the downloaded file name

        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      });
  }
}
