import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData, PagedData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService, ExtensionService } from '../../../core';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-ext-mapped-destination',
  templateUrl: './ext-mapped-destination.component.html',
  styleUrls: ['./ext-mapped-destination.component.css']
})
export class ExtMappedDestinationComponent implements OnInit {
  errors: Errors = { errors: {} };
  error = '';
  destinationList = [];
  feature_id: any;
  did: any;
  didName = [];
  appointment: any;
  appointment_name = [];
  queue: any;
  queue_name = [];
  callGroup: any;
  call_group = [];
  ivr: any;
  ivr_name = [];
  minute = false;
  assign_minute = [];
  check = '';
  ext_number: any;
  ext_name: any;
  plugin: any;
  plugin_name = [];
  time_group: any;
  time_group_name = [];
  tc: any;
  tc_name = [];

  constructor(
    private extensionService: ExtensionService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {

    this.ext_number = this.route.snapshot.queryParams.ext_number;
    this.ext_name = this.route.snapshot.queryParams.ext_name; //tarun   
    this.extensionService.getExtensionAssignMinutesByExtId(Number(this.ext_number), Number(localStorage.getItem('id'))).subscribe(pagedData => {
      if (pagedData == '') {
        this.check = null;
      } else {
        let count;
        for (let i = 0; i < pagedData.length; i++) {
          if (pagedData[i]['name']) {
            count = i;
            this.minute = true;
            this.assign_minute.push({ name: pagedData[count]['name'], minutes: pagedData[count]['assingn_minutes'], type: pagedData[count]['plan_type'] })
          }
          if (pagedData[i]['feature_id'] == '11') {
            this.feature_id = 11;
            this.destinationList.push({ name: pagedData[i]['feature_name'] })
          }
          if (pagedData[i]['feature_id'] == '18') {
            this.did = 18;
            this.didName.push({ name: pagedData[i]['feature_name'] })
          }

          if (pagedData[i]['feature_id'] == '13') {
            this.appointment = 13;
            this.appointment_name.push({ name: pagedData[i]['feature_name'] })
          }

          if (pagedData[i]['feature_id'] == '4') {
            this.queue = 4;
            this.queue_name.push({ name: pagedData[i]['feature_name'] })
          }

          if (pagedData[i]['feature_id'] == '5') {
            this.callGroup = 5;
            this.call_group.push({ name: pagedData[i]['feature_name'] })
          }

          if (pagedData[i]['feature_id'] == '2') {
            this.ivr = 2;
            this.ivr_name.push({ name: pagedData[i]['feature_name'] })
          }

          if (pagedData[i]['feature_id'] == '31') {
            this.plugin = 31;
            this.plugin_name.push({ name: pagedData[i]['feature_name'] });
          }
          if (pagedData[i]['feature_id'] == '32') {
            this.time_group = 32;
            this.time_group_name.push({ name: pagedData[i]['feature_name'] });
          }
          if (pagedData[i]['feature_id'] == '10') {
            this.tc = 10;
            this.tc_name.push({ name: pagedData[i]['feature_name'] });
          }
        }
      }
    });
  }


}
