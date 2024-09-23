import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AllDID } from '../../../core/models';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { didUpdated, Errors, CommonService, ExcelService, invalidFileType, rangeError, invalidForm, spaceError, didCreated, errorMessage, maxChanelMessage, duplicateDID, duplicateDIDInRange, num_not_start_with_ziro, importSuccessfully, importUnsuccessfully } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { DidService } from '../../DID/did.service';
import { TeleConsultationService } from '../tele-consultation.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-mapped-contacts',
  templateUrl: './mapped-contacts.component.html',
  styleUrls: ['./mapped-contacts.component.css']
})
export class MappedContactsComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  countryList:any = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  userRole = '';
  rowData: any;
  companyData = [];
  exportData: any = {};
  defaultPageSize = '10';
  providerList = '';
  contactId = '';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    public teleConsultationService :TeleConsultationService,
    private route: ActivatedRoute,

  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_number': [""],

    });
  }

  ngOnInit() {
    this.contactId = this.route.snapshot.queryParams.tcpId;
    this.teleConsultationService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    var user_id = localStorage.getItem("id");
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'contact_name', headerName: 'Contact Name', hide: false, width: 10 },
      { field: 'phone_number1', headerName: 'Contact Number', hide: false, width: 10 },
      { field: 'assign_minutes', headerName: 'Assign Minutes', hide: false, width: 10 },
      // { field: 'provider', headerName: 'Provider', hide: false, width: 10 },
      // { field: 'company_name', headerName: 'Assigned to', hide: false, width: 10 },
      // { field: 'reservation_date', headerName: 'Reservation Date', hide: false, width: 10 },
      // { field: 'release_date', headerName: 'Release Date', hide: false, width: 10 },
   

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials['contact_id'] = this.contactId;
      this.teleConsultationService.getMappedContactsByFilter(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.teleConsultationService.getMappedContacts(this.contactId).subscribe(pagedData => {    
        
            
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }

  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='History'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }
  
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "history":
         return this.showDIDhistory(data);
    }
  }

  public showDIDhistory(data){    
    const dialogRef = this.dialog.open(InfoTcHistoryDialog, { width: '80%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.displayAllRecord();
    });
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  backtolist(){
    this.router.navigate(['teleconsultation/tc-plan-list']);
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

}
@Component({
  selector: 'InfoTcHistory-dialog',
  templateUrl: 'InfoTcHistory-dialog.html',
})

export class InfoTcHistoryDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoTcHistoryDialog>, @Inject(MAT_DIALOG_DATA) public data,
    private didService: DidService, 
    private fb: FormBuilder,
    public teleConsultationService :TeleConsultationService,
    ) { }

  filterForm: FormGroup;
  tcHistoryList : any;
  ngOnInit() {
    
    // let tc_id = this.data['tc_plan_id'];
    // let cId = this.data['contact_id'];
    let credentials = {}
    credentials['tc_plan_id'] = this.data['tc_plan_id'];
    credentials['contact_id'] = this.data['contact_id']
    credentials['customer_id'] = localStorage.getItem('id');
    if (this.data) {
      this.teleConsultationService.getMappedTcHistory(credentials).subscribe(pagedData => {        
        this.tcHistoryList = pagedData ? pagedData : [];
      });
    }
  }
  

  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}
