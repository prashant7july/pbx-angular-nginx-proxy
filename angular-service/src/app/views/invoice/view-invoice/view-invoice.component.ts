import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { elementAt } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TestPaymentService } from '../../test-payment/test-payment.service';
import { UserTypeConstants } from 'src/app/core/constants/userType.constant';
import { ProductProfileService } from '../../product-profile/product.profile.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.css']
})
export class ViewInvoiceComponent implements OnInit {
  invoiceData = '';
  itemData = '';
  cdrData = '';
  reference_num = '';
  invoice_date = '';
  company_name = '';
  company_address = '';
  email = '';
  phone = '';
  inv_amount: number = 0.00;
  cdrSum = 0.00;
  didSum = 0.00;
  state_id = '';
  isDelhi = false;
  paymentFormGroup: FormGroup;
  htmlCode: any;
  amount_with_gst : number = 0.00;
  advance_balance : number = 0.00;
  loginUserType = localStorage.getItem('type');
  final_payment : number = 0.00;
  adjustment_payment : number = 0.00;

  organization_name = '';
  organization_address = '';
  organization_gstin = '';
  previous_invoice_balance : any;
  invoice_due_date ;
  invoice_period ;
  payment_day = '';
  payment_detail = '';
  sgst_amount = 0;
  cgst_amount = 0;
  organization_email = '';
  organization_mobile = '';
  organization_extension = '';
  organization_cin = '';
  organization_pan = '';
  pan_number = '';
  po_number = '';
  pi_number = '';
  comp_gst = '';
  userRole : any;
  product_logo: any;
  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private formBuilder: FormBuilder,
    private testPaymentService:TestPaymentService,
    private productProfileService: ProductProfileService,
    private ngxService: NgxUiLoaderService
  ) {
    this.paymentFormGroup = formBuilder.group({
      custId: ['', Validators.required],
      orderId: ['', Validators.required],
      amount: ['', Validators.required],
      mobile: ['', Validators.required],
      email: ['', Validators.required]
    });
   }

  ngOnInit() {   
    this.userRole = localStorage.getItem('type');
    var invoiceId = this.route.snapshot.queryParams.id;
    this.invoiceService.getInvoicesById(invoiceId).subscribe(invoiceData => {
      this.invoiceData = invoiceData[0];
      this.reference_num = invoiceData[0].reference_num;
      this.invoice_date = invoiceData[0].invoice_date;
      this.company_name = invoiceData[0].company_name;
      this.company_address = invoiceData[0].company_address;
      this.email = invoiceData[0].email;
      this.phone = invoiceData[0].phone;
      this.inv_amount = invoiceData[0].amount;
      this.state_id = invoiceData[0].state_id;
      this.amount_with_gst= parseFloat(invoiceData[0].amount_with_gst);
      this.advance_balance = parseFloat(invoiceData[0].advance_balance);
      this.organization_name = invoiceData[0].organization_name;
      this.organization_address = invoiceData[0].organization_address;
      this.organization_gstin = invoiceData[0].gstin;
      this.organization_cin = invoiceData[0].cin;
      this.organization_pan = invoiceData[0].pan;
      // this.previous_invoice_balance = invoiceData[0].previous_invoice_balance;
      this.invoice_due_date = invoiceData[0].invoice_due_date;
      this.invoice_period = invoiceData[0].invoice_period + ' to ' + this.invoice_date;

      this.payment_day = invoiceData[0].payment_day;
      this.payment_detail = invoiceData[0].payment_detail;
      this.sgst_amount = Number(invoiceData[0].sgst_amount);
      this.cgst_amount = Number(invoiceData[0].cgst_amount);
      this.organization_email = invoiceData[0].organization_email;
      this.organization_mobile = invoiceData[0].organization_mobile;
      this.organization_extension = invoiceData[0].organization_extension;
      this.pan_number = invoiceData[0].pan_number != 0 ? invoiceData[0].pan_number : "-";
      this.po_number = invoiceData[0].po_number != 0 ? invoiceData[0].po_number : '-';
      this.pi_number = invoiceData[0].pi_number != 0 ? invoiceData[0].pi_number : '-';
      this.comp_gst = invoiceData[0].company_gst_number != 0 ? invoiceData[0].company_gst_number : '-' ;

      if(this.state_id == '179'){
      this.isDelhi = true;
      }else{
        this.isDelhi = true;
      }
      if(this.amount_with_gst >= this.advance_balance){
         this.previous_invoice_balance = 0.00;
      }else{
        this.previous_invoice_balance = this.advance_balance - this.amount_with_gst;
      }
      if(this.amount_with_gst >= this.advance_balance){
        this.adjustment_payment = this.advance_balance;
      }else{
        this.adjustment_payment = this.amount_with_gst;
      }
       this.final_payment = parseFloat(Number(this.amount_with_gst - this.adjustment_payment).toFixed(2));

      this.invoiceService.getInvoicesDetail(invoiceId).subscribe(itemData => {
        this.itemData = itemData;
        this.invoiceService.getInvoiceCdrDetail(invoiceData[0].customer_id).subscribe(cdrData => {
          this.cdrData = cdrData;
          for (let i = 0; i < this.cdrData.length; i++) {
            this.cdrData[i]['sessionbill'] = parseFloat(this.cdrData[i]['sessionbill']);
            this.cdrSum = this.cdrSum + parseFloat(this.cdrData[i]['sessionbill']);
          }
        });
        for(let j=0; j<this.itemData.length; j++){
          if(this.itemData[j]['item_type'] == "1"){
          this.itemData[j]['amount'] = parseFloat(this.itemData[j]['amount']).toFixed(2);
          this.didSum = this.didSum + parseFloat(this.itemData[j]['amount']);
        }
      }
      });
    });

      let data = localStorage.getItem('id');
      this.productProfileService.getLogo(data, localStorage.getItem('type')).subscribe(data => {        
        if(data.logo_path.length){
          this.product_logo = data.logo_path[0]['logo_img'];
        }else{
          this.product_logo = "assets/img/brand/ECTL_logo_new.png"
        }
      })
    
  }

  downloadPDF() {
    this.ngxService.start();
    let element = document.getElementById('invoice_pdf');
    var HTML_Width = element.offsetWidth ;
    var HTML_Height = element.offsetHeight;    
    var top_left_margin = 15;
    var left = 50
    var PDF_Width = HTML_Width + (left * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = HTML_Width - 200;
    var canvas_image_height = HTML_Height;

    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
    var file_name = "Invoice.pdf";
    
    
    html2canvas(element).then(canvas => {
      var imgData = canvas.toDataURL('image/PNG', 1.0);
      var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'PNG', left+100, top_left_margin, canvas_image_width, canvas_image_height);
      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage(PDF_Width, PDF_Height);
        pdf.addImage(imgData, 'PNG', left+100, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      }
      // var invoiceId = this.route.snapshot.queryParams.id;

      pdf.save(file_name);
      this.ngxService.stop();
    });
  }

 //---------------------------------------------- PAYMENT CODE ---------------------------------------------------
  payNow(){
    this.paymentFormGroup.get('amount').setValue(this.inv_amount);
    this.paymentFormGroup.get('custId').setValue(localStorage.getItem('id'));
    this.paymentFormGroup.get('email').setValue(this.email);
    this.paymentFormGroup.get('mobile').setValue(this.phone);
     this.doRequestAsync(this.paymentFormGroup.value);
  }
  doRequestAsync(formData) {
    this.testPaymentService.payHerePAYTM(formData).subscribe(data => {
       this.htmlCode = data;
      this.goToLink();
    });
  }

  goToLink(){
    var inhtml = /<body.*?>([\s\S]*)<\/body>/.exec(this.htmlCode)
    document.body.innerHTML = inhtml[1];
    (document as any).f1.submit();
    }

    get UserTypeCustomer() {
      return UserTypeConstants.CUSTOMER;
    }
}
