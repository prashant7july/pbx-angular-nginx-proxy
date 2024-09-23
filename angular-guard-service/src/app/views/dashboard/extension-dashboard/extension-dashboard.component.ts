import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { UserService } from '../../../core';
import { CdrService } from '../../cdr/cdr.service';

@Component({
  selector: 'app-extension-dashboard',
  templateUrl: './extension-dashboard.component.html',
  styleUrls: ['./extension-dashboard.component.css']
})

export class ExtensionDashboardComponent implements OnInit {
  speeddialValue = "";
  callForwardValue: any = {};
  featuresValue: any = {};
  voiceMailValue: any = {};
  errors = '';
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  disableCallForward = false;
  disableSpeeddial = false;
  disableVoicemail = false;



  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private userService: UserService,
    private cdrService: CdrService,
  ) {
  }

  ngOnInit() {
    if(localStorage.getItem('type') != '6'){
      this.userService.purgeAuth();
      let ip = localStorage.getItem('ip');
      window.localStorage.clear();
      localStorage.setItem('ip', ip);
    this.router.navigateByUrl('/auth/login');
    }
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'startTime', headerName: 'Start Time', hide: false, width: 15 },
      { field: 'endTime', headerName: 'End Time', hide: false, width: 15 },
      { field: 'src', headerName: 'Caller', hide: true, width: 15 },
      { field: 'dispDst', headerName: 'Callee', hide: false, width: 15 },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: true, width: 15 },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, width: 10 },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, width: 10 },
      { field: 'dnid', headerName: 'DNID', hide: true, width: 10 },
      { field: 'sellCost', headerName: 'Buy Cost', hide: false, width: 10 },
      { field: 'callCost', headerName: 'Call Cost', hide: false, width: 10 },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: true, width: 10 },
      { field: 'dispDestination', headerName: 'Country', hide: false, width: 15 },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: true, width: 10 },
      { field: 'uuid', headerName: 'UUID', hide: true, width: 20 },
    ];
    var id = localStorage.getItem("id");
    //call reports
    this.cdrService.getExtensionCdrInfo(id).subscribe(pagedData => {
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    });
    //get speeddial
    this.dashboardService.getExtensionDashboardSpeeddial(localStorage.getItem('id')).subscribe(data => {
      this.speeddialValue = data.response ? data.response : null;
    }, err => {
      this.errors = err.message;
    });

    //get callforward
    this.dashboardService.getExtensionDashboardCallForward(localStorage.getItem('id')).subscribe(data => {
      this.callForwardValue = data.response[0] ? data.response[0]: null;
    }, err => {
      this.errors = err.message;
    });

    //get extension features
    this.dashboardService.getExtensionDashboardFeatures(localStorage.getItem('id')).subscribe(data => {
      // console.log(data);
      this.featuresValue = data ? data: null;
      this.disableCallForward = data.forward == '1' ? true :false;
      this.disableSpeeddial = data.speed_dial == '1' ? true :false;
      this.disableVoicemail = data.voicemail == '1' ? true :false;
    }, err => {
      this.errors = err.message;
    });

    //get voicemail
    this.dashboardService.getExtensionDashboardVoiceMail(localStorage.getItem('id')).subscribe(data => {
      // console.log(data);
      this.voiceMailValue = data.response[0] ? data.response[0]: null;
    }, err => {
      this.errors = err.message;
    });
  }

  showSpeeddial() {
    this.router.navigate(['speedDial/speedDialFeatures'], { queryParams: { id: localStorage.getItem('id') } });
  }
  showVoicemail() {
    this.router.navigate(['voicemail/settings'], { queryParams: { id: localStorage.getItem('id') } });
  }
  showCallForward() {
    this.router.navigate(['callForward/features'], { queryParams: { id: localStorage.getItem('id') } });
  }
  showExtensionFeatures() {
    this.router.navigate(['extensionSettings/create'], { queryParams: { id: localStorage.getItem('id') } });
  }

  manageAction(e) {
    let data = e.data;
    return this.showCdr(e.data);
  }

  showCdr(event) {
    this.router.navigateByUrl('cdr/extension-cdr');
  }
}
