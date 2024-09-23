import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx,Number_RegEx,Contact_RegEx, importSuccessfully, importUnsuccessfully, invalidFileType, ExtensionService } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VoicebotService } from '../voicebot-list.service';
import { CdrService } from '../../cdr/cdr.service';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';



@Component({
  selector: 'app-voicebot-cdr',
  templateUrl: './voicebot-cdr.component.html',
  styleUrls: ['./voicebot-cdr.component.css']
})
export class VoicebotCdrComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  allCountryList:any="";
  terminatecause: any = [];
  defaultPageSize = '10';
  filterForm: FormGroup;
  isShowLocation : boolean = false;

  public mode : string = 'CheckBox' ;
  public selectAllText: string = "Select All"
  public fields: Object = { text: 'name', value: 'phonecode' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Terminate Cause';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private voicebotService : VoicebotService, 
       private cdrService: CdrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    
    ) { 
      this.filterForm = this.fb.group({
        'by_date': [""],
        'by_sellcost': [""],
        'by_src': [""],
        'by_dest': [""],
        'by_destination':  new FormControl([]),
        'by_callerid': [""],
        'by_terminatecause':  new FormControl([]),
        'by_call_type': [""]
      });
    }
    ngOnInit() {

      this.commonService.getCountryList().subscribe(data => {
        this.allCountryList = data.response;
      }, err => {
        this.error = err.message;
      });
      this.cdrService.getTerminateCause().subscribe(data => {
        // this.terminatecause = data;
        for (let i = 0; i < data.length; i++) {
          this.terminatecause.push({ id: data[i].digit, name: data[i].digit + '-' + data[i].description });
        }
      }, err => {
        this.error = err.message;
      });

      this.extensionService.getMyExtensionLimit(localStorage.getItem('id'),localStorage.getItem('type')).subscribe(data => {
        this.isShowLocation =  data.ext.geo_tracking == '1' ? true : false;
       
      //  this.displayAllRecord();
       
    //   this.extPackage = data.ext.package_id;
     });
      
    

    this.voicebotService.displayAllRecord().subscribe(() =>{
      this.displayAllRecord();
    })

  }

  Accountremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action',width: 100,hide: false },
      { field: 'id', headerName: 'ID',hide: true },
      { field: 'quality', headerName: 'Call Type & Quality',width : 160, hide: false},
      { field: 'startTime', headerName: 'Start Time',width : 170, hide: false},
      { field: 'endTime', headerName: 'End Time' ,width : 170, hide: false},
      { field: 'src', headerName: 'Caller' ,width : 150,hide: false},
      { field: 'dispDst', headerName: 'Callee', width : 150, hide: false} ,
      { field: 'forward', headerName: 'Forward' ,width : 150, hide: false},
      { field: 'dispCallerId', headerName: 'Caller ID',hide: false },
      { field: 'sessionTime', headerName: 'Session Time' ,width : 150, hide: false},
      { field: 'bridgeTime', headerName: 'Bridge Time' ,width : 150, hide: false},
      { field: 'sellCost', headerName: 'Buy Cost' ,width : 100, hide: false},
      { field: 'callCost', headerName: 'Call Cost' ,width : 100, hide: false },
      { field: 'used_minutes', headerName: 'Bundle Minutes' , hide: false, width: 150}, 
      { field: 'termDescription', headerName: 'Terminate Cause' ,hide: false},
      { field: 'dispDestination', headerName: 'Country' ,hide: false},
      { field: 'hangup_disposition', headerName: 'Hangup Disposition' , width : 200 ,hide: false},
      { field: 'uuid', headerName: 'UUID', hide: false },

      { field: 'clr_mos', headerName: 'Caller MOS',width : 200, hide: false },
      { field: 'clr_jitter_min_variance', headerName: 'Caller Jitter Min Variance',width : 200, hide: false },
      { field: 'clr_jitter_max_variance', headerName: 'Caller Jitter Max Variance' ,width : 200, hide: false},
      { field: 'clr_jitter_loss_rate', headerName: 'Caller Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'clr_jitter_burst_rate', headerName: 'Caller Jitter Burst Rate',width : 200, hide: false },
      { field: 'clr_mean_interval', headerName: 'Caller Mean Interval' ,width : 200, hide: false},
      { field: 'clr_quality_percentage', headerName: 'Caller Quality Percentage',width : 200, hide: true },
      { field: 'clr_read_codec', headerName: 'Caller Read Codec',width : 200,hide: false },
      { field: 'clr_write_codec', headerName: 'Caller Write Codec' ,width : 200, hide: false},
      { field: 'clr_local_media_ip', headerName: 'Caller Media IP', width : 200,hide: false },
      { field: 'clr_remote_media_ip', headerName: 'Caller Signalling IP',width : 200,hide: false },
      { field: 'clr_user_agent', headerName: 'Caller User Agent' ,width : 200, hide: false},

      { field: 'cle_mos', headerName: 'Callee MOS' ,width : 200,hide: false},
      { field: 'cle_jitter_min_variance', headerName: 'Callee Jitter Min Variance' ,width : 200, hide: false },
      { field: 'cle_jitter_max_variance', headerName: 'Callee Jitter Max Variance',width : 200,hide: false},
      { field: 'cle_jitter_loss_rate', headerName: 'Callee Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'cle_jitter_burst_rate', headerName: 'Callee Jitter Burst Rate' ,width : 200,hide: false},
      { field: 'cle_mean_interval', headerName: 'Callee Mean Interval' ,width : 200,hide: false},
      { field: 'cle_quality_percentage', headerName: 'Callee Quality Percentage' ,width : 200,hide: true},
      { field: 'cle_read_codec', headerName: 'Callee Read Codec',hide: false,width : 200, resizable: false },
      { field: 'cle_write_codec', headerName: 'Callee Write Codec' ,width : 200,hide: false},
      { field: 'cle_local_media_ip', headerName: 'Callee Media IP',width : 200,hide: false },
      { field: 'cle_remote_media_ip', headerName: 'Callee Signalling IP' ,width : 200,hide: false},
      { field: 'cle_user_agent', headerName: 'Callee User Agent',width : 200,hide: false },
    ];
    const credentials = this.filterForm.value;
    let user_id = Number(localStorage.getItem('id'));
    credentials['user_id'] = user_id;
    credentials.by_callerid = Number(credentials.by_callerid)
    credentials.by_dest = Number(credentials.by_dest);
    credentials.by_sellcost = Number(credentials.by_sellcost);
    credentials.by_src = Number(credentials.by_src);
    if(this.isFilter){
      this.voicebotService.getVoicebotCDRByFilter(credentials).subscribe(data => {
        data = this.manageUserActionBtn(data);
        
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const user_id = localStorage.getItem('id');
      this.voicebotService.getVoicebotCDR(user_id, 0).subscribe((datas => {
        

        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': datas});
      })),err => {
        this.error = err.message;
      }
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      let actionBtn = '';
      let a1 = data[i]['clr_quality_percentage'];
      if(a1){
      a1 = a1 + '%'
      }
      data[i]['clr_quality_percentage'] = a1;

      let a2 = data[i]['cle_quality_percentage'];
      if(a2){
      a2 = a2 + '%'
      }
      data[i]['cle_quality_percentage'] = a2;

      //MOS

      let clr_mos = parseFloat(data[i]['clr_mos']);
      let cle_mos = parseFloat(data[i]['cle_mos']);
      var result = 0
      
      if(clr_mos && cle_mos > 0){
        result = (clr_mos + cle_mos)/2;
        
      }else if(clr_mos == 0 && cle_mos > 0){
        result = cle_mos
      }else if(cle_mos == 0 && clr_mos > 0 ){
        result = clr_mos
      }else {
        result = 0;
      }
      

      finalBtn += "<span><center>";
      actionBtn += "<span><center>";
      if(data[i]['call_type'] == 'inbound'){

        if(result>=4 && result<=5){
          finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound / "+result+"'></i>";
        }else if(result>=3.4 && result<4){
        finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound / "+result+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound / "+result+"'></i>";
      }
    }
      if(data[i]['call_type'] == 'outbound'){
        if(result>=4 && result<=5){
          finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Outbound / "+result+"'></i>";
        }else if(result>=3.4 && result<4){
        finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Outbound / "+result+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Outbound / "+result+"'></i>";
      }
      }

      if(data[i]['call_type'] == 'intercom'){
        if(result>=4 && result<=5){
          finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: green' title='Intercom / "+result+"'></i>";
        }else if(result>=3.4 && result<4){
        finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: orange' display: inline' title='Intercom / "+result+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrows-h' style='color: red' display: inline' title='Intercom / "+result+"'></i>";
      }
      }
      if(data[i]['lat_long'] && this.isShowLocation){
      actionBtn += "<i class='fa fa-map-marker list-button' style='cursor:pointer; display: inline' data-action-type='view_location' title='Location'></i>";
      }
      actionBtn += "<i class='fa fa-ticket list-button' style='cursor:pointer; display: inline' data-action-type='ticket' title='Ticket'></i>";
      finalBtn += "</center></span>";
      actionBtn += "</center></span>";
      
      if(data[i]['hangup_disposition']=='send_bye'){
        data[i]['hangup_disposition'] = 'Callee Hangup';
      }else if(data[i]['hangup_disposition']=='recv_bye'){
        data[i]['hangup_disposition'] = 'Caller Hangup';
      }else if(data[i]['hangup_disposition']=='send_refuse'){
        data[i]['hangup_disposition'] = 'System';
      }else if(data[i]['hangup_disposition']=='s_end__cancel'){
        data[i]['hangup_disposition'] = 'Caller Cancel';
      }else if(data[i]['hangup_disposition']=='recv_cancel'){
        data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
      }else if(data[i]['hangup_disposition']=='recv_cancel'){
        data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
      }else{
        data[i]['hangup_disposition'] = '';
      }
      data[i]['quality'] = finalBtn;
      data[i]['action'] = actionBtn;
    }
    return data;
  }
  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }
  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }




}
