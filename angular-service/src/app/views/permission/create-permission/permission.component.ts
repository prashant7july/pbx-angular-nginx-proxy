import { Component, OnInit, Inject } from "@angular/core";
import {
  Errors,
  CommonService,
  errorMessage,
  invalidForm,
  permissionCreated,
} from "../../../core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { PermissionService } from "../permission.service";
import { element } from "protractor";
import { create } from "domain";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { InfiniteRowModelModule } from "@ag-grid-community/all-modules";

@Component({
  selector: "app-permission",
  templateUrl: "./permission.component.html",
  styleUrls: ["./permission.component.scss"],
})
export class PermissionComponent implements OnInit {
  errors: Errors = { errors: {} };
  permissionForm: FormGroup;
  allUrls: any;
  isSelected = false;
  selectedItem = [];
  resellerList = [];
  exPermission: any;
  completePermissions = false; 
  permissionName:string = '';

  constructor(
    private permissionService: PermissionService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.permissionForm = this.formBuilder.group({
      permission_name: [
        "",
        [Validators.maxLength(30), Validators.minLength(1)],
      ],
      allCheck: [""],
      permissions: [""],
      complete_permissions: [""],
      user_type: [""],
      pbx: [""],
      oc: [""],
    });
  }

  get permission_name() {
    return this.permissionForm.get("permission_name");
  }

  ngOnInit() {
    this.permissionService.getAdminUrls().subscribe((data) => {
      const resList = data.response.sort((a, b) =>
        a.menuname > b.menuname ? 1 : -1
      );
      this.resellerList = data.response.sort((a, b) =>
        a.menuname > b.menuname ? 1 : -1
      );
      
      
      const urlList = resList
        .filter((item) => item.id != 330)
        .filter((item) => item.id != 328)
        .filter((item) => item.parent_id != 330)
        .filter((item) => item.parent_id != 66)
        .filter((item) => item.id != 11)
        .filter((item) => item.id != 8)
        .filter((item) => item.id != 372)
      const finalUrlList = [];
      urlList.map((item, i) => {
        const menu = {
          ...item,
          addpermission: 0,
          deletepermission: 0,
          editpermission: 0,
          viewpermission: 0,
          allpermission: 0,
        };
        if (
          (menu.children == null || menu.children == "") &&
          menu.parent_id == 0
        ) {
          const childs = resList.filter((child) => child.parent_id == menu.id);
          if (childs.length == 0) {
            menu.children = "-";
          } else {
            menu.children = null;
          }
        }
        if (i > 0) {
          if (urlList[i - 1].menuname !== menu.menuname) {
            menu.menuname = menu.menuname;
          } else {
            menu.menuname = "";
          }
        }
        finalUrlList.push(menu);
        return item;
      });

      this.allUrls = finalUrlList;  
      
      
      // let exArray = [];
      // this.permissionService.getExtraPermission().subscribe(data => {
      //   this.exPermission = data.response;
      //   for (let i = 0; i < this.allUrls.length; i++) {
      //     exArray = [];
      //     if (this.allUrls[i].is_extra_permission) {
      //       for (let j = 0; j < this.exPermission.length; j++) {
      //         if (this.allUrls[i].id == this.exPermission[j].menu_id) {
      //           exArray.push(this.exPermission[j]);
      //           this.allUrls[i]['extra_permission'] = exArray;
      //         }
      //       }
      //     }
      //   }
      //   console.log(this.allUrls);
      // });
    });
  }

