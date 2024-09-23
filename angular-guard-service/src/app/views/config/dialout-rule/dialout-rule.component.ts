import { Component, Inject, OnInit } from '@angular/core';
import { ConfigService } from '../../config/config.service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formError, Errors, CommonService, ExcelService, Name_RegEx, plus_number_RegEx } from '../../../core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Page } from '../../../core/models';
import { circle } from 'src/app/core/models/circle.model';
import { ToastrService } from 'ngx-toastr';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { id } from '@swimlane/ngx-charts/release/utils';
import { DidService } from '../../DID/did.service';

@Component({
  selector: 'app-dialout-rule',
  templateUrl: './dialout-rule.component.html',
  styleUrls: ['./dialout-rule.component.css']
})
export class DialoutRuleComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj: any = {};
  dialoutGroupList: any = [];
  DialFilter: any;
  filterDial: any;
  menus: any;
  dialOutRuleMenu: any = '';
  admin: any;
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Dialout Group';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  constructor(
    public ConfigService: ConfigService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
  
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.dialOutRuleMenu = this.menus.find((o) => o.url == '/config/dialout-rule');
    this.ConfigService.getDialOutGroupList({}).subscribe(pagedData => {
      this.dialoutGroupList = pagedData;
      this.filterDial = this.DialFilter = this.dialoutGroupList.slice();
    });

    this.filterForm = this.fb.group({
      'dialout_group': [""],
    });

    this.displayAllRecord();

  }
  calleremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.dialoutGroupList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 5 },
      { field: 'id', headerName: 'ID', hide: false, width: 10 },
      { field: 'dialout_group_name', headerName: 'Dialout Group Name', hide: false, width: 15 },
      { field: 'rule_pattern', headerName: 'Rule Pattern', hide: false, width: 15 },
      { field: 'strip_digit', headerName: 'Strip Digit', hide: false, width: 15 },
      { field: 'prepend_digit', headerName: 'Prepend Digit', hide: false, width: 15 },
      { field: 'exceptional_rule', headerName: 'Exceptional Rule', hide: false, width: 15 },

    ];

    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    this.ConfigService.getDialOutRuleList(this.filterObj).subscribe(pagedData => {
      this.exportData = pagedData;
      this.dataSource = [];

      pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
      this.error = err.message;
    }
    );
  }

  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 15 },
      { header: 'Description', key: 'Description', width: 80 },
    ];
    worksheet.getRow(1).font = {
      bold: true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };
    for (let i = 0; i < this.exportData.length; i++) {

      worksheet.addRow({
        name: this.exportData[i].name,
        Description: this.exportData[i].description
      });

    }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });
    // worksheet.eachRow(function (row, _rowNumber) {
    //   row.eachCell(function (cell, _colNumber) {
    //     cell.border = {
    //       top: { style: 'thin', color: { argb: '000000' } },
    //       left: { style: 'thin', color: { argb: '000000' } },
    //       bottom: { style: 'thin', color: { argb: '000000' } },
    //       right: { style: 'thin', color: { argb: '000000' } }
    //     };
    //   });
    // });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'server');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'circle');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
      let strCode = element.code;
      //let strCode1 = strCode.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.description];
      rows.push(e11);
    });
    doc.autoTable(col, rows, {
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 6
      },
      columnStyles: {
        0: { cellWidth: 'wrap' },
        1: { cellWidth: 'auto' },
        // 2: {cellWidth: 'wrap'},
        // 3:{cellWidth: 'wrap'}
      },
    });
    doc.save('Circle.pdf');
  }


  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }


  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if(this.dialOutRuleMenu.all_permission == '0' && this.dialOutRuleMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.dialOutRuleMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (this.dialOutRuleMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      // finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Customers'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;

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
      case "edit":
        return this.editDialOutRule(data);
      case "delete":
        return this.deleteCircle(data);
    }
  }


  addCircle() {
    this.openDialog(null)
  }

  editDialOutRule(data: any) {
    this.openDialog(data);
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddDialoutRule, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  deleteCircle(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>ID: " + event.id + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.ConfigService.deleteDialOutRule({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                html: "<span style='color:#FFFFFF;'> Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> ID: " + event.id + "</span> <span style='color:#FFFFFF;'> is already exist in other.</span>",
                showConfirmButton: false,
                timer: 3000,
                background: '#000000'
              })
            return;
          } else {
            this.displayAllRecord();
          }
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
          html: "<span style='color:#FFFFFF;'> Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> ID: " + event.id + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> ID: " + event.id + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoCircleDialog, {
    //   width: '80%', disableClose: true, autoFocus: false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
    //   }
    // });
    // dialogRefInfo.keydownEvents().subscribe(e => {
    //   if (e.keyCode == 27) {
    //     dialogRefInfo.close('Dialog closed');
    //   }
    // });
    // dialogRefInfo.afterClosed().subscribe(result => {
    //   console.log('Dialog closed');
    // });
  }
}

