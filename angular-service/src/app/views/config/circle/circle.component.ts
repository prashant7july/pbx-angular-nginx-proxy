import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
//import {circle} from '../../../core/models/circle.model'
import { Router, NavigationEnd } from '@angular/router';
import { ConfigService } from "../config.service";
import { ToastrService } from 'ngx-toastr';
import { Errors, CommonService,formError, circle } from '../../../core';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.css'],
  providers:[CommonService]
})
export class CircleComponent implements OnInit {
  circleForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    public configService:ConfigService,
    private toastr: ToastrService,
    public commonService :CommonService,
    private router: Router,

  ) { }

  ngOnInit() {

    this.circleForm = this.fb.group({
      'circle': ["", [Validators.required, Validators.pattern("[a-zA-Z ]+")]],
      'description': [""],
    });

  }

  submitCircle(){
    if (this.circleForm.valid) {
      let circleName = this.circleForm.value.circle;    
      this.circleForm.value.circle = circleName.replace(/^./, circleName[0].toUpperCase());    
      // we can pass form data on Service now.
      this.configService.addCircle(this.circleForm.value).subscribe((data)=>{
        this.toastr.success('Success!',circle,{timeOut:2000});
        this.router.navigate(['config/circle']);
      });
      
    }else{
      this.toastr.error('Error!',formError,{timeOut:2000});
    }

  }
  
  cancelForm(){
    this.circleForm.reset();
    this.router.navigate(['config/circle'])
  }
}
