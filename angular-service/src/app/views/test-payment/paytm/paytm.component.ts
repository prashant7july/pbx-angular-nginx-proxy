import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TestPaymentService } from '../test-payment.service';

@Component({
  selector: 'app-paytm',
  templateUrl: './paytm.component.html',
  styleUrls: ['./paytm.component.css']
})
export class PaytmComponent implements OnInit {

  formGroup: FormGroup;
  submitted = false;
  display: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private testPaymentService:TestPaymentService,
    private renderer2: Renderer2) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      custId: ['', Validators.required],
      orderId: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  htmlCode: any;

  pay() {
    this.submitted = true;

    if (this.formGroup.invalid) {
      return;
    }
     this.doRequestAsync(this.formGroup.value);
  }


  doRequestAsync(formData) {
    console.log('come')
    this.testPaymentService.payHerePAYTM(formData).subscribe(data => {
      console.log('come1');
    
       this.htmlCode = data;
    // console.log('come2'+ data)
      this.goToLink();
    });
  }

  goToLink(){
    var inhtml = /<body.*?>([\s\S]*)<\/body>/.exec(this.htmlCode)
   console.log(inhtml);
    document.body.innerHTML = inhtml[1];
    (document as any).f1.submit();
    }
}
