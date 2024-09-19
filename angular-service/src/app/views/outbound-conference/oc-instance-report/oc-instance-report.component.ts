import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully, 
  Errors,OutboundSuccessfully,Contact_RegEx } from '../../../../app/core';
import { OutboundService } from '../outbound.service';
import { forkJoin } from "rxjs";


@Component({
  selector: 'app-oc-instance-report',
  templateUrl: './oc-instance-report.component.html',
  styleUrls: ['./oc-instance-report.component.css']
})
export class OcInstanceReportComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  selectedValue: any = [];
  selectedValueTwo : any= [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  OCReportForm: FormGroup;
  todayDate = new Date();


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private OutboundService: OutboundService,
  ) { }

  ngOnInit() {
    this.OCReportForm = this.fb.group({
      'by_date': [""],
      'by_name': [""],
      'by_caller': [""]
    });
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });


    

  }
  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 200 },
      { field: 'id', headerName: 'ID', hide: true, width: 100 },
      { field: 'session_start', headerName: 'Date', hide: false, width: 263 },
      { field: 'instance_id', headerName: 'Instance ID', hide: true, width: 300 }, 
      { field: 'conf_name', headerName: 'Name', hide: false, width: 300 }, 
      { field: 'caller', headerName: 'Caller', hide: false, width: 300 }, 
    ];
    const credentials = this.OCReportForm.value;
    let user_id = localStorage.getItem('id');
    if(this.isFilter){

      // forkJoin([
      //   this.OutboundService.getreportFilter(
      //     credentials,user_id
      //   ),
      //   this.OutboundService.getreportFilterTwo(
      //     credentials,user_id
      //   ),
     
      // ]).subscribe(([apiResponse1, apiResponse2]) => {
      //     this.selectedValueTwo = apiResponse1.concat(
      //       apiResponse2
      //     );
      //     this.selectedValueTwo = this.manageUserActionBtn(this.selectedValueTwo);
      //     this.dataSource = [];
      //     this.dataSource.push({ 'fields': this.columnDefs, 'data': this.selectedValueTwo});
      //   },
      //   (error) => {
      //     console.error(error);
      //   }
      // );
    
      this.OutboundService.getreportFilter(credentials,user_id).subscribe(data => {      
        data = this.manageUserActionBtn(data);      
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{

      // forkJoin([
      //   this.OutboundService.getoutboundReport(
      //     localStorage.getItem("id")
      //   ),
      //   this.OutboundService.outboundreportstatusNotlive(
      //     localStorage.getItem("id")
      //   ),
     
      // ]).subscribe(([apiResponse1, apiResponse2]) => {
      //     this.selectedValue = apiResponse1.concat(
      //       apiResponse2
      //     );
      //     this.selectedValue = this.manageUserActionBtn(this.selectedValue);
      //     this.dataSource = [];
      //     this.dataSource.push({ 'fields': this.columnDefs, 'data': this.selectedValue});
      //   },
      //   (error) => {
      //     console.error(error);
      //   }
      // );

      const credentials = this.OCReportForm.value;
      const user_id = localStorage.getItem('id');      
      this.OutboundService.getoutboundReport(user_id).subscribe((datas => {    
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': datas});
      })),err => {
        this.error = err.message;
      }

    }
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

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='info' title='Information'></i>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if(pagedData[i]['status'] == '1'){
        finalBtn += "<i class='fa fa-circle active-button' style='cursor:pointer; display: inline' data-action-type='active' title='Active'></i>";
      }
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "info":
        return this.editOC(data);
    }
  }
  editOC(data: any) {
    this.openDialog(data);
  }
  openDialog(id?): void {      
    const dialogRef = this.dialog.open(ocreportDialog, {
      width: '60%', disableClose: true,
      data: {
        id: id ? id.instance_id : null,
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,

      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {      
    });
  }

}
@Component({
  selector: 'ocreport-dialog',
  templateUrl: './ocreport-dialog.html',
})

export class ocreportDialog {
  outboundCDRList : any  = [];
  selectedAssociate : any= [];


  constructor(
    private router: Router,
    private OutboundService: OutboundService,
    public dialogRefInfo: MatDialogRef<ocreportDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    if (this.data) {
      
      // forkJoin([
      //   this.OutboundService.getassocieateCDR(
      //     this.data.id
      //   ),
      //   this.OutboundService.getoutboundCDRAssociate(
      //     this.data.id
      //   ),
     
      // ]).subscribe(([apiResponse1, apiResponse2]) => {
      //     this.outboundCDRList = apiResponse1.concat(
      //       apiResponse2
      //     );
      //   },
      //   (error) => {
      //     console.error(error);
      //   }
      // );



      this.OutboundService.getassocieateCDR(this.data.id).subscribe(pagedData => {
        this.outboundCDRList = pagedData;
      })
    }
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
