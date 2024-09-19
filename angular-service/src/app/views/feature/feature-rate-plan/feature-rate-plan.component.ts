import { Component, OnInit, Inject } from '@angular/core';
import { FeaturesService } from '../feature.service';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../../../core/models'
import { RatePlan } from '../../../core/models/RatePlan.model';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { LimitData } from '@syncfusion/ej2-angular-inputs';
import { id } from '@swimlane/ngx-datatable/release/utils';
import { FormArray } from '@angular/forms';
import { UpgradeFeatureRatePlanComponent } from '../upgrade-feature-rate-plan/upgrade-feature-rate-plan.component';

@Component({
  selector: 'app-feature-rate-plan',
  templateUrl: './feature-rate-plan.component.html',
  styleUrls: ['./feature-rate-plan.component.css']
})
export class FeatureRatePlanComponent implements OnInit {

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
  planData: any = {
    "name": "",
    "feature_name": "",
    "feature_limit": "",
    "feature_rate": "",
    "description": "",
    "amount": "",
  }
  filter_list: any[] = [];
  globalRateList: any = "";
  menus: any;
  feactureRateMenu: any = '';
  packageMenu: any = '';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Plan Name';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';
  public popupWidth2: string = '100%';

  constructor(
    public FeaturesService: FeaturesService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.filter_list.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.packageMenu = this.menus.find((o) => o.url == '/package');
    this.feactureRateMenu = this.menus.find((o) => o.url == '/feature/ratePlan');
    this.filterForm = this.fb.group({
      'plan_id': [""],
    });
    this.FeaturesService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.FeaturesService.getFeaturePlan({}).subscribe(pagedData => {
      
      // this.filter_list = pagedData;
      let data = pagedData;
      for (let i = 0; i < data.length; i++) {
        this.filter_list.push({ id: data[i].id, name: data[i].name });
      }
      this.filter_list.unshift({id:0,name:'Select Plan Name'})

    });
    this.FeaturesService.getDefaultGlobalFeatureRate({}).subscribe(pagedData => {
      this.globalRateList = pagedData;
    }, err => {
      this.error = err.message;
    }
    );

  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Plan Name', hide: false, width: 10 },
      // { field: 'feature_name', headerName: 'Feature Name', hide: false, width: 10 },
      // { field: 'feature_limit', headerName: 'Feature Limit', hide: false, width: 10 },
      // { field: 'feature_rate', headerName: 'Feature Rate', hide: false, width: 10 },
      // { field: 'amount', headerName: 'Amount', hide: false, width: 20 },
      { field: 'description', headerName: 'Description', hide: false, width: 10 },

    ];
    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    
    this.FeaturesService.getFeaturePlan(this.filterObj).subscribe(pagedData => {
      this.exportData = pagedData;
      this.dataSource = [];
      pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
      this.error = err.message;
    }
    );
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    this.filterForm.reset();
    this.displayAllRecord();
  }


  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Plan Name", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
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
        1: { cellWidth: 'wrap' },
        2: { cellWidth: 'wrap' },
        3: { cellWidth: 'wrap' },
        4: { cellWidth: 'wrap' },
        5: { cellWidth: 'wrap' },
        6: { cellWidth: 'wrap' }
      },
    });
    doc.save('rateplan.pdf');

  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Plan Name', key: 'name', width: 30 },
      { header: 'Description', key: 'description', width: 40 }
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
      let strStatus = this.exportData[i].status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        name: this.exportData[i].name,
        description: this.exportData[i].description,
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

    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';

    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'gateway');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'RatePlan');
    });
  }

  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";

      if(this.feactureRateMenu.all_permission == '0' && this.feactureRateMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.feactureRateMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (pagedData[i].reserved == '1') {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-rocket views-button' style='cursor:pointer; display: inline;' data-action-type='release' title='Release'></i>\
      ";
      } else {
        // if (pagedData[i].status == 'Active') {
        //   pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
        //   finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
        // ";
        // } else {
        //   pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
        //   finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        // ";
        // }
        if (this.feactureRateMenu.delete_permission) {
          finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        }
        if (this.packageMenu && pagedData[i]['flag'] == 1) {
          finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewPackages' title='View Packages'></i>";
        }
        finalBtn += "<i class='fa fa-suitcase list-button' style='cursor:pointer; display: inline' data-action-type='upgrade' title='Upgrade'></i>";

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
      case "edit":
        return this.editratePlan(data);
      case "delete":
        return this.deleteratePlan(data);
      case "viewPackages":
        return this.showPackage(data);
      case "upgrade":
        return this.upgradeFeaturePlan(data)
      case "active":
    }
  }

  showPackage(data) {
    this.router.navigate(['feature/ratePlan/planPackage'], { queryParams: { fId: data.id, fName: data.name } });
  }

  editratePlan(data: any) {
    this.openDialog(data);
    //his.router.navigate(['config/manage-circle'], { queryParams: {id:data.id } });
  }
  addratePlan() {
    this.openDialog(null)
  }

  upgradeFeaturePlan(data: any) {
    const dialogRef = this.dialog.open(UpgradeFeatureRatePlanComponent, { width: '80%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  openDialog(data?): void {
    // alert(id);
    if (data) {
      data['globalRateList'] = this.globalRateList;
    }
    const dialogRef = this.dialog.open(ViewRatePlanDialog, { width: '80%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(featurePlanInfoDialog, {
      width: '80%', disableClose: true, autoFocus: false,
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

  deleteratePlan(event) {
    // debugger;
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Feature Rate Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.FeaturesService.deleteFeaturePlan({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                html: "<span style='color:#FFFFFF;'>Feature Rate Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is already exist in order. </span>",
                showConfirmButton: false,
                timer: 3000,
                background: '#000000',
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
          html: "<span style='color:#FFFFFF;'>Feature Rate Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Feature Rate Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }
}


@Component({
  selector: 'viewratePlan-dialog',
  templateUrl: './viewratePlan-dialog.html'
})

export class ViewRatePlanDialog implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  rateplanForm: FormGroup;
  page = new Page();
  feature_list: any;
  isEdit: boolean = false;
  errorField: any
  dialog: any;
  displayAllRecord: any;
  planData: any;
  menus: any;
  packageMenu: any;
  feactureRateMenu: any;
  globalRateList: any = "";
  constructor(
    public dialogRef: MatDialogRef<ViewRatePlanDialog>, @Inject(MAT_DIALOG_DATA) public data: RatePlan,
    private router: Router,
    public FeaturesService: FeaturesService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder
  ) {

    this.planData = {
      name: '',
      feature_name: '',
      feature_limit: '',
      feature_rate: '',
      // amount:'',
      description: '',
      unit_Type: ''
    };

    this.rateplanForm = this.fb.group({
      'name': ["", Validators.required],
      featureRateForm: new FormArray([]),   // this.fb.array([])
      // 'feature_name' : [""],
      // 'feature_limit' : [""],
      // 'feature_rate' : [""],

      // 'amount' : [""],
      'description': [""],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.packageMenu = this.menus.find((o) => o.url == '/package');
    this.feactureRateMenu = this.menus.find((o) => o.url == '/feature/ratePlan');
  }
  get name() { return this.rateplanForm.get('name'); }
  // get feature_name() { return this.rateplanForm.get('feature_name'); }
  // get feature_limit() { return this.rateplanForm.get('feature_limit'); }
  // get feature_rate() { return this.rateplanForm.get('feature_rate'); }
  // get amount() { return this.rateplanForm.get('amount'); }
  get description() { return this.rateplanForm.get('description'); }

  ngOnInit() {

    if(this.feactureRateMenu.all_permission == '0' && this.feactureRateMenu.view_permission == '1'){
      this.rateplanForm.disable();
    }


    if (this.data) { // edit
      this.FeaturesService.getGlobalFeatureRate({ featurePlanRateId: Number(this.data['id']) }).subscribe(data => {
        let managedArray = [];
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let obj = {};
            obj['id'] = data[i].global_feature_id;
            obj['feature_name'] = this.getFeatureName(data[i].global_feature_id);
            obj['feature_rate'] = data[i].amount;
            obj['feature_limit'] = data[i].count;
            obj['unit_Type'] = data[i].unit_Type;
            managedArray.push(obj);
            // feature_name
          }
        }
        this.feature_list = managedArray;
        this.setDefaultValue(); // set default value in form
      });
    } else {  //creation
      this.FeaturesService.getDefaultGlobalFeatureRate({}).subscribe(data => {
        this.feature_list = data;
        this.feature_list.map(item =>{
          Object.assign(item,{unit_Type:'1'})
        })
        
        if (data && !this.data) {
          this.setDefaultValue(); // set default value in form
        }
      });

    }

    this.planData = this.data;
    this.isEdit = true;
    if (!this.data) {
      this.planData = {
        name: '',
        // feature_name:'',
        // feature_limit:'',
        // feature_rates:'',
        // amount:'',
        description: ''
      };
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.rateplanForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  reloadFeature() {
    this.rateplanForm.reset();
    this.FeaturesService.updateGridList();
    this.dialogRef.close();
  }

  submitRatePlan() {
    if (this.rateplanForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.rateplanForm.value;

      if (this.data) {
        credentials.id = this.data.id;
        credentials.name = credentials.name[0].toUpperCase() + credentials.name.slice(1);
        this.FeaturesService.updateFeaturePlan(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.reloadFeature();
          } else if (data['code'] == 1062) {

            data['message'] = 'Duplicate Entry for Plan Name'
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });

          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })

      } else {
        credentials.name = credentials.name[0].toUpperCase() + credentials.name.slice(1);
        this.FeaturesService.addFeaturePlan(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.reloadFeature();
          } else if (data['code'] == 1062) {
            data['message'] = 'Duplicate Entry for Plan Name'
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }


        })

      }
    }
  }

  public setDefaultValue() {
    let control = <FormArray>this.rateplanForm.controls.featureRateForm;
    this.feature_list.forEach(x => {            
      control.push(this.fb.group(x));
    });
  }

  public getDefaultGlobalFeatureRate() {
    this.FeaturesService.getDefaultGlobalFeatureRate({}).subscribe(pagedData => {
      this.globalRateList = pagedData;
    }, err => {
      this.error = err.message;
    }
    );
  }

  public getFeatureName(id) {
    let returnArray = this.data['globalRateList'].filter(element => {
      if (element.id === id) {
        return element.feature_name;
      }
    });
    return returnArray[0].feature_name;
  }
}

@Component({
  selector: 'featurePlanInfoDialog',
  templateUrl: 'featurePlanInfoDialog.html',
})

export class featurePlanInfoDialog {

  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  globatrateForm: FormGroup;
  page = new Page();
  rows = new Array<RatePlan>();
  feature_name = "";
  feature_limit = "";
  feature_rate = "";
  circleForm: FormGroup;
  //dialogRefInfo: any;
  dialog: any;

  constructor(
    private fb: FormBuilder,
    public FeaturesService: FeaturesService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialogRefInfo: MatDialogRef<featurePlanInfoDialog>, @Inject(MAT_DIALOG_DATA) public data: RatePlan,

  ) { }

  ngOnInit() { }


  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

