import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.element.html'
})
export class SidebarElement implements OnInit {

  menuItems: any[] = [];
  currentUser: any;

  constructor(private router: Router) { }

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

  isMenuItemActive(menuItem: any): boolean {
    const currentUrl = this.router.url.split('?')[0]; // strip query params
    const children = this.getChildItems(menuItem);
    return children.some(child => {
      if (this.isParent(child)) {
        return this.isMenuItemActive(child);
      }
      // ✅ Use exact string match instead of router.isActive()
      return child.url && currentUrl === child.url;
    });
  }
}