import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-paytm-success',
  templateUrl: './paytm-success.component.html',
  styleUrls: ['./paytm-success.component.css']
})
export class PaytmSuccessComponent implements OnInit {

  paymentStatus ;
  constructor(private route:ActivatedRoute,private toastr: ToastrService) {
    
   }

  ngOnInit() {
    this.paymentStatus = this.route.snapshot.queryParams.status;
   if(this.paymentStatus == '01'){
    this.toastr.success('Success!', "Payment Done Successfully", { timeOut: 2000 });
   }else {
    this.toastr.error('Error!', "Payment Failed", { timeOut: 2000 });
   }
  }
}
