import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-admin-live-call-dashboard',
  templateUrl: './admin-live-call-dashboard.component.html',
  styleUrls: ['./admin-live-call-dashboard.component.css']
})
export class AdminLiveCallDashboardComponent implements OnInit {

  liveCallList = [];
  columnDefs: any;
  dataSource: any = [];
  errors = '';
  rowData: any;
  defaultPageSize = '10'; 
  ResellerID:any;
  role:any;

  constructor(
    private dashboardService: DashboardService
  ) {

  }

  ngOnInit() {
    this.getLiveCallRecord();
  }
  public getLiveCallRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'callerid', headerName: 'Caller ID', hide: false, width: 15 },
      { field: 'src', headerName: 'Caller', hide: false, width: 12 },
      { field: 'dst', headerName: 'Callee', hide: false, width: 12 },
      { field: 'forward', headerName: 'Forward', hide: false, width: 12 },
      { field: 'start_time', headerName: 'Start Time', hide: false, width: 12 },
      { field: 'bridge_time', headerName: 'Call Duration', hide: false, width: 10 },
      { field: 'clr_read_codec', headerName: 'Caller Codecs', hide: false, width: 15 },
      { field: 'cle_read_codec', headerName: 'Callee Codecs', hide: false, width: 15 },
    ];
    this.ResellerID = localStorage.getItem('id')
    this.role = localStorage.getItem('type')
    
    // this.dashboardService.getCustomerCallingnfo().subscribe((calllData: any) => {
      if (this.role == '3' || this.role == 3 ) {
        this.dashboardService.getResellerCallinginfo(this.role,this.ResellerID).subscribe((calllData: any) => {
          this.liveCallList = calllData;
          calllData = this.manageUserActionBtn(calllData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': calllData });
        });
      }
      else{
        this.dashboardService.getCustomerCallingnfo().subscribe((calllData: any) => {
          this.liveCallList = calllData;
          calllData = this.manageUserActionBtn(calllData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': calllData });
        });
      }
  }
  manageUserActionBtn(pagedData) {
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
}