  changeUser(e){

    if(e.value == '1'){
       
      const urlList = this.resellerList
        .filter((item) => item.id != 330)
        .filter((item) => item.parent_id != 330)
        .filter((item) => item.parent_id != 66)
        .filter((item) => item.id != 11)
        .filter((item) => item.id != 8)
        .filter((item) => item.id != 44)
        .filter((item) => item.id != 51)
        .filter((item) => item.id != 52)
        .filter((item) => item.id != 55)
        .filter((item) => item.id != 332)
        .filter((item) => item.id != 333)
        .filter((item) => item.id != 91)
        .filter((item) => item.id != 92)
        .filter((item) => item.id != 93)
        .filter((item) => item.id != 95)
        .filter((item) => item.id != 349)
        .filter((item) => item.id != 350)
        .filter((item) => item.id != 351)
        .filter((item) => item.id != 365)
        .filter((item) => item.id != 4)
        .filter((item) => item.id != 34)
        .filter((item) => item.id != 35)
        .filter((item) => item.id != 256)
        .filter((item) => item.id != 375)
        .filter((item) => item.id != 50)
        .filter((item) => item.id != 53)
        .filter((item) => item.id != 54)
        .filter((item) => item.id != 96)
        .filter((item) => item.id != 97)
        .filter((item) => item.id != 98)
        .filter((item) => item.id != 99)
        .filter((item) => item.id != 3)
        .filter((item) => item.id != 371)
        .filter((item) => item.id != 124)
        .filter((item) => item.id != 126)
        .filter((item) => item.id != 128)
        .filter((item) => item.id != 130)
        .filter((item) => item.id != 383)
        .filter((item) => item.id != 384)
        .filter((item) => item.id != 100)
        .filter((item) => item.id != 101)
        .filter((item) => item.id != 102)
        .filter((item) => item.id != 345)
        .filter((item) => item.id != 352)
        .filter((item) => item.id != 355)
        .filter((item) => item.id != 328)
        
      const finalUrlList = [];
      urlList.map((item, i) => {
        const menu = {
          ...item,
          addpermission: 0,
          deletepermission: 0,
          editpermission: 0,
          viewpermission: 0,
          allpermission: 0,
        };
        if (
          (menu.children == null || menu.children == "") &&
          menu.parent_id == 0
        ) {
          const childs = this.resellerList.filter((child) => child.parent_id == menu.id);
          if (childs.length == 0) {
            menu.children = "-";
          } else {
            menu.children = null;
          }
        }
        if (i > 0) {
          if (urlList[i - 1].menuname !== menu.menuname) {
            menu.menuname = menu.menuname;
          } else {
            menu.menuname = "";
          }
        }
        finalUrlList.push(menu);
        return item;
      });

      this.allUrls = finalUrlList;  
    }else{
      
      
      const urlList = this.resellerList
      .filter((item) => item.id != 330)
      .filter((item) => item.id != 328)
      .filter((item) => item.parent_id != 330)
      .filter((item) => item.parent_id != 328)
      .filter((item) => item.parent_id != 66)
      .filter((item) => item.id != 11)
      .filter((item) => item.id != 8)    
      .filter((item) => item.id != 372)    
    const finalUrlList = [];
    urlList.map((item, i) => {
      const menu = {
        ...item,
        addpermission: 0,
        deletepermission: 0,
        editpermission: 0,
        viewpermission: 0,
        allpermission: 0,
      };
      if (
        (menu.children == null || menu.children == "") &&
        menu.parent_id == 0
      ) {
        const childs = this.resellerList.filter((child) => child.parent_id == menu.id);
        if (childs.length == 0) {
          menu.children = "-";
        } else {
          menu.children = null;
        }
      }
      if (i > 0) {
        if (urlList[i - 1].menuname !== menu.menuname) {
          menu.menuname = menu.menuname;
        } else {
          menu.menuname = "";
        }
      }
      finalUrlList.push(menu);
      return item;
    });

    this.allUrls = finalUrlList;  
    }

  }

