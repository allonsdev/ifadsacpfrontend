import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
const apiUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class FileuploadService {
  constructor(private http: HttpClient) { }

  uploadFile(file: File, details: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileDetails', JSON.stringify(details));

    return this.http.post<any>(apiUrl + '/File', formData);
  }
}
