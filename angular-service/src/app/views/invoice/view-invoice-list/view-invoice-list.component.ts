import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup ,Validator, Validators,} from '@angular/forms';
import { CommonService, ProductService,Number_RegEx, EMAIL_RegEx, Name_RegEx,upi_regex } from '../../../core';
import { InvoiceService } from '../invoice.service';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserTypeConstants } from 'src/app/core/constants';
import { PromptsService } from 'src/app/views/prompts/prompts.service';
import { ToastrService } from 'ngx-toastr';
import { PayInvoiceComponent } from '../pay-invoice/pay-invoice.component';
import { DateAdapter } from '@angular/material';
import { TestPaymentService } from '../../test-payment/test-payment.service';
import { UserService } from '../../user/user.service';
declare const ExcelJS: any;
export var productId = '1';

@Component({
  selector: 'app-view-invoice-list',
  templateUrl: './view-invoice-list.component.html',
  styleUrls: ['./view-invoice-list.component.css']
})
export class ViewInvoiceListComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  isFilter = false;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  userType = '';
  companyList: any[] = [];
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  countryList: any = "";
  menus: any = "";
  invoiceMenu: any = "";
  paymentStatus ;


  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    public productService : ProductService,
    public promptsService: PromptsService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private userService:UserService
  ) {{
    var ex = '^\d+(?:\.\d{1,2})?$';
    this.filterForm = this.formBuilder.group({
      'by_date': [""],
      'by_company':  new FormControl([]),
      'by_product': [""],
      'by_country': [""],
      'paid_status':[""],
      'reference_num':[""],
      'amount':[""],
      'customer_status' : [""]

    });
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.invoiceMenu = this.menus.find((o) => o.url == '/invoice');
  } }

  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  ngOnInit() {
    this.productService.getProductInfo().subscribe(data => {
      this.selectedValue = data.response;
    });
    this.userType = localStorage.getItem('type');
       this.displayAllRecord();
       let userType = localStorage.getItem('type');
       let id = localStorage.getItem('id');
       if (userType == '3') {
         this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
           let data = datas.response;
           for (let i = 0; i < data.length; i++) {
             this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
           }
         }, err => {
           this.error = err.message;
         });
       }else{
       this.commonService.getCompany().subscribe(datas => {
        // this.companyData = data.response;
        let data = datas.response;
      for (let i = 0; i < data.length; i++) {
        this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
        
      }
      }, err => {
        this.error = err.message;
      });
    }

      this.commonService.getCountryList().subscribe(data => {
        this.countryList = data.response;
      }, err => {
        this.error = err.message;
      });

      this.paymentStatus = this.route.snapshot.queryParams.status || false;
      if (this.paymentStatus) {
        if (this.paymentStatus == '01') {
          this.toastr.success('Success!', "Payment Done Successfully", { timeOut: 2000 });
        } else {
          this.toastr.error('Error!', "Payment Failed", { timeOut: 2000 });
        }
      }
  }
  Companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    let id = localStorage.getItem('id');    
    let customer_id = this.route.snapshot.queryParams.id || null;

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 5 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'invoice_date', headerName: 'Invoice Date', hide: false, width: 10 },
      { field: 'company_name', headerName: 'Company', hide: (this.userType=='1'), width: 10 },
      { field: 'reference_num', headerName: 'Invoice Number', hide: false, width: 10 },
      { field: 'amount', headerName: 'Amount (Without GST)', hide: false, width: 15 },
      { field: 'amount_with_gst', headerName: 'Amount (With GST)', hide: false, width: 15 },
      { field: 'paid_status', headerName: 'Status', hide: false, width: 10 },

    ];

    if (this.isFilter) {
      if(this.userType === UserTypeConstants.ACCOUNT_MANAGER){  //AM
        const credentials = this.filterForm.value;
        credentials.account_manager_id = id;
        this.invoiceService.getInvoicesOfManagerCustomerByFilters(credentials).subscribe(pagedData => {
          this.exportData = pagedData;
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        });
      }else{
        const credentials = this.filterForm.value; 
        let role = Number(localStorage.getItem('type'));
        let ResellerID = Number(localStorage.getItem('id'));       
        credentials.customer_id = (this.userType == '0' || this.userType == '5') ? null : this.userType == '4' ? customer_id : customer_id  == null ? localStorage.getItem('id') : customer_id;
        credentials.amount = Number(credentials.amount);
        credentials.customer_status = Number(credentials.customer_status);
        credentials.paid_status = Number(credentials.paid_status);
        credentials.reference_num = Number(credentials.reference_num);
        this.invoiceService.getInvoiceByFilters(credentials,role,ResellerID).subscribe(pagedData => {
          this.exportData = pagedData;
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        });
      }

    } else {
      if (this.userType === '0' ) {  //ADMI
      this.invoiceService.getAllInvoices().subscribe(pagedData => {
       this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);        
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
  
      });
    }else if(this.userType === UserTypeConstants.ACCOUNT_MANAGER){  //AM
      this.invoiceService.getAllInvoicesOfManagerCustomer(id,customer_id).subscribe(pagedData => {
        this.exportData = pagedData;
         pagedData = this.manageUserActionBtn(pagedData);
         this.dataSource = [];
         this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
       });
    }else if(this.userType === UserTypeConstants.SUPPORT_MANAGER){  //SM
      this.invoiceService.getAllInvoices().subscribe(pagedData => {
        this.exportData = pagedData;
         pagedData = this.manageUserActionBtn(pagedData);
         this.dataSource = [];
         this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
       });
    }else{
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      this.invoiceService.getAllInvoicesOfCustomer(id,role).subscribe(pagedData => {
        this.exportData = pagedData;
         pagedData = this.manageUserActionBtn(pagedData);
         this.dataSource = [];
         this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
       });
    }
    }
  }

  exportToExcel() {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Invoice Date', key: 'invoice_date', width: 25 },
      { header: 'Company Name', key: 'company_name', width: 25 },
      { header: 'Invoice Number', key: 'reference_num', width: 25 },
      { header: 'Invoice Amount', key: 'amount_with_gst', width: 25 },
      { header: 'Status', key: 'paid_status', width: 25 },
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
        invoice_date: this.exportData[i].invoice_date,
        company_name: this.exportData[i].company_name,
        reference_num: this.exportData[i].reference_num,
        amount_with_gst: this.exportData[i].amount_with_gst,
        paid_status: this.exportData[i].paid_status,
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

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'invoice_detail');
    });
  }
  updateData(){
    this.invoiceService.updateGridList();
  }

  downloadPDF() {
    var doc = new jsPDF('p', 'mm', 'a3');
    var col = ["Invoice Date", "Company Name", "Invoice Number","Invoice Amount","Status"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.invoice_date, element.company_name, element.reference_num,element.amount_with_gst,
        element.paid_status];
      rows.push(e11);
    });
    doc.autoTable(col, rows, {
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 5
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' }
      },
    });
    doc.save('invoice_detail.pdf');
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";[]
      //finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline;' data-action-type='view' title='View'></i>";
      // finalBtn += "</span>";
      if(this.invoiceMenu.modify_permission){

        if(this.userType === UserTypeConstants.CUSTOMER && pagedData[i]['paid_status'] != '1' && Number(pagedData[i]['amount_with_gst']) > 0){
          finalBtn += "<button class='icon-hover' mat-raised-button color='primary' style='cursor:pointer; display: inline; background-color: #0ca9f1fa !important; border : none; color:white; border-radius: 4px ' data-action-type='pay' title='Pay'>Pay</button>";
          finalBtn += "</span>";
        }else if(this.userType === UserTypeConstants.ADMIN && pagedData[i]['paid_status'] != '1' && Number(pagedData[i]['amount_with_gst']) > 0){
          finalBtn += "<button class='icon-hover' mat-raised-button color='primary' style='cursor:pointer; display: inline; background-color: #0ca9f1fa !important; border : none; color:white; border-radius: 4px ' data-action-type='Adminpay' title='Admin Pay'>Pay</button>";
        }else{
          finalBtn += "</span>";
        }
      }
        // if(pagedData[i]['paid_status'] == '1' && Number(pagedData[i]['amount_with_gst']) > 0){
      //   pagedData[i]['paid_status'] = 'Paid';

      // }
      // else if(pagedData[i]['paid_status'] == '1' && Number(pagedData[i]['amount_with_gst']) == 0){

      //   pagedData[i]['paid_status'] = 'No need to pay';

      // }
      // else if(pagedData[i]['paid_status'] == '2' && Number(pagedData[i]['amount_with_gst']) == 0){

      //   pagedData[i]['paid_status'] = 'No need to pay';

      // }
      if(pagedData[i]['paid_status'] == '1'){

        pagedData[i]['paid_status'] = 'Paid';

      }
      else if(pagedData[i]['paid_status'] == '2'){

        pagedData[i]['paid_status'] = 'Not Paid';

      }else if(pagedData[i]['paid_status'] == '3'){

        pagedData[i]['paid_status'] = 'Overdue';

      }else if(pagedData[i]['paid_status'] == '4'){

        pagedData[i]['paid_status'] = 'No need to pay';

      }else if(pagedData[i]['paid_status'] == '5'){

        pagedData[i]['paid_status'] = 'Previous balance remaining';

      }else{
        pagedData[i]['paid_status'] = '';
      }
      pagedData[i]['action'] = finalBtn;

    }
    return pagedData;
  }

  manageAction(e) {    
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "view":
        return this.viewInvoice(data);
      case "pay":
        return this.payInvoice(data);
      case "Adminpay":
        return this.adminPayInvoice(data)
    }
  }

  adminPayInvoice(data){
const dialogRefBalance = this.dialog.open(AdminPayInvoiceComponent, { width: '60%', disableClose: true, data: data  });
dialogRefBalance.keydownEvents().subscribe(e => {
  if (e.keyCode == 27) {
    dialogRefBalance.close('Dialog closed');
  }
});
dialogRefBalance.afterClosed().subscribe(result => {
});
  }

  viewInvoice(data){
    this.router.navigate(['invoice/view-invoice/view'], { queryParams: { id: data.id } });
  }
  payInvoice(data){
      const dialogRefBalance = this.dialog.open(PayInvoiceComponent, { width: '60%', disableClose: true, data: data  });
      dialogRefBalance.keydownEvents().subscribe(e => {
        if (e.keyCode == 27) {
          dialogRefBalance.close('Dialog closed');
        }
      });
      dialogRefBalance.afterClosed().subscribe(result => {
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


}

@Component({
  selector: 'app-admin-pay-invoice',
  templateUrl: './admin-pay-invoice.component.html',
})

export class AdminPayInvoiceComponent {
  selectedPaymentType = 2;
  adminPaymentFormGroup: FormGroup;
  amount_with_gst : number = 0.00;
  isCash : boolean = false;
  is_dd : boolean = false;
  is_cheque: boolean = false;
  is_upi : boolean = false;
  read : boolean = true;
  customer_id ;
  invoice_number;
  minDate;


  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private formBuilder: FormBuilder,
    private testPaymentService:TestPaymentService,
    public commonService: CommonService,
    private dateAdapter: DateAdapter<Date>,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<AdminPayInvoiceComponent>, @Inject(MAT_DIALOG_DATA) public data:any,
  ) {
    this.adminPaymentFormGroup = formBuilder.group({
      paymentMode: [''],
      dateRange: ['', Validators.required],
      amount_with_gst: [''],
      dd_number: [''],
      bank_name: [''],
      amount_to_pay: ['', Validators.required],
      cheque_number: [''],
      upi_number: ['',[Validators.pattern(upi_regex)]],
      payment_type: [''],
      desc: [''],
    });
    this.dateAdapter.setLocale('en-GB');
   }

   get upi_number() { return this.adminPaymentFormGroup.get('upi_number'); }


  ngOnInit() {
    let date = new Date();
    this.minDate = new Date(date.getFullYear(), date.getMonth(), 1)
    this.isCash = true;
    // this.adminPaymentFormGroup.get('payment_type').setValue('2');
    
    this.customer_id = this.data.customer_id;
    this.invoice_number = this.data.reference_num;

    this.customOninit();
  }

  customOninit(){
    setTimeout(() => {
      this.invoiceService.getPreviousLogPayments(this.invoice_number).subscribe(data=>{
        if(data){
          this.amount_with_gst = this.data.amount_with_gst - data['total'];
          this.adminPaymentFormGroup.get('amount_to_pay').setValue(this.amount_with_gst.toFixed(2))
          this.adminPaymentFormGroup.get('amount_with_gst').setValue(this.amount_with_gst.toFixed(2))
        }else{
          this.amount_with_gst= parseFloat(this.data.amount_with_gst.toFixed(2));
        }    
      })
    }, 1000);
  }

  modechange(data){

    if(data.value == '2'){
      this.is_dd = true;
      this.is_cheque =false;
      this.is_upi = false;
      this.isCash == false;
      this.adminPaymentFormGroup.get('dd_number').setValidators(Validators.required);
      this.adminPaymentFormGroup.get('bank_name').setValidators(Validators.required);
      this.adminPaymentFormGroup.get('dd_number').updateValueAndValidity();
      this.adminPaymentFormGroup.get('bank_name').updateValueAndValidity();



      this.adminPaymentFormGroup.get('cheque_number').setValue("");
      this.adminPaymentFormGroup.get('cheque_number').clearValidators();
      this.adminPaymentFormGroup.get('cheque_number').updateValueAndValidity();
      this.adminPaymentFormGroup.get('upi_number').setValue("");
      this.adminPaymentFormGroup.get('upi_number').clearValidators();
      this.adminPaymentFormGroup.get('upi_number').updateValueAndValidity();
    }else if(data.value == '3'){
      this.is_dd = false;
      this.is_cheque =true;
      this.is_upi = false;
      this.isCash == false;  

      this.adminPaymentFormGroup.get('cheque_number').setValidators(Validators.required);
      this.adminPaymentFormGroup.get('bank_name').setValidators(Validators.required);
      this.adminPaymentFormGroup.get('cheque_number').updateValueAndValidity();
      this.adminPaymentFormGroup.get('bank_name').updateValueAndValidity();


      this.adminPaymentFormGroup.get('dd_number').setValue("");
      this.adminPaymentFormGroup.get('dd_number').clearValidators();  
      this.adminPaymentFormGroup.get('dd_number').updateValueAndValidity();

      this.adminPaymentFormGroup.get('upi_number').setValue("");
      this.adminPaymentFormGroup.get('upi_number').clearValidators(); 
      this.adminPaymentFormGroup.get('upi_number').updateValueAndValidity();
  
    }else if(data.value == '4'){
      this.is_dd = false;
      this.is_cheque =false;
      this.is_upi = true;
      this.isCash == false;
      this.adminPaymentFormGroup.get('upi_number').setValidators(Validators.required);
      this.adminPaymentFormGroup.get('bank_name').setValidators(Validators.required);
      this.adminPaymentFormGroup.get('upi_number').updateValueAndValidity();
      this.adminPaymentFormGroup.get('bank_name').updateValueAndValidity();



      this.adminPaymentFormGroup.get('dd_number').setValue("");
      this.adminPaymentFormGroup.get('dd_number').clearValidators(); 
      this.adminPaymentFormGroup.get('dd_number').updateValueAndValidity();

      this.adminPaymentFormGroup.get('cheque_number').setValue("");
      this.adminPaymentFormGroup.get('cheque_number').clearValidators();  
      this.adminPaymentFormGroup.get('cheque_number').updateValueAndValidity();

      this.adminPaymentFormGroup.get('bank_name').setValue("");
      this.adminPaymentFormGroup.get('bank_name').clearValidators();
      this.adminPaymentFormGroup.get('bank_name').updateValueAndValidity();


      }else if(data.value == '1'){
      this.is_dd = false;
      this.is_cheque =false;
      this.is_upi = false;
      this.isCash == true; 

      this.adminPaymentFormGroup.get('bank_name').setValue("");
      this.adminPaymentFormGroup.get('bank_name').clearValidators();
      this.adminPaymentFormGroup.get('bank_name').updateValueAndValidity();

      this.adminPaymentFormGroup.get('dd_number').setValue("");
      this.adminPaymentFormGroup.get('dd_number').clearValidators(); 
      this.adminPaymentFormGroup.get('dd_number').updateValueAndValidity();

      this.adminPaymentFormGroup.get('cheque_number').setValue("");
      this.adminPaymentFormGroup.get('cheque_number').clearValidators(); 
      this.adminPaymentFormGroup.get('cheque_number').updateValueAndValidity();

      this.adminPaymentFormGroup.get('upi_number').setValue("");
      this.adminPaymentFormGroup.get('upi_number').clearValidators(); 
      this.adminPaymentFormGroup.get('upi_number').updateValueAndValidity();

        }
  }

  onNoClick(): void {
    this.dialogRef.close();
    }

    changePayment(data){
    if(data == '2'){
      this.adminPaymentFormGroup.get('amount_to_pay').setValue(this.amount_with_gst);
      this.read = true;
    }else{
      this.adminPaymentFormGroup.get('amount_to_pay').setValue("");
      this.adminPaymentFormGroup.get('amount_to_pay').updateValueAndValidity();
      this.read = false;
    }
    }

    submit(){
     let credentials = this.adminPaymentFormGroup.value; 
     if(Number(credentials['amount_with_gst']) < Number(credentials['amount_to_pay'])){
      this.toastr.error('Error!', 'Incorrect Amount', { timeOut: 2000 });
      return;
     }else{
       if(Number(credentials['amount_with_gst']) == Number(credentials['amount_to_pay'])){
        credentials['paid'] = '1';
       }
       credentials['customer_id'] = this.customer_id;
       credentials['invoice_number'] = this.invoice_number
  
       this.invoiceService.saveAdminPaymentLog(credentials).subscribe(data=>{
        if(data.status_code == 200){
          this.toastr.success('Success!', 'Transaction Successfull', { timeOut: 2000 });
          this.cancleDialog();
          
        
        }else{
          this.toastr.error('Error!', 'Something Wrong Happened', { timeOut: 2000 });
        }
       })
     }
     
    }
    cancleDialog(): void {
      this.adminPaymentFormGroup.reset();
      this.dialogRef.close();
      this.invoiceService.updateGridList();
      this.invoiceService.displaySavedRecord();
  
    }

} 

