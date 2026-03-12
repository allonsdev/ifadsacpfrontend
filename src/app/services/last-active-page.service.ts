import { Injectable } from '@angular/core'; 
  
@Injectable({ 
    providedIn: 'root'
}) 

export class LastActivePageService { 
    private lastActivePage: string | null = null; 
  
    constructor() { } 
  
    storeLastActivePage(url: string): void { 
        this.lastActivePage = url; 
    } 
  
    getLastActivePage(): string | null { 
        return this.lastActivePage; 
    } 
  
    clearLastActivePage(): void { 
        this.lastActivePage = null; 
    } 
}