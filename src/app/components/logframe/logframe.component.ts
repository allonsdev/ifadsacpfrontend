import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}
const apiUrl = environment.apiUrl;
@Component({
  selector: 'app-logframe',
  templateUrl: './logframe.component.html',
  styleUrls: ['./logframe.component.css']
})
export class LogframeComponent implements OnInit {

  cols!: Column[];
  data: any;
  exportColumns: any;

  constructor(private http: HttpClient) { }
  ngOnInit() {
    this.cols = [
      { field: 'objective', header: 'Objectives' },
      { field: 'outcome', header: 'Outcomes' },
      { field: 'output', header: 'Outputs' },
      { field: 'activity', header: 'Activities' }
    ];

  this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

  this.fetchData()
  }

  fetchData() {
    this.http.get<any>(apiUrl + '/Project/logframe').subscribe(
      (response: any) => {
        var data = response
        this.data = data
        console.log(this.data);
        this.cols = [
          { field: 'objective', header: 'objective' },
          { field: 'outcome', header: 'outcome' },
          { field: 'output', header: 'output' },
          { field: 'activity', header: 'activity' },
      ];
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.data);
        doc.save('Logframe.pdf');
      });
    });
  }
}
