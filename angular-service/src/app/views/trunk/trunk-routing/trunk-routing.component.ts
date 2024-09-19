import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, RINGTIMEOUT_RegEx, EXPANDTIME_RegEx, ExcelService, invalidPhone, invalidForm, errorMessage, countryError, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx, duplicateIP } from '../../../core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core';
import 'jspdf-autotable';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TrunkService } from '../trunk.service';
import { DidService } from '../../DID/did.service';
import { getLocaleExtraDayPeriodRules } from '@angular/common';


@Component({
  selector: 'app-trunk-routing',
  templateUrl: './trunk-routing.component.html',
  styleUrls: ['./trunk-routing.component.css']
})
export class TrunkRoutingComponent implements OnInit {
  filterForm: FormGroup;
  rowData: any;
  AgLoad: boolean;
  error = '';
  user_id = '';
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  customer_list: any = [];
  exportData: any = {};
  destination_data: any[] = [];
  defaultPageSize = '10';
  id: any;
  destinationData = [];
  trunkName = [];
  promptList = [];
  activeFeature = [];
  filterFeature: any;
  FeatureFilter: any;
  CIDdest = [{
    id: '0', name: 'SIP'
  }, {
    id: '1', name: 'PSTN'
  }]
  trunkRoutingFeature = [
    {
      id: '', name: 'Select Feature'
    },
    {
    id: '0', name: 'External'
  },
   {
    id: '1', name: 'Playback'
  }]

  public fields: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'prompt_name', value: 'id' };
  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Extension';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public commonService: CommonService,
    private toastr: ToastrService,
    public userservice: UserService,
    private trunkService: TrunkService,
    private didService: DidService,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_feature': [""],
      'by_prompt': [""],
    });
  }

  ngOnInit() {
    this.id = localStorage.getItem('id');
    this.trunkService.displayAllRecord().subscribe(() => {
      this.displayAllRecord();
    })

    this.trunkService.getTrunkListById(Number(this.id)).subscribe(pagedData => {
      this.trunkName = pagedData;
      this.trunkName.unshift({ name: 'Select Name', id: 0 });

    })

    this.trunkService.getGeneralPrompt(localStorage.getItem('id')).subscribe(data=>{
      this.promptList = data;
      this.promptList.unshift({ prompt_name: 'Select Destination', id: 0 });

      
    })

    // this.didService.getActiveFeature(this.id).subscribe(data => {

    //   if (data[0].appointment == '1') {
    //     this.activeFeature.push({ id: '13', feature: 'Appointment' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].conference == '1') {
    //     this.activeFeature.push({ id: '3', feature: 'Conference' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].call_group == '1') {
    //     this.activeFeature.push({ id: '5', feature: 'Call Group' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].CID_routing == '1') {
    //     this.activeFeature.push({ id: '19', feature: 'CID Routing' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].ivr == '1') {
    //     this.activeFeature.push({ id: '2', feature: 'IVR' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].playback == '1') {
    //     this.activeFeature.push({ id: '12', feature: 'Playback' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].queue == '1') {
    //     this.activeFeature.push({ id: '4', feature: 'Queue' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   this.activeFeature.push({ id: '1', feature: 'SIP' });
    //   this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   if (data[0].tele_consultancy == '1') {
    //     this.activeFeature.push({ id: '10', feature: 'Tele Consultation' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    // }, err => {
    //   this.error = err.message;
    // });

  }
  promptremovedspacePrompt(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.promptList.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }
  promptremovedspaceFeature(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.trunkRoutingFeature.filter((data) => {
      return data['name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  } 
  promptremovedspaceName(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.trunkName.filter((data) => {
      return data['name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'name', headerName: 'Trunk Name', width: 150, hide: false },
      { field: 'active_feature', headerName: 'Feature', width: 200, hide: false },
      { field: 'destination_name', headerName: 'Destination', width: 200, hide: false },
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.trunkService.getTrunkRoutingByFilter(credentials,this.id).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      })
    } else {
      this.trunkService.getTrunkRouting(Number(this.id)).subscribe(data => {      
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      })
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      let featureBtn = '';
      let promptBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if(data[i].active_feature == '1'){
        featureBtn += 'Playback'
        promptBtn += 'Playback'.concat(` - (${data[i]['destination_name']})`)
      }else{
        promptBtn += 'External'
        featureBtn += 'External'
      }
      data[i]['destination_name'] = promptBtn;
      data[i]['active_feature'] = featureBtn;
      data[i]['action'] = finalBtn;
    }

    return data;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editRouting(data);
      case "delete":
      return this.deleteRouting(data);
    }
  }

  getFeature(e) {

    this.filterForm.get('by_dest').reset();
    let didFeature = e.value;
    if (didFeature != '19') {
      this.didService.getDestination(this.id, didFeature).subscribe(datas => {
        this.destinationData = datas;
      });
      {
      }
    } else {
      const destination_promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.destinationData = this.CIDdest);
        }, 200);
      });
      destination_promise.then((result) => {
      })
    }

  }

  editRouting(data) {
    this.router.navigate(['/trunk/addRoute'], { queryParams: { data: data.id } });

  }

  addRouting() {
    this.router.navigateByUrl('/trunk/addRoute', {});
  }

  deleteRouting(data){
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Route  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.trunkService.deleteRoute({ 'id': data.id }).subscribe(data => {
          this.displayAllRecord();
          if (data) {
            this.toastr.success('Successfully !', "Route Deleted", { timeOut: 2000 });
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Route </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +data.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 4000
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Route </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name+ "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 4000
        });
      }
    })

  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

}

