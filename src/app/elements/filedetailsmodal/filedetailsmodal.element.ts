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
import { FileuploadService } from '../../services/fileupload.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal, { SweetAlertOptions } from 'sweetalert2';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'filedetailsmodal',
  templateUrl: './filedetailsmodal.element.html',
})
export class FiledetailsmodalElement implements OnInit, OnChanges {
  users: any;
  selectedusers: any;
  selectedFile: any;
  fileType: string = '';
  title: string = '';
  author: string = '';
  authorOrganization: string = '';
  description: string = '';
  uploadDate: Date = new Date();
  applySecurity: boolean = false;
  fileTypes: any[] = [];
  apiUrl: any = apiUrl + '/Parameter';
  currentUser: any;
  items: any;
  selectedItems: any[] = [];
  selectAll = false;
  @Input() userLibrary?: Boolean = false;
  @Input() editid: number = 0;
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  file: any;

  constructor(
    private FileuploadService: FileuploadService,
    private http: HttpClient
  ) {}

  onSelectAllChange(event: any) {
    this.selectedItems = event.checked ? [...this.items] : [];
    this.selectAll = event.checked;
  }

  onChange(event: any) {
    const { originalEvent, value } = event;
    if (value) this.selectAll = value.length === this.items.length;
  }
  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;

    this.getAllParameters();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.userLibrary, this.editid);
    if (this.editid != 0 && this.userLibrary) {
      this.getitem();
    }
  }

  getitem() {
    this.http
      .get(`${apiUrl}/File/${this.editid}/${this.currentUser.staffId}`)
      .subscribe(
        (response: any) => {
          console.log('here', response);
          this.file = response;
          this.loadItem();
        },
        (error) => {
          console.error('Error occurred:', error);
        }
      );
  }

  loadItem() {
    console.log('here 2', this.file);
    this.fileType = this.file.fileType;
    this.title = this.file.title;
    this.author = this.file.author;
    this.authorOrganization = this.file.authorOrganization;
    this.description = this.file.description;
    this.uploadDate = this.file.uploadDate;
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }
  addpermmssions() {
    if (this.applySecurity === false) {
      this.selectedusers = [];
    }
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

  saveFile() {
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
      formData.append('objectTypeId', '0');
      formData.append('objectId', '0');
      formData.append('createdBy', this.currentUser.staffId);
      this.selectedItems.forEach((item) => {
        formData.append('filePermissions', item.value.toString());
      });

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

  getAllParameters(): void {
    this.http.get(`${this.apiUrl}/luFileTypes`).subscribe(
      (response: any) => {
        this.fileTypes = JSON.parse(response);
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
    this.http.get(`${apiUrl}/StaffMember/users`).subscribe(
      (response: any) => {
        this.users = response;
        this.items = response.map((item: any) => ({
          label: item.staffFullName,
          value: item.id,
        }));
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }

  submitFile() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put<any>(
        `${apiUrl}/File/Submit/${this.file.id}/${this.currentUser.staffId}`,
        { headers }
      )
      .subscribe(
        (response) => {
          this.refresh.emit();
          Swal.fire({
            icon: 'success',
            title: 'Files',
            text: 'File submitted for approval',
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Files',
            text: 'Error submitting file',
          });
        }
      );
  }
}
