import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService } from '../../../core';
import { PromptsService } from '../prompts.service';
import { log } from 'console';

@Component({
  selector: 'app-associate-prompt',
  templateUrl: './associate-prompt.component.html',
  styleUrls: ['./associate-prompt.component.css']
})
export class AssociatePromptComponent implements OnInit {
  groupId = '';
  errors: Errors = { errors: {} };
  error = '';
  contactList = '';
  ivrName = '';




  destinationList = [];
  destinationListt = [];
  TCList = [];
  CallGroupList = [];
  IVRList = [];
  broadcastList = [];
  obdList = [];
  outboundList = [];
  appointmentList = [];
  is_TG:boolean = false;
  is_broadcast:boolean = false;
  is_ivr:boolean = false;
  is_callgroup:boolean = false;
  is_TC:boolean = false;
  is_obd:boolean = false;
  is_outbound:boolean = false;
  is_appointment:boolean = false;
  TimeList = [];
  conferenceList = [];
  is_conference:boolean = false;
  dataArray = [];
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
  is_queue: boolean = false;
  assign_minute = [];
  check = '';
  ext_number: any;
  ext_name: any;
  time = 0;
  conf = 0;
  IVR = 0;
  TC = 0;
  broad = 0;
  callgroup = 0;
  general = 0;
  moh = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private PromptsService: PromptsService,

  ) { }

  ngOnInit() {
    this.ivrName = this.route.snapshot.queryParams.ivrName || '';
    // this.route.data.subscribe(data => {
    //   this.destinationList = data['packageData']['response'];
    // });
    this.route.data.subscribe(data => {
      // if (data.packageData.response[0].prompt_type == 1) {
      //   if (data.packageData.response[0]['c_name'] !== null) {
      //     this.is_conference = true
      //     this.conferenceList = data.packageData.response[0]['c_name'].split(',').map(name => name.trim());
          
      //   }
      //   if (data.packageData.response[0]['queue_name'] !== null) {
      //     this.is_queue = true
      //     this.destinationListt = data.packageData.response[0]['queue_name'].split(',').map(name => name.trim());
          
      //   }
      //   if (data.packageData.response[0]['tc_name'] !== null) {
      //     this.is_TC = true
      //     this.TCList = data.packageData.response[0]['tc_name'].split(',').map(name => name.trim());
          
      //   } 
      // }
      // else{

      if (data.packageData.response[0]['queue_name']) {
        this.is_queue = true;
        this.destinationListt = data.packageData.response[0]['queue_name'].split(',').map(name => name.trim());
      }

      // if (data.packageData.response[0]['queue_name'] !== null) {
      //   this.is_queue = true
      //   this.destinationListt = data.packageData.response[0]['queue_name'].split(',').map(name => name.trim());
        
      // }
      if (data.packageData.response[0]['c_name']) {
        this.is_conference = true
        this.conferenceList = data.packageData.response[0]['c_name'].split(',').map(name => name.trim());
        
      }
      if (data.packageData.response[0]['t_name']) {
        this.is_TG = true
        this.TimeList = data.packageData.response[0]['t_name'].split(',').map(name => name.trim());
        
      }
      if (data.packageData.response[0]['tc_name']) {
        this.is_TC = true
        this.TCList = data.packageData.response[0]['tc_name'].split(',').map(name => name.trim());
        
      }  
      if (data.packageData.response[0]['cg_name']) {
        this.is_callgroup = true
        this.CallGroupList = data.packageData.response[0]['cg_name'].split(',').map(name => name.trim());
        
      }
      if (data.packageData.response[0]['ivr_name']) {
        this.is_ivr = true
        this.IVRList = data.packageData.response[0]['ivr_name'].split(',').map(name => name.trim());
        
      }  
      if (data.packageData.response[0]['b_name']) {
        this.is_broadcast = true
        this.broadcastList = data.packageData.response[0]['b_name'].split(',').map(name => name.trim());
        
      }
      if (data.packageData.response[0]['ob_name']) {
        this.is_obd = true
        this.obdList = data.packageData.response[0]['ob_name'].split(',').map(name => name.trim());
        
      }
      if (data.packageData.response[0]['obc_name']) {
        this.is_outbound = true
        this.outboundList = data.packageData.response[0]['obc_name'].split(',').map(name => name.trim());
        
      }
      if (data.packageData.response[0]['ap_name']) {
        this.is_appointment = true
        this.appointmentList = data.packageData.response[0]['ap_name'].split(',').map(name => name.trim());
        
      }
    // }
      
      
      for (let i = 0; i < data['packageData']['response'].length; i++) {
        // if (data['packageData']['response'][i]['prompt_type'] == '17') {
          // this.general = 17;
          if (data['packageData']['response'][i]['queue_name'] != null) {
            data['packageData']['response'][i]['queue_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Queue' })
            })
          }
          if (data['packageData']['response'][i]['c_name'] != null) {
            data['packageData']['response'][i]['c_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Conference' })
            })
          }
          if (data['packageData']['response'][i]['t_name'] != null) {
            data['packageData']['response'][i]['t_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Time Group' })
            })
          }
          if (data['packageData']['response'][i]['ivr_name'] != null) {
            data['packageData']['response'][i]['ivr_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'IVR' })
            })
          }
          if (data['packageData']['response'][i]['tc_name'] != null) {
            data['packageData']['response'][i]['tc_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'TC' })
            })
          }
          if (data['packageData']['response'][i]['b_name'] != null) {
            data['packageData']['response'][i]['b_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Broadcast' })
            })
          }
          if (data['packageData']['response'][i]['cg_name'] != null) {
            data['packageData']['response'][i]['cg_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Call Group' })
            })
          }
          if (data['packageData']['response'][i]['ob_name'] != null) {
            data['packageData']['response'][i]['ob_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'OBD' })
            })
          }
          if (data['packageData']['response'][i]['obc_name'] != null) {
            data['packageData']['response'][i]['obc_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Outbound Conference' })
            })
          }
          if (data['packageData']['response'][i]['ap_name'] != null) {
            data['packageData']['response'][i]['ap_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Appointment' })
            })
          }

        // }
       
        if (data['packageData']['response'][i]['prompt_type'] == '1') {
          this.moh = 1;
          if (data['packageData']['response'][i]['queue_name'] != null) {
            data['packageData']['response'][i]['queue_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Queue' })
            })
          }
          if (data['packageData']['response'][i]['tc_name'] != null) {
            data['packageData']['response'][i]['tc_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'TC' })
            })
          }
          if (data['packageData']['response'][i]['c_name'] != null) {
            data['packageData']['response'][i]['c_name'].split(',').map(data => {
              this.destinationList.push({ name: data,id:'Conference' })
            })
          }
        }
        if (data['packageData']['response'][i]['prompt_type'] == '5') {
          this.queue = 5;
          data['packageData']['response'][i]['queue_name'].split(',').map(data => {
            this.destinationList.push({ name: data, id: 'Queue' })
          })
        }
        if (data['packageData']['response'][i]['prompt_type'] == '6') {
          this.time = 6;
          data['packageData']['response'][i]['t_name'].split(',').map(data => {
            this.destinationList.push({ name: data,id:'Time Group' })
          })
        }
        if (data['packageData']['response'][i]['prompt_type'] == '4') {
          this.conf = 4;
          data['packageData']['response'][i]['c_name'].split(',').map(data => {
            this.destinationList.push({ name: data,id:'Conference' })
          })
        }
        if (data['packageData']['response'][i]['prompt_type'] == '3') {
          this.IVR = 3;
          data['packageData']['response'][i]['ivr_name'].split(',').map(data => {
            this.destinationList.push({ name: data,id:'IVR' })
          })
        }
        if (data['packageData']['response'][i]['prompt_type'] == '10' ) {
          this.TC = 10;
          data['packageData']['response'][i]['tc_name'].split(',').map(data => {
            this.destinationList.push({ name: data,id:'TC' })
          })
        }
        if (data['packageData']['response'][i]['prompt_type'] == '11') {
          this.broad = 11;
          data['packageData']['response'][i]['b_name'].split(',').map(data => {
            this.destinationList.push({ name: data,id:'Broadcast' })
          })
        }
        if (data['packageData']['response'][i]['prompt_type'] == '16') {
          this.callgroup = 16;
          data['packageData']['response'][i]['cg_name'].split(',').map(data => {
            this.destinationList.push({ name: data,id:'Call Group' })
          })
        }
        // if(data['packageData']['response'][i]['prompt_type'] == '17') {
        //   if(data['packageData']['response'][i]['prompt'])           
        //   data['packageData']['response'][i]['t_name'].split(',').map(data => {
        //     this.destinationList.push({name:data})                                 
        //   })
        // }
      }
    });
  }

}
