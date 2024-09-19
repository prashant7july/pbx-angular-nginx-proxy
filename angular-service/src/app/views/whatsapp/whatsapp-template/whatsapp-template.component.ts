

import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx, importSuccessfully, importUnsuccessfully, invalidFileType, createWhatsapp,updateWhatsapp, whatsappTemplateNameDuplicate } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { LimitData } from '@syncfusion/ej2-angular-inputs';
import { id } from '@swimlane/ngx-datatable/release/utils';
import { FormArray } from '@angular/forms';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { WhatsAppService } from './whatsapp.service';

@Component({
  selector: 'app-whatsapp-template',
  templateUrl: './whatsapp-template.component.html',
  styleUrls: ['./whatsapp-template.component.css']
})

export class WhatsappTemplateComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;  
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj: any = {};
  filter_list: any;
  globalRateList: any = "";
  user_id: any='';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public whatsappService: WhatsAppService
  ) { 
    this.filterForm = this.fb.group({
      'name': [""]      
    });
  }

  ngOnInit() {
    this.whatsappService.displayAllRecord().subscribe(() => {
      this.displayAllRecord();      
    })    
  }

  displayAllRecord(){
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'name', headerName: 'Name', width: 150, hide: false },
      { field: 'description', headerName: 'Description', width: 200, hide: false }    
    ];
    let user_id = localStorage.getItem('id');
    if(!this.isFilter){
      this.whatsappService.getTemplate('',user_id).subscribe(data => {      
        data = this.manageUserActionBtn(data);      
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const credentials = this.filterForm.value;
      const cust_id = localStorage.getItem('id');      
      this.whatsappService.getTemplate(credentials, user_id).subscribe((datas => {      
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
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";  
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {     
      case "edit":
        return this.editData(data);   
      case "delete":
        return this.deleteData(data);      
    }
  }

  addTemplate () {
    this.openDialog(null)
  }

  
  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddWhatsappTemplateDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  editData(event) {    
    this.openDialog(event.id);
  }

  deleteData(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',      
      html : "<span style='color:#FFFFFF;'>You will not be able to recover Whatsapp Template</span> <span style='color:red; font-weight:bold; font-size:1.2em'>"+event.name+ "</span>  <span style='color:#FFFFFF;'>in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.whatsappService.deleteTemplate(event.id).subscribe(data => {  
          this.displayAllRecord();
        },
          err => {
            this.errors = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : " <span style='color:#FFFFFF;'> Whatsapp Template </span> <span style='color:red; font-size:1.2em; font-weight: bold;'>"+event.name+" </span> <span style='color:#FFFFFF'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer:2000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF';>Whatsapp Template </span> <span style='color:red; font-weight:bold; font-size:1.3em'>"+event.name+ "</span> <span style='color:#FFFFFF';> is safe </span> ",
          type: 'error',
          background: '#000000',
          timer:2000
        });
      }
    })
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


@Component({
  selector: 'addTemplate-dialog',
  templateUrl: './addTemplate-dialog.html',
  providers: [CheckBoxSelectionService]
})

export class AddWhatsappTemplateDialog implements OnInit {  
  WhatsappTemplateForm: FormGroup;
  submitted = false;      
  placeholder3 = 'Custom Group';
  placeholder4 = 'Language'; 
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';    
  error: any;
  socialChannelList = [];
  placeholder = 'Whatsapp Provider';   
  public fields: Object = { text: 'channel_name', value: 'id' };



  constructor( private changeRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddWhatsappTemplateDialog>, @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private whatsappService: WhatsAppService,     
  ) {
    this.WhatsappTemplateForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'description': [''],
      // 'custom_group': [''],
      // 'language': [''],
      'text': ['', Validators.required],
      'social_channel': [0]
    });    
  }

  get name() { return this.WhatsappTemplateForm.get('name'); }  
  get description() { return this.WhatsappTemplateForm.get('description'); }  
  get text() { return this.WhatsappTemplateForm.get('text'); }  




  ngOnInit() {          
    if(this.data){
      this.whatsappService.getTemplateById(this.data).subscribe((data) => {        
        this.WhatsappTemplateForm.get('name').setValue(data['name']);
        this.WhatsappTemplateForm.get('description').setValue(data['description']);
        this.WhatsappTemplateForm.get('text').setValue(data['text']);
      }
      , err => {
        this.error = err.message;
      });
    }
    let user_id = localStorage.getItem('id');
    this.whatsappService.getSocial(user_id).subscribe(data => {      
      this.socialChannelList = data;
    })
  }

  cancleDialog(): void {
    this.dialogRef.close();
  }  
  
  cancelForm() {
    this.WhatsappTemplateForm.reset();
    this.whatsappService.updateGridList();
    this.dialogRef.close();    
  }  

  submitTemplateForm(){    
    let credentials = this.WhatsappTemplateForm.value;
    credentials['user_id'] = localStorage.getItem('id');
    if(!this.data){
      this.whatsappService.createWhatsappTemplate(credentials).subscribe((data) => {        
        if (data['code'] == 200) {
          this.toastr.success('Success!', createWhatsapp, { timeOut: 2000 });          
          this.cancelForm();
        } else if (data['code'] == 1062) {
          this.toastr.error('Error!', whatsappTemplateNameDuplicate, { timeOut: 2000 });
        }
        else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          this.submitted = false;
        }
      })
    }else{
      credentials.id = this.data;
      this.whatsappService.updateTemplateDetail(credentials).subscribe((data) => {     
        if(data['code'] == 200){        
          this.toastr.success('Success!', updateWhatsapp, { timeOut: 2000 });
          this.cancelForm();
        }else{
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      })
    }
  }
}

