import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Errors, Name_RegEx, CommonService, promptUpdated, invalidFileType, errorMessage } from '../../../core';
import { DateAdapter } from '@angular/material';
import { UserTypeConstants } from 'src/app/core/constants';
import { BackendApiServiceService } from '../backend-api-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { log } from 'console';

@Component({
  selector: 'app-view-package-audit-log',
  templateUrl: './view-package-audit-log.component.html',
  styleUrls: ['./view-package-audit-log.component.css']
})
export class ViewPackageAuditLogComponent implements OnInit {

  error = '';
  isFilter = false;
  filterForm: FormGroup;

  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  viewButton: boolean = true;
  editButton: boolean = true;
  deleteButton: boolean = true;
  packageList = '';
  selectedValue = '';
  defaultPageSize = '10';
  maxDate: Date;
  todayDate: Date;
  loginUserType = localStorage.getItem('type');

  
  constructor(
    public commonService: CommonService,
    private logService: BackendApiServiceService,
    private dateAdapter: DateAdapter<Date>,      
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.maxDate = new Date();
   // this.todayDate = new Date();
    this.dateAdapter.setLocale('en-GB');
    this.filterForm = this.fb.group({
      'by_username': [""],
      'by_pckg' : [''],
      'by_date': [""],
    });
   }

  ngOnInit() {
    let user_id = localStorage.getItem('id');
    this.displayAllRecord();
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'actionBtn', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'created_at', headerName: 'Date', hide: false, width: 20 },
      { field: 'package_name', headerName: 'Package', hide: false, width: 20 },
      // { field: 'action', headerName: 'Task', hide: false, width: 20 },
     
      // { field: 'broadcasting', headerName: 'Broadcast', hide: false, width: 120 },
      // { field: 'barging', headerName: 'Call Barging', hide: false, width: 120 },
      // { field: 'call_group', headerName: 'Call Group', hide: false, width: 120 },
      // { field: 'is_caller_id', headerName: 'Caller ID', hide: false, width: 120 },

      // { field: 'call_transfer', headerName: 'Call Transfer', hide: false, width: 120 },
      // { field: 'click_to_call', headerName: 'ClickToCall', hide: false, width: 120 },
      // { field: 'conference', headerName: 'Conference', hide: false, width: 120 },
      // { field: 'is_caller_id', headerName: 'Custom Prompts', hide: false, width: 120 },

      // { field: 'custom_acl', headerName: 'Custom ACL', hide: false, width: 120 },
      // { field: 'feed_back_call', headerName: 'Feedback Call', hide: false, width: 120 },
      // { field: 'find_me_follow_me', headerName: 'Find Me Follow Me', hide: false, width: 120 },
      // { field: 'forward', headerName: 'Forward', hide: false, width: 120 },

      // { field: 'geo_tracking', headerName: 'Geo Tracking', hide: false, width: 120 },
      // { field: 'ivr', headerName: 'IVR', hide: false, width: 120 },
      // { field: 'music_on_hold', headerName: 'Music On Hold', hide: false, width: 120 },
      // { field: 'one_to_one_video_call', headerName: 'One To One Video Call', hide: false, width: 120 },

      // { field: 'miss_call_alert', headerName: 'Miss Call Alert(MCA)', hide: false, width: 120 },
      // { field: 'minute_plan', headerName: 'Minute Plan', hide: false, width: 120 },
      // { field: 'is_bundle_type', headerName: 'Bundle', hide: false, width: 120 },
      // { field: 'is_roaming_type', headerName: 'Roaming', hide: false, width: 120 },

      // { field: 'outbound_call', headerName: 'Outbound', hide: false, width: 120 },
      // { field: 'playback', headerName: 'Playback', hide: false, width: 120 },
      // { field: 'queue', headerName: 'Queue', hide: false, width: 120 },
      // { field: 'recording', headerName: 'Recording', hide: false, width: 120 },

      // { field: 'is_sms', headerName: 'SMS', hide: false, width: 120 },
      // { field: 'speed_dial', headerName: 'Speed Dial', hide: false, width: 120 },
      // { field: 'sticky_agent', headerName: 'Sticky Agent', hide: false, width: 120 },
      // { field: 'storage', headerName: 'Storage', hide: false, width: 120 },

