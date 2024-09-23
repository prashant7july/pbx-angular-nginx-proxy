import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ProviderService } from '../../provider/provider.service';

@Component({
  selector: 'app-vendor-did-report',
  templateUrl: './vendor-did-report.component.html',
  styleUrls: ['./vendor-did-report.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class VendorDidReportComponent implements OnInit {

  columnsToDisplay = ['dropdown','name','mapped_did', 'total_did'];  //'mapped_did','unmapped_did','total_did'
  expandedElement: any | null;

  providerInfo = [];
  liveCallList = [];
  loading: boolean = false;
  public __callInfoSubscription ;

  constructor(
    private providerService: ProviderService,
  ) { }

  ngOnInit() {
    this.getCustomerInfo();
  }


  public getCustomerInfo() {
    let role = localStorage.getItem('type');
    let ResellerID = localStorage.getItem('id');
    this.providerService.viewProviderDetails(role,ResellerID).subscribe(pagedData => {
      
      let managedArray ;
      let AllData = [];
      if(pagedData){
        managedArray = pagedData.map( (item) => {
          let obj = item;
          console.log(obj,'---------------');
          
          let total_did = obj['did_status'] ? obj['did_status'].split(',') : [];
          let total_mapped_did = [];
          let total_un_mapped_did = [];
          let assigned_map_did = []
          obj['total_did'] = obj['did_id'] ? ((obj['did_id'].split(',')).length) : 0; 
          obj['did_customer_id'] = obj['did_customer_id'] ? (obj['did_customer_id'].split(',')) : []; 
                for (let i =0; i<obj['did_customer_id'].length; i++){
        if(obj['did_customer_id'][i] == 0)
        {
          obj['did_customer_id'].splice(i,1); 
            i--;
        }

      }
      let length = obj['did_customer_id'].length
          // total_mapped_did = total_did.filter(item=> item == '1');
          // obj['mapped_did'] = total_mapped_did.length;
          total_un_mapped_did = total_did.filter(item=> item != '1');
          obj['unmapped_did'] = total_un_mapped_did.length;
         return obj
        })
      }
      this.providerInfo = managedArray;
      // this.providerInfo = pagedData;
    })
    
  }

  public getRecord(data, item) {
    this.loading = true;
    let providerId = data['id'];
    
    this.__callInfoSubscription  = this.providerService.getDIDdetailsBasedOnProvider(providerId).subscribe((pagedData: any) => {
      this.liveCallList = pagedData;
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if(this.__callInfoSubscription) this.__callInfoSubscription.unsubscribe();
  }

}