  allCheck(event, urlData) {    
    const isChecked = event.target.checked;
    const allUrls = this.allUrls;
    this.allUrls = this.allUrls.filter((item) => item.id != 66 || item.id != 328);
    
    

    const data = allUrls.map((url) => {
      if (url.id != urlData.id) return url;
      return {
        ...url,
        addpermission: isChecked ? 1 : 0,
        deletepermission: isChecked ? 1 : 0,
        editpermission: isChecked ? 1 : 0,
        viewpermission: isChecked ? 1 : 0,
        allpermission: isChecked ? 1 : 0,
      };
    });
    let childCheck = false;
    if (urlData.parent_id > 0) {
      data.map((url) => {
        if (urlData.parent_id == url.parent_id) {
          if (
            url.addpermission ||
            url.deletepermission ||
            url.editpermission ||
            url.viewpermission
          ) {
            childCheck = true;
          }
        }
      });
    }        
    this.allUrls = data.map((url) => {      
      if (urlData.parent_id == url.id) {
        return {
          ...url,
          // addpermission: childCheck ? 1 : 0,
          // deletepermission: childCheck ? 1 : 0,
          // editpermission: childCheck ? 1 : 0,
          viewpermission: childCheck ? 1 : 0,
          allpermission: childCheck ? 1 : 0,
        };
      }                  
      // if(url.allpermission == 0){
      //   this.completePermissions = false;
      //   // complete_permissions = false
      // }      
      
      
      return url;
    })  
    
   let checkedArray = this.allUrls.filter((item) => item.allpermission == 0);
    

    if(checkedArray.length > 0){
      this.completePermissions = false;
    }else{
      this,this.completePermissions = true;
    }
  }

  singleCheck(e, urlData, type) {
    
    const isChecked = e.target.checked;
    const allUrls = this.allUrls;
    const data = allUrls.map((url) => {
      if (url.id != urlData.id) return url;
      let addpermission = url.addpermission;
      let deletepermission = url.deletepermission;
      let editpermission = url.editpermission;
      let viewpermission = url.viewpermission;
      let extraPermissions = url.extraPermissions;
      if (type == "add") {
        addpermission = isChecked ? 1 : 0;
      }
      if (type == "delete") {
        deletepermission = isChecked ? 1 : 0;
      }
      if (type == "edit") {
        editpermission = isChecked ? 1 : 0;
      }
      if (type == "view") {
        viewpermission = isChecked ? 1 : 0;
      }
      if(addpermission || editpermission || deletepermission){
        viewpermission = 1
      }
      const allpermission =
        addpermission == 1 &&
        deletepermission == 1 &&
        editpermission == 1 &&
        viewpermission == 1
          ? 1
          : 0;
      return {
        ...url,
        addpermission,
        deletepermission,
        editpermission,
        viewpermission,
        allpermission,
        extraPermissions,
      };
    });
    let childCheck = false;
    if (urlData.parent_id > 0) {
      data.map((url) => {
        if (urlData.parent_id == url.parent_id) {
          if (
            url.addpermission ||
            url.deletepermission ||
            url.editpermission ||
            url.viewpermission
          ) {
            childCheck = true;
          }
        }
      });
    }
    // let complete_permissions = true
    this.allUrls = data.map((url) => {
      if (urlData.parent_id == url.id) {
        return {
          ...url,
          addpermission: childCheck ? 1 : 0,
          deletepermission: childCheck ? 1 : 0,
          editpermission: childCheck ? 1 : 0,
          viewpermission: childCheck ? 1 : 0,
          allpermission: childCheck ? 1 : 0,
        };
      }
      // if(url.allpermission == 0){
      //   complete_permissions = false
      // }
      return url;
    });
    // this.completePermissions = complete_permissions
  }

  completeCheck(event) {
    this.completePermissions = true
    const isChecked = event.target.checked;
    const allUrls = this.allUrls;
    const data = allUrls.map((url) => {
      if (isChecked) {
        return {
          ...url,
          addpermission: 1,
          deletepermission: 1,
          editpermission: 1,
          viewpermission: 1,
          allpermission: 1,
        };
      } else {
        return {
          ...url,
          addpermission: 0,
          deletepermission: 0,
          editpermission: 0,
          viewpermission: 0,
          allpermission: 0,
        };
      }
    });
    this.allUrls = data;
  }

