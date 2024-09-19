import { Component, OnInit, Inject,  } from '@angular/core';
import { EmailTemplateService } from '../email-template.service';
import { Router, NavigationEnd } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductService, Errors, Name_RegEx, CommonService, EmailTemplate, textareaContent,profileError, UserService } from '../../../core';
import { FileUploader  } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment.prod';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ProductProfileService } from '../../product-profile/product.profile.service';

const URL = environment.api_url + 'api/upload/';

@Component({
  selector: 'app-view-email-template',
  templateUrl: './view-email-template.component.html',
  styleUrls: ['./view-email-template.component.css']
})
export class ViewEmailTemplateComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  filterForm: FormGroup;
  selectedValue:any = "";
  selectedProduct:any = "";
  ProductFilter:any;
  filterProduct:any;
  errors: Errors = { errors: {} };
  isFilter = false;
  countTemplate = true;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  viewButton: boolean = false;
  editButton: boolean = true;
  deleteButton: boolean = true;
  statusButton: boolean = true;
  defaultPageSize = '10';
  menus: any;
  emailViewMenu: any = '';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'category_name', value: 'id' };
  public fields1: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Category';
  public placeholder1: string = 'Select Provider';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  constructor(
    private emailTemplateService: EmailTemplateService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public productService: ProductService,
  ) {
    this.filterForm = this.fb.group({
      'by_category': new FormControl([]),
      'by_product': [""],
      'by_status': [""],
    });
  }


  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.emailViewMenu = this.menus.find((o) => o.url == '/emailTemplate/view');
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
      this.filterProduct = this.ProductFilter = this.selectedProduct.slice();
    }, err => {
      this.errors = err.message;
    });

  }
  Customerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedValue.filter((data) =>{    
      return data['category_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Productremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedProduct.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'category_name', headerName: 'Category', hide: false, width: 25 },
      { field: 'product', headerName: 'Product', hide: false, width: 20 },
      { field: 'title', headerName: 'Title', hide: false, width: 20 },
      { field: 'image', headerName: 'Image', hide: true, width: 15 },
      { field: 'contentDisplay', headerName: 'Content', hide: false, width: 40 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.emailTemplateService.filterEmailtemplate(credentials).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.emailTemplateService.viewEmailTemplate({ id: null }).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
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
      finalBtn += "<span>";

      if(this.emailViewMenu.all_permission == '0' && this.emailViewMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.emailViewMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (pagedData[i].status == 'Inactive') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        ";
        if (this.emailViewMenu.delete_permission) {
          finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        }
      } else {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
      }
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
      pagedData[i]['contentDisplay'] = pagedData[i]['contentDisplay'].trim(); //handle spacing
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
      case "active":
        return this.updateStatus(data);
      case "inactive":
        return this.updateStatus(data);
    }
  }


  editData(event) {
    this.openDialog(event.id);
  }

  deleteData(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Email template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.category_name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.emailTemplateService.deleteEmailTemplate({ id: event.id }).subscribe(data => {
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
          html: "<span style='color:#FFFFFF;'>Email template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.category_name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Email template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.category_name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }



  updateStatus(event) {
    let emailTemplateStatus = '';
    let btnmessage = '';
    let action = event.status.match(/Active/g) ? 'Active' : 'Inactive';
    if (action == 'Active') {
      emailTemplateStatus = 're-activate';
      btnmessage = "Inactive";
    } else {
      emailTemplateStatus = 'inactive';
      btnmessage = "Activate";
    }

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You can ' + emailTemplateStatus + ' this email template in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes,' + btnmessage + ' it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.emailTemplateService.updateEmailTemplateStatus('updateEmailTemplateStatus', event.id, action, event.category_id).subscribe(data => {
          this.checkMultipleStatus(event.id, action, event.category_id);// for multiple status
          this.displayAllRecord();
        }, err => {
          this.error = err.message;
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">' + btnmessage + 'd!</span>',
          text: 'Email template has been ' + btnmessage + 'd.',
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'Email template is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    });
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(EmailTemplateDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed'); 
    });
  }

  checkMultipleStatus(id, action, email_category_id) {
    this.emailTemplateService.checkMultipleStatus('checkMultipleStatus', id, action, email_category_id).subscribe(data => {
      this.displayAllRecord();
    }, err => {
      this.error = err.message;
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
    const dialogRefInfo = this.dialog.open(InfoEmailTemplateDialog, {
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
  
 
}

@Component({
  selector: 'preview-dialog',
  templateUrl: 'preview-dialog.html',
})

export class PreviewDialog {
  encoded: SafeHtml;
  image: string;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    public dialogRefInfo: MatDialogRef<PreviewDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.image = this.data.template.image
    this.encoded = this.sanitizer.bypassSecurityTrustHtml(this.data.template.content);
  }


  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'infoEmailTemplate-dialog',
  templateUrl: 'infoEmailTemplate-dialog.html',
})

export class InfoEmailTemplateDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoEmailTemplateDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
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

export declare var tinymce: any;
export var imagePath: any;

@Component({
  selector: 'emailtemplate-dialog',
  templateUrl: 'emailtemplate-dialog.html',
})

export class EmailTemplateDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  emailForm: FormGroup;
  checkForm: any;
  title = 'app';
  selectedFile: File = null;
  selectedValue:any = [];
  EmailFilter:any;
  filterCategory:any;
  sessionId = "";
  emailTemplateData: any = {};
  mailContent = "";
  dynamicPath = "";
  uploadImageFile = "";
  defaultImage = "ECTL_logo_new.png"
  imagePath1 = "";
  selectedProduct = [];
  ProductFilter:any;
  filterSelectProduct:any;
  productId = 0;
  logoImage = "ECTL_logo_new.png";
  
  // public mode = 'CheckBox';;
  // public selectAllText: string = 'Select All';
  public fields4: Object = { text: 'category_name', value: 'id' };
  public fields1: Object = { text: 'name', value: 'id' };
  public fields6: Object = { text: 'name', value: 'id' };
  public placeholder4: string = 'Select Category';
  public placeholder6: string = 'Select Provider';
  public placeholder7: string = ' Select Email Category';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public imgError: string = ''
  public uploader: FileUploader = new FileUploader({
    url: URL, 
    itemAlias: 'image',
    allowedMimeType: ['image/png','image/jpg','image/jpeg'], 
    method: 'post'
  });
  emailbind: any;
  menus: any;
  emailViewMenu: any;


  constructor(
    public dialogRef: MatDialogRef<EmailTemplateDialog>, @Inject(MAT_DIALOG_DATA) public data: EmailTemplate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private emailTemplateService: EmailTemplateService,
    public commonService: CommonService,
    public productService: ProductService,
    public dialog: MatDialog,
    private productProfileService: ProductProfileService,
  ) {
    this.emailForm = this.fb.group({
      'name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'image': [''],
      'emailTitle': ['', [Validators.required]],
      'content': [''],
      'category': ['', Validators.required],
      'product': ['', Validators.required],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.emailViewMenu = this.menus.find((o) => o.url == '/emailTemplate/view');
  }

  get name() { return this.emailForm.get('name'); }
  get emailTitle() { return this.emailForm.get('emailTitle'); }
  get content() { return this.emailForm.get('content'); }
  get category() { return this.emailForm.get('category'); }
  get image() { return this.emailForm.get('image'); }
  get product() { return this.emailForm.get('product'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.emailForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }


  ngOnInit() {

    if(this.emailViewMenu.all_permission == '0' && this.emailViewMenu.view_permission == '1'){
      this.emailForm.disable();
    }
    
    let data = localStorage.getItem('id');
    this.productProfileService.getLogo(data, localStorage.getItem('type')).subscribe(data => {
      this.logoImage = data.logo_path[0]['logo_img'].replace('assets/uploads/','');
      console.log(this.logoImage,"logo");
      
    });
    tinymce.remove();
    tinymce.init(
      {
        selector: "#mainContent",
        menubar: false,
        statusbar: false,
        mode: "textareas",
        editor_selector: "mceEditor",
        readonly: false,
        convert_urls: false,
        relative_urls: false,
        // forced_root_block : "",

        entity_encoding: 'raw',
        // forced_root_block : "",
        style_formats: [
          { title: 'Bold text', inline: 'b' },
          { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
          { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
          { title: 'Example 1', inline: 'span', classes: 'example1' },
          { title: 'Example 2', inline: 'span', classes: 'example2' },
          { title: 'Table styles' },
          { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
        ]
      });

    this.productService.getProductInfo().subscribe(data => {
      this.selectedProduct = data.response ? data.response : [];
      this.filterSelectProduct = this.ProductFilter = this.selectedProduct.slice();
      // if(this.selectedProduct.length > 0) this.emailTemplateData.product_id = this.selectedProduct[0]['id'];
    }, err => {
      this.errors = err.message;
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      this.imgError = ''
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = URL + item.file.name;
      this.imagePath1 = item.file.name;
      this.uploadImageFile = item.file.name;//when image uploaded show imge on frontend
      this.logoImage = item.file.name;
      // alert('File uploaded successfully');
    };

    this.uploader.onWhenAddingFileFailed = (item) => {
      this.imgError = `Sorry, ${item.name} is invalid, allowed extensions are: .png, .jpg, .jpeg`
    }
    if (this.data.id) {
      this.emailTemplateService.viewEmailTemplate({ id: this.data.id }).subscribe(data => {
        console.log(data[0],"data00000");
        
        this.emailTemplateData = data[0];
        
        this.emailbind = this.emailTemplateData.category_id
        
        this.productId = this.emailTemplateData.product_id;
        this.mailContent = this.emailTemplateData.content;
        tinymce.get("mainContent").setContent(this.mailContent);
        this.selectCategory(this.productId, true);
        // this.dynamicPath = URL + this.emailTemplateData.image;
        this.dynamicPath = environment.api_url + 'assets/uploads/' + this.emailTemplateData.image;
        console.log(this.emailTemplateData.image,"============");
        
        this.logoImage = this.emailTemplateData.image2.split('/')[0] == 'email' ? this.emailTemplateData.image2.replace('email/assets/uploads/',"") : this.logoImage;
        // this.logoImage =  this.emailTemplateData.image ?  this.emailTemplateData.image : this.logoImage;
      }, err => {
        this.errors = err.message;
      });
    }
  }   

  Selectremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedProduct.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Categoryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedValue.filter((data) =>{    
      return data['category_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  ngOnDestroy() {
    tinymce.remove();
  }

  selectCategory(event, firstTime =false) {
    
    let product = event.value ? event.value : event;
    this.emailTemplateService.getProductEmailCategory({ product: product }).subscribe(data => {
      this.selectedValue = data;
      this.filterCategory = this.EmailFilter = this.selectedValue.slice();
      if (this.data.id && firstTime) {
        this.emailbind = this.emailTemplateData.category_id
        this.emailForm.get('category').setValue(this.emailTemplateData.category_id)
      }
    }, err => {
      this.errors = err.message;
    });
  }

  submitEmail() {
    this.checkForm = this.findInvalidControls();
    if (this.emailForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      var mainContent = tinymce.get("mainContent").getContent() ? tinymce.get("mainContent").getContent() : this.emailForm.controls['content'].value;

      const credentials = this.emailForm.value;
      credentials.content = mainContent;
      if (credentials.content == "" || !credentials.content) {
        this.toastr.error('Error!', textareaContent, { timeOut: 2000 });
        return;
      }
      //image already shown at frontside if someone do not want to change the image then dynamicPath value comes
      // credentials.image = imagePath ? environment.api_url+'assets/uploads/'+this.uploadImageFile : this.dynamicPath;
      credentials.id = this.data.id ? this.data.id : null;

      if (!this.data.id) {
        let img = this.emailForm.get('image').value;
        credentials.image =  environment.api_url + 'email/assets/uploads/' + (this.imagePath1 ? this.imagePath1 : this.logoImage);
      } else {
        credentials.image = this.uploadImageFile ? environment.api_url + 'email/assets/uploads/' + this.uploadImageFile : environment.api_url + 'assets/uploads/' + this.logoImage;
      }

      if (credentials.image == '' || credentials.image == '/assets/uploads/') {
        this.toastr.error('Error!', profileError, { timeOut: 2000 });
        return;
      }

      this.emailTemplateService.createEmailTemplate('createEmailTemplate', credentials)
        .subscribe(data => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
    }
  }

  preview() {
    let credentials = this.emailTemplateData 
    var mainContent = tinymce.get("mainContent").getContent();
    credentials.content = mainContent;
    credentials.image = this.logoImage 
    
    const dialogRefInfo = this.dialog.open(PreviewDialog, {
      width: '60%', 
      disableClose: true, 
      autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        template: credentials
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

  cancelForm() {
    this.emailForm.reset();
    this.emailTemplateService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}
