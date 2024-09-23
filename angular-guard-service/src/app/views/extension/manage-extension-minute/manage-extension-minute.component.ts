import { Component, OnInit } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, FormGroupName } from '@angular/forms';
import { PagedData, Page, AllExtension } from '../../../core/models';
import Swal from 'sweetalert2';
import { ExtensionService, ExcelService, CommonService, GatewayService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { UserTypeConstants } from 'src/app/core/constants/userType.constant';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';
import { ManageMinuteDialog } from '../view-extension/view-extension.component';
import { ContactListService } from '../../contact-list/contact-list.service';
import { TeleConsultationService } from '../../tele-consultation/tele-consultation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-manage-extension-minute',
  templateUrl: './manage-extension-minute.component.html',
  styleUrls: ['./manage-extension-minute.component.css']
})
export class ManageExtensionMinuteComponent implements OnInit {

  minutePlan: FormGroup;
  destinatioList = [];
  extensionList: [];
  selectedDestinationMinutes: number = 0;
  selectedExtensionList = [];
  smbtBtnDisable: boolean = false;
  allDestinationRates = [];
  everyDestMappedExtn = [];
  counter = 0;
  ext_id = [];
  type = '';
  contactList = [];
  groupList = [];
  planData: any;
  isEdit: boolean = false;
  tcPlanValue: any;
  planPrice: any;
  disablePlan: boolean = false;
  isContact: boolean = false;
  testValue: any
  minuteManage: any
  flag = 0
  checkArray = []
  isAssignMinute = [];  
  constructor(
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private fb: FormBuilder,
    private minutePlanService: MinutePlanService,
    private contactService: ContactListService,
    public teleConsultationService: TeleConsultationService,
    private route: ActivatedRoute,
  ) {
    this.minutePlan = this.fb.group({
      minutManageForm: new FormArray([]),
      'name': [''],
      'price': ['']
    });
  }

  ngOnInit() {
    this.contactService.getContactList({ 'customer_id': localStorage.getItem('id'), 'role': localStorage.getItem('type') }).subscribe(contactData => {
      this.contactList = contactData;
      for (let i = 0; i < contactData.length; i++) {
        this.ext_id[i] = contactData[i]
      }
    });    
    this.getTCPlanList();
    // this.getCustomerBundlePlan(true);        
  }
  
  public getTCPlanList() {
    let obj = {};
    if (this.route.snapshot.queryParams.id === undefined) {
      obj['assign_minute'] = true;
    }
    let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;    
    this.teleConsultationService.getTCPlan(obj, customerId).subscribe(pagedData => {
      this.groupList = pagedData.response;      
      this.tcPlanValue = JSON.parse(this.route.snapshot.queryParams.id);
      if (this.tcPlanValue) {
        this.disablePlan = true;
        this.onPlanSelect(pagedData.response, this.tcPlanValue);
      }      
    });
  }

  onPlanSelect(data, selectedPlan) {        
    if (selectedPlan) {      
      data = data.filter(value => value.id == selectedPlan)
      this.planPrice = data[0]['price'];      
      this.getCustomerBundlePlan(data[0]);
    }else{
    this.getCustomerBundlePlan(data);    
    }
    this.isEdit = true;
    let plan_id = data.id;
    let plan_price = data.price;
    if (this.groupList.length == 0) {
      let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
      this.teleConsultationService.getTCPlan({}, customerId).subscribe(pagedData => {
        this.groupList = pagedData.response;
        this.groupList.forEach(element => {
          if (element.id === plan_id) {
            this.minutePlan.get('price').setValue(plan_price);
            this.minutePlan.get('name').setValue(plan_id);
          }
        });
      });
    } else {
      this.groupList.forEach(element => {
        if (element.id === plan_id) {
          this.minutePlan.get('name').setValue(plan_id);
          this.minutePlan.get('price').setValue(plan_price);
          this.planPrice = element.price;
        }
      });
    }
  }


