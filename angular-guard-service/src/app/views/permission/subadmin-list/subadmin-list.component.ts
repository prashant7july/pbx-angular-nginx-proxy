import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Errors, ExcelService, errorMessage, CommonService, permissionUpdate } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../permission.service';

@Component({
  selector: 'app-subadmin-list',
  templateUrl: './subadmin-list.component.html',
  styleUrls: ['./subadmin-list.component.css']
})
export class SubadminListComponent implements OnInit {
  permissionId = '';
  errors: Errors = { errors: {} };
  error = '';
  customerList = '';
  groupName = '';

  constructor( private route: ActivatedRoute, private permissionService: PermissionService, private router: Router) { }

  ngOnInit() {
    this.permissionId = this.route.snapshot.queryParams.pId;
    this.groupName = this.route.snapshot.queryParams.pName;
    this.permissionService.getPermissionUser({id: Number(this.permissionId)}).subscribe(data => {
      this.customerList = data;
    });
  }

}
