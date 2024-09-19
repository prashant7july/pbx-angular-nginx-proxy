import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully,Errors,OutboundSuccessfully,Contact_RegEx } from '../../../../app/core';
import { OBDService } from '../obd.service';
import { forkJoin } from "rxjs";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-obd-recordings',
  templateUrl: './obd-recordings.component.html',
  styleUrls: ['./obd-recordings.component.css']
})
export class ObdRecordingsComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  filterObj: any = {};
  rowData: any;
  selectedValue: any = [];
  selectedValueTwo : any= [];
  exportData: any = {};
  defaultPageSize = '10';
  OBDReportForm: FormGroup;
  todayDate = new Date();
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private obdService: OBDService,
  ) { }
  ngOnInit() {
    this.OBDReportForm = this.fb.group({
      'by_range': [""],
      'by_caller': [""],
      'by_callee': [""]
    });
    this.obdService.displayAllRecord().subscribe(() =>{
      this.displayAllRecord();
    }) 
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 200 },
      { field: 'id', headerName: 'ID', hide: true, width: 100 },
      { field: 'src', headerName: 'Caller', hide: false, width: 263 },
      { field: 'dest', headerName: 'Lead', hide: false, width: 280 },
      { field: 'created_at', headerName: 'Date', hide: false, width: 280 },
      { field: 'recording', headerName: 'Play Recording', hide: false, width: 300 },
    ];
    const credentials = this.OBDReportForm.value;
    let user_id = localStorage.getItem('id');
    if(this.isFilter){
      const credentials = this.OBDReportForm.value;
      credentials.user_id = localStorage.getItem('id');
      credentials.role = localStorage.getItem('type');
      credentials.type = 'normalRecording';
      this.obdService.getOBDRecordingByFilter(credentials).subscribe(response => {
        let pagedData = response;
       
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    }else{
      const user_id = localStorage.getItem('id');
      this.obdService.getOBDRecording(user_id).subscribe(data =>{
        console.log(data,"--recordings--");

        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
        
      })
   
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
      let filePath = '';
      finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-microphone edit-button' style='cursor:pointer; display: inline' data-action-type='info' title='Information'></i>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
    
      finalBtn += "<a href='" + pagedData[i].file_path +  "' download='" + pagedData[i].file_name + "'  style='margin-left:10px'><i class='fa fa-download edit-button' style='cursor:pointer; display: inline' data-action-type='download' title='Download'></i></a> ";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
       
      filePath = '<audio controls="" preload="auto" height="32" style="float:left; margin-left:5px; width: 85%;">\
    <source src="'+ pagedData[i].file_path + '" type="audio/wav"/>\audio isn\'t supported.\</audio>';
      pagedData[i]['action'] = finalBtn;
      pagedData[i]['recording'] = filePath;
    }
    return pagedData;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete": 
      return this.deleteRecording(data);
        case "download":
          return this.downloadRecording(data);
    }
  }

  deleteRecording(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html : "<span style='color:#FFFFFF;'>You will not be able to recover recording </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.id+"</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.obdService.deleteOBDRecording({ 'filename': data.file_name, 'id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')), 'type' : '' }).subscribe(data => {
          this.displayAllRecord();
        },
          err => {
            this.error = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : "<span style='color:#FFFFFF;'> Recording </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.id+"</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        let obj = {
          application: "recording",
          action: "delete", //update
          file: data.name,
          cust_id: (localStorage.getItem('id'))
        } 
        // this.backendIntegrationService.createAPIintegration(obj).subscribe(res => {
        //   console.log(res)
        // });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF;'>Recording  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.id+"</span> <span style='color:#FFFFFF'> is safe.</span> ",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  public downloadRecording(data){
    console.log(data)
  }
  // editOC(data: any) {
  //   this.openDialog(data);
  // }
  // openDialog(id?): void {
  //   const dialogRef = this.dialog.open(obdreportDialog, {
  //     width: '60%', disableClose: true,
  //     data: {
  //       id: id ? id.instance_id : null,
  //       customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
  //     }
  //   });
  //   dialogRef.keydownEvents().subscribe(e => {
  //     if (e.keyCode == 27) {
  //       dialogRef.close('Dialog closed');
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }
}
