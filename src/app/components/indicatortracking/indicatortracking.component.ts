import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { environment } from '../../environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

interface Column {
  field: string;
  header: string;
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'indicatortracking',
  templateUrl: './indicatortracking.component.html'
})
export class IndicatortrackingComponent implements OnInit {
  dataTable: any;
  data!: any[];
  cols!: Column[];
  childcols: any;
  files:any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getIndicators();
  }
  getIndicators() {

    const apiEndpoint = `${apiUrl}/Indicator/tracking`;

    Swal.fire({
      title: 'Loading data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    } as SweetAlertOptions);

    this.http.get<any[]>(apiEndpoint).subscribe(
      (response: any) => {
        var data = [...response]
        this.data = data
        console.log(this.data);
        Swal.close();
        this.cols = [
          { field: 'name', header: 'Name' },
          { field: 'size', header: 'Size' },
          { field: 'type', header: 'Type' }
      ];

      this.files = [
        {
            data: {
                name: 'Applications'
            },
            children: [
                {
                    data: {
                        
                        size: '25mb',
                        type: 'Folder'
                    },
                    children: [
                        {
                            data: {
                                name: 'angular.app',
                                size: '10mb',
                                type: 'Application'
                            }
                        },
                        {
                            data: {
                                name: 'cli.app',
                                size: '10mb',
                                type: 'Application'
                            }
                        },
                        {
                            data: {
                                name: 'mobile.app',
                                size: '5mb',
                                type: 'Application'
                            }
                        }
                    ]
                },
                {
                    data: {
                        name: 'editor.app',
                        size: '25mb',
                        type: 'Application'
                    }
                },
                {
                    data: {
                        name: 'settings.app',
                        size: '50mb',
                        type: 'Application'
                    }
                }
            ]
        }
    ];
        //this.cols = Object.keys(data[0]).map((key) => ({ field: key, header: key }));
        //this.childcols = Object.keys(data[0].ChildData[0]).map((key) => ({ field: key, header: key }));
        console.log(this.childcols,this.cols);
      },
      (error) => {
        Swal.close();
        console.error('Error fetching data:', error);
      }
    );
  }
}
