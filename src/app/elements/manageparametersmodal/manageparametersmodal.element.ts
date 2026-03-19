import { Component, Input, DoCheck, KeyValueDiffers } from '@angular/core';
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
  isEditMode: boolean = false;           // ← NEW: tracks whether we're editing
  editingId: any = null;                 // ← NEW: stores the PK value being edited

  private apiUrl = apiUrl + '/Parameter';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private differ: any;
  ListName: any | undefined = undefined;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private differs: KeyValueDiffers
  ) {
    this.differ = this.differs.find(this.parameter).create();
  }

  ngDoCheck() {
    const changes = this.differ.diff(this.parameter);
    if (changes) {
      this.getAllParameters();
      this.ListName = this.parameter.ListName;
    }
  }

  createForm(): void {
    const formGroupConfig: { [key: string]: any } = {};
    this.columns.forEach(column => {
      if (column === this.parameter.PrimaryKey) {
        formGroupConfig[column] = [''];
      } else {
        formGroupConfig[column] = ['', Validators.required];
      }
    });
    this.dynamicForm = this.formBuilder.group(formGroupConfig);
    const primaryKeyField = this.dynamicForm.get(this.parameter.PrimaryKey);
    if (primaryKeyField) {
      primaryKeyField.disable();
    }
  }

  // ─── NEW: populate form with a row's data for editing ───────────────────────
  editItem(item: any): void {
    this.isEditMode = true;
    this.editingId = item[this.parameter.PrimaryKey];

    // Patch all column values into the form
    const patchValues: { [key: string]: any } = {};
    this.columns.forEach(column => {
      patchValues[column] = item[column];
    });
    this.dynamicForm.patchValue(patchValues);

    // Scroll to the form so the user sees it populated
    const formEl = document.getElementById('parameterForm');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── NEW: clear form back to "Add" mode ─────────────────────────────────────
  cancelEdit(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.dynamicForm.reset();
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      const formValues = this.dynamicForm.getRawValue(); // getRawValue includes disabled fields

      if (this.isEditMode && this.editingId !== null) {
        // ─── UPDATE (PUT) ────────────────────────────────────────────────────
        const updateBody = {
          primaryKey: this.parameter.PrimaryKey,
          id: this.editingId,
          fields: formValues   // all column values
        };

        this.http.post(
          `${this.apiUrl}/${this.parameter.TableName}/update`,  // ← POST not PUT
          updateBody,
          this.httpOptions
        ).subscribe(
          () => {
            this.getAllParameters();
            this.cancelEdit();
            Swal.fire({ icon: 'success', title: 'Lookup List', text: 'Record Updated Successfully' });
          },
          (error) => {
            console.error('Error occurred:', error);
            Swal.fire({ icon: 'error', title: 'Lookup List', text: 'Error while updating record' });
          }
        );
      } else {
        // ─── INSERT (POST) ───────────────────────────────────────────────────
        const insertBody = {
          ...formValues,
          __primaryKey: this.parameter.PrimaryKey   // ← add this
        };

        this.http.post(
          `${this.apiUrl}/${this.parameter.TableName}`,
          insertBody,
          this.httpOptions
        ).subscribe(
          () => {
            this.getAllParameters();
            this.cancelEdit();
            Swal.fire({
              icon: 'success',
              title: 'Lookup List',
              text: 'Records Saved Successfully',
            });
          },
          (error) => {
            console.error('Error occurred:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lookup List',
              text: 'Error while saving record',
            });
          }
        );
      }
    }
  }

  getAllParameters(): void {
    this.http.post(this.apiUrl, this.parameter, this.httpOptions)
      .subscribe(
        (response: any) => {
          if (Array.isArray(response)) {
            this.columns = response;
            this.createForm();
          } else {
            this.data = JSON.parse(response);
            this.columns = Object.keys(this.data[0]);
            this.createForm();
            this.filteredData = this.data.filter(item =>
              Object.values(item).some(value => value !== null && value !== undefined)
            );
          }
        },
        (error) => {
          console.error('Error occurred:', error);
          Swal.fire({
            icon: 'error',
            title: 'Group',
            text: 'Error while loading records',
          });
        }
      );
  }

  deleteItem(id: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This record will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    }).then((result) => {
      if (result.isConfirmed) {
        const requestBody = { id: id, primaryKey: this.parameter.PrimaryKey };
        this.http.post(
          `${this.apiUrl}/${this.parameter.TableName}/delete`,
          requestBody,
          this.httpOptions
        ).subscribe(
          () => {
            this.getAllParameters();
            if (this.editingId === id) this.cancelEdit(); // clear form if deleting the item being edited
            Swal.fire({ icon: 'success', title: 'Parameter', text: 'Record Deleted Successfully' });
          },
          (error) => {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Group', text: 'Error while deleting record' });
          }
        );
      }
    });
  }
}