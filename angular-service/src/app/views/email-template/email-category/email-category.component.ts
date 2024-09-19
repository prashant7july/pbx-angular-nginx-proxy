import { Component, OnInit, Inject } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { Errors, CommonService, ProductService,Name_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { EmailTemplateService } from '../email-template.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { EmailCategory } from 'src/app/core/models/email-category.model';

@Component({
  selector: 'app-email-category',
  templateUrl: './email-category.component.html',
  styleUrls: ['./email-category.component.css']
})
export class EmailCategoryComponent implements OnInit {
  errors: Errors = { errors: {} }; 
  filterForm: FormGroup;
  selectedValue:any = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  defaultPageSize = '10';
  selectedProduct = '';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'category_name', value: 'id' };
  public placeholder: string = 'Select Category';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  constructor(
    private fb: FormBuilder,
    private emailTemplateService: EmailTemplateService,
    public commonService: CommonService,
    public dialog: MatDialog,
    public productService : ProductService,
  ) {
    this.filterForm = this.fb.group({
      'by_category': new FormControl([]),
      'by_product': [""],
      'by_status': [""]
    });
  }

  ngOnInit() {
    this.emailTemplateService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.emailTemplateService.getEmailCategory().subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.errors = err.message;
    });

    this.productService.getProductInfo().subscribe(data => {
      this.selectedProduct = data.response;
    }, err => {
      this.errors = err.message;
    });
  }
  Providerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedValue.filter((data) =>{    
      return data['category_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }


  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'created_at', headerName: 'Date', hide: true, width: 20 },
      { field: 'product', headerName: 'Product', hide: false, width: 20 },
      { field: 'category_name', headerName: 'Name', hide: false, width: 30 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.by_status = Number(this.filterForm.value.by_status);
      this.emailTemplateService.filterEmailCategory(credentials).subscribe(data => {
        data=this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.errors = err.message;
      });
    } else {
      this.emailTemplateService.viewEmailCategory().subscribe(data => {
        data=this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.errors = err.message;
      });
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      if (pagedData[i].status == 'Active') {
        pagedData[i].status="<span style='color:#379457;'><strong>"+ pagedData[i].status+"</strong></span>";
      }else{
        pagedData[i].status="<span style='color:#c69500;'><strong>"+ pagedData[i].status+"</strong></span>";
      }
    }
    return pagedData;
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(EmailCategoryDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
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

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoEmailCategoryDialog, {
      width: '80%', disableClose: true, autoFocus:false,
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
}

@Component({
  selector: 'infoEmailCategory-dialog',
  templateUrl: 'infoEmailCategory-dialog.html',
})

export class InfoEmailCategoryDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoEmailCategoryDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) {}
 
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

@Component({
  selector: 'email-category-dialog',
  templateUrl: 'email-category-dialog.html'
})

export class EmailCategoryDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  categoryForm: FormGroup;
  checkForm: any;
  emailCategoryData: any = {};
  emailCategoryExist = false;
  email_category_id = "";
  selectedValue:any = "";

  constructor(
    public dialogRef: MatDialogRef<EmailCategoryDialog>, @Inject(MAT_DIALOG_DATA) public data: EmailCategory,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private emailTemplateService: EmailTemplateService,
    public commonService: CommonService,
    private productService: ProductService,
  ) {
    this.categoryForm = this.fb.group({
      'category': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'product': ['', Validators.required]
    });
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  get category() { return this.categoryForm.get('category'); }
  get product() { return this.categoryForm.get('product'); }


  ngOnInit() {
    this.productService.getProductInfo().subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.errors = err.message;
    });
  }


  public findInvalidControls() {
    const invalid = [];
    const controls = this.categoryForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }


  submitCategory() {
    this.checkForm = this.findInvalidControls();
    if (this.categoryForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.categoryForm.value;

      credentials.id = null;

      this.emailTemplateService.createEmailCategory('createEmailCategory', credentials)
        .subscribe(data => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.cancelEmailcategory();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
    }
  }

  cancelEmailcategory() {
    this.categoryForm.reset();
    this.emailCategoryExist = false;
    this.emailTemplateService.updateGridList();
    this.dialogRef.close();
  }
}
