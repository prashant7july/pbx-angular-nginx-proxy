import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully, 
  Errors,OutboundSuccessfully,Contact_RegEx } from '../../../../app/core';
import { OutboundService } from '../outbound.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-oc-recording',
  templateUrl: './oc-recording.component.html',
  styleUrls: ['./oc-recording.component.css']
})
export class OcRecordingComponent implements OnInit {
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  error = "";
  defaultPageSize = '10';
  filterForm: FormGroup;
  isFilter = false;
  userType; 

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private OutboundService: OutboundService,
    public commonService: CommonService
  ) { 
    this.filterForm = this.fb.group({
      'by_range': [""],
      'by_src': [""],
      'by_dest': [""],
    });
  }

  ngOnInit() {
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  displayAllRecord() {
    // let userRole = localStorage.getItem('type') == '1' ? false : true;

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100},
      // { field: 'id', headerName: 'ID', hide : false , width: 100 },
      // { field: 'name', headerName: 'Name', hide: true, width: 200 },
      // { field: 'file_type', headerName: 'File Type', hide: false, width: 10 },
      { field: 'type', headerName: 'Call Type', hide: false, width: 200 },
      { field: 'src', headerName: 'Caller', hide: false, width: 200 },
      { field: 'dest', headerName: 'Callee', hide: false, width: 200 },
      { field: 'time', headerName: 'Date', hide: false, width: 200 },
      { field: 'recording', headerName: 'Play Recording', hide: false, width: 300 }

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = localStorage.getItem('id');
      credentials.role = localStorage.getItem('type');
      credentials.type = 'normalRecording';
      this.OutboundService.filterRecordingList(credentials).subscribe(response => {
        let pagedData = response;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } 
    else {
      this.OutboundService.getOCRecordingList({ 'id': localStorage.getItem('id')}).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    let role = localStorage.getItem('type');    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let callType = "";
      let filePath = '';
      finalBtn += "<span>";
      finalBtn += "<a href='" + pagedData[i].file_path +  "' download='" + pagedData[i].file_name + "'  style='margin-left:10px'><i class='fa fa-download edit-button' style='cursor:pointer; display: inline' data-action-type='download' title='Download'></i></a> ";
      // if(role == '1'){
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // }
      finalBtn += "</span>";
 
      filePath = '<audio controls="" preload="auto" height="32" style="float:left; margin-left:5px; width: 85%;">\
    <source src="'+ pagedData[i].file_path + '" type="audio/wav"/>\audio isn\'t supported.\</audio>';
    //   callType += pagedData[i]['call_type'].replace('_',' ');
    //   callType = callType == 'call' ? callType.replace('call','Outgoing Call') : callType;
    //   pagedData[i]['call_type'] = callType;
      pagedData[i]['recording'] = filePath;
      pagedData[i]['action'] = finalBtn;
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

  public downloadRecording(data){
    console.log(data)
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
        this.OutboundService.deleteRecording({ id: Number(data.id) }).subscribe(data => {
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

}
