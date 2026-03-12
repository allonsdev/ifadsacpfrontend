import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.element.html'
})
export class SidebarElement implements OnInit {

  menuItems: any[] = []; // Replace 'any[]' with your specific menu item type
  currentUser: any;

  constructor() { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getMenu();
  }

  getMenu(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.menuItems = this.currentUser.mainmenu;
  }

  isParent(menuItem: any): boolean {
    return this.menuItems.some(item => item.parentId === menuItem.id);
  }

  isExternalLink(url: string): boolean {
    return url.startsWith('http') || url.startsWith('https');
  }

  getChildItems(menuItem: any): any[] {
    return this.menuItems.filter(item => item.parentId === menuItem.id);
  }
}

