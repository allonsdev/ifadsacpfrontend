import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'projectmenu',
  templateUrl: './projectmenu.element.html'
})
export class ProjectmenuElement implements OnInit {

  menuItems: any[] = []; // Replace 'any[]' with your specific menu item type
  currentUser: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getMenu();
  }

  getMenu(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.menuItems = this.currentUser.submenu;
  }

  isParent(menuItem: any): boolean {
    return this.menuItems.some(item => item.parentId === menuItem.id);
  }

  getChildItems(menuItem: any): any[] {
    return this.menuItems.filter(item => item.parentId === menuItem.id);
  }
}

