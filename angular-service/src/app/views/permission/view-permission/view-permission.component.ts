import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Errors,
  ExcelService,
  errorMessage,
  CommonService,
  permissionUpdate,
} from "../../../core";
import { ToastrService } from "ngx-toastr";
import { PermissionService } from "../permission.service";
import { Page, PermissionDetail } from "../../../core/models";
import Swal from "sweetalert2";
import { UserService } from '../../user/user.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { E } from "@angular/cdk/keycodes";

export var productId = '1';
@Component({
  selector: "app-view-permission",
  templateUrl: "./view-permission.component.html",
  styleUrls: ["./view-permission.component.scss"],
})
export class ViewPermissionComponent implements OnInit {
  error = "";
  submitted = false;
  errors: Errors = { errors: {} };
  permissionForm: FormGroup;
  page = new Page();
  errorControl = "";
  provider_id = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = "10";
  companyList: any[] = [];
  filterForm: FormGroup;
  isFilter = false;
  userRole = ''
  public fields: Object = { text: 'name', value: 'id' };

  constructor(
    private permissionService: PermissionService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private userService: UserService,
  ) {
    this.filterForm = this.formBuilder.group({
      'by_name': [''],
      'by_company': [''],
      'by_user': [''],
    });
  }

  ngOnInit() {
    this.permissionService.getSavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.userRole = localStorage.getItem("type");

    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 20 },
      { field: "permission_id", headerName: "ID", hide: true, width: 10 },
      {
        field: "permission_name",
        headerName: "Permission Name",
        hide: false,
        width: 90,
      },
      {
        field: "userType",
        headerName: "Permission For",
        hide: false,
        width: 90,
      }
    ];
    productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';

    this.userService.getCustomerCompany(productId).subscribe(datas => {
      // this.selectedValue = data.response;
      let data = datas.response;
      let companyData = []
      for (let i = 0; i < data.length; i++) {
        companyData.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
      }
      this.companyList = companyData
    }, err => {
      this.error = err.message;
    });

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.permissionService
        .getPermissionListByFilter(credentials).subscribe(pagedData => {
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        }, err => {
          this.error = err.message;
        });
    } else {
      this.permissionService
        .getPermissionList({ id: localStorage.getItem("id") })
        .subscribe((pagedData) => {
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: pagedData });
        });
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  goToCreate(url: string) {
    this.router.navigate([url]);
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      let userType = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      if(this.userRole){
        finalBtn +=
          "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if(data[i]['flag'] == 1){
        finalBtn +=
          "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Users'></i>";
        finalBtn += "</span>";
      }
      if(data[i].userType == '1'){
        userType += 'Reseller'
      }else{
        userType+= 'Sub Admin'
      }
     
      data[i]['userType'] = userType;
      data[i]["action"] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    //alert(actionType);
    switch (actionType) {
      case "edit":
        return this.editDID(data);
      case "viewUsers":
        return this.showCustomer(data);
      case "delete":
        return this.deletePermission(data);
    }
  }

  showCustomer(data) {
    this.router.navigate(["permission/viewUser"], {
      queryParams: { pId: data.id, pName: data.permission_name },
    });
  }

  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }


  deletePermission(data) {
    this.permissionService
      .getPermissionUser({ id: Number(data.id) })
      .subscribe((userdata) => {
        if (userdata.length > 0) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Oopss...</span>',
            html:
              "<span style='color:#FFFFFF;'>Permission </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.permission_name +
              "</span> <span style='color:#FFFFFF;'> can't be deleted because it is associate with users.</span>",
            type: "error",
            background: "#000000",
            timer: 5000,
          });
        } else {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Are you sure?</span>',
            html:
              "<span style='color:#FFFFFF;'>You will not be able to recover permission </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.permission_name +
              "</span> <span style='color:#FFFFFF;'> in future!</span>",
            type: "warning",
            showCancelButton: true,
            background: "#000000",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, keep it",
            preConfirm: () => {
              this.permissionService.deletePermission({id:data.id}).subscribe(data => {
                this.displayAllRecord();
              }, err => {
                this.error = err.message;
              });
            },
            allowOutsideClick: () => !Swal.isLoading(),
          }).then((result) => {
            if (result.value) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Deleted!</span>',
                html:
                  "<span style='color:#FFFFFF;'> Permission </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                  data.permission_name +
                  "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
                type: "success",
                background: "#000000",
                timer: 3000,
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Cancelled</span>',
                html:
                  "<span style='color:#FFFFFF;'>Permission </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                  data.permission_name +
                  "</span> <span style='color:#FFFFFF;'> is safe.</span>",
                type: "error",
                background: "#000000",
                timer: 3000,
              });
            }
          });
        }
      });
  }

  editDID(data) {
    // this.router.navigate(['did/manage'], { queryParams: { id: data.id } });
    this.openDialog(data.id);
  }

  Companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDataa = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDataa);
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(permissionDialog, {
      width: "80%",
      disableClose: true,
      data: { id: id ? id : null },
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      //console.log('Dialog closed');
      this.displayAllRecord();
    });
  }
}

@Component({
  selector: "edit-permission-dialog",
  templateUrl: "edit-permission.html",
  styleUrls: ["./view-permission.component.scss"],
})
export class permissionDialog {
  errors: Errors = { errors: {} };
  permissionForm: FormGroup;
  allUrl: any;
  isSelected = false;
  selectedItem = [];
  resellerList = [];
  selectedPermission: any;
  selectedUserType: any;
  selectedPbx: any;
  selectedOc: any;
  selectedPermissionId: any;
  completePermissions = false; 

