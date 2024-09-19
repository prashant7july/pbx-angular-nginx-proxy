import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TestPaymentService } from '../../test-payment/test-payment.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';

@Component({
  selector: 'app-pay-invoice',
  templateUrl: './pay-invoice.component.html',
  styleUrls: ['./pay-invoice.component.css']
})
export class PayInvoiceComponent implements OnInit {

  paymentFormGroup: FormGroup;
  htmlCode: any;
  amount_with_gst : number = 0.00;
  advance_balance : number = 0.00;
  adjustment_payment : number = 0.00;
  final_payment : number = 0.00;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private formBuilder: FormBuilder,
    private testPaymentService:TestPaymentService,
    public dialogRef: MatDialogRef<PayInvoiceComponent>, @Inject(MAT_DIALOG_DATA) public data,

  ) {
    this.paymentFormGroup = formBuilder.group({
      custId: ['', Validators.required],
      orderId: ['', Validators.required],
      amount: ['', Validators.required],
      mobile: ['', Validators.required],
      email: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
    });
   }

  ngOnInit() {
  }


  viaPayTM(){    
    this.amount_with_gst= parseFloat(this.data.amount_with_gst);
    this.advance_balance = parseFloat(this.data.advance_balance);
    if(this.amount_with_gst >= this.advance_balance){
      this.adjustment_payment = this.advance_balance;
    }else{
      this.adjustment_payment = this.amount_with_gst;
    }
    this.final_payment = parseFloat(Number(this.amount_with_gst - this.adjustment_payment).toFixed(2));        
    this.paymentFormGroup.get('amount').setValue(this.final_payment);
    this.paymentFormGroup.get('custId').setValue((this.data['customer_id']).toString());
    this.paymentFormGroup.get('email').setValue(this.data['email']);
    this.paymentFormGroup.get('mobile').setValue(this.data['phone']);
    this.paymentFormGroup.get('invoiceNumber').setValue(this.data['reference_num']);    
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

  public closeInvoiceDaiolge() {
    this.dialogRef.close();
  }

  viaCCAvenue(){
    
  }

}
