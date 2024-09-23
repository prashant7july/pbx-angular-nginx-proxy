import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { DashboardService } from '../dashboard.service';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-customer-realtime-dashboard',
  templateUrl: './admin-customer-realtime-dashboard.component.html',
  styleUrls: ['./admin-customer-realtime-dashboard.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
}) 
export class AdminCustomerRealtimeDashboardComponent implements OnInit {
  // dataSource = ELEMENT_DATA;
  columnsToDisplay = ['dropdown','first_name','registered_extension','live_call','balance'];
  //  columnsToDisplay = ['Customer ID', 'Customer Name', 'Registered Extension', 'Total Registered Extension', 'Live Calls','Current Balance'];
  expandedElement: any | null;

  customerInfo = [];
  liveCallList = [];
  loading: boolean = false;
  responseData : any ;
  user_data : number;
  public __callInfoSubscription ;

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.getCustomerInfo(); 
    
  }


  public getCustomerInfo() {
    let role = localStorage.getItem('type');
    let ResellerID = localStorage.getItem('id');
    this.dashboardService.getCustomerFullInfo(role,ResellerID).subscribe((pagedData:any) => { 
      let extDATA;
      let managedArray ;
      if(pagedData){
        managedArray = pagedData.map( (item) => {
          let obj = item;    
          this.dashboardService.getCustomerExtensionInfo(obj['id']).subscribe( data => {
            extDATA =  data;     
            obj['total_extensions'] =extDATA ? extDATA['total_extensions'] : 0 ;
            obj['registered_extensions'] =  extDATA ? extDATA['total_registered_extensions'] : 0;
          },(er)=>{
            console.log(er);            
          });            
          this.loading = true;
          let customerId = obj['id'];
          this.__callInfoSubscription  = this.dashboardService.getCustomerCallingnfo(customerId, true).subscribe((pagedData: any) => {
            this.liveCallList = pagedData;
            
            item['live_call'] = this.liveCallList.length;
            this.loading = false;
          });                              
         return obj
        });
      }
      this.customerInfo = managedArray;
      
      
    });
  }

  // public callingTime(){
    
  // }
  
  public getRecord(data, item) {
    this.loading = true;
    let customerId = data['id'];
    this.__callInfoSubscription  = this.dashboardService.getCustomerCallingnfo(customerId, true).subscribe((pagedData: any) => {
      this.liveCallList = pagedData;
      
      this.customerInfo['live_call'] = this.liveCallList.length;
      
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if(this.__callInfoSubscription) this.__callInfoSubscription.unsubscribe();
  }

}