      // { field: 'teleconsultation', headerName: 'Tele Consultation', hide: false, width: 120 },
      // { field: 'whatsapp', headerName: 'WhatsApp', hide: false, width: 120 },
     
      
     ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.logService.getPackageAuditLogByFilter(credentials).subscribe(pagedData => {
      pagedData = this.manageUserActionBtn(pagedData);  
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    } else {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      this.logService.getPackageAuditLog(role,ResellerID).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let allFeatures: any;
      var cause = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='History'></i>";
      finalBtn += "</span>";
      // allFeatures = pagedData[i].all_features ? JSON.parse(pagedData[i].all_features) : {};
      pagedData[i]['actionBtn'] = finalBtn;
      // pagedData[i]['broadcasting'] = allFeatures['broadcasting'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['barging'] = allFeatures['barging'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['call_group'] = allFeatures['call_group'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['barging'] = allFeatures['barging'] == '1' ? 'Active':'In-Active' ;

      // pagedData[i]['call_transfer'] = allFeatures['call_transfer'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['click_to_call'] = allFeatures['click_to_call'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['conference'] = allFeatures['conference'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['is_caller_id'] = allFeatures['is_caller_id'] == '1' ? 'Active':'In-Active' ;

      // pagedData[i]['custom_acl'] = allFeatures['custom_acl'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['feed_back_call'] = allFeatures['feed_back_call'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['find_me_follow_me'] = allFeatures['find_me_follow_me'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['forward'] = allFeatures['forward'] == '1' ? 'Active':'In-Active' ;

      // pagedData[i]['geo_tracking'] = allFeatures['geo_tracking'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['ivr'] = allFeatures['ivr'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['music_on_hold'] = allFeatures['music_on_hold'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['one_to_one_video_call'] = allFeatures['one_to_one_video_call'] == '1' ? 'Active':'In-Active' ;

      // pagedData[i]['miss_call_alert'] = allFeatures['miss_call_alert'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['minute_plan'] = allFeatures['minute_plan'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['is_bundle_type'] = allFeatures['is_bundle_type'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['is_roaming_type'] = allFeatures['is_roaming_type'] == '1' ? 'Active':'In-Active' ;

      // pagedData[i]['outbound_call'] = allFeatures['outbound_call'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['playback'] = allFeatures['playback'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['queue'] = allFeatures['queue'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['recording'] = allFeatures['recording'] == '1' ? 'Active':'In-Active';

      // pagedData[i]['is_sms'] = allFeatures['is_sms'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['speed_dial'] = allFeatures['speed_dial'] == '1' ? 'Active':'In-Active'; 
      // pagedData[i]['sticky_agent'] = allFeatures['sticky_agent'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['storage'] = allFeatures['storage'] == '1' ? 'Active':'In-Active';

      // pagedData[i]['teleconsultation'] = allFeatures['teleconsultation'] == '1' ? 'Active':'In-Active' ;
      // pagedData[i]['whatsapp'] = allFeatures['whatsapp'] == '1' ? 'Active':'In-Active'; 
     
      
    }
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "history":
         return this.showDIDhistory(data);
    }
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  public showDIDhistory(data){
    const dialogRef = this.dialog.open(InfoPackageLogDialog, { width: '80%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log('Dialog closed');
      this.displayAllRecord();
    });
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}

@Component({
  selector: 'infoPackageLog-dialog',
  templateUrl: 'infoPackageLog-dialog.html',
  styles : [`.switch-div{
    border-right: 1px solid #09aee4;
}
.serviceStatus{
    width: 25px;
}
::ng-deep 
.card-body {
    padding: 25px;
}`]})

export class InfoPackageLogDialog { 
  constructor(
    public dialogRefInfo: MatDialogRef<InfoPackageLogDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private logService: BackendApiServiceService, private fb: FormBuilder) { }

  filterForm: FormGroup;
  packageLogList : any;
  ngOnInit() {
    // const element = document.querySelector('#scrollId');
    // element.scrollIntoView();
    this.filterForm = this.fb.group({
      'by_username': [""],
      'by_pckg' : [''],
      'by_date': [""],
    });
    if (this.data.id) {
      console.log(this.data,"--data--")
      const credentials = this.filterForm.value;
      
      credentials['by_pckg'] = String(this.data['package_id']);
      this.logService.getPackageAuditLogByFilter(credentials).subscribe(pagedData => {
        let data = pagedData ? pagedData : [];
        for(let i=0; i< pagedData.length; i++){
          data[i]['all_features'] = JSON.parse(data[i].all_features)
        }
        // let data2 = data.map(item => item['all_features'] = JSON.parse(item.all_features));
        this.packageLogList =data ? data : []; //JSON.parse(pagedData[i].all_features)
        });
    }
  }
  

  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}
