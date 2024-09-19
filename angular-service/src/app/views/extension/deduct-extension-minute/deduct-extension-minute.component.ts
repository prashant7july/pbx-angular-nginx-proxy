import { Component, OnInit } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
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
import * as _ from 'lodash';

@Component({
  selector: 'app-deduct-extension-minute',
  templateUrl: './deduct-extension-minute.component.html',
  styleUrls: ['./deduct-extension-minute.component.css']
})
export class DeductExtensionMinuteComponent implements OnInit {

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
  hideExt: boolean = false;
  globalRemain = 0;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private fb: FormBuilder,
    private minutePlanService: MinutePlanService,
  ) {
    this.minutePlan = this.fb.group({
      minutManageForm: new FormArray([]),   // this.fb.array([])
    });
  }

  ngOnInit() {
    this.extensionService.getExtension(localStorage.getItem('id')).subscribe(pagedData => {
      this.extensionList = pagedData;
      for (let i = 0; i < pagedData.length; i++) {
        this.ext_id[i] = pagedData[i]
      }
    });
    this.getCustomerBundlePlan();
  }

  submitRatePlan() {
    const credentials = this.minutePlan.value;    
    if (this.smbtBtnDisable) {
      this.toastr.error("Assign Minutes can not be less than Used Minutes.", 'Error!', { timeOut: 4000 });
      return;
    }
    let customerId = localStorage.getItem('id');
    let data = credentials;
    let addMinutes = 0;
    for (let i = 0; i < credentials['minutManageForm'][0]['ext'].length; i++) {
      for (let j = 0; j < this.ext_id.length; j++) {
        if (this.ext_id[j]['ext_number'] == credentials['minutManageForm'][0]['ext'][i]['id']) {
          credentials['minutManageForm'][0]['ext'][i]['id'] = this.ext_id[j]['id'];
        }
      }
      addMinutes = addMinutes + Number(credentials['minutManageForm'][0]['ext'][i]['minutes'])
    }
    credentials['minutManageForm'][0].remaining_minutes = Number(this.allDestinationRates[0]['minutes']) - Number(addMinutes);
    credentials['minutManageForm'][0].call_plan_id = this.allDestinationRates[0]['call_plan_id'];
    credentials['minutManageForm'][0].total_minutes = credentials['minutManageForm'][0].remaining_minutes == 0 ? 0 : Number(this.allDestinationRates[0]['minutes']);    
    if (!data['minutManageForm'].length) {
      this.toastr.error("Please select at least one destination.", 'Error!', { timeOut: 4000 });
      return;
    }
    if (!data['minutManageForm'][0]['ext'].length) {
      this.toastr.error("Please select at least one Extension.", 'Error!', { timeOut: 4000 });
      return;
    }
    this.extensionService.adjustBundlePlanMinute(credentials, customerId).subscribe(data => {
      this.toastr.success('Success!', data['message'], { timeOut: 4000 });
      this.router.navigateByUrl('user/extension/view');
    }, err => {
      if (err.error_code == 1062) {
        this.toastr.error("Already Minute Assign to this extension.", 'Eroor!', { timeOut: 4000 });
      }
    });
  }

  public getCustomerBundlePlan() {
    let obj = {
      customer_id: Number(localStorage.getItem('id'))
    }
    this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      this.destinatioList = pagedData ? pagedData.filter(item => { return item['group_type'] === 'Individual' && item['customer_id'] != 0 }) : [];
    });

  }

  public getExtensionDetail(e) {
    let selectedExt = [] = e.value;
    selectedExt = selectedExt.map(item => (item));
    let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
    FormArray.controls.forEach((element1, index) => {
      let FormControl = element1.get('ext') as FormArray;
      let preSelectedExt = (FormControl.value).map(item => item.id);
      var differentExt;
      let event = FormControl.length > selectedExt.length ? 'pop' : 'push';
      event == 'push' ? (differentExt = selectedExt.filter(x => !preSelectedExt.includes(x))) : (differentExt = preSelectedExt.filter(x => !selectedExt.includes(x)));
      if (event == 'push') {
        FormControl.push(
          this.fb.group({
            id: differentExt,
            minutes: 0,
            remain_minutes: 0,
            used_minutes: 0
          })
        );
      } else {
        FormControl.removeAt(FormControl.value.findIndex(item => item.id == differentExt))
      }
    });
  }

  public getDestinationDetails(e) {
    let obj = {
      customer_id: Number(localStorage.getItem('id')),
      by_destination: e.dial_prefix,
      id: e.id
    }
    this.minutePlanService.viewCustomerBundlePlanAllRates(obj).subscribe(pagedData => {

      this.allDestinationRates = pagedData;
      let selectedDestination = [] = e.dial_prefix;
      let control = <FormArray>this.minutePlan.controls.minutManageForm;
      control.clear();
      selectedDestination.length ? pagedData.forEach((element, index) => {

        this.counter = index + 1;
        control.push(
          this.fb.group({
            country: element ? element['dial_prefix'] : 91,
            type: element ? element['plan_type'] : '1',
            ext: new FormArray([]),
            id: element['id'],
            gateway_id: element['gateway_id']
          })
        );
        selectedDestination.length ? this.getExtensionAssignMinutes([element['dial_prefix']], element['id']) : '';
      }) : '';
      // selectedDestination.length ? this.getExtensionAssignMinutes(e.value) : '';
    });

    // let selectedDestination = [] = e.value;
    // let control = <FormArray>this.minutePlan.controls.minutManageForm;
    // control.clear();
    // selectedDestination.forEach(element => {
    //  control.push(
    //   this.fb.group({
    //     country: element ? element : 91,
    //     ext : new FormArray([])
    //   })
    // );
    // });
    // this.getExtensionAssignMinutes(e.value)
  }

  public getMinutePlanControls() {
    return (this.minutePlan.get('minutManageForm') as FormArray).controls;
  }

  public getDestinationName(item: FormControl, type) {
    let rtrnData;
    let countryPrefix = item.get('country').value;
    let planType = item.get('type').value;
    let ext_id = item.get('id').value;
    if (type === 'country_name') {
      let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType);
      let type = (planType == '3') ? '- Booster' : '- Bundle';
      rtrnData = arr[0]['destination'] + ' (' + arr[0]['dial_prefix'] + ') ' + type;
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
      rtrnData = 'Consumed : ' + Number(usedMnutes);
      return rtrnData;
    } else if (type == 'total_minutes') {
      let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
      // let assignMinutesList = item.get('ext').value;
      // let assignMinutes = 0;
      // assignMinutesList.forEach(element => {
      //   assignMinutes = Number(assignMinutes) + Number(element['minutes']);
      // });
      rtrnData = 'Total Minutes : ' + Number(arr[0]['minutes']);
      return rtrnData;
    } else {
      let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);
      let assignMinutesList = item.get('ext').value;  
      let assignMinutes = 0;
      assignMinutesList.forEach(element => {
        assignMinutes = Number(assignMinutes) + Number(element['minutes']);
      });
      let remain = 0;
      remain = this.globalRemain = Number(arr[0]['minutes']) - Number(assignMinutes);
      rtrnData = 'Remaining Minutes : ' + remain
      return rtrnData;
    }
  }

  public getExtensionAssignMinutes(DestinationList, id) {
    let aa = [];
    this.selectedExtensionList = [];
    this.extensionService.getExtensionAssignMinutes(DestinationList, localStorage.getItem('id'), id).subscribe(pagedData => {
      let ExtInfo = pagedData ? JSON.parse(JSON.stringify(pagedData)) : [];
      this.everyDestMappedExtn = pagedData ? pagedData : [];
      this.extensionList.forEach(element => {
        this.everyDestMappedExtn.forEach(elements => {
          if ((element['caller_id_name'] == elements.extension_id) && elements.checks == 1) {
            Object.assign(element, { check: true })
          }
        })
      })
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
            aa.push(element['extension_id'].toString());
            this.selectedExtensionList = aa;
            FormControl.push(
              this.fb.group({
                id: element ? element['extension_id'] : 0,
                minutes: element ? element['assingn_minutes'] : 0,
                remain_minutes: element ? element['assingn_minutes'] : 0,
                used_minutes: element ? element['used_minutes'] : 0
              })
            );
          }
        });
        if (ExtInfo.length == 0) { // if destination has no ext-minute-mapping previously
          this.selectedExtensionList.forEach((element, index) => {
            let exist = (FormControl.value).filter(item => {
              item.id === Number(element)
            });
            FormControl.push(
              this.fb.group({
                id: element ? Number(element) : 0,
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
    // this.minutePlan.get('')
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
        if ((elements.minutes <= elements.used_minutes) && (elements.used_minutes != 0 && elements.minutes != null)) {
          check = true;
        }
      })
    })
    if (check != false) {
      this.smbtBtnDisable = true;
    } else {
      this.smbtBtnDisable = false;
    }
    let FormArray = <FormArray>this.minutePlan.controls.minutManageForm;
    let c = FormArray.at(destIndex).get('ext') as FormArray;
    let rtrnData;
    let countryPrefix = item.get('country').value;
    let planType = item.get('type').value;
    let ext_id = item.get('id').value;

    // let arr = this.destinatioList.filter(item => item.dial_prefix == countryPrefix);

    let arr = this.allDestinationRates.filter(item => item.dial_prefix == countryPrefix && item.plan_type == planType && item.id == ext_id);

    let assignMinutesList = item.get('ext').value;
    let assignMinutes = 0;
    let previousAssignMinutes = 0;    
    assignMinutesList.forEach(element => {
      // if (typeof element.minutes == 'string')
       assignMinutes = Number(assignMinutes) + Number(element['minutes']);
    });

    // assignMinutesList.forEach((element, index) => {
    //   if (element.minutes < element.used_minutes) {
    //     this.toastr.error('Total should be less than ' + arr[0]['minutes'], 'Error !', { timeOut: 4000, progressBar: true, progressAnimation: "increasing" });
    //     c.at(Extindex).get('minutes').setErrors({ 'incorrect': true });
    //     return;
    //   }
    // });        
    if (assignMinutes > arr[0]['minutes']) {
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
}