  createPermission() {
    this.errors = { errors: {} };
    var permissionArr = [];
    var k = 0;

    var elements = <HTMLInputElement[]>(
      (<any>document.getElementsByTagName("input"))
    );

    for (let i = 0; i < elements.length; i++) {
      let name_a = elements[i].name.split("_");
      let getId = name_a[1];
      let parent_id = name_a[2];
      var n = this.search(getId, permissionArr);
      if (getId != n) {
        if (elements[i].type == "checkbox") {
          if (getId != "check") {
            permissionArr.push({ id: getId });

            var childElements = <HTMLInputElement[]>(
              (<any>document.getElementsByName("p_" + getId + "_" + parent_id))
            );
            let chilsobj = {};
            for (let j = 0; j < childElements.length; j++) {
              let child_name_a = childElements[j].name.split("_");
              let child_getId = child_name_a[1];
              let child_val_a = childElements[j].value.split("_");
              var child_getval = child_val_a[0];
              if (permissionArr[k]["id"] == child_getId) {
                chilsobj[child_getval] = childElements[j].checked;
              }
            }
            permissionArr[k]["permission"] = chilsobj;
            k = k + 1;
          }
        }
      }
    }


    this.permissionService
    .getPermissionList({ id: localStorage.getItem("id") })
    .subscribe((pagedData) => {
      const list = pagedData.filter((p) => p.permission_name == this.permissionForm.get('permission_name').value.trim())
      if(list.length > 0) {
        this.toastr.error("Error!", 'Permission name already exist.', { timeOut: 2000 });
      }else {
        let credentials = this.permissionForm.value;
        
        const check = permissionArr.filter((item) =>item.permission.all == true || item.permission.view == true);
        
        
        if(check.length){
          credentials.permissionObj = permissionArr;
          if(credentials['pbx'] == '1' || credentials['oc'] == '1'){
            this.permissionService
              .createPermission("permission/create", credentials)
              .subscribe(
                (data) => {
                  this.toastr.success('Success!', permissionCreated, { timeOut: 2000 });
                  localStorage.removeItem("data");
                  this.router.navigateByUrl("permission/view");
                },
                (err) => {
                  this.errors = err;
                  this.toastr.error("Error!", errorMessage, { timeOut: 2000 });
                }
              );
          }else{
            this.toastr.error("Error!", 'Select Atleast One Product', { timeOut: 2000 });
          }  
        }else{
          this.toastr.error('Error!', 'Select Atleast One Menu', { timeOut: 2000 })
        }
      }
    });
    
  }
  search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].id === nameKey) {
        return myArray[i].id;
      }
    }
  }

  checkName() {
    let credentials = this.permissionForm.value;
    this.permissionService.checkNameValid(credentials).subscribe(data => {
      if (data.id >= 1) {
        this.toastr.error('Error!', 'This permission name already exist!', { timeOut: 4000 })
        this.permissionName = "";
      }
    });
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(ExtraPermissionDialog, {
      width: "40%",
      disableClose: true,
      data: { id: id ? id : null },
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }
}

@Component({
  selector: "extra-permission-dialog",
  templateUrl: "extra-permission-dialog.html",
})
export class ExtraPermissionDialog {
  errors: Errors = { errors: {} };
  permissionForm: FormGroup;
  submitted = false;
  menuName = "";
  error = "";
  menu_id = "";

  constructor(
    public dialogRef: MatDialogRef<ExtraPermissionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: "",
    private permissionService: PermissionService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog
  ) {
    this.permissionForm = this.fb.group({
      permission: ["", Validators.required],
    });
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  get permission() {
    return this.permissionForm.get("permission");
  }

  ngOnInit() {
    this.menu_id = this.data;
    // if (this.provider_id) {
    //   this.providerService.getProviderById(this.provider_id).subscribe(data => {
    //     this.providerData = data.response[0];
    //     this.providerName = this.providerData.provider;
    //   });
    // }
  }

  submitpermissionForm() {
    if (this.permissionForm.valid) {
      this.submitted = true;
      const credentials = this.permissionForm.value;
      
      
      //check provider
      let path = "permission/createExtraPermission";
      credentials["menu_id"] = this.data;
      this.permissionService.createExtraPermission(path, credentials).subscribe(
        (data) => {
          //let msg = this.data.id ? provderUpdated : provderCreated;
          this.toastr.success("Success!", "Extra permission cretaed", {
            timeOut: 2000,
          });
          //this.permissionService.updateGridList();
          this.router.navigate(["permission/create"]);
          this.dialogRef.close();
        },
        (err) => {
          this.error = err;
          this.toastr.error("Error!", errorMessage, { timeOut: 2000 });
        }
      );
    } else {
      this.toastr.error("Error!", invalidForm, { timeOut: 2000 });
    }
  }
}
