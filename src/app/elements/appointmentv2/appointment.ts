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
  //componentid: number= 0;
  //ubcomponentidv2 : number= 0;
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
  selector: 'appointment',
  templateUrl: './appointment.html',
})
export class AppointmentElement implements OnInit, OnChanges {
  generalActivity: GeneralActivity = new GeneralActivity();
  stakeholder:StakeholderUploadComponent= new StakeholderUploadComponent();

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

  componenets: any[]=[];
  subcompnents: any[]=[];

  activityTypes: any[] = [];
  activities: any[] = [];
  activityStatuses: any[] = [];
  districts: any[] = [];
  facilitators: any[] = [];
  otherfacilitators: any[] = [];

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

  constructor(
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private FileuploadService: FileuploadService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editid != 0) {
      this.getitem();
      this.getRegister();
    }
  }

  loadActivities(): void {
    this.filteredSubComponents = this.activitiessubcomponents
      .filter(
        (subComponent: { subComponentId: number }) =>
          subComponent.subComponentId == this.generalActivity.subComponentId
      )
      .map(
        (filteredSubComponent: { activityId: any }) =>
          filteredSubComponent.activityId
      );
    this.filteredActivities = this.activities.filter((activity) =>
      this.filteredSubComponents.includes(activity.Id)
    );
  }

  readExcelFile(event: any) {
    if (event.target.files.length === 0) {
      console.log('No file selected!');
      return;
    }

    var file = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const data = new Uint8Array(fileReader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const headers = [];
      for (let col = 0; ; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) {
          break;
        }

        const headerValue = worksheet[cellAddress].v;
        if (
          headerValue === undefined ||
          headerValue === null ||
          headerValue === ''
        ) {
          break;
        }

        headers.push(
          headerValue.charAt(0).toLowerCase() + headerValue.slice(1)
        );
      }

      if (headers.length === 0) {
        console.log('No headers found in the Excel file!');
        return;
      }

      const startingRow = 1;
      this.excelData = XLSX.utils.sheet_to_json(worksheet, {
        header: headers,
        range: startingRow,
        dateNF: 'yyyy-mm-dd', // Specify the date format here
      });
      console.log('Excel File Data', this.excelData);
    };

    fileReader.readAsArrayBuffer(file);
  }

  displayData() {
    var ids: any[] = this.excelData.map((ben: any) => ben.iDNumber);
    console.log(ids);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    Swal.fire({
      title: 'Generating Preview...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    } as SweetAlertOptions);

    this.http
      .post<any>(`${this.apiUrl}/GeneralActivityParticipant/exists`, ids, {
        headers,
      })
      .subscribe(
        (response) => {
          this.excelData.forEach((record: any) => {
            record.exists = response.includes(record.IdNumber)
              ? 'Already exists'
              : 'New';
            record.status = 'pending';
          });
          var columns: any[] = Object.keys(this.excelData[0]).map((key) => ({
            data: key,
            title: key,
          }));
          if (this.excelDataTable) {
            this.excelDataTable.clear().destroy();
            const dataTableElement = $('#dtPreview');
            if (dataTableElement.length) {
              dataTableElement.empty();
            }
          }
          this.initializeExcelDataTable(this.excelData);
          Swal.close();
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'General Activity',
            text: 'Error while generating preview',
          });
        }
      );
  }

  UploadData() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    Swal.fire({
      title: 'Saving Participation...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    } as SweetAlertOptions);
    console.log(this.excelData);
    this.http
      .post<any>(
        `${this.apiUrl}/GeneralActivityParticipant/savetemplatedata/${this.generalActivity.id}`,
        JSON.stringify(this.excelData),
        { headers }
      )
      .subscribe(
        (response) => {
          // Extract failed beneficiary IDs from the response
          var failedBeneficiaryIds = response.failedBeneficiaryIds;
          // Update Status field in excelData based on failedBeneficiaryIds
          this.excelData.forEach((record: any) => {
            record.Status = failedBeneficiaryIds.includes(record.iDNumber)
              ? 'Failed'
              : 'Saved';
          });

          if (this.excelDataTable) {
            this.excelDataTable.clear().destroy();
            const dataTableElement = $('#dtPreview');
            if (dataTableElement.length) {
              dataTableElement.empty();
            }
          }
          this.initializeExcelDataTable(this.excelData);
          Swal.close();
          Swal.fire({
            icon: 'info',
            title: 'General Activity(Success Report)',
            text: `Successful: ${response.successfulCount} record(s) Failed: ${response.failedCount} record(s).`,
          });
        },
        (error) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'GeneralActivity',
            text: 'Error while generating preview',
          });
        }
      );
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
        this.generalActivity = response;
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
    // Set default projectId after modal is loaded
    this.generalActivity.projectId = 1;
    this.stakeholder.uploadedBy= this.currentUser;
    this.generalActivity.createdBy = this.currentUser
  }

  refreshdata() {
    this.refresh.emit();
  }

  createGeneralActivity(): void {
    if (!this.isGeneralActivityValid()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });
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
          this.refreshdata();
          this.clearForm();
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

  isGeneralActivityValid(): boolean {
    if (this.generalActivity.projectId !== 1) {
      this.generalActivity.projectId = 1;
    }
    return (
      this.generalActivity.projectId !== 0 &&
      this.generalActivity.organisationId !== 0 &&
      this.generalActivity.subComponentId !== 0 &&
      this.generalActivity.interventionId !== 0 &&
      this.generalActivity.activityTypeId !== 0 &&
      this.generalActivity.activityId !== 0 &&
      this.generalActivity.activeStatusId !== 0 &&
      this.generalActivity.districtId !== 0 &&
      this.generalActivity.site.trim() !== '' &&
      this.generalActivity.leadFacilitatorId !== 0 &&
      this.generalActivity.details.trim() !== '' &&
      this.generalActivity.issuesComments.trim() !== '' &&
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
      //componentid:0,
      //subcomponentidv2:2,
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
    this.http.get(`${this.apiUrl}/Parameter/luSubComponents`).subscribe(
      (response: any) => {
        this.subComponents = JSON.parse(response);
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
    this.http.get(`${this.apiUrl}/Parameter/Activities`).subscribe(
      (response: any) => {
        this.activities = JSON.parse(response);
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






    // SHOW PREVIEW TABLE
  displayData2() {
    if (!this.excelData.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Upload an Excel file first.'
      });
      return;
    }

    $('#dtPreview').DataTable().clear().destroy();

    $('#dtPreview').DataTable({
      data: this.excelData,
      columns: Object.keys(this.excelData[0]).map(k => ({ title: k, data: k })),
      paging: true,
      searching: true
    });

    Swal.fire({
      icon: 'success',
      title: 'Preview Ready',
      timer: 1200,
      showConfirmButton: false
    });
  }

  // FINAL UPLOAD FUNCTION
  uploadStakeholders() {
    if (!this.file) {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please choose an Excel file first.'
      });
      return;
    }

    if (!this.stakeholder.uploadedBy.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing UploadedBy',
        text: 'Please enter who uploaded the file.'
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", this.file);
   

    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.http.post(`${this.apiUrl}/GeneralActivityParticipant/stakeholdertemplatedata/${this.generalActivity.id}/${this.stakeholder.uploadedBy}`, formData)
      .subscribe({
        next: (res: any) => {
          Swal.close();
          this.stakeholder.uploadResults = res;
          this.renderResultTable();

          Swal.fire({
            icon: 'success',
            title: 'Upload Completed',
            text: `Created: ${res.Created.length}, Updated: ${res.UpdatedDuplicates.length}, Failed: ${res.Failed.length}`
          });
        },
        error: err => {
          Swal.close();
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'Something went wrong uploading the Excel file.'
          });
        }
      });
  }

  // POPULATE RESULT TABLE
  renderResultTable() {
    $('#dtResults').DataTable().clear().destroy();

    let results = [
      ...this.stakeholder.uploadResults.Created.map((x: any) => ({ ...x, Status: "Created" })),
      ...this.stakeholder.uploadResults.UpdatedDuplicates.map((x: any) => ({ ...x, Status: "Updated" })),
      ...this.stakeholder.uploadResults.Failed.map((x: any) => ({ ...x, Status: "Failed" }))
    ];



    $('#dtResults').DataTable({
      data: results,
      columns: Object.keys(results[0]).map(k => ({ title: k, data: k })),
      paging: true,
      searching: true
    });

    Swal.fire({
      icon: 'info',
      title: 'Results Table Ready',
      text: 'Scroll down to view upload results.',
      timer: 1500,
      showConfirmButton: false
    });
  }




  public getRegister() {
    console.log(this.editid, 'here');
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
