import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import * as data from '../../../assets/Lookuplist.json';

declare interface DataTableSettings {
  pagingType: string;
  pageLength: number;
  processing: boolean;
  lengthMenu: number[];
  dom: string;
  
}

const apiUrl = environment.apiUrl;
@Component({
  selector: 'manageparameters',
  templateUrl: './manageparameters.component.html'
})
export class ManageparametersComponent implements OnInit {
  currentUser: any;

  parameters: any[] = [];
  dataTable: any;
  selectedParameter: any;
  isModalOpen: boolean = false;

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getParameters();
  }

  private getParameters() {
    this.parameters = (data as any).default.sort((a: { ListName: string; }, b: { ListName: string; }) => {
      const listNameA = a.ListName.toUpperCase();
      const listNameB = b.ListName.toUpperCase();

      if (listNameA < listNameB) {
        return -1;
      }
      if (listNameA > listNameB) {
        return 1;
      }
      return 0;
    });

    setTimeout(() => {
      this.dataTable = $('#dtParameters').DataTable(<DataTableSettings>{
        pagingType: 'full_numbers',
        pageLength: 10,
        processing: true,
        lengthMenu: [5, 10, 25],
        order: [[16, "desc"]],
        dom: 'frtip',
        
      });
    }, 1);
  }

  openModal(parameter: any) {
    this.selectedParameter = parameter;
  }
}

