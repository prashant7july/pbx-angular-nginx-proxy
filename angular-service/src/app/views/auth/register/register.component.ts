import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Errors, UserService } from '../../../core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  errors: Errors = { errors: {} };
  authForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
  ) {
    this.authForm = this.fb.group({
      'username': ['', Validators.required],
      'email': ['', Validators.required],
      'password': ['', Validators.required],
      'rPassword': ['', Validators.required],
    });
  }

  ngOnInit() {
    if (localStorage.getItem('isAuthenticated')) {
      this.router.navigateByUrl('/');
    }
  }

  register() {
    this.errors = { errors: {} };

    const credentials = this.authForm.value;
    this.userService.attemptAuth(credentials).subscribe(data => {
      this.router.navigateByUrl('/');
    }, err => {
      this.errors = err;
    });
  }
}
