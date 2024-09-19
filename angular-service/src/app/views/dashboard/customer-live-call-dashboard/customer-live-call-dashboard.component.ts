import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { takeUntil } from 'rxjs/operators';
// @ts-ignore
import moment from 'moment';

@Component({
  selector: 'app-customer-live-call-dashboard',
  templateUrl: './customer-live-call-dashboard.component.html',
  styleUrls: ['./customer-live-call-dashboard.component.css']
})
export class CustomerLiveCallDashboardComponent implements OnInit {

  liveCallList = [];
  columnDefs: any;
  dataSource: any = [];
  errors = '';
  rowData: any;
  public __callInfoSubscription;
  ngUnsubscribe = new Subject();
  defaultPageSize = '10'; 

  reinitializeTable: boolean = false;

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.getLiveCallRecord(true);
    this.getLiveCallRecord();
  }

  public getLiveCallRecord(refreshCalls = false) {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 150 },
      { field: 'callerid', headerName: 'Caller ID' , width : 150, hide: false},
      { field: 'src', headerName: 'Caller', hide: false, width: 150 },
      { field: 'dst', headerName: 'Callee', hide: false, width: 150 },
      { field: 'forward', headerName: 'Forward', hide: false, width: 150 },
      { field: 'start_time', headerName: 'Start Time', hide: false, width: 150 },
      { field: 'bridge_time', headerName: 'Call Duration', hide: false, width: 150 },
      // { field: 'codec', headerName: 'Caller Codecs', hide: false, width: 15 },
      // { field: 'codec', headerName: 'Callee Codecs', hide: false, width: 15 },
      { field: 'clr_read_codec', headerName: 'Caller Read Codec', width : 150, hide: false },
      { field: 'clr_write_codec', headerName: 'Caller Write Codec' , width : 150, hide: false},
      { field: 'cle_read_codec', headerName: 'Callee Read Codec', hide: false, width : 150, resizable: false },
      { field: 'cle_write_codec', headerName: 'Callee Write Codec' , width : 150, hide: false},
    ];

    const customerId = localStorage.getItem('id');
    // debugger
    this.__callInfoSubscription  =  this.dashboardService.getCustomerCallingnfo(customerId, refreshCalls)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe((callData: any) => {
      this.dataSource = [];
      this.dataSource.push({ fields: this.columnDefs, data: callData });
      if (callData.refreshCalls) {
        this.reinitializeTable = true;
      }
      setInterval(() => {
        callData.map((callItem, index) => {
          const seconds = callItem.bridge_time;
          if (callItem.end_time && callItem.bridge_time) {
            callData[index].bridge_time = new Date( seconds * 1000 ).toISOString().slice(11, 19);
          } else {
            const currentMomentDate = moment();
            const momentStartDate = moment(callItem.start_time, 'DD/MM/YYYY hh:mm:ss');
            const timeDifference = currentMomentDate.diff(momentStartDate, 'seconds');
            const secondsDiff = timeDifference + 1;
            callData[index].bridge_time = new Date( secondsDiff * 1000 ).toISOString().slice(11, 19);
          }
        });
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data: callData });
        this.reinitializeTable = false;
      }, 30000);
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  public refeshLiveCalls() {
    this.getLiveCallRecord(true);
  }

 

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.__callInfoSubscription.unsubscribe();
  }

  manageUserActionBtn(pagedData) {
  return pagedData;
  }
}
