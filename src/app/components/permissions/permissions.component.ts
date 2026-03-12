import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html'
})
export class PermissionsComponent implements OnInit {
  currentUser: any;

  commands: any;
  staffmembers: any;
  pages: any;
  selecteduser: number = 0;
  submenu: any;
  mainmenu: any;
  commandsarray: any[] = [];
  submenuarray: any[] = [];
  mainmenuarray: any[] = [];
  existingmaminmenu: any;
  existingsubmenu: any;
  existingcommands: any;
  submitmenu: any[] = [];
  submitsubmenu: any[] = [];
submenupermissionstbr: any;
mainmenupermissionstbr: any;
commandpermissionstbr: any;

  constructor(private http: HttpClient, authService: AuthService) { }
  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters()

  }

  async onselect() {
    this.getPermissions()

  }

  addParentIds(item: any, array: number[], menu: any[]): void {
    if (item && (item.parentId !== null)) {
      array.push(item.parentId);
      const parentItem = menu.find((parent: { id: any; }) => parent.id === item.parentId);
      this.addParentIds(parentItem, array, menu);
    }
  }

  // Function to handle selection in the main menu
  mainMenuSelectionChanged(): void {
    this.mainmenuarray.forEach(element => {
      const item = this.mainmenu.find((i: { id: any; }) => i.id === element);
      this.addParentIds(item, this.mainmenuarray, this.mainmenu);
    });
  }

  projectMenuSelectionChanged(): void {
    this.submenuarray.forEach(element => {
      const item = this.submenu.find((i: { id: any; }) => i.id === element);
      this.addParentIds(item, this.submenuarray, this.submenu);
    });
  }

  removemenupermissions() {
    this.removePermissions('mainmenu', this.mainmenupermissionstbr)
  }
  removesubmenupermissions() {
    this.removePermissions('submenu', this.submenupermissionstbr)
  }
  removecommandpermissions() {
    this.removePermissions('command', this.commandpermissionstbr)
  }

  getPermissions(): void {
    this.http.get(`${apiUrl}/Permissions/${this.selecteduser}`)
      .subscribe(
        (response: any) => {

          this.existingmaminmenu = response.menuItemIds;
          this.existingsubmenu = response.subMenuItemIds;
          this.existingcommands = response.commandIds;
          this.mainmenu = response.remainingMenu
          this.commands = response.remainingCommands,
            this.submenu = response.remainingSubMenu

        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  saveMainMenuPermissions() {
    if (this.selecteduser > 0) {

      Swal.fire({
        title: 'Saving Permissions',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      } as SweetAlertOptions);

      this.mainMenuSelectionChanged();
      let extractedIds: number[] = this.existingmaminmenu.map((item: { id: any; }) => item.id);
      this.submitmenu = [...this.mainmenuarray, ...extractedIds];
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.post<any>(`${apiUrl}/Permissions/mainmenu/${this.selecteduser}`, this.submitmenu, { headers }).subscribe(
        (response) => {
          // Close loading spinner on success
          Swal.close();
          this.getPermissions()
          Swal.fire({
            icon: 'success',
            title: 'Users',
            text: 'Permissions saved successfully.',
          });
        },
        (error) => {
          // Close loading spinner on error
          Swal.close();

          ;
          Swal.fire({
            icon: 'error',
            title: 'Users',
            text: 'Error while saving permissions.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Users',
        text: 'Please select User!',
      });
    }
  }


  saveSubMenuPermissions() {
    if (this.selecteduser > 0) {
      // Show Swal with loading spinner
      Swal.fire({
        title: 'Saving Permissions',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      } as SweetAlertOptions);

      this.projectMenuSelectionChanged();
      let extractedIds: any[] = this.existingsubmenu.map((item: { id: any; }) => item.id);

      this.submitsubmenu = [...this.submenuarray, ...extractedIds];

      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.post<any>(`${apiUrl}/Permissions/submenu/${this.selecteduser}`, this.submitsubmenu, { headers }).subscribe(
        (response) => {
          // Close Swal on success
          Swal.close();
          this.getPermissions()
          Swal.fire({
            icon: 'success',
            title: 'Users',
            text: 'Permissions saved successfully.',
          });
        },
        (error) => {
          // Close Swal on error
          Swal.close();

          ;
          Swal.fire({
            icon: 'error',
            title: 'Users',
            text: 'Error while saving permissions.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Users',
        text: 'Please select User!',
      });
    }
  }

  saveCommandPermissions() {
    if (this.selecteduser > 0) {
      Swal.fire({
        title: 'Saving Permissions',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      } as SweetAlertOptions);
      let extractedIds: any[] = this.existingcommands.map((item: { id: any; }) => item.id);
      this.commandsarray = [...this.commandsarray, ...extractedIds];

      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.post<any>(`${apiUrl}/Permissions/command/${this.selecteduser}`, this.commandsarray, { headers }).subscribe(
        (response) => {
          // Close Swal on success
          Swal.close();
          this.getPermissions()
          Swal.fire({
            icon: 'success',
            title: 'Users',
            text: 'Permissions saved successfully.',
          });
        },
        (error) => {
          // Close Swal on error
          Swal.close();

          ;
          Swal.fire({
            icon: 'error',
            title: 'Users',
            text: 'Error while saving permissions.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Users',
        text: 'Please select User!',
      });
    }
  }

  removePermissions(permissionType: string, permissionsArray: any) {
    if (this.selecteduser > 0) {
      Swal.fire({
        title: 'Removing Permissions',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      } as SweetAlertOptions);

      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.delete<any>(`${apiUrl}/Permissions/${permissionType}/${this.selecteduser}`, { headers, body: permissionsArray }).subscribe(
        (response) => {
          // Close Swal on success
          Swal.close();
          this.getPermissions();
          Swal.fire({
            icon: 'success',
            title: 'Users',
            text: 'Permissions removed successfully.',
          });
        },
        (error) => {
          // Close Swal on error
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Users',
            text: 'Error while removing permissions.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Users',
        text: 'Please select User!',
      });
    }
  }

  getAllParameters(): void {

    this.http.get(`${apiUrl}/User`)
      .subscribe(
        (response: any) => {
          this.staffmembers = response
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }
}