@Component(
  {
    selector: 'addDialoutRule-dialog',
    templateUrl: 'addDialoutRule-dialog.html',
  })

export class AddDialoutRule {
  dialoutForm: FormGroup;
  c_name = "";
  description = "";
  dialoutGroupList = [];
  DialFilter: any;
  filterDial: any;
  editdata: boolean = false;

  rules: number[] = [];
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Dialout Group';
  public popupHeight: string = '200px';
  public popupWidth: string = '300px';
  placeholder5 = 'DID as caller id'; 
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  didList = []
  public fields2: Object = { text: 'didDisplay', value: 'id' };  
  DIDFilter:any;
  filterDID:any;
  hideRandom = false;
  promise;
  clr_id_as_random: any;
  dialOutRuleMenu: any;
  menus: any;
  admin: any;


  constructor(
    public dialogRef: MatDialogRef<AddDialoutRule>, @Inject(MAT_DIALOG_DATA) public data: circle,
    private router: Router,
    private fb: FormBuilder,
    public ConfigService: ConfigService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private didService: DidService
  ) {
    this.dialoutForm = this.fb.group({
      'id': [""],
      'dialout_group_id': ["", Validators.required],
      'rule_pattern': ["", [Validators.required]],
      'prepend_digit': ["", [Validators.pattern(plus_number_RegEx)]],
      'strip_digit': ["", [Validators.pattern(plus_number_RegEx)]],
      // 'is_sign': [""],
      'blacklist_manipulation': [1, Validators.required],
      'exceptional_rule': new FormControl([]),
      'dialout_manipulation': [1, Validators.required],
      "caller_id_pstn":[""],
      "is_random": [""]
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.dialOutRuleMenu = this.menus.find((o) => o.url == '/config/dialout-rule');
  }

  get dialout_group_id() { return this.dialoutForm.get('dialout_group_id'); }
  get blacklist_manipulation() { return this.dialoutForm.get('blacklist_manipulation'); }
  get exceptional_rule() { return this.dialoutForm.get('exceptional_rule'); }
  get rule_pattern() { return this.dialoutForm.get('rule_pattern'); }
  get prepend_digit() { return this.dialoutForm.get('prepend_digit'); }
  get strip_digit() { return this.dialoutForm.get('strip_digit'); }
  get dialout_manipulation() { return this.dialoutForm.get('dialout_manipulation'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {

    if(localStorage.getItem('type') == '0'){
      this.admin = true
    }else{
      this.admin = false;
    }

    if(this.dialOutRuleMenu.all_permission == '0' && this.dialOutRuleMenu.view_permission == '1'){
      this.dialoutForm.disable();
    }

    this.dialoutForm.get('rule_pattern').valueChanges.subscribe((event) => {
      if (event) this.dialoutForm.get('rule_pattern').setValue(event.toUpperCase(), { emitEvent: false });
    })

    this.ConfigService.getDialOutGroupList({}).subscribe(pagedData => {
      this.dialoutGroupList = pagedData;
      this.filterDial = this.DialFilter = this.dialoutGroupList.slice();

    });    
    this.didService.getDID(null, null).subscribe(item => {      
      item.map(values => {
        if(values.status == 'Active'){
          this.didList.push(values);
          this.filterDID = this.DIDFilter = this.didList.slice();
        }
      })
      if(this.data){               
        this.promise = Number(this.data['did_as_caller']);
      }
    })
    if (this.data) {
      if (this.data['dialout_group_name'] !== '') {
        this.editdata = true;        
        this.rules = this.data['exceptional_rule'] ? this.data['exceptional_rule'].split(',').map(Number) : [];
        this.data['blacklist_manipulation'] = Number(this.data['blacklist_manipulation']);
        this.data['dialout_manipulation'] = Number(this.data['dialout_manipulation']);
        this.data['is_sign'] = this.data['is_sign'] === '1' ? true : false;
        if(this.data['caller_id_as_random'] == '1'){
          this.hideRandom = true;
        }                                  
        this.clr_id_as_random = this.data['caller_id_as_random'] == '1' ? true : false;        
        this.dialoutForm.patchValue(this.data);        
        this.exceptional_rule.setValue(null);
      }
    }
  }
  Dialoutremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.dialoutGroupList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }


  submitDialOutGroup() {
    this.exceptional_rule.setValue(this.rules)
    if (this.dialoutForm.valid) {
      const credentials = this.dialoutForm.value;
      credentials.rule_pattern = Number(this.dialoutForm.value.rule_pattern);
      credentials.prepend_digit = Number(this.dialoutForm.value.prepend_digit);
      credentials.strip_digit = Number(this.dialoutForm.value.strip_digit);

      this.ConfigService.addDialOutRules(credentials)
        .subscribe(data => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.cancelForm();
          } else if (data['code'] == 1062) {
            data['message'] = 'Group with this pattern already exist!'
            this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
            this.exceptional_rule.setValue(null);
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
            this.exceptional_rule.setValue(null);
          }
        });
    }

  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  Submit() {
    if ((this.rules).length > 5) {
      this.toastr.error('exceptional Rule value should be 5', 'Error!', { timeOut: 2000 });
    } else {
      this.submitDialOutGroup();
    }
  }

  cancelForm() {
    this.dialoutForm.reset();
    this.ConfigService.updateGridList();
    this.dialogRef.close();
  }

  add(event: MatChipInputEvent) {
    let a;
    const value = (event.value || '').trim();
    a = value;
    if (value == '') {
      return;
    }

    let checkRulePatter = this.dialoutForm.get('rule_pattern').value.length;
    let checkIncludeX = this.dialoutForm.get('rule_pattern').value.indexOf('X');
    let removeX = this.dialoutForm.get('rule_pattern').value.substring(checkIncludeX, 0)    
    let rule_pattern = checkIncludeX != -1 ? this.dialoutForm.get('rule_pattern').value.substring(checkIncludeX, 0) == value.substring(0, removeX.length) : this.dialoutForm.get('rule_pattern').value == value.substring(0, checkRulePatter);           
    if ((rule_pattern && checkRulePatter == value.length) || this.dialoutForm.get('rule_pattern').value == '*' ) {      
      if ((this.rules).length == 0) {
        this.rules.push(Number(value));
      } else {
        if ((this.rules).includes(a)) {
          this.toastr.error('Error!', 'Duplicate exceptional value', { timeOut: 2000 });
        } else {
          this.rules.push(Number(value));
        }
      }
    } else {
      this.toastr.error('Error!', 'Invalid exceptional rule', { timeOut: 2000 });
    }
    // if(value == this.rules)    
    // Clear the input value
    // event.chipInput!.clear();
    this.exceptional_rule.setValue(null);
  }

  remove(fruit: number): void {
    const index = this.rules.indexOf(fruit);
    if (index >= 0) {
      this.rules.splice(index, 1);
    }
  }

  dialoutRules(event, ruleValue) {
    ruleValue = ruleValue.toUpperCase();
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || (charCode == 42 || charCode == 88 || charCode == 120)) {
      let convertIntoString = ruleValue.toString();
      if ((event.key == 'x' || event.key == 'X') && !convertIntoString.includes('*')) {
        return true;
      } else if ((convertIntoString.includes('X') || convertIntoString.includes('x'))) {
        return false;
      }
      else if (event.key == '*' && convertIntoString.length == 0) {
        return true;
      } else if (event.key == '*' && convertIntoString.length >= 1) {
        return false;
      } else if ((convertIntoString.includes('*'))) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  stripDigit(event, stripValue) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 43) {
      let convertIntoString = stripValue.toString();
      if ((event.key == '+') && convertIntoString.length == 0) {
        return true;
      } else if ((event.key == '+') && convertIntoString.length >= 1) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }


  prepandDigit(event, stripValue) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 43) {
      let convertIntoString = stripValue.toString();
      if ((event.key == '+') && convertIntoString.length == 0) {
        return true;
      } else if ((event.key == '+') && convertIntoString.length >= 1) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  groupremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.didList.filter((data) =>{    
      return data['didDisplay'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  checkRandom(event:any){    
    if(event){
      this.hideRandom = true;    
      this.dialoutForm.get('caller_id_pstn').reset()
    }else{
      this.hideRandom = false;      
    }
  }

  // if ((charCode > 47 && charCode < 58) || (charCode == 42 || charCode == 88)) {
  //   let convertIntoString = ruleValue.toString();
  //   if(convertIntoString.includes('X')){
  //     return false;
  //   }else{
  //     return true;
  //   }
  // }
  // return false;
}
