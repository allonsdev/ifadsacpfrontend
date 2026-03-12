import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'dashboards',
  templateUrl: './dashboards.component.html',
})
export class DashboardsComponent implements OnInit {
  currentUser: any;
  beneficiaries: any;
  msmes: any;
  groups: any;
  men: any;
  vcle: any;
  vcleTarget: any;
  apgs: any;
  women: any;
  plwd: any;
  plwdTarget: any;
  whhh: any;
  whhhTarget: any;
  mhhh: any;
  youth: any;
  reachbydistrict: any;
  reachbyvc: any;
  reachbydistrictdata: any;
  reachbyprovince: any;
  beneficiariesTarget: any;
  msmesTarget: any;
  groupsTarget: any;
  menTarget: any;
  womenTarget: any;
  youthTarget: any;
  reachbyprovincedata: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.http.get(`${apiUrl}/Dashboard`).subscribe(
      (response: any) => {
        this.beneficiaries = response.beneficiaries;
        this.beneficiariesTarget = response.beneficiariesTarget;
        this.msmes = response.msmes;
        this.msmesTarget = response.msmesTarget;
        this.groups = response.groups;
        this.groupsTarget = response.groupsTarget;
        this.men = response.male;
        this.menTarget = response.maleTarget;
        this.women = response.female;
        this.womenTarget = response.femaleTarget;
        this.youth = response.youth;
        this.youthTarget = response.youthTarget;
        this.mhhh = response.maleHeadedCount;
        this.whhh = response.femaleHeadedCount;
        this.plwd = response.disabilityCount;
        this.apgs = response.groups;
        this.vcle = response.vcle;
        this.plwdTarget = response.plwdtarget;
        this.whhhTarget = response.whhtarget;
        this.vcleTarget = response.vcletarget;
        this.reachbyGender(response.male, response.female);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    Chart.register(ChartDataLabels);
    this.reachbyProvinceChart();
    this.reachbyDistrictChart();
  }

  // reachbyProvinceChart() {
  //   this.http.get(`${apiUrl}/Dashboard/province`).subscribe(
  //     (response: any) => {
  //       this.reachbyprovincedata = response;

  //       if (this.reachbyprovince) {
  //         this.reachbyprovince.destroy();
  //       }

  //       const labels = this.reachbyprovincedata.map(
  //         (item: { province: any }) => {
  //           const province = item.province;
  //           return province.charAt(0).toUpperCase() + province.slice(1);
  //         }
  //       );
  //       // Assuming 'district' is the property name in the object
  //       const reachValues = this.reachbyprovincedata.map(
  //         (item: { reach: any }) => item.reach
  //       ); // Assuming 'reach' is the property name in the object

  //       this.reachbyprovince = new Chart('reachbyprovince', {
  //         type: 'bar',
  //         data: {
  //           labels: labels,
  //           datasets: [
  //             {
  //               label: 'Reach',
  //               data: reachValues,
  //               backgroundColor: 'rgba(54, 162, 235, 0.5)',
  //               borderColor: 'rgba(54, 162, 235, 1)',
  //               borderWidth: 1,
  //               borderRadius: 5,
  //             },
  //           ],
  //         },
  //         options: {
  //           indexAxis: 'x',
  //           plugins: {
  //             datalabels: {
  //               anchor: 'end',
  //               align: 'bottom',
  //               color: 'white', // Set font color to white
  //               font: {
  //                 weight: 'bold', // Set font weight to bold
  //                 size: 16, // Set font weight to bold
  //               },
  //               formatter: (value: any, context: any) => {
  //                 return value; // Displaying the value of the bar
  //               },
  //             },
  //           },
  //           scales: {
  //             x: {
  //               stacked: false,
  //               title: {
  //                 display: true,
  //                 text: 'Provinces',
  //               },
  //             },
  //             y: {
  //               stacked: false,
  //               title: {
  //                 display: true,
  //                 text: 'Number of Beneficiaries',
  //               },
  //             },
  //           },
  //         },
  //       });
  //     },
  //     (error) => {
  //       console.error('Error occurred:', error);
  //     }
  //   );
  // }

  reachbyProvinceChart() {
    this.http.get(`${apiUrl}/Dashboard/province`).subscribe(
      (response: any) => {
        this.reachbyprovincedata = response;

        if (this.reachbyprovince) {
          this.reachbyprovince.destroy();
        }

        const labels = this.reachbyprovincedata.map(
          (item: { province: string }) =>
            item.province.charAt(0).toUpperCase() + item.province.slice(1)
        );

        // Extract reach values by gender
        const maleReach = this.reachbyprovincedata.map(
          (item: any) => item.male || 0
        );
        const femaleReach = this.reachbyprovincedata.map(
          (item: any) => item.female || 0
        );
        const otherReach = this.reachbyprovincedata.map(
          (item: any) => item.other || 0
        );

        // Create datasets dynamically and exclude "Other" if all values are 0
        const datasets = [
          {
            label: 'Male',
            data: maleReach,
            backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
          },
          {
            label: 'Female',
            data: femaleReach,
            backgroundColor: 'rgba(255, 99, 132, 0.7)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            borderRadius: 5,
          },
        ];

        // Only add "Other" if it has at least one non-zero value
        if (otherReach.some((value: number) => value > 0)) {
          datasets.push({
            label: 'Other',
            data: otherReach,
            backgroundColor: 'rgba(255, 206, 86, 0.7)', // Yellow
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            borderRadius: 5,
          });
        }

        this.reachbyprovince = new Chart('reachbyprovince', {
          type: 'bar',
          data: {
            labels: labels,
            datasets: datasets, // Dynamically generated datasets
          },
          options: {
            indexAxis: 'x',
            responsive: true,
            plugins: {
              datalabels: {
                anchor: 'end',
                align: 'bottom',
                color: 'white',
                font: {
                  weight: 'bold',
                  size: 16,
                },
                formatter: (value: any) => value,
              },
            },
            scales: {
              x: {
                stacked: true, // Enable stacking
                title: {
                  display: true,
                  text: 'Provinces',
                },
              },
              y: {
                stacked: true, // Enable stacking
                title: {
                  display: true,
                  text: 'Number of Beneficiaries',
                },
              },
            },
          },
        });
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  // reachbyDistrictChart() {
  //   this.http.get(`${apiUrl}/Dashboard/district`).subscribe(
  //     (response: any) => {
  //       this.reachbydistrictdata = response;

  //       if (this.reachbydistrict) {
  //         this.reachbydistrict.destroy();
  //       }

  //       const labels = this.reachbydistrictdata.map(
  //         (item: { district: any }) => {
  //           const district = item.district;
  //           return district.charAt(0).toUpperCase() + district.slice(1);
  //         }
  //       );
  //       // Assuming 'district' is the property name in the object
  //       const reachValues = this.reachbydistrictdata.map(
  //         (item: { reach: any }) => item.reach
  //       ); // Assuming 'reach' is the property name in the object

  //       this.reachbydistrict = new Chart('reachbydistrict', {
  //         type: 'bar',
  //         data: {
  //           labels: labels,
  //           datasets: [
  //             {
  //               label: 'Reach',
  //               data: reachValues,
  //               backgroundColor: 'rgba(54, 162, 235, 0.5)',
  //               borderColor: 'rgba(54, 162, 235, 1)',
  //               borderWidth: 1,
  //               borderRadius: 5,
  //             },
  //           ],
  //         },
  //         options: {
  //           indexAxis: 'x',
  //           plugins: {
  //             datalabels: {
  //               anchor: 'end',
  //               align: 'bottom',
  //               color: 'white', // Set font color to white
  //               font: {
  //                 weight: 'bold', // Set font weight to bold
  //                 size: 16, // Set font weight to bold
  //               },
  //               formatter: (value: any, context: any) => {
  //                 return value; // Displaying the value of the bar
  //               },
  //             },
  //           },
  //           scales: {
  //             x: {
  //               stacked: false,
  //               title: {
  //                 display: true,
  //                 text: 'Districts',
  //               },
  //             },
  //             y: {
  //               stacked: false,
  //               title: {
  //                 display: true,
  //                 text: 'Number of Beneficiaries',
  //               },
  //             },
  //           },
  //         },
  //       });
  //     },
  //     (error) => {
  //       console.error('Error occurred:', error);
  //     }
  //   );
  // }

  reachbyDistrictChart() {
    this.http.get(`${apiUrl}/Dashboard/district`).subscribe(
      (response: any) => {
        this.reachbydistrictdata = response;

        if (this.reachbydistrict) {
          this.reachbydistrict.destroy();
        }

        const labels = this.reachbydistrictdata.map(
          (item: { district: string }) => {
            const district = item.district;
            return district.charAt(0).toUpperCase() + district.slice(1);
          }
        );

        // Extract reach values by gender
        const maleReach = this.reachbydistrictdata.map(
          (item: any) => item.male || 0
        );
        const femaleReach = this.reachbydistrictdata.map(
          (item: any) => item.female || 0
        );
        const otherReach = this.reachbydistrictdata.map(
          (item: any) => item.other || 0
        );

        // Create datasets dynamically and exclude "Other" if all values are 0
        const datasets = [
          {
            label: 'Male',
            data: maleReach,
            backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
          },
          {
            label: 'Female',
            data: femaleReach,
            backgroundColor: 'rgba(255, 99, 132, 0.7)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            borderRadius: 5,
          },
        ];

        // Only add "Other" if it has at least one non-zero value
        if (otherReach.some((value: number) => value > 0)) {
          datasets.push({
            label: 'Other',
            data: otherReach,
            backgroundColor: 'rgba(255, 206, 86, 0.7)', // Yellow
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            borderRadius: 5,
          });
        }

        this.reachbydistrict = new Chart('reachbydistrict', {
          type: 'bar',
          data: {
            labels: labels,
            datasets: datasets, // Dynamically generated datasets
          },
          options: {
            indexAxis: 'x',
            responsive: true,
            plugins: {
              datalabels: {
                anchor: 'end',
                align: 'bottom',
                color: 'white',
                font: {
                  weight: 'bold',
                  size: 16,
                },
                formatter: (value: number) => value, // Displaying the value of the bar
              },
            },
            scales: {
              x: {
                stacked: true, // Enable stacking
                title: {
                  display: true,
                  text: 'Districts',
                },
              },
              y: {
                stacked: true, // Enable stacking
                title: {
                  display: true,
                  text: 'Number of Beneficiaries',
                },
              },
            },
          },
        });
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  reachbyGender(male: any, female: any) {
    if (this.reachbyvc) {
      this.reachbydistrict.destroy();
    }

    this.reachbyvc = new Chart('reachbyvc', {
      type: 'bar',
      data: {
        labels: ['Male', 'Female'],
        datasets: [
          {
            label: 'Reach',
            data: [male, female],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
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
              text: 'Gender',
            },
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: 'Number of Beneficiaries',
            },
          },
        },
      },
    });
  }
  // reachbyVCChart() {
  //   this.http.get(`${apiUrl}/Dashboard/valuechain`)
  //     .subscribe(
  //       (response: any) => {
  //         this.reachbydistrictdata = response;

  //         if (this.reachbydistrict) {
  //           this.reachbydistrict.destroy();
  //         }

  //         const labels = this.reachbydistrictdata.map((item: { district: any; }) => item.district); // Assuming 'district' is the property name in the object
  //         const reachValues = this.reachbydistrictdata.map((item: { reach: any; }) => item.reach); // Assuming 'reach' is the property name in the object

  //         this.reachbydistrict = new Chart('monthchart', {
  //           type: 'bar',
  //           data: {
  //             labels: labels,
  //             datasets: [
  //               {
  //                 label: 'Reach',
  //                 data: reachValues,
  //                 backgroundColor: 'rgba(54, 162, 235, 0.5)',
  //                 borderColor: 'rgba(54, 162, 235, 1)',
  //                 borderWidth: 1
  //               }
  //             ]
  //           },
  //           options: {
  //             indexAxis: 'x',
  //             scales: {
  //               x: {
  //                 stacked: false,
  //                 title: {
  //                   display: true,
  //                   text: 'Districts'
  //                 }
  //               },
  //               y: {
  //                 stacked: false,
  //                 title: {
  //                   display: true,
  //                   text: 'Reach'
  //                 }
  //               }
  //             }
  //           }
  //         });
  //       },
  //       (error) => {
  //         console.error("Error occurred:", error);
  //       }
  //     );
  // }
}