  constructor(
    public dialogRef: MatDialogRef<permissionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PermissionDetail,
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.permissionForm = this.fb.group({
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
      this.permissionService
      .getPermissionById({ id: this.data.id })
      .subscribe((data1) => {
        this.selectedPermission = data1[0]["permission_name"];
        this.selectedPermissionId = data1[0]["permission_id"];
        this.selectedUserType = data1[0]["userType"] == '1' ? '1' : '';
        this.selectedPbx = data1[0]["pbx"] == '1' ? true : false;
        this.selectedOc = data1[0]["oc"] == '1' ? true : false;
        if(data1[0]["userType"] == '0'){
          const urlList = resList
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
  
        this.allUrl = finalUrlList;
        }else{
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
  
      this.allUrl = finalUrlList;  
        }
        if (data1) {
          this.makeCheckPermission(data1);
        }
      });
        
      // this.allUrl = data.response;
    
    });
  }

  makeCheckPermission(selectedUrl) {
    
    let complete_permissions = true
    const data = this.allUrl.map((url) => {
      const userPerm = selectedUrl.find((item) => item.id == url.id);
      
      
      
      if (userPerm) {
        const allpermission =
          userPerm.all_permission == 1 &&
          // userPerm.delete_permission == 1 &&
          // userPerm.modify_permission == 1 &&
          userPerm.view_permission == 1
            ? 1
            : 0;
            if(allpermission == 0){
              complete_permissions = false
            }
            return {
              ...url,
              // addpermission: userPerm.add_permission,
              // deletepermission: userPerm.delete_permission,
          // editpermission: userPerm.modify_permission,
          viewpermission: userPerm.view_permission,
          allpermission,
        };
      } else {
        return {
          ...url,
          // addpermission: 0,
          // deletepermission: 0,
          // editpermission: 0,
          viewpermission: 0,
          allpermission: 0,
        };
      }
      
      
    });
    
    
    this.allUrl = data;
    // this.completePermissions = complete_permissions
    
    
    if(selectedUrl.length == this.allUrl.length){
      this.completePermissions = true;
    }else{    
      this.completePermissions = false;
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.permissionForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.permissionForm.reset();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  allCheck(event, urlData) {
    const isChecked = event.target.checked;
    const allUrls = this.allUrl;
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
    let complete_permissions = true
    this.allUrl = data.map((url) => {
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
      if(url.allpermission == 0){
        complete_permissions = false
      }
      return url;
    });
    this.completePermissions = complete_permissions
  }

  
  singleCheck(e, urlData, type) {
    const isChecked = e.target.checked;
    const allUrls = this.allUrl;
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
      if (addpermission || editpermission || deletepermission) {
        viewpermission = 1;
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
    let complete_permissions = true
    this.allUrl = data.map((url) => {
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
      if(url.allpermission == 0){
        complete_permissions = false
      }
      return url;
    });
    this.completePermissions = complete_permissions
  }

  completeCheck(event) {
    const isChecked = event.target.checked;
    const allUrls = this.allUrl;
    console.log(isChecked);
    
    
    
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

    
    this.allUrl = data
    this.allUrl.map((o)=>{
      if(o.id == 1 || o.id == 324 || o.id == 325 || o.id == 326){
        o.addpermission = 1;
        o.deletePermission = 1;
        o.editpermission = 1;
        o.viewpermission = 1;
        o.allpermission = 1;
      }
    })
    
  }

  checkName() {
    let credentials = this.permissionForm.value;
    this.permissionService.checkNameValid(credentials).subscribe(data => {
      if (data.id >= 1) {
        this.toastr.error('Error!', 'This permission name already exist!', { timeOut: 4000 })
        this.selectedPermission = "";
      }
    });
  }

  updatePermission() {
    this.errors = { errors: {} };
    var permissionArr = [];
    var k = 0;
    
    
    this.allUrl.map((perm) => {
      const permission = {
        all: perm.allpermission == 1 ? true : false,
        add: perm.addpermission == 1 ? true : false,
        delete: perm.deletepermission == 1 ? true : false,
        modify: perm.editpermission == 1 ? true : false,
        view: perm.viewpermission == 1 ? true : false,
      };
      permissionArr.push({ id: perm.id, permission });
      return perm;
    });

    const check = permissionArr.filter((item) =>item.permission.all == true || item.permission.view == true);
    

    if(check.length){
      let credentials = this.permissionForm.value;
      credentials.permissionObj = permissionArr;
      credentials.permissionId = this.data.id;
      
      this.permissionService
        .updatePermission("permission/update", credentials)
        .subscribe(
          (data) => {
            this.toastr.success("Success!", permissionUpdate, { timeOut: 4000 });
            localStorage.removeItem("data");
            this.dialogRef.close();
          },
          (err) => {
            this.errors = err;
            this.toastr.error("Error!", errorMessage, { timeOut: 2000 });
          }
        );
    }else{
      this.toastr.error('Error!', 'Select Atleast One Menu', { timeOut: 2000 });
    }
  }
  search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].id === nameKey) {
        return myArray[i].id;
      }
    }
  }
}
