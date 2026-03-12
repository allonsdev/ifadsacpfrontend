import {
  Component,
  NgZone,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { inject, signal, TemplateRef, WritableSignal } from '@angular/core';

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';
const apiUrl = environment.apiUrl;

declare var $: any;
declare var bootstrap: any;
export interface FinancialRecord {
  id: number;
  financialYear: string;
  totalBudget: number;
  totalReceived: number;
  totalSpent: number;
  balance: number;
  cumulativeBudget: number;
}

export class Project {
  id: number = 0;
  name?: string;
  code?: string;
  acronym?: string;
  activeStatus?: string;
  finalGoalStatement?: string;
  projectManager?: string;
  startDate: Date = new Date();
  endDate: Date = new Date();
  evaluationDate: Date = new Date();
  totalProjectBudget: number = 0;
  totalReceived: number = 0;
  totalSpent: number = 0;
  balance: number = 0;
  cumulativeBudget: number = 0;
  beneficiaryDescription?: string;
  stakeholderDescription?: string;
  targetedNoOfDirectBeneficiaries: number = 0;
  targetedNoOfMsmes: number = 0;
  targetedNoOfGroups: number = 0;
  men: number = 0;
  women: number = 0;
  youth: number = 0;
  vcle: number = 0;
  pwld: number = 0;
  whhh: number = 0;
  mhhh: number = 0;
  createdBy?: string;
  createdDate: Date = new Date();
  updatedBy?: string;
  updatedDate: Date = new Date();
}

@Component({
  selector: 'projectbrief',
  templateUrl: './projectbrief.component.html',
  providers: [BsModalService],
})
export class ProjectbriefComponent implements OnInit {
  @ViewChild('modalTemplate') modalTemplate!: TemplateRef<any>;
  @ViewChild('template') template!: TemplateRef<any>; // Declare template reference
  @ViewChild('templateNested') templateNested!: TemplateRef<any>; // Declare nested template reference
  districtsData: any[] = [];
  currentUser: any;
  project: Project = new Project();
  projectData: FinancialRecord[] = [];
  newRecord: FinancialRecord = this.getEmptyRecord();
  staffmembers: any;
  dataTable: any;
  columns: any;
  table: any;
  constructor(
    private http: HttpClient,
    private modalService: BsModalService,
    private ngZone: NgZone
  ) {}
  modalTitle: string = ''; // Define modalTitle with an initial value

  // Set modal title dynamically

  selectedItem: any = null;

  modalRef?: BsModalRef | null;
  modalRef2?: BsModalRef;
  // ✅ Add this method to fix the error
  private getEmptyRecord(): FinancialRecord {
    return {
      id: 0,
      financialYear: '',
      totalBudget: 0,
      totalReceived: 0,
      totalSpent: 0,
      balance: 0,
      cumulativeBudget: 0,
    };
  }
  closeFirstModal() {
    if (!this.modalRef) {
      return;
    }

    this.modalRef.hide();
    this.modalRef = null;
  }
  // closeModal(modalId?: number) {
  //   this.modalService.hide(modalId);
  // }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getProjectDetails();
    this.getDistrictRegister();
    this.getProvinceRegister();
    this.getProjectFinanceDetails();
    this.loadRecords();
  }
  ngAfterViewInit(): void {
    this.getDistrictRegister();
    this.loadRecords();
  }

  getProjectDetails(): void {
    this.http.get(`${apiUrl}/StaffMember`).subscribe(
      (response: any) => {
        this.staffmembers = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${apiUrl}/Project/1`).subscribe(
      (response: any) => {
        this.project = response;
        console.log(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }
  getProjectFinanceDetails(): void {
    this.http.get(`${apiUrl}/StaffMember`).subscribe(
      (response: any) => {
        this.staffmembers = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${apiUrl}/Project/1`).subscribe(
      (response: any) => {
        this.project = response;
        console.log(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }
  addRecord(): void {
    if (!this.newRecord.financialYear) {
      alert('Financial Year is required!');
      return;
    }
    this.project.cumulativeBudget = this.newRecord.cumulativeBudget;
    this.project.totalReceived = this.newRecord.totalReceived;
    this.project.totalSpent = this.newRecord.totalSpent;
    this.newRecord.totalBudget = this.project.totalProjectBudget;

    this.http
      .post<FinancialRecord>(`${apiUrl}/Project/addbudgets`, this.newRecord)
      .subscribe((record) => {
        this.projectData.push(record); // Update table instantly
        this.newRecord = this.getEmptyRecord();
      });

    this.updateProject();
  }

  isProjectValid(project: Project): boolean {
    if (!project.name || project.name.trim() === '') {
      return false;
    }

    if (
      !this.project.code ||
      !this.project.acronym ||
      !this.project.activeStatus ||
      !this.project.finalGoalStatement ||
      !this.project.projectManager ||
      !this.project.startDate ||
      !this.project.endDate ||
      !this.project.evaluationDate ||
      !this.project.beneficiaryDescription ||
      !this.project.stakeholderDescription
    ) {
      return false;
    }
    return true;
  }

  loadRecords(): void {
    this.http
      .get<FinancialRecord[]>(`${apiUrl}/Project/allbugdgets`)
      .subscribe((data) => {
        this.projectData = data;
      });
  }

  deleteRecord(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.http.delete(`${apiUrl}/Project/deletebudget/${id}`).subscribe(() => {
        this.projectData = this.projectData.filter(
          (record) => record.id !== id
        );
      });
    }
  }
  updateProject(): void {
    if (!this.isProjectValid(this.project)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put<any>(`${apiUrl}/Project/${this.project.id}`, this.project, {
        headers,
      })
      .subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Project',
            text: 'Record Updated Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Project',
            text: 'Error while updating record!',
          });
        }
      );
  }
  public getDistrictRegister() {
    const apiEndpoint = apiUrl + '/CoveredDistrict/names';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any) => {
        this.columns = Object.keys(data[0]).map((key) => ({
          data: key,
          title: key,
        }));
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
      buttons: ['print', 'excel'],
      initComplete: function (this: any) {
        const api = this.api();

        // Add Search Inputs
        const headerRow = api.table().header().querySelector('tr');
        const searchRow = document.createElement('tr');
        api.columns().every(function (this: any) {
          const column = this;
          const searchCell = document.createElement('th');
          const input = document.createElement('input');
          input.placeholder = 'Search';
          input.className = 'form-control form-control-sm';
          input.addEventListener('keyup', function () {
            column.search((this as HTMLInputElement).value).draw();
          });
          searchCell.appendChild(input);
          searchRow.appendChild(searchCell);
        });

        headerRow.insertAdjacentElement('afterend', searchRow);
      },
      createdRow: (row: Node, data: any, dataIndex: number) => {
        // Manually bind click handler to the "view-btn" button
        $(row)
          .find('.view-btn')
          .on('click', () => {
            this.ngZone.run(() => {});
            // Open the modal using the openDynamicModal method
          });
      },
    };

    try {
      // Initialize the DataTable and add data
      this.ngZone.run(() => {
        this.dataTable = $('#dtCoveredDistricts2').DataTable(dtOptions);
        this.dataTable.rows.add(data).draw();
      });
    } catch (error) {
      console.error('Error initializing DataTable', error);
    }
  }
  // Call this method if you want to open the modal from the DataTable's createdRow method

  // private initializeDataTable(data: any[], columns: any[]) {
  //   if (!data || data.length === 0) {
  //     console.error('No data available.');
  //     return;
  //   }

  //   const dtOptions: any = {
  //     processing: true,
  //     pagingType: 'full_numbers',
  //     pageLength: 10,
  //     columns: columns,
  //     dom: 'BfrtipP',

  //     buttons: ['print', 'excel'],
  //     initComplete: function (this: any) {
  //       const api = this.api();

  //       const headerRow = api.table().header().querySelector('tr');
  //       const searchRow = document.createElement('tr');
  //       api.columns().every(function (this: any) {
  //         const column = this;
  //         const searchCell = document.createElement('th');
  //         const input = document.createElement('input');
  //         input.placeholder = 'Search';
  //         input.className = 'form-control form-control-sm';
  //         input.addEventListener('keyup', function () {
  //           column.search(this.value).draw();
  //         });
  //         searchCell.appendChild(input);
  //         searchRow.appendChild(searchCell);
  //       });

  //       headerRow.insertAdjacentElement('afterend', searchRow);
  //     },
  //   };

  //   try {
  //     this.dataTable = $('#dtCoveredDistricts2').DataTable(dtOptions);
  //     this.dataTable.rows.add(data).draw();
  //   } catch (error) {
  //     console.error('Error initializing DataTable', error);
  //   }
  // }

  public getProvinceRegister() {
    const apiEndpoint = apiUrl + '/CoveredProvince/names';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any) => {
        const columns = Object.keys(data[0]).map((key) => ({
          data: key,
          title: key,
        }));
        this.initializeTable(data, columns);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeTable(data: any[], columns: any[]) {
    console.log('Data passed to table:', data);

    console.log('these are the to the table' + columns);
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }
    columns.push({
      title: 'View Districts',
      data: null,
      defaultContent:
        '<button type="button" class="btn btn-primary view-btn">View Districts</button>',
      orderable: false,
    });

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      dom: 'BfrtipP',

      buttons: ['print', 'excel'],
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
      // createdRow: (row: Node, data: any, dataIndex: number) => {
      //   // Manually bind click handler to the "view-btn" button
      //   $(row)
      //     .find('.view-btn')
      //     .on('click', () => {
      //       this.ngZone.run(() => {});
      //       data = this.districtsData;
      //       this.openDynamicModal(this.template, data);
      //     });
      // },

      createdRow: (row: Node, data: any, dataIndex: number) => {
        $(row)
          .find('.view-btn')
          .on('click', () => {
            this.ngZone.run(() => {
              console.log('Row Data:', data);
              console.log('Available Keys:', Object.keys(data));

              const selectedProvince = data?.provinceName;
              console.log('this province: ' + selectedProvince);

              // Fetch districts by province
              this.getDistrictsByProvince(selectedProvince);
            });
          });
      },
    };

    try {
      this.table = $('#dtCoveredProvinces2').DataTable(dtOptions);
      this.table.rows.add(data).draw();
    } catch (error) {
      console.error('Error initializing table', error);
    }
  }

  public getDistrictsByProvince(provinceName: string) {
    const url = `${apiUrl}/CoveredDistrict/name?provinceName=${provinceName}`;

    this.http.get<any[]>(url).subscribe(
      (data: any) => {
        const columns = Object.keys(data[0]).map((key) => ({
          data: key,
          title: key,
        }));
        this.ngZone.run(() => {
          this.districtsData = data;
          this.initializeDataTables(this.districtsData, columns);
        });

        // Now open the modal and pass the districts data
        this.openDynamicModal(this.template, this.districtsData, provinceName);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openDynamicModal(template: TemplateRef<any>, data: any, title: any) {
    // You can use the data passed in for custom logic or pass it into the modal as input
    this.ngZone.run(() => {
      console.log('This is the final data' + data);
      this.openModal(template, data, title); // Open the modal using the passed template
    });
  }

  openModal(template: TemplateRef<any>, data: any, modaltitle: any) {
    console.log('Final data:', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      console.error('No data available for the modal.');
      return;
    }

    const columns = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    console.log('Data passed to modal:', data);
    console.log('Columns:', columns);

    const initialState = { columns, data };

    this.ngZone.run(() => {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-lg',
        initialState,
      });
      this.modalTitle = modaltitle;

      setTimeout(() => {
        this.initializeDataTables(data, columns);
      }, 50);
    });
  }

  closeModal(level?: number) {
    if (level === 1 && this.modalRef) {
      this.modalRef.hide();
    } else {
      this.modalService.hide();
    }
  }
  private initializeDataTables(data: any[], columns: any[]) {
    console.log(data);
    console.log(columns);
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
      buttons: ['print', 'excel'],
      initComplete: function (this: any) {
        const api = this.api();

        // Add Search Inputs
        const headerRow = api.table().header().querySelector('tr');
        const searchRow = document.createElement('tr');
        api.columns().every(function (this: any) {
          const column = this;
          const searchCell = document.createElement('th');
          const input = document.createElement('input');
          input.placeholder = 'Search';
          input.className = 'form-control form-control-sm';
          input.addEventListener('keyup', function () {
            column.search((this as HTMLInputElement).value).draw();
          });
          searchCell.appendChild(input);
          searchRow.appendChild(searchCell);
        });

        headerRow.insertAdjacentElement('afterend', searchRow);
      },
    };

    try {
      this.table = $('#dtCoveredDistricts2').DataTable(dtOptions);
      this.table.rows.add(data).draw();
    } catch (error) {
      console.error('Error initializing DataTable', error);
    }
  }
}