@Component({
  selector: 'add-routing',
  templateUrl: 'add-routing.component.html',
})

export class AddRoutingComponent {
  routingForm: FormGroup;
  linkAddress = "";
  error = '';
  errors: Errors = { errors: {} };
  token = "";
  text: any = "";
  name: any = "";
  color: any = "";
  lang: any = "";
  id: any = "";
  userToken: any = "";
  flagOut: boolean = false;
  flagIn: boolean = false;
  allowFlag: boolean = false;
  whitelistIPs = [];
  destinationData = [];
  trunkName = [];
  activeFeature = [];
  trunkData: any = [];
  customer_list: any = [];
  customer: any
  filterFeature: any;
  FeatureFilter: any;
  user_id: any;
  didFeature: any;
  didDestination: any;
  destinationId = "";
  edit: boolean = true;
  isSIP: boolean = false;
  isPrompt: boolean = false;
  routerData: any;
  active_id: any;
  trunk_id: any;
  destination: any;
  active_feature: any;
  enable_bypass: any;
  cont = [];
  promptList = [];
  CIDdest = [{
    id: '0', name: 'SIP'
  }, {
    id: '1', name: 'PSTN'
  }]

  trunkRoutingFeature = [
    {
    id: '0', name: 'External'
  }, {
    id: '1', name: 'Playback'
  }]
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public fields: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'prompt_name', value: 'id' };
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public IP_RegEx = /^(\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$)/;

  constructor(
    private userservice: UserService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private trunkService: TrunkService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private didService: DidService,
  ) {
    this.routingForm = this.fb.group({
      'trunk_name': [""],
      'active_feature': [""],
      'prompt_id': [''],
      'enable_bypass': [''],
    });
  }

  ngOnInit() {

    this.user_id = localStorage.getItem('id');

    this.route.queryParams.subscribe(params => {
      this.id = params.data;
    });



    this.trunkService.getTrunkListById(Number(this.user_id)).subscribe(pagedData => {
      this.trunkName = pagedData;
      this.trunkService.getTrunkRouting(Number(this.user_id)).subscribe(data =>{
        const set2 = new Set(data.map(obj => obj['trunk_id']));
        for (let i = 0; i < pagedData.length; i++) {
          if (set2.has(pagedData[i].id)) {
            } else {
              this.trunkName[i]['flag'] = '1'
          }
        }
      })
    })

    this.trunkService.getGeneralPrompt(Number(localStorage.getItem('id'))).subscribe(data=>{
      
      this.promptList = data;
      
    })

    // this.didService.getActiveFeature(this.user_id).subscribe(data => {
    //   if (data[0].appointment == '1') {
    //     this.activeFeature.push({ id: '13', feature: 'Appointment' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].conference == '1') {
    //     this.activeFeature.push({ id: '3', feature: 'Conference' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].call_group == '1') {
    //     this.activeFeature.push({ id: '5', feature: 'Call Group' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].CID_routing == '1') {
    //     this.activeFeature.push({ id: '19', feature: 'CID Routing' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].ivr == '1') {
    //     this.activeFeature.push({ id: '2', feature: 'IVR' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].playback == '1') {
    //     this.activeFeature.push({ id: '12', feature: 'Playback' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   if (data[0].queue == '1') {
    //     this.activeFeature.push({ id: '4', feature: 'Queue' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    //   this.activeFeature.push({ id: '1', feature: 'SIP' });
    //   this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   if (data[0].tele_consultancy == '1') {
    //     this.activeFeature.push({ id: '10', feature: 'Tele Consultation' });
    //     this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
    //   }
    // }, err => {
    //   this.error = err.message;
    // });


    if (this.id) {
      this.trunkService.getTrunkRoutingById(this.id).subscribe(datas => {
        this.routerData = datas[0];
        setTimeout(() => {
          this.active_feature = datas[0].active_feature;
           this.destination = JSON.parse(datas[0].destination);
        }, 500);
       

      
          // this.trunkService.getGeneralPrompt(localStorage.getItem('id')).subscribe(data => {
          //   console.log(data,'----------data');
            
          //   const destination_promise = new Promise((resolve, reject) => {
          //     setTimeout(() => {
          //       resolve(this.promptList = data);
          //     }, 500);
          //   });
          //   destination_promise.then((result) => {
          //     this.destination = data[0].id;
          //   })

          // });
     
        


          // this.destination = datas.find(item => item.id == datas[0]['destination'])
          // console.log(this.destination,"---destinatoin");
          this.promptList.filter(item =>{        
            if(item.id == datas[0]['destination']){        
              this.destination = item.id;
            }
            
            
          })
          
        
          const destination_promise = new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(this.destinationData = this.CIDdest);
            }, 200);
          });
          destination_promise.then((result) => {
            this.destination = datas[0].destination;
          })
        
   

        this.trunk_id = datas[0].trunk_id;
        // this.enable_bypass = datas[0].enable_bypass_media;
        // if (this.routerData.active_feature == 1) {
        //   this.isSIP = true;
        // } else {
        //   this.isSIP = false;
        // }

      })
    }

  }


  changeFeature(e){
    

    if(e.value == 1){
      this.isPrompt = true;
      this.routingForm.get('prompt_id').setValidators(Validators.required);
      this.routingForm.get('prompt_id').updateValueAndValidity();
    }else{
      this.isPrompt = false;
      this.routingForm.get('prompt_id').reset();
      this.routingForm.get('prompt_id').clearValidators();
      this.routingForm.get('prompt_id').updateValueAndValidity();

    }
    
  }
  // getFeature(e) {
  //   this.routingForm.get('destination_id').reset();
  //   this.didFeature = e.value;
  //   if (e.value == 1) {
  //     this.isSIP = true;
  //   } else {
  //     this.isSIP = false;
  //     this.routingForm.get('enable_bypass').setValue(false);
  //   }

  //   if (this.didFeature != '19') {
  //     this.didService.getDestination(this.user_id, this.didFeature).subscribe(datas => {
  //       this.destinationData = datas;
  //     });
  //     {
  //     }
  //   } else {
  //     const destination_promise = new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve(this.destinationData = this.CIDdest);
  //       }, 200);
  //     });
  //     destination_promise.then((result) => {
  //     })
  //   }

  // }

  submitRoutingForm() {
    let credentials = this.routingForm.value;
    credentials['custId'] = this.user_id;
    let name = this.routingForm.get('prompt_id').value;
    let actionTitle = this.promptList.find(action => action.id == name);
    if(credentials['active_feature'] == '1'){
      credentials['destination_name'] = actionTitle.prompt_name;
    }
    if (!this.id) {
      this.trunkService.postTrunkRouting(credentials).subscribe(data => {
        if (data['status_code'] == 200) {
          this.toastr.success('Success!', "Trunk Routing Created Successfully!", { timeOut: 2000 });
          this.router.navigateByUrl('/trunk/routing', {});
          this.trunkService.updateGridList();
        } else {
          this.toastr.error('Failed!', "Trunk Name Duplicate!", { timeOut: 2000 });
        }

      })
    } else {
      credentials['id'] = this.id;
      this.trunkService.updateRouting(credentials).subscribe(data => {
        if (data['status_code'] == 200) {
          this.toastr.success('Success!', "Trunk Routing Updated Successfully!", { timeOut: 2000 });
          this.router.navigateByUrl('/trunk/routing', {});
          this.trunkService.updateGridList();
        } else {
          this.toastr.error('Failed!', "Trunk Name Duplicate!", { timeOut: 2000 });
        }

      })

    }
  }
  cancleDialog(): void {
    this.router.navigateByUrl('/trunk/routing', {});
  }
}

