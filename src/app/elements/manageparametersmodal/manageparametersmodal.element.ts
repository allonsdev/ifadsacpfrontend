import { Component, Input, DoCheck, SimpleChanges, KeyValueDiffers } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

export class Parameter {
  ListName: string = '';
  ListDescription: string = '';
  SelectQuery: string = '';
  TableName: string = '';
  PrimaryKey: string = '';
}

interface DynamicForm {
  [key: string]: any; // Or define specific types for each column if known
}
const apiUrl = environment.apiUrl;
@Component({
  selector: 'manageparametersmodal',
  templateUrl: './manageparametersmodal.element.html'
})
export class ManageparametersmodalElement implements DoCheck {
  @Input() parameter: Parameter = new Parameter();
  data: any[] = [];
  columns: any[] = [];
  dynamicForm!: FormGroup;
  filteredData: any[] = [];

  private apiUrl = apiUrl + '/Parameter';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private differ: any;
  ListName: any | undefined = undefined;
  constructor(private http: HttpClient, private formBuilder: FormBuilder, private differs: KeyValueDiffers) {
    this.differ = this.differs.find(this.parameter).create();
  }

  ngDoCheck() {
    const changes = this.differ.diff(this.parameter);
    if (changes) {
      this.getAllParameters();

      this.ListName = this.parameter.ListName
      // changes.forEachChangedItem((changedItem: any) => {
      //   
      //   this.ListName = changedItem.ListName
      // });
    }
  }

  createForm(): void {
    const formGroupConfig: { [key: string]: any } = {};

    this.columns.forEach(column => {
      // Check if the column is the primary key field
      if (column === this.parameter.PrimaryKey) {
        formGroupConfig[column] = [''];
      } else {
        formGroupConfig[column] = ['', Validators.required]; // Add required validator for non-primary key fields
      }
    });

    this.dynamicForm = this.formBuilder.group(formGroupConfig);
    const primaryKeyField = this.dynamicForm.get(this.parameter.PrimaryKey);
    if (primaryKeyField) {
      primaryKeyField.disable();
    }
  }


  onSubmit(): void {
    if (this.dynamicForm.valid) {
      const formValues = this.dynamicForm.value;
      this.http.post(`${this.apiUrl}/${this.parameter.TableName}`, formValues, this.httpOptions)
        .subscribe(
          (response: any) => {
            this.getAllParameters();
            Swal.fire({
              icon: "success",
              title: "Lookup List",
              text: "Records Saved Successfully",
            });
          },
          (error) => {
            console.error("Error occurred:", error);
            Swal.fire({
              icon: "error",
              title: "Lookup List",
              text: "Error while saving record",
            });
          }
        );
    }
  }

  getAllParameters(): void {
    this.http.post(this.apiUrl, this.parameter, this.httpOptions)
      .subscribe(
        (response: any) => {

          if (Array.isArray(response)) {
            // If the response is an array, it contains columns
            this.columns = response;

            this.createForm();
          } else {
            // If the response is not an array, it's the actual data
            this.data = JSON.parse(response);
            this.columns = Object.keys(this.data[0]); // Assuming the first object contains column names

            this.createForm();
            this.filteredData = this.data.filter(item =>
              Object.values(item).some(value => value !== null && value !== undefined)
            );
          }
        },
        (error) => {
          console.error("Error occurred:", error);
          Swal.fire({
            icon: "error",
            title: "Group",
            text: "Error while saving record",
          });
        }
      );
  }


  deleteItem(id: any): void {
    const requestBody = { id: id, primaryKey: this.parameter.PrimaryKey };
    this.http.post(`${this.apiUrl}/${this.parameter.TableName}/delete`, requestBody, this.httpOptions)
      .subscribe(
        () => {
          this.getAllParameters();
          Swal.fire({
            icon: "success",
            title: "Parameter",
            text: "Records Deleted Successfully",
          });
        },
        (error) => {
          console.error(error)
          Swal.fire({
            icon: "error",
            title: "Group",
            text: "Error while deleting record",
          });
        }
      );
  }


}
