import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { Errors, CommonService} from '../../../core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TestPaymentService } from '../test-payment.service';

@Component({
  selector: 'app-ccavenue',
  templateUrl: './ccavenue.component.html',
  styleUrls: ['./ccavenue.component.css']
})
export class CcavenueComponent implements OnInit {
  @ViewChild('form',null) form: ElementRef;
  encRequest: String;
  accessCode: String;
  errors: Errors = { errors: {} };
  ccavenueForm: FormGroup;
  submitted = false;
  error = "";
  checkForm: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private commonService: CommonService,
    private testPaymentService:TestPaymentService,
  ) { 
    // this.ccavenueForm = this.formBuilder.group({
    //   'details': ['', Validators.required],
    // });
  }

  ngOnInit() {
    this.accessCode = 'YOURACCESSCODEGOESHERE';
  }

  pay() {
    // this.cartValue contains all the order information which is sent to the server
    // You can use this package to encrypt - https://www.npmjs.com/package/node-ccavenue/

    
    // redirect_url: encodeURIComponent(`http://localhost:3000/api/redirect_url/`),
    const orderParams = {
      order_id: 8765432,
      currency: 'INR',
      amount: '100',
      billing_name: 'Name of the customer',
      // etc etc
    };

    this.testPaymentService.payHere({'credentials': orderParams}).subscribe((response: any) => {
      this.encRequest = response.encRequest;
      setTimeout(_ => this.form.nativeElement.submit());
    }, error => {
      console.log(error);
    });
  }

  // get details() { return this.ccavenueForm.get('details'); }

  // public findInvalidControls() {
  //   const invalid = [];
  //   const controls = this.ccavenueForm.controls;
  //   for (const name in controls) {
  //     if (controls[name].invalid) {
  //       invalid.push(name);
  //     }
  //   }
  //   return invalid;
  // }

  // ngOnInit() {

  // }

  // submitForm() {
  //   this.checkForm = this.findInvalidControls();
  //   if (this.ccavenueForm.valid) {
  //     this.submitted = true;
  //     const credentials = this.ccavenueForm.value;

  //     this.testPaymentService.payHere('payHere', credentials)
  //       .subscribe(data => {
  //         if (data['code'] == 200) {
  //           this.toastr.success('Success!', data['message'], { timeOut: 2000 });
  //           this.router.navigateByUrl('/');
  //         }
  //         else {
  //           this.toastr.error('Error!', data['message'], { timeOut: 2000 });
  //         }
  //       });

  //   }
  // }

}
