import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from './services/auth.service';
import { LastActivePageService } from './services/last-active-page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  currentUser: any;
  router: Router = new Router();
  idleState = "NOT_STARTED";

  constructor(private idle: Idle, cd: ChangeDetectorRef, private authService: AuthService,private lastActivePageService: LastActivePageService) {
    idle.setIdle(5);
    idle.setTimeout(600);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onTimeout.subscribe(() => {
      this.idleState = "TIMED_OUT";
      if(this.router.url !== ''){
        this.lastActivePageService.storeLastActivePage(this.router.url);
      }
      this.authService.logout();
    });
  }

  reset() {
    this.idle.watch();
    this.idleState = "NOT_IDLE";
  }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.reset();
  }
}