  submitRatePlan() {
    const credentials = this.minutePlan.value;
    if (this.smbtBtnDisable) {
      this.toastr.error("Assign Minuutes can not be less than Used Minutes.", 'Error!', { timeOut: 4000 });
      return;
    }
    let customerId = localStorage.getItem('id');
    let data = credentials;
    for (let i = 0; i < credentials['minutManageForm'][0]['ext'].length; i++) {
      for (let j = 0; j < this.ext_id.length; j++) {
        if (this.ext_id[j]['ext_number'] == credentials['minutManageForm'][0]['ext'][i]['id']) {
          credentials['minutManageForm'][0]['ext'][i]['id'] = this.ext_id[j]['id'];
        }
      }
    }
    if (!data['minutManageForm'].length) {
      this.toastr.error("Please select at least one destination.", 'Error!', { timeOut: 4000 });
      return;
    }
    if (!data['minutManageForm'][0]['ext'].length) {
      this.toastr.error("Please select at least one Contact.", 'Error!', { timeOut: 4000 });
      return;
    }


    credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
    this.teleConsultationService.assignMinuteToUser(credentials).subscribe((data) => {
      if (data['code'] == 200) {
        this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        this.router.navigateByUrl('teleconsultation/tc-plan-list');
      } else if (data['code'] == 1062) {
        this.toastr.error('Error!', 'Already assign minutes to this user with destination', { timeOut: 2000 });
      } else {
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
    });
  }

  public getCustomerBundlePlan(dest) {
    let obj = {
      customer_id: Number(localStorage.getItem('id')),
      flag: true,
      dest: dest.country
    }        
    this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      this.destinatioList = [];
      let dest_details = pagedData.length ? pagedData.filter(item => item['group_type'] === 'Individual') : [];      
      let minute = 0;      
      dest_details.map(element => {
        minute += element.talktime_minutes;
      });
      if(!dest_details.length){
        this.isEdit = false;
        this.toastr.error("You do not have any Call Rates.", 'Error!', { timeOut: 4000 });
      }
      dest_details[0]['talktime_minutes'] = minute;      
      this.destinatioList = [dest_details[0]];
    });
  }

  public getExtensionDetail(e) {    
    let cID;
    e.value.map(element => {
      this.contactList.filter((item) => {
        if(element == item.name){
          cID = item.id;
        }
      })
    });    
    let selectedExt = [] = e.value;
    selectedExt = selectedExt.map(item => (item));
    let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
    FormArray.controls.forEach((element1, index) => {
      let FormControl = element1.get('ext') as FormArray;
      let preSelectedExt = (FormControl.value).map(item => item.c_name);
      var differentExt;

      let event = FormControl.length > selectedExt.length ? 'pop' : 'push';
      event == 'push' ? (differentExt = selectedExt.filter(x => !preSelectedExt.includes(x))) : (differentExt = preSelectedExt.filter(x => !selectedExt.includes(x)));
      if (event == 'push') {
        // differentExt.map(element => {
        FormControl.push(
          this.fb.group({
            c_name: differentExt,
            minutes: 0,
            used_minutes: 0,
            c_id: cID
          })
        );
        // });
      } else {
        FormControl.removeAt(FormControl.value.findIndex(item => item.c_name == differentExt))
      }
    });
  }

  public getDestinationDetails(e) {
    this.selectedExtensionList = [];
    this.isContact = true;
    // const index = _.indexOf(this.checkArray, e.dial_prefix)
    // if (index === -1) {
    //   this.checkArray.push(e.dial_prefix);
    let obj = {
      customer_id: Number(localStorage.getItem('id')),
      by_destination: e.dial_prefix,
      // id: e.id,
      flag: true
    }
    this.minutePlanService.viewCustomerBundlePlanAllRates(obj).subscribe(pagedData => {
      this.allDestinationRates = pagedData;
      // this.allDestinationRates = pagedData.concat(this.allDestinationRates);
      let minute = 0;
      pagedData.map(element => {
        minute += element.minutes;
      })
      pagedData[0]['minutes'] = minute;
      pagedData = [pagedData[0]];
      let selectedDestination = [] = e.dial_prefix;
      let control = <FormArray>this.minutePlan.controls.minutManageForm;
      control.clear();      
      selectedDestination.length ? pagedData.forEach((element, index) => {
        this.counter = index + 1;
        control.push(
          this.fb.group({
            country: element ? element['dial_prefix'] : '',
            type: element ? element['plan_type'] : '1',
            ext: new FormArray([]),
            id: element['id'],
          })
        );
        if (this.route.snapshot.queryParams.id) {
          selectedDestination.length ? this.getExtensionAssignMinutes([element['dial_prefix']], element['id'], this.route.snapshot.queryParams.id) : '';
        }
      }) : '';
      // let contact = _.map(this.minutePlan.get('minutManageForm').value[0]['ext'], (obj) => { return obj.c_name });
      // this.getExtensionDetail({value:contact});        
    });
    // }
    // else {
    //   let tempArray = []
    //   let control = <FormArray>this.minutePlan.controls.minutManageForm;
    //   const controlIndex = _.findIndex(control.value, { country: this.checkArray[index] });
    //   this.checkArray = _.remove(this.checkArray, (n) => {
    //     return n !== this.checkArray[index];
    //   })
    //   if (controlIndex != -1) {
    //     tempArray = _.filter(control.value, (n) => {
    //       return n.country !== this.checkArray[index]
    //     });
    //   }
    //   control.removeAt(controlIndex)
    // }
  }

  public getMinutePlanControls() {
    return (this.minutePlan.get('minutManageForm') as FormArray).controls
  }
  // public getDestinationName(item, type) {
  //   let rtrnData;
  //   let countryPrefix = item.get('country').value;
  //   let planType = item.get('type').value;
  //   let ext_id = item.get('id').value;
  //   if (type === 'country_name') {
  //     let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType);
  //     let type = (planType == '3') ? '- Booster' : (planType == '4') ? '- TeleConsultancy' : '-Bundle';
  //     rtrnData = arr[0]['destination'] + ' (' + arr[0]['dial_prefix'] + ') ';
  //     return rtrnData;
  //   } else if (type === 'assign_minute') {
  //     let assignMinutesList = item.get('ext').value;
  //     let assignMinutes = 0;
  //     assignMinutesList.forEach(element => {
  //       assignMinutes = Number(assignMinutes) + Number(element['minutes']);
  //     });
  //     rtrnData = 'Assigned : ' + assignMinutes;
  //     return rtrnData;
  //   } else if (type == 'used_minute') {
  //     let usedMnutesList = item.get('ext').value;
  //     let usedMnutes = 0;
  //     usedMnutesList.forEach(element => {
  //       usedMnutes = Number(usedMnutes) + Number(element['used_minutes']);
  //     });
  //     rtrnData = 'Consumed : ' + usedMnutes;
  //     return rtrnData;
  //   } else if (type == 'remaining_minutes') {
  //     let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
  //     // let assignMinutesList = item.get('ext').value;
  //     // let assignMinutes = 0;
  //     // assignMinutesList.forEach(element => {
  //     //   assignMinutes = Number(assignMinutes) + Number(element['minutes']);
  //     // });      
  //     rtrnData = 'Total Minutes : ' + arr[0]['minutes'];
  //     return rtrnData;
  //   } else {
  //     let assignMinutesList = item.get('ext').value;
  //     let assignMinutes = 0;
  //     assignMinutesList.forEach(element => {
  //       assignMinutes = Number(assignMinutes) + Number(element['minutes']);
  //     });
  //     let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
  //     rtrnData = 'Remaining : ' + (arr[0]['minutes'] - assignMinutes);
  //     return rtrnData;
  //   }
  // }


  public getDestinationName(item: FormControl, type) {
    let rtrnData;
    let countryPrefix = item.get('country').value;
    let planType = item.get('type').value;
    let ext_id = item.get('id').value;  
    if (type === 'country_name') {
      let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType);
      let type = (planType == '3') ? '- Booster' : (planType == '4') ? '- TeleConsultancy' : '-Bundle';
      rtrnData = arr[0]['destination'] + ' (' + arr[0]['dial_prefix'] + ') ';
      return rtrnData;
    } else if (type === 'assign_minute') {
      let assignMinutesList = item.get('ext').value;
      let assignMinutes = 0;
      assignMinutesList.forEach(element => {
        assignMinutes = Number(assignMinutes) + Number(element['minutes']);
      });
      rtrnData = 'Assigned : ' + assignMinutes;
      return rtrnData;
    } else if (type == 'used_minute') {
      let usedMnutesList = item.get('ext').value;
      let usedMnutes = 0;
      usedMnutesList.forEach(element => {
        usedMnutes = Number(usedMnutes) + Number(element['used_minutes']);
      });
      rtrnData = 'Consumed : ' + usedMnutes;
      return rtrnData;
    } else if (type == 'remaining_minutes') {
      let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
      // let assignMinutesList = item.get('ext').value;
      // let assignMinutes = 0;
      // assignMinutesList.forEach(element => {
      //   assignMinutes = Number(assignMinutes) + Number(element['minutes']);
      // });      
      rtrnData = 'Total Minutes : ' + arr[0]['minutes'];
      return rtrnData;
    } else {
      let assignMinutesList = item.get('ext').value;
      let assignMinutes = 0;
      assignMinutesList.forEach(element => {
        assignMinutes = Number(assignMinutes) + Number(element['minutes']);
      });
      let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
      rtrnData = 'Remaining : ' + (arr[0]['minutes'] - assignMinutes);
      return rtrnData;
    }
  }
  public getExtensionAssignMinutes(DestinationList, id, planID) {
    let aa = [];    
    let obj = {
      destination: DestinationList,
      customer_id: localStorage.getItem('id'),
      id: id,
      plan_id: planID
    }
    this.teleConsultationService.getTCAssignMinute(obj).subscribe(pagedData => {
      // this.tcPlanValue = pagedData.length ? pagedData[0]['tc_plan_id'] : null;
      // this.planPrice = pagedData.length ? pagedData[0]['plan_price'] : null;                
      // this.isAssignMinute = pagedData.length == 0 ? true : false;
      this.isAssignMinute.push(pagedData)
      this.minutePlan.get('price').setValue(pagedData[0]['plan_price']);
      this.minutePlan.get('name').setValue(pagedData[0]['tc_plan_id']);
      let ExtInfo = pagedData ? JSON.parse(JSON.stringify(pagedData)) : [];
      this.everyDestMappedExtn = pagedData ? pagedData : [];
      let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
      FormArray.controls.forEach((element, index) => {
        let FormControl = element.get('ext') as FormArray;   // --- {}
        let destFormControl = element.get('country') as FormControl;  // --- 91,92
        let typeFormControl = element.get('type') as FormControl;
        let unique_id = element.get('id') as FormControl;
        destFormControl = destFormControl ? (destFormControl.value).replace('+', '') : 0;
        typeFormControl = typeFormControl ? typeFormControl.value : '1';
        unique_id = unique_id ? unique_id.value : 0;
        ExtInfo.forEach(element => {
          if (Number(destFormControl) == element['destination'] && typeFormControl == element['plan_type'] && element['id'] == unique_id) {
            aa.push(element['contact_name']);
            this.selectedExtensionList = aa;
            FormControl.push(
              this.fb.group({
                c_name: element ? element['contact_name'] : 0,
                minutes: element ? element['assign_minutes'] : 0,
                used_minutes: element ? element['u_minute'] : 0,
                c_id: element ? element['contact_id'] : 0
              })
            );
          }
        });
        if (ExtInfo.length == 0) { // if destination has no contact-minute-mapping previously
          this.selectedExtensionList.forEach((element, index) => {
            let exist = (FormControl.value).filter(item => {
              item.id === Number(element)
            });
            FormControl.push(
              this.fb.group({
                c_name: element ? Number(element) : 0,
                minutes: 0,
              })
            );
            let FormArray2 = <FormArray>this.minutePlan.controls.minutManageForm;
            if (FormArray2.length == this.counter) {
              this.removeDuplicateExtension()
            }
          })
        }

      });
    });

  }

  public onAdjustMinuteValueChange(input, destIndex, Extindex) {
    let adjustmentMinutes = input;
    let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
    let c = FormArray.at(destIndex).get('ext') as FormArray;
    let assingned_minutes = c.at(Extindex).get('minutes').value;

    if (Number(assingned_minutes) < Number(adjustmentMinutes)) {
      this.toastr.error('Adjust Minute should be less than ' + assingned_minutes, 'Error !', { timeOut: 4000, progressBar: true, progressAnimation: "increasing" });
      c.at(Extindex).get('manage_minutes').setValue(0);
    }
  }

  public restrictMinuteValidation(item: FormControl, type, destIndex?, Extindex?) {
    let check = false;
    _.map(this.minutePlan.get('minutManageForm').value, (element) => {
      _.map(element.ext, (elements) => {
        if (elements.minutes < elements.used_minutes && elements.used_minutes != 0 && elements.minutes != '') {
          // this.toastr.error("Please select at least one destination.", 'Error!', { timeOut: 4000 });
          check = true;
        }
      })
    })
    if (check != false) {
      this.smbtBtnDisable = true;
      // this.toastr.error("Assign Minuutes can not be less than Used Minutes.", 'Error!', { timeOut: 4000 });
    } else {
      this.smbtBtnDisable = false;
    }

    let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
    let c = FormArray.at(destIndex).get('ext') as FormArray;
    let rtrnData;
    let countryPrefix = item.get('country').value;
    let planType = item.get('type').value;
    let ext_id = item.get('id').value;
    let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
    let assignMinutesList = item.get('ext').value;
    let assignMinutes = 0;
    assignMinutesList.forEach(element => {
      assignMinutes = Number(assignMinutes) + Number(element['minutes']);
    });
    rtrnData = 'Remaining Minutes : ' + assignMinutes + '/' + arr[0]['minutes'];

    if (assignMinutes > Number(arr[0]['minutes'])) {
      this.toastr.error('Total should be less than ' + arr[0]['minutes'], 'Error !', { timeOut: 4000, progressBar: true, progressAnimation: "increasing" });
      c.at(Extindex).get('minutes').setErrors({ 'incorrect': true });
      return;
    } else {
      c.at(Extindex).get('minutes').setErrors({ 'incorrect': null });
      c.at(Extindex).get('minutes').updateValueAndValidity();
      return;
    }
  }

  public removeDuplicateExtension() {
    let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
    FormArray.controls.forEach((element, index) => {
      let FormControl = element.get('ext') as FormArray;
      let arr = JSON.parse(JSON.stringify(FormControl.value));
      let aa = arr.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    });

  }

  cancelForm() {
    this.router.navigateByUrl('teleconsultation/tc-plan-list');
  }
}

