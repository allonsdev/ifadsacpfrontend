import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  DoCheck,
  KeyValueDiffers,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export class Indicator {
  id: number = 0;
  indicatorTypeId: number = 0;
  indicatorCategoryId: number = 0;
  objectiveId: number = 0;
  outcomeId: number = 0;
  outputId: number = 0;
  activityId: number = 0;
  name: string = '';
  definition: string = '';
  description: string = '';
  unitOfMeasurementId: number = 0;
  baselineValue: number = 0;
  dataSourceId: number = 0;
  dataCollectionMethodId: number = 0;
  toolId: number = 0;
  dataCollectionFrequencyId: number = 0;
  responsibleParty: string = '';
  programTargetValue: number = 0;
  createdBy: string | null = '';
  createdDate: Date = new Date();
  updatedBy: string | null = '';
  updatedDate: Date = new Date();
}

export class IndicatorTarget {
  id: number = 0;
  indicatorId: number = 0;
  organization: string = '';
  district: string = '';
  financialYear: number = 0;
  quarter: string = '';
  month: string = '';
  target: number = 0;
  achievement: number = 0;
  comments: string = '';

  isValid(): boolean {
    // Check if any property is empty or undefined
    if (
      this.organization === '' ||
      this.district === '' ||
      this.financialYear === undefined ||
      this.quarter === '' ||
      this.month === '' ||
      this.target === undefined ||
      this.achievement === undefined ||
      this.comments === ''
    ) {
      return false;
    }

    return true;
  }
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'indicatordetailsmodal',
  templateUrl: './indicatordetailsmodal.element.html',
})
export class IndicatordetailsmodalElement implements OnInit, OnChanges {
  @Input() editid: number = 0;
  indicator: Indicator = new Indicator();

  financialyears = this.getTenYearsRange();
  indicatorTarget: IndicatorTarget = new IndicatorTarget();
  indicatorTypes: any[] = [];
  indicatorCategories: any[] = [];
  objectives: any[] = [];
  outcomes: any[] = [];
  outputs: any[] = [];
  activities: any[] = [];
  filteredobjectives: any[] = [];
  filteredoutcomes: any[] = [];
  filteredoutputs: any[] = [];
  filteredactivities: any[] = [];
  unitsOfMeasurement: any[] = [];
  dataSources: any[] = [];
  dataCollectionMethods: any[] = [];
  tools: any[] = [];
  dataCollectionFrequencies: any[] = [];

  @Output() refresh: EventEmitter<any> = new EventEmitter();
  private apiUrl = apiUrl + '';
  organisations: any;
  districts: any;
  dataTable: any;
  private differ: any;
  targets: any[] = [];
  monthchart: any;
  quarterchart: any;
  selectedYear: any;
  columnsAI: any;
  dataTableAI: any;
  currentUser: any;
  constructor(private http: HttpClient, private differs: KeyValueDiffers) {
    this.differ = this.differs.find(this.indicator).create();
  }

