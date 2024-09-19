import { Component, OnInit, Inject } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  FormBuilder,
  FormControl,
  FormArray,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  CommonService,
  formError,
  agentError,
  invalidFileType,
  importUnsuccessfully,
  importSuccessfully,
  Errors,
  OutboundSuccessfully,
  Contact_RegEx,
  ExtensionService,SIPError
} from "../../../../app/core";
import { CustomerDialoutServiceService } from "../customer-dialout-service.service";
import { ConfigService } from "../../config/config.service";
import { DidService } from "../../DID/did.service";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { CallgroupService } from "../../call-group/call-group.service";
import { ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import Swal from "sweetalert2";

@Component({
  selector: "app-intercom-dialout-rule",
  templateUrl: "./intercom-dialout-rule.component.html",
  styleUrls: ["./intercom-dialout-rule.component.css"],
})
export class IntercomDialoutRuleComponent implements OnInit {
  error = "";
  filterForm: FormGroup;
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  selectedValue: any = [];
  selectedValueTwo: any = [];
  extList: any = [];
  cg_names: any = [];
  cgList: any = [];
  filterObj: any = {};
  rowData: any;
  intercomData: any;
  exportData: any = {};
  defaultPageSize = "10";
  DialOutName: any;
  public fields: Object = { text: "agent", value: "agent" };
  public fields1: Object = { text: "name", value: "id" };
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private CustomerDialoutServiceService: CustomerDialoutServiceService,
    private didService: DidService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private callGroupService: CallgroupService
  ) {
    this.filterForm = this.fb.group({
      name: [""],
      sip_allow: [""],
      cg_allow: [""],
    });
  }

  ngOnInit() {
    this.CustomerDialoutServiceService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.extensionService
      .getMyExtension(localStorage.getItem("id"))
      .subscribe((data) => {
        this.extList.unshift({ agent: 'Select SIP Allow', id: 0 });
        for (let i = 0; i < data.response.length; i++) {
          this.extList.push({
            id: data.response[i].id,
            agent:
              data.response[i].ext_number +
              "-" +
              data.response[i].username,
          });

        }
      });

    this.callGroupService
      .getCallgroup({ customer_id: Number(localStorage.getItem("id")) })
      .subscribe((pagedData) => {
        this.cgList.unshift({ agent: 'Select CG Allow', id: 0 });
        for (let i = 0; i < pagedData.length; i++) {
          this.cgList.push({ id: pagedData[i].id, agent: pagedData[i].name });

        }
      });
  }
  promptremovedspaceExtList(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.extList.filter((data) => {
      return data["agent"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  promptremovedspacecgList(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.cgList.filter((data) => {
      return data["agent"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 100 },
      {
        field: "name",
        headerName: "Name",
        hide: false,
        width: 200,
      },
      {
        field: "extension_list",
        headerName: "Extension List",
        hide: false,
        width: 220,
      },
      {
        field: "only_extension",
        headerName: "Intercom Allowed",
        hide: false,
        width: 150,
      },
      {
        field: "group_extension",
        headerName: "Other Intercom Allowed",
        hide: true,
        width: 150,
      },
      {
        field: "cc_extension",
        headerName: "Call Group Allowed",
        hide: true,
        width: 150,
      },
      { field: "cg_name", headerName: "Call Group List", hide: false, width: 200 },
      { field: "group_name", headerName: "Extension Group List", hide: false, width: 200 },
      { field: "cg_name", headerName: "CG Allow", hide: true, width: 200 },
    ];
    let user_id = Number(localStorage.getItem("id"));
    if (this.isFilter) {
      let credentials = this.filterForm.value;
      credentials.sip_allow = Number(credentials.sip_allow)
      credentials["customer_id"] = user_id;
      this.CustomerDialoutServiceService.getInternalDialoutByFilter(
        credentials
      ).subscribe((data) => {
        data = this.manageUserActionBtn(data["response"]);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data: data });
      });
    } else {
      this.CustomerDialoutServiceService.getInternalDialout(
        localStorage.getItem("id")
      ).subscribe((data) => {
        this.intercomData = data;

        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data: data });
      });
    }
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if (pagedData[i].mapped) {
        finalBtn +=
          "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='associate' title='Mapped Extensions'></i>";
      }
      finalBtn += "</span>";
      pagedData[i]["action"] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.openDialog(data);
      case "delete":
        return this.deleteIntercomRule(data);
      case "associate":
        return this.associatedExtension(data);
    }
  }

  associatedExtension(data) {
    this.router.navigate(
      ["/dialout-rule/intercom-dialout-rule/intercom-assiciated-extensions"],
      { queryParams: { id: data.id } }
    );
  }

  deleteIntercomRule(data) {
    let event = data;
    this.CustomerDialoutServiceService
    .getIntercomIDCount(event.id, event.extension_group_list)
    .subscribe((data) => {
      if (data.extension_count > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html:
            "<span style='color:#FFFFFF;'> Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            " </span><span style='color:#FFFFFF'> can't be deleted because </span> <span style='color:#FFFFFf;'> it is associate with other group.</span>",
          type: "error",
          background: "#000000",
          timer: 5000,
        });
      } else {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover Intercom Dialout Rule </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        event.name +
        "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.CustomerDialoutServiceService.deleteIntercomRule({
          id: event.id,
        }).subscribe(
          (data) => {
            this.displayAllRecord();
          },
          (err) => {
            this.error = err.message;
          }
        );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> Intercom Dialout Rule </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>Intercom Dialout Rule </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: "error",
          background: "#000000",
        });
      }
    });
  }
});

  }

  editDialOutRule(data: any) {
    this.openDialog(data);
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(IntercomDialoutDialog, {
      width: "200%",
      disableClose: true,
      data: data ? data : null,
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
}

@Component({
  selector: "IntercomDialout-dialog",
  templateUrl: "./IntercomDialout-dialog.html",
})
export class IntercomDialoutDialog {
  sourceAddSIPExt: any[] = [];
  ByExtID: any[] = [];
  targetAddSIPExt: any[] = [];
  errors: Errors = { errors: {} };
  intercomDialoutForm: FormGroup;
  c_name = "";
  description = "";
  dialoutGroupList = [];
  DialFilter: any;
  filterDial: any;
  editdata: boolean = false;
  public mode;
  sourceAgent: any[] = [];
  public selectAllText: string;
  rules: string[] = [];
  public placeholder: string = "Dialout Group";
  public placeholder1: string = "Extension List"; 
  public placeholder2: string = 'Call Group List';
  public placeholder3: string = 'Extension Group List';

  public popupHeight: string = "200px";
  public popupWidth: string = "300px";
  placeholder5 = "DID as caller id";
  didList = [];
  public fields: Object = { text: "agent", value: "id" };
  public fields1: Object = { text: "name", value: "id" };
  // public fields2: Object = { text: 'name', value: 'id' };
  DIDFilter: any;
  filterDID: any;
  hideRandom = false;
  promise;
  clr_id_as_random: any;
  dialoutName: any;
  prependData: any;
  intercomData: any;
  stripData: any;
  extList: any = [];
  groupList: any = [];
  groupCCList: any = [];
  cgList: any = [];
  intercomSipArray: any = [];
  intercomCgArray: any = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  rule_typee: any = [];
  intercom_cc_Array:any = []
  intercom_group_Array:any = []
  group_types: any;
  checkValue: any;
  checkCCValue: any;
  only_extension:any;
  group_extension:any;
  cc_extension:any;
  disable:any;
  intercomId:any;
  ruleOptions = [
    { name: 'Only extension calling allowed', value: '1' },
    { name: 'Only Command center/ Admin Group allowed', value: '2' },
    { name: 'Other extension group allowed', value: '3' }
  ];
  

  constructor(
    private cdref: ChangeDetectorRef,
    public dialogRef: MatDialogRef<IntercomDialoutDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private fb: FormBuilder,
    public ConfigService: ConfigService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private didService: DidService,
    private extensionService: ExtensionService,
    private callGroupService: CallgroupService,
    private CustomerDialoutServiceService: CustomerDialoutServiceService
  ) {
    this.intercomDialoutForm = this.fb.group({
      name: ["", Validators.required],
      'group_type': [""],
      // extension_list: [""],
      'only_extension':[''],
      'cc_extension':[''],
      'group_extension':[''],
      extension_cc_list:[""],
      extension_group_list:[""]
    });
  }  
  
  // get extension_list() {
  //   return this.intercomDialoutForm.get("extension_list");
  // }
  get name() {
    return this.intercomDialoutForm.get("name");
  }
  get extension_group_list() {
    return this.intercomDialoutForm.get("extension_group_list");
  }
  get extension_cc_list() {
    return this.intercomDialoutForm.get("extension_cc_list");
  }
  // get group_type() {
  //   return this.intercomDialoutForm.get("group_type");
  // }
  get rule_type() {
    return this.intercomDialoutForm.get("rule_type");
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any =
      document.getElementsByClassName("mat-filter-input");
    matFilterInput && matFilterInput.length
      ? (matFilterInput[0].value = "")
      : "";
    this[key] = value;
  }

  ngOnInit() {
    let user_id = localStorage.getItem('id')
      this.extensionService.getAllIntercomExtension(localStorage.getItem('id')).subscribe(data => {           
        this.extList.push(data.response)        
        for (let i = 0; i < data.response.length; i++) {
          this.sourceAddSIPExt.push({ id: data.response[i].id, codec: data.response[i].ext_number + '-' + data.response[i].username });
        }
      });      
    // })
    this.mode = "CheckBox";
    this.selectAllText = "Select All";

    // this.extensionService
    //   .getMyExtension(localStorage.getItem("id"))
    //   .subscribe((data) => {
    //     for (let i = 0; i < data.response.length; i++) {
    //       this.extList.push({
    //         id: data.response[i].id,
    //         agent:
    //           data.response[i].ext_number +
    //           "-" +
    //           data.response[i].username,
    //       });
    //     }
    //   });

    this.callGroupService
      .getCallgroup({ customer_id: Number(localStorage.getItem("id")) })
      .subscribe((pagedData) => {
        for (let i = 0; i < pagedData.length; i++) {
          this.cgList.push({ id: pagedData[i].id, agent: pagedData[i].name });
        }
      });

    if (this.data) {
      this.CustomerDialoutServiceService.getIntercomByExtID(user_id,this.data.id).subscribe(data =>{       
        for (let i = 0; i < data.length; i++) {
          this.targetAddSIPExt.push({ id: data[i].id, codec: data[i].ext_number + '-' + data[i].username });             
        }                
      })      
      this.CustomerDialoutServiceService.getIntercomById(
        this.data.id
      ).subscribe((data) => {
        this.intercomId = data[0]['id'];                        
        let targetSIP = (data[0].extension_list).split(",");   
        this.intercomData = data[0];
        this.disable = this.intercomData.id
        this.dialoutName = this.intercomData.name;
        // this.group_types = this.intercomData.group_type;
        setTimeout(() => {
          this.only_extension = this.intercomData.only_extension == '1' ? true : false;
          this.group_extension = this.intercomData.group_extension == '1' ? true : false;
          this.cc_extension = this.intercomData.cc_extension == '1' ? true : false;
          this.intercomSipArray = this.intercomData.extension_list
            ? this.intercomData.extension_list.split(",").map(Number)
            : [];
          this.rule_typee = this.intercomData.rule_type ? this.intercomData.rule_type.split(',').map(String) : [];
     
          if (this.cc_extension == true) {
            this.intercomDialoutForm.controls.extension_cc_list.setValidators(Validators.required);
            this.intercomDialoutForm.controls.extension_cc_list.updateValueAndValidity();
            this.CustomerDialoutServiceService.getGroupCCType(localStorage.getItem("id"),2).subscribe((data) => {
              this.groupCCList = data.map(item => ({ id: item.id, name: item.name }));
            });
          }
          if (this.group_extension == true) {
            this.intercomDialoutForm.controls.extension_group_list.setValidators(Validators.required);
            this.intercomDialoutForm.controls.extension_group_list.updateValueAndValidity();
            this.CustomerDialoutServiceService.getGroupType(localStorage.getItem("id"),1).subscribe((data) => {
              this.groupList = data.map(item => ({ id: item.id, name: item.name }));
              let newArray = [this.groupList.filter(item => item.id !== this.intercomId)];
              this.groupList = newArray[0];
            });
          }
          
          this.intercom_cc_Array = this.intercomData.extension_cc_list ? this.intercomData.extension_cc_list.split(',').map(Number) : [];
          this.intercom_group_Array = this.intercomData.extension_group_list ? this.intercomData.extension_group_list.split(',').map(Number) : [];
        }, 1000);
      });
    }
  
    
  }
//   SelectGroupType(event){
// if (event.value == '1') {
//   this.intercomDialoutForm.controls.extension_list.setValidators(Validators.required);
//   this.intercomDialoutForm.controls.extension_list.updateValueAndValidity();
//   this.intercomDialoutForm.get('extension_list').reset();

// }
// else if( event.value == '2'){
//   this.intercomDialoutForm.controls.extension_list.setValidators(Validators.required);
//   this.intercomDialoutForm.controls.extension_list.updateValueAndValidity();
//   this.intercomDialoutForm.get('extension_list').reset();
// }
//   }
  CCToggle(event){
    this.checkCCValue = event.checked
    if (this.checkCCValue == true) {
      this.intercomDialoutForm.controls.extension_cc_list.setValidators(Validators.required);
      this.intercomDialoutForm.controls.extension_cc_list.updateValueAndValidity();
    this.CustomerDialoutServiceService.getGroupCCType(localStorage.getItem("id"),2).subscribe((data) => {
      this.groupCCList = data.map(item => ({ id: item.id, name: item.name }));
    });
  }
  else if(this.checkCCValue == false){
    this.intercomDialoutForm.controls.extension_cc_list.clearValidators();
    this.intercomDialoutForm.controls.extension_cc_list.updateValueAndValidity();
    this.intercomDialoutForm.get('extension_cc_list').setValue('');
  }
  }
  GroupToggle(event){
    this.checkValue = event.checked
    if (this.checkValue == true) {
      this.intercomDialoutForm.controls.extension_group_list.setValidators(Validators.required);
      this.intercomDialoutForm.controls.extension_group_list.updateValueAndValidity();
      this.CustomerDialoutServiceService.getGroupType(localStorage.getItem("id"),1).subscribe((data) => {
        this.groupList = data.map(item => ({ id: item.id, name: item.name }));
        let newArray = [this.groupList.filter(item => item.id !== this.intercomId)];
        this.groupList = newArray[0];
      });
    }
    else if(this.checkValue == false){
      this.intercomDialoutForm.controls.extension_group_list.clearValidators();
      this.intercomDialoutForm.controls.extension_group_list.updateValueAndValidity();
      this.intercomDialoutForm.get('extension_group_list').setValue('');
    }
  }
  
  

  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.extList.filter((data) => {
      return data["agent"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Providerremovedspac_cc(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.groupCCList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Providerremovedspac_group(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.groupList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  

  submitIntercomDGForm() {
    if (this.targetAddSIPExt.length == 0) {
      this.toastr.error('Error!', SIPError, { timeOut: 2000 });
      return;
    }
    let credentials = [];
    let value: any = [];
    let ext_names = [];
    let cg_names = [];
    credentials = this.intercomDialoutForm.value;
    // credentials["extension_list"].map((id) => {
    //   let names = this.extList.find((item) => item.id == id);
    //   ext_names.push(names.agent);
    // });
    credentials["ext_names"] = ext_names;
    credentials["cg_names"] = cg_names;
    credentials["customer_id"] = Number(localStorage.getItem("id"));
    if (!this.data) {
      if (this.targetAddSIPExt.length > 0) {
        for (let i = 0; i < this.targetAddSIPExt.length; i++) {
          let res1 = this.targetAddSIPExt[i].codec.split("-");
          value.push(res1[0]);
        }
        credentials['extension_list'] = value.join();
      
      this.CustomerDialoutServiceService.saveIntercomDialout(
        credentials
      ).subscribe((data) => {
        if (data.status_code == 200) {
          this.toastr.success(
            "Success!",
            "Intercom Dialout Created Successfully.",
            { timeOut: 2000 }
          );
          this.dialogRef.close();
          this.CustomerDialoutServiceService.updateGridList();
        } else if (data.status_code == 409) {
          this.toastr.error("Error!", data.message, { timeOut: 4000 });
        } else {
          this.toastr.error("Error!", "Something wrong happened.", {
            timeOut: 4000,
          });
        }
      });
    }
    } else {
      credentials["dialout_id"] = this.data.id;
      if (this.targetAddSIPExt.length > 0) {
        for (let i = 0; i < this.targetAddSIPExt.length; i++) {
          let res1 = this.targetAddSIPExt[i].codec.split("-");
          value.push(res1[0]);
        }
        credentials['extension_list'] = value.join();
      this.CustomerDialoutServiceService.updateIntercomDialout(
        credentials
      ).subscribe((pagedData) => {
        if (pagedData.status_code == 200) {
          this.toastr.success(
            "Success!",
            "Intercom Dialout Updated Successfully.",
            { timeOut: 2000 }
          );
          this.dialogRef.close();
          this.CustomerDialoutServiceService.updateGridList();
        } else if (pagedData.status_code == 409) {
          this.toastr.error("Error!", pagedData.message, { timeOut: 4000 });
        } else {
          this.toastr.error("Error!", "Something wrong happened.", {
            timeOut: 4000,
          });
        }
      });
    }
    
  }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  cancelForm() {
    this.ConfigService.updateGridList();
    this.dialogRef.close();
  }
  sourceFilterValue: string = '';

  targetFilterValue: string = '';
  clearFilter(e) {
    this.sourceFilterValue = '';
    this.targetFilterValue = '';
  }
}
