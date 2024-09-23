import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, ProductService, CommonService, PagedData } from '../../../core';
import { CallplanService } from '../callplan.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GatewayService } from '../../gateway/gateway.service';


@Component({
  selector: 'app-call-rates-associate-group',
  templateUrl: './call-rates-associate-group.component.html',
  styleUrls: ['./call-rates-associate-group.component.css']
})
export class CallRatesAssociateGroupComponent implements OnInit {
  error = '';
  isFilter = false;
  filterForm: FormGroup;  
  columnDefs: any;
  dataSource: any = [];    
  defaultPageSize = '10'; 
  group_id = '';
  selectedValue = "";
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public placeholder: string = 'Select Call Plan';
  public fields: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  gateways: any=[];
  countryList = "";
  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private gatewayService: GatewayService,
    private commonService: CommonService
  ) { 
    this.filterForm = this.fb.group({
      // 'by_call_plan':  new FormControl([]),
      'by_call_plan': [""],
      'by_gateway': [""],
      'by_country': [""],
      'by_provider': [""]
    });
  }

  ngOnInit() {

    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.callplanService.getCallPlan().subscribe(data => {
      this.selectedValue = data.response;
    })

    this.gatewayService.getGateway({ id: null, ip: null, port: null, provider_id: null }).subscribe(data => {     
                 
      let arrMap;
      arrMap = data.map( (item) => {
        this.gateways.push({id:item['id'], name: item['ip'], provider: item['provider'],domain: item['domain']})          
      })
    });
    
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      // this.filterCountry = this.countryList.slice();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'call_plan', headerName: 'Call Plan', hide: false, width: 30 },  
      { field: 'name', headerName: 'Country Name', hide: false, width: 20 },
      { field: 'minutes', headerName: 'Minutes', hide: false, width: 30 },
      // { field: 'provider', headerName: 'Provider', hide: false, width: 30 },
      { field: 'gatewayName', headerName: 'Gateway', hide: false, width: 30 },
    ];
    if(this.isFilter){
      const credentials = this.filterForm.value;
      credentials['id'] = Number(this.group_id);      
      this.callplanService.getAssociateCallRates(credentials).subscribe(PagedData => {        
        this.dataSource = [];        
        this.dataSource.push({'fields': this.columnDefs, 'data': PagedData});
        PagedData = this.manageUserActionBtn(PagedData);
      })          
    }else{
      this.route.data.subscribe(data => {                        
        this.group_id = data['groupData'][0]['id'];  
        this.dataSource = [];          
        this.dataSource.push({'fields': this.columnDefs, 'data': data['groupData']});
        data = this.manageUserActionBtn(data['groupData']);                  
      });
    }
  }

  manageUserActionBtn(pagedData){   
     
    for(let i=0; i< pagedData.length; i++){   
      let gatewayCol = '';
      gatewayCol += pagedData[i].provider + ' - ' + pagedData[i].ip + ' ' + pagedData[i].domain;            
      pagedData[i]['gatewayName'] = gatewayCol;
      }
      return pagedData;
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

}