  refreshdata() {
    this.refresh.emit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.editid != 0) {
      this.getitem();
      this.getRegister();
      this.getRegisterAI();
    }
  }
  getitem() {
    this.http.get(`${this.apiUrl}/Indicator/${this.editid}`).subscribe(
      (response: any) => {
        this.indicator = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  getchilditem(id: number) {
    this.http.get(`${this.apiUrl}/IndicatorTarget/byid/${id}`).subscribe(
      (response: any) => {
        this.indicatorTarget = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }
  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    Chart.register(ChartDataLabels);
    this.getAllParameters();
  }

  createIndicator(): void {
    if (!this.isIndicatorValid()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('here');
    this.indicator.createdBy = this.currentUser.fullname;
    this.indicator.updatedBy = this.currentUser.fullname;
    this.http
      .post<any>(`${this.apiUrl}/Indicator`, this.indicator, { headers })
      .subscribe(
        (response) => {
          this.refreshdata();

          this.clearForm();
          Swal.fire({
            icon: 'success',
            title: 'Indicators',
            text: 'Record Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Indicators',
            text: 'Error saving records',
          });
        }
      );
  }

  isIndicatorValid(): boolean {
    const indicator = this.indicator;
    const typeId = indicator.indicatorTypeId;

    const commonChecks =
      typeId !== 0 &&
      indicator.indicatorCategoryId !== 0 &&
      indicator.name.trim() !== '' &&
      indicator.definition.trim() !== '' &&
      indicator.description.trim() !== '' &&
      indicator.unitOfMeasurementId !== 0 &&
      indicator.dataSourceId !== 0 &&
      indicator.dataCollectionFrequencyId !== 0 &&
      indicator.responsibleParty.trim() !== '' &&
      indicator.programTargetValue !== 0;
    if (typeId == 1) {
      console.log(indicator, commonChecks);
      return commonChecks;
    } else if (typeId == 3) {
      console.log('2', commonChecks);
      return commonChecks && indicator.outputId !== 0;
    } else {
      console.log('3', commonChecks);
      return (
        commonChecks && indicator.outputId !== 0 && indicator.activityId !== 0
      );
    }
  }

  clearForm(): void {
    this.indicator = {
      // Reset the indicator object to its initial state
      indicatorTypeId: 0,
      indicatorCategoryId: 0,
      objectiveId: 0,
      outcomeId: 0,
      outputId: 0,
      activityId: 0,
      name: '',
      definition: '',
      description: '',
      unitOfMeasurementId: 0,
      baselineValue: 0,
      dataSourceId: 0,
      dataCollectionMethodId: 0,
      toolId: 0,
      dataCollectionFrequencyId: 0,
      responsibleParty: '',
      programTargetValue: 0,
      createdBy: null,
      createdDate: new Date(),
      updatedBy: null,
      updatedDate: new Date(),
      id: 0,
    };
  }

  updateIndicator(): void {
    if (!this.isIndicatorValid()) {
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
        `${this.apiUrl}/Indicator/${this.indicator.id}`,
        this.indicator,
        { headers }
      )
      .subscribe(
        (response) => {
          this.refreshdata();
          this.trackingByMonth();
          this.trackingByQuarter();
          this.http.get(`${apiUrl}/Achievements`);
          Swal.fire({
            icon: 'success',
            title: 'Indicators',
            text: 'Record Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Indicators',
            text: 'Error saving records',
          });
        }
      );
  }

  getAllParameters(): void {
    this.http.get(`${this.apiUrl}/Parameter/luIndicatorTypes`).subscribe(
      (response: any) => {
        this.indicatorTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luIndicatorCategories`).subscribe(
      (response: any) => {
        this.indicatorCategories = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Objective`).subscribe(
      (response: any) => {
        this.objectives = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Outcome`).subscribe(
      (response: any) => {
        this.outcomes = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Output`).subscribe(
      (response: any) => {
        this.outputs = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Activity`).subscribe(
      (response: any) => {
        this.activities = response;
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
    this.http.get(`${this.apiUrl}/Parameter/luDistricts`).subscribe(
      (response: any) => {
        this.districts = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luUnitsOfMeasurement`).subscribe(
      (response: any) => {
        this.unitsOfMeasurement = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luDataSources`).subscribe(
      (response: any) => {
        this.dataSources = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luDataCollectionMethods`).subscribe(
      (response: any) => {
        this.dataCollectionMethods = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${this.apiUrl}/Parameter/luTools`).subscribe(
      (response: any) => {
        this.tools = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http
      .get(`${this.apiUrl}/Parameter/luDataCollectionFrequencies`)
      .subscribe(
        (response: any) => {
          this.dataCollectionFrequencies = JSON.parse(response);
        },
        (error) => {
          console.error('Error occurred:', error);
        }
      );
  }

  getTenYearsRange() {
    const currentYear = new Date().getFullYear();
    const yearsRange = [];

    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      yearsRange.push(i);
    }

    return yearsRange;
  }

  onOutputSelect(event: any) {
    this.filteredactivities = this.activities.filter(
      (d: { outputId: any }) => d.outputId == event.target.value
    );
  }

  onOutcomeSelect(event: any) {
    this.filteredoutputs = this.outputs.filter(
      (d: { outcomeId: any }) => d.outcomeId == event.target.value
    );
  }

  onObjectiveSelect(event: any) {
    this.filteredoutcomes = this.outcomes.filter(
      (d: { objectiveId: any }) => d.objectiveId == event.target.value
    );
  }

  onSelect(event: any) {
    const outputTextbox = document.getElementById(
      'output'
    ) as HTMLSelectElement;
    const activityTextbox = document.getElementById(
      'activity'
    ) as HTMLSelectElement;

    outputTextbox.disabled = false;
    activityTextbox.disabled = false;

    const selectedValue = event.target.value;

    switch (selectedValue) {
      case '1':
        // Clear and disable bottom two textboxes
        outputTextbox.value = ''; // Clear value
        activityTextbox.value = ''; // Clear value
        outputTextbox.disabled = true;
        activityTextbox.disabled = true;
        break;
      case '3':
        // Clear and disable bottom one textbox
        activityTextbox.value = ''; // Clear value
        activityTextbox.disabled = true;
        break;
      default:
        // No specific action for other cases
        break;
    }
  }

  createIndicatorTarget(): void {
    if (!this.indicatorTarget.isValid()) {
      Swal.fire({
        icon: 'success',
        title: 'Indicator Target',
        text: 'Please fill out all required fields.',
      });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.indicatorTarget.indicatorId = this.indicator.id;
    this.http
      .post<any>(`${this.apiUrl}/IndicatorTarget`, this.indicatorTarget, {
        headers,
      })
      .subscribe(
        (response) => {
          this.getRegister();
          this.trackingByMonth();
          this.trackingByQuarter();
          this.clearIndicatorTarget();
          this.http.get(`${apiUrl}/Achievements`);
          Swal.fire({
            icon: 'success',
            title: 'Indicator Target',
            text: 'Record Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Indicator Target',
            text: 'Error saving records',
          });
        }
      );
  }

  updateIndicatorTarget(): void {
    console.log('here');
    if (
      this.indicatorTarget.organization == '' ||
      this.indicatorTarget.district == '' ||
      this.indicatorTarget.financialYear == 0 ||
      this.indicatorTarget.quarter == '' ||
      this.indicatorTarget.month == '' ||
      this.indicatorTarget.target == 0 ||
      this.indicatorTarget.comments == ''
    ) {
      Swal.fire({
        icon: 'success',
        title: 'Indicator Target',
        text: 'Please fill out all required fields.',
      });
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put<any>(
        `${this.apiUrl}/IndicatorTarget/${this.indicatorTarget.id}`,
        this.indicatorTarget,
        { headers }
      )
      .subscribe(
        (response) => {
          this.getRegister();
          this.trackingByMonth();
          this.trackingByQuarter();
          this.clearIndicatorTarget();
          Swal.fire({
            icon: 'success',
            title: 'Indicator Target',
            text: 'Record Saved Successfully',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Indicator Target',
            text: 'Error saving records',
          });
        }
      );
  }

  clearIndicatorTarget(): void {
    this.indicatorTarget.id = 0;
    this.indicatorTarget.indicatorId = 0;
    this.indicatorTarget.organization = '';
    this.indicatorTarget.district = '';
    this.indicatorTarget.financialYear = 0;
    this.indicatorTarget.quarter = '';
    this.indicatorTarget.month = '';
    this.indicatorTarget.target = 0;
    this.indicatorTarget.achievement = 0;
    this.indicatorTarget.comments = '';
  }

  public getRegister() {
    const apiEndpoint = apiUrl + '/IndicatorTarget/detailed/' + this.editid;

    this.http.get<any[]>(apiEndpoint).subscribe(
      (response: any) => {
        var data = JSON.parse(response);
        this.targets = data;
        if (!this.dataTable) {
          setTimeout(() => {
            this.initializeDataTable(data);
          }, 1);
        } else {
          this.dataTable.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeDataTable(data: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    const editButtonColumn = [
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-icon-only btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3"><i class="fa fa-pencil" aria-hidden="true"></i></button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.getchilditem(rowData.Id);
          });
        },
      },
      {
        data: 'action',
        defaultContent:
          '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3" ><i class="fa fa-trash" aria-hidden="true"></i></button>',
        title: '',
        createdCell: (
          cell: any,
          cellData: any,
          rowData: any,
          rowIndex: number,
          colIndex: number
        ) => {
          $(cell).on('click', () => {
            this.http
              .delete(apiUrl + '/IndicatorTargets/' + rowData.Id)
              .subscribe(
                (response: any) => {
                  this.getRegister();
                  this.trackingByMonth();
                  this.trackingByQuarter();
                  Swal.fire({
                    icon: 'success',
                    title: 'Indicator Target',
                    text: 'Record Deleted Successfully',
                  });
                },
                (error) => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Indicator Target',
                    text: 'Error while deleting record',
                  });
                }
              );
          });
        },
      },
    ];

    const updatedColumns = [...columns, ...editButtonColumn];

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

    this.dataTable = $('#IndicatorTargets').DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  onselect(event: any) {
    this.selectedYear = event.target.value;
    this.trackingByMonth();
    this.trackingByQuarter();
  }

  trackingByMonth() {
    const filteredData = this.targets.filter(
      (item) => item.FinancialYear == this.selectedYear
    );

    // Group data by month and sum up targets and achievements
    const groupedData = filteredData.reduce((acc, item) => {
      const month = item.Month;
      if (!acc[month]) {
        acc[month] = {
          targets: [item.Target ? item.Target : 0],
          achievements: [item.Achievement ? item.Achievement : 0],
        };
      } else {
        acc[month].targets.push(item.Target ? item.Target : 0);
        acc[month].achievements.push(item.Achievement ? item.Achievement : 0);
      }
      return acc;
    }, {} as { [key: string]: { targets: number[]; achievements: number[] } });

    const labels = Object.keys(groupedData);
    let targets: number[], achievements: number[];

    // Calculate targets and achievements based on indicator type
    switch (this.indicator.indicatorCategoryId) {
      case 1:
        targets = labels.map((month) =>
          groupedData[month].targets.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        achievements = labels.map((month) =>
          groupedData[month].achievements.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        break;
      case 2:
        targets = labels.map((month) => {
          const sum = groupedData[month].targets.reduce(
            (acc: any, val: any) => acc + val,
            0
          );
          return sum / groupedData[month].targets.length;
        });
        achievements = labels.map((month) => {
          const sum = groupedData[month].achievements.reduce(
            (acc: any, val: any) => acc + val,
            0
          );
          return sum / groupedData[month].achievements.length;
        });
        break;
      case 3:
        targets = labels.map(
          (month) =>
            groupedData[month].targets[groupedData[month].targets.length - 1]
        );
        achievements = labels.map(
          (month) =>
            groupedData[month].achievements[
              groupedData[month].achievements.length - 1
            ]
        );
        break;
      case 4:
        targets = labels.map((month) =>
          Math.max(...groupedData[month].targets)
        );
        achievements = labels.map((month) =>
          Math.max(...groupedData[month].achievements)
        );
        break;
      case 5:
        targets = labels.map((month) =>
          Math.min(...groupedData[month].targets)
        );
        achievements = labels.map((month) =>
          Math.min(...groupedData[month].achievements)
        );
        break;
      default:
        // Default to additive if indicator category is not recognized
        targets = labels.map((month) =>
          groupedData[month].targets.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        achievements = labels.map((month) =>
          groupedData[month].achievements.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        break;
    }

    if (this.monthchart) {
      this.monthchart.destroy();
    }
    this.monthchart = new Chart('monthchart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Target',
            data: targets,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Achievement',
            data: achievements,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'x',
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'bottom',
            color: 'white', // Set font color to white
            font: {
              weight: 'bold', // Set font weight to bold
              size: 16, // Set font weight to bold
            },
            formatter: (value: any, context: any) => {
              return value; // Displaying the value of the bar
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            title: {
              display: true,
              text: 'Months',
            },
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: 'Values',
            },
          },
        },
      },
    });
  }

  trackingByQuarter() {
    const filteredData = this.targets.filter(
      (item) => item.FinancialYear == this.selectedYear
    );

    const groupedData = filteredData.reduce((acc, item) => {
      const quarter = item.Quarter;
      if (!acc[quarter]) {
        acc[quarter] = {
          targets: [item.Target ? item.Target : 0],
          achievements: [item.Achievement ? item.Achievement : 0],
        };
      } else {
        acc[quarter].targets.push(item.Target ? item.Target : 0);
        acc[quarter].achievements.push(item.Achievement ? item.Achievement : 0);
      }
      return acc;
    }, {} as { [key: string]: { targets: number[]; achievements: number[] } });

    const labels = Object.keys(groupedData);
    let targets: number[], achievements: number[];

    switch (this.indicator.indicatorCategoryId) {
      case 1:
        targets = labels.map((quarter) =>
          groupedData[quarter].targets.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        achievements = labels.map((quarter) =>
          groupedData[quarter].achievements.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        break;
      case 2:
        targets = labels.map((quarter) => {
          const sum = groupedData[quarter].targets.reduce(
            (acc: any, val: any) => acc + val,
            0
          );
          return sum / groupedData[quarter].targets.length;
        });
        achievements = labels.map((quarter) => {
          const sum = groupedData[quarter].achievements.reduce(
            (acc: any, val: any) => acc + val,
            0
          );
          return sum / groupedData[quarter].achievements.length;
        });
        break;
      case 3:
        targets = labels.map(
          (quarter) =>
            groupedData[quarter].targets[
              groupedData[quarter].targets.length - 1
            ]
        );
        achievements = labels.map(
          (quarter) =>
            groupedData[quarter].achievements[
              groupedData[quarter].achievements.length - 1
            ]
        );
        break;
      case 4:
        targets = labels.map((quarter) =>
          Math.max(...groupedData[quarter].targets)
        );
        achievements = labels.map((quarter) =>
          Math.max(...groupedData[quarter].achievements)
        );
        break;
      case 5:
        targets = labels.map((quarter) =>
          Math.min(...groupedData[quarter].targets)
        );
        achievements = labels.map((quarter) =>
          Math.min(...groupedData[quarter].achievements)
        );
        break;
      default:
        targets = labels.map((quarter) =>
          groupedData[quarter].targets.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        achievements = labels.map((quarter) =>
          groupedData[quarter].achievements.reduce(
            (acc: any, val: any) => acc + val,
            0
          )
        );
        break;
    }

    if (this.quarterchart) {
      this.quarterchart.destroy();
    }

    this.quarterchart = new Chart('quarterchart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Target',
            data: targets,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Achievement',
            data: achievements,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'x',
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'bottom',
            color: 'white', // Set font color to white
            font: {
              weight: 'bold', // Set font weight to bold
              size: 16, // Set font weight to bold
            },
            formatter: (value: any, context: any) => {
              return value; // Displaying the value of the bar
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            title: {
              display: true,
              text: 'Quarter',
            },
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: 'Values',
            },
          },
        },
      },
    });
  }

  public getRegisterAI() {
    const apiEndpoint = apiUrl + '/Activity';

    this.http.get<any[]>(apiEndpoint).subscribe(
      (data: any[]) => {
        if (!this.dataTableAI) {
          setTimeout(() => {
            this.columnsAI = Object.keys(data[0]).map((key) => ({
              data: key,
              title: key,
            }));
            this.initializeDataTableAI(data, this.columnsAI);
          }, 1);
        } else {
          this.dataTableAI.clear().rows.add(data).draw();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeDataTableAI(data: any[], columns: any[]) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: columns,
      select: 'multi',
      dom: 'BfrtipP',

      buttons: ['copy', 'print', 'excel', 'colvis'],
    };

    try {
      this.dataTableAI = $('#dtIndicatorActivities').DataTable(dtOptions);
      if (data && data.length > 0) {
        this.dataTableAI.rows.add(data).draw();
      }
    } catch (error) {
      console.error('Error initializing DataTable');
    }
  }

  sendSelectedData() {
    if (this.dataTableAI) {
      const selectedRowsData = this.dataTableAI
        .rows({ selected: true })
        .data()
        .toArray();
      const ids = selectedRowsData.map((row: { id: any }) => row.id);

      const postEndpoint = apiUrl + '/Achievements/' + this.indicator.id;

      this.http.post(postEndpoint, ids).subscribe(
        (response) => {
          this.http.get(`${apiUrl}/Achievements`);
          Swal.fire({
            icon: 'success',
            title: 'Indicators',
            text: 'Records Saved Successfully',
          });
        },
        (error) => {
          console.error('Error posting selected ids:', error);
          Swal.fire({
            icon: 'error',
            title: 'Indicators',
            text: 'Error while saving records',
          });
        }
      );
    }
  }
}
