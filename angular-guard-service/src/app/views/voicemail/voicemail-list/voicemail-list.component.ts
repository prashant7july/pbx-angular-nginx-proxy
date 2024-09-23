import { Component, OnInit, Inject } from '@angular/core';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment.prod';
import { RecordingService } from '../../recording/recording.service';
import { VoicemailService } from '../voicemail.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PagedData } from 'src/app/core';

const uname = localStorage.getItem('uname');
const URL = environment.api_url + 'vm/' + uname;
export let imagePath: any;
let _validFileExtensions = [".wav"];


@Component({
  selector: 'app-voicemail-list',
  templateUrl: './voicemail-list.component.html',
  styleUrls: ['./voicemail-list.component.css']
})
export class VoicemailListComponent implements OnInit {
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  error = "";
  defaultPageSize = '10';
  filterForm: FormGroup;
  isFilter = false;


  constructor(
    private recordingService: RecordingService,
    private voicemailService: VoicemailService,
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) { 
     this.filterForm = this.fb.group({
      'by_range': [""],
      'src':['']
    });
  }

  ngOnInit() {
    this.voicemailService.getSavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  
  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide:false, width: 10 },
      { field: 'name', headerName: 'Name', hide: true, width: 10 },
      {field: 'extension', headerName:'caller',hide:false, width: 10},
      // { field: 'number', headerName: 'Ext Number', hide: false, width: 10 },
      { field: 'time', headerName: 'Date', hide: false, width: 10 },
      { field: 'recording', headerName: 'Play Recording', hide: false, width: 10 },
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = localStorage.getItem('id');
      credentials.role = localStorage.getItem('type');
      credentials.type = 'voicemailRecording';
      this.recordingService.filterRecordingList(credentials).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.recordingService.getRecordingList({ 'id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')), 'type': 'voicemailRecording'}).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);        
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let filePath = '';
      let caller='';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";

      filePath = '<audio controls="" preload="auto" controlsList="nodownload" height="32" style="float:left; margin-left:5px; width: 85%;">\
      <source src="'+ pagedData[i].file_path + '" type="audio/wav"/>\audio isn\'t supported.\</audio>';

      pagedData[i]['action'] = finalBtn;
      pagedData[i]['recording'] = filePath;
      pagedData[i]['src']=caller;
    }

    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete":
        return this.deleteVoicemailList(data);
        
    }
    





  }
  deleteVoicemailList(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You will not be able to recover this Voicemail in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.recordingService.deleteRecording({ 'filename': data.file_name, 'id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')),'type': 'vm','src':localStorage.getItem }).subscribe(data => {
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
          text: 'Voicemail has been deleted.',
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'Voicemail is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoVoicemaillistDialog, {
      width: '60%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

}

@Component({
  selector: 'infoVoicemaillist-dialog',
  templateUrl: 'infoVoicemaillist-dialog.html',
})

export class InfoVoicemaillistDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoVoicemaillistDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
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

