import { Component, OnDestroy, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService, ProductService, CommonService, EmitterService } from '../../core';
import { ProfileService } from '../../views/profile/profile.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductProfileService } from 'src/app/views/product-profile/product.profile.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { zhCnLocale } from 'ngx-bootstrap';

export let productId = '1';

@Component({
  selector: 'app-dashboard',
  templateUrl: './secured-layout.component.html',
  styleUrls: ['./secured-layout.component.css']
})
export class SecuredLayoutComponent implements OnDestroy {
  publicIP: string;
  allMenuItems: any = [];
  navMenuItems: any = [];
  public userType;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  dashboardPath = "";
  user_name = '';
  user_role = '';
  selectedValue = "";
  customerSelectedValue = "";
  errors = "";
  product = "1";
  public href: boolean = true;
  hiddenProduct = true;
  navbarOpen = false;
  historyData: any = []
  // subscription: Subscription;
  count = 0;
  user_id = '';
  isNotification = false;
  userData: any = {};
  userImg = '';
  tooltipContent: any = "";
  product_logo: any = "";
  searchValue: any = "";
  footer_text = "" 
  footer_text_left = ""
  favicon = "";
  ByAdmin:any;
  ByCustomer:any;
  ByAccount:any;
  BySupport:any;
  BySub:any;
  ByReseller:any;
  type;
  logo_obj = {src: 'assets/img/brand/ECTL_logo_new.png', width: 90, height: 50, alt: 'Cloud Connect', id:'brand_logo'}

  constructor(
    private userService: UserService,
    private router: Router,
    private productService: ProductService,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private profileService: ProfileService,
    public dialog: MatDialog,
    private http: HttpClient,
    private emitter: EmitterService, 
    private toastr: ToastrService,   
    private productprofileServices: ProductProfileService,    
    private titleService: Title,
    @Inject(DOCUMENT) _document?: any,
  ) {
    this.user_role = localStorage.getItem('type');
    this.user_id = localStorage.getItem('id'); 
    this.ByAdmin = localStorage.getItem('ByAdmin')
    this.ByCustomer = localStorage.getItem('ByCustomer');
    this.ByReseller = localStorage.getItem('ByReseller');
    if(this.user_role == '4')
    {
      this.ByAccount = localStorage.getItem('ByAccount');
    }
    else if(this.user_role == '5') 
    {
      this.BySupport = localStorage.getItem('BySupport');
    }
    else if(this.user_role == '2'){
      this.BySub = localStorage.getItem('BySub');

    }
  
    this.disabledDropDown();
    this.hiddenDropDown();
    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });
    this.productService.SharingData.subscribe((res: any) => {
      this.customerSelectedValue['balance'] = res;
      this.customerSelectedValue['balance'] = (this.customerSelectedValue['balance']).toFixed(2)

    })
    this.emitter.updateImage$.subscribe(() => {
      this.updateImage();
    });

    // router.events.subscribe((val) => {
    //   if (val instanceof NavigationEnd) {
    //     this.searchValue = '';
    //     this.displayMenu(localStorage.getItem('menu'));
    //   }
    // });    
    // if(localStorage.getItem('type') == '0'){      
      let data = localStorage.getItem('cid') == 'undefined' ? localStorage.getItem('id') : localStorage.getItem('cid');
      this.productprofileServices.getLogo(data, localStorage.getItem('type')).subscribe(data => {                             
        if(data.logo_path.length)  {
          this.product_logo = data.logo_path[0]['minIoImage'];    
          this.footer_text = data.logo_path[0]['footer_text'];
          this.footer_text_left = data.logo_path[0]['footer_text_left'];
          this.favicon = data.logo_path[0]['favicon_img'];  
          this.titleService.setTitle(data.logo_path[0]['title'])      
        }
                    
        if(localStorage.getItem('id') == '2'){          
          document.getElementsByClassName('navbar-brand-full')[0]['src'] = this.product_logo;
        }else{          
          document.getElementsByClassName('navbar-brand-full')[0]['src'] = this.product_logo;
          this.logo_obj.src = this.product_logo;
        }             
        _document.getElementById('appFavicon').setAttribute('href',this.favicon)                
        localStorage.setItem('logo',this.product_logo);
      });                    
  }  
  
  logout() {
    this.userService.updateLogoutActivity(this.user_role, this.user_id).subscribe(data => {
      this.userService.purgeAuth();
      productId = '';
      let ip = localStorage.getItem('ip');
      window.localStorage.clear();
      localStorage.setItem('ip', ip);
      this.dialog.closeAll();
      this.router.navigateByUrl('/auth/login');
    });
  }

  changePassword() {
    this.router.navigateByUrl('password/changePassword');
  }

  editProfile() {
    if (this.user_role != '6') {
      this.router.navigateByUrl('profile/userProfile');
    } else {
      this.router.navigate(['extension/manage'], { queryParams: { id: localStorage.getItem('id'), customer_id: localStorage.getItem('id'), cid : localStorage.getItem('cid') } });
    }
  }
  
  viewProfile() {    
    this.router.navigateByUrl('profile/viewProfile');
  }
  showData() {
    this.router.navigateByUrl('profile/dashboard-customize');
  }



  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoProfileDialog, {
      width: '60%', disableClose: true,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
    });
  }

  showDID2SIP() {
    const dialogRefInfo = this.dialog.open(Did2SipDialog, {
      width: '40%', disableClose: true,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
    });
  }

  showInfoPassword() {
    const dialogRefInfo = this.dialog.open(InfoChangePasswordDialog, {
      width: '60%', disableClose: true,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
    });
  }


  selectProductDiv(product) {
    let myproduct = product.target.value;
    if (this.user_role == '5') {
      this.userService.getMenuListForOcPbx({ productid: myproduct }).subscribe(data => {
        this.displayMenu(JSON.stringify(data), myproduct);
      });
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  ngOnInit(): void {
    this.type = localStorage.getItem('type')
    // if(this.type == 1){
    //   this.custToggle = true
    // }
    this.displayMenu(localStorage.getItem('menu'));
    this.user_name = (localStorage.getItem('type') != '6') ? localStorage.getItem('user_name') : localStorage.getItem('uname');
    
    if (localStorage.getItem('type') === '5') {
      this.productService.getProductInfo().subscribe(data => {
        this.selectedValue = data.response;
        this.product = localStorage.getItem('supportProdId') ? localStorage.getItem('supportProdId') : localStorage.getItem('product_id');
      });
    } else if (localStorage.getItem('type') === '1') {
      this.productService.getProductCustomerWise(localStorage.getItem('id')).subscribe(data => {
        let billing_Type = data.response[0] ? data.response[0]['billing_type'] : 1;
        this.customerSelectedValue = data.response[0];
        this.customerSelectedValue['balance'] = Number(this.customerSelectedValue['balance']).toFixed(2);
        this.tooltipContent = 'Balance =' + this.customerSelectedValue['balance'];
        if (billing_Type == 2) {
          this.customerSelectedValue['balance'] = Number(this.customerSelectedValue['balance']) + Number(this.customerSelectedValue['credit_limit']);
          this.tooltipContent = 'Balance =' + (Number(this.customerSelectedValue['balance']) - Number(this.customerSelectedValue['credit_limit'])).toFixed(2) + ' ' + '\n' + ', Credit Limit =' + Number(this.customerSelectedValue['credit_limit']).toFixed(2);
        }

        // this.product = data.response[0].id;
        this.product = this.route.snapshot.queryParams.productId ? this.route.snapshot.queryParams.productId : productId;
      });
    }

    this.disabledDropDown();
    this.hiddenDropDown();

    localStorage.setItem('product_id', this.product);
    this.product = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';

    // this.displayMenu(localStorage.getItem('menu'));

    //get history data
    // this.userService.getHistory({ loginId: localStorage.getItem('id'), role: localStorage.getItem('type') }).subscribe(data => {

    //   for (let key in data) {
    //     if (data.hasOwnProperty(key)) {
    //       if(data[key].status == '0' && data[key].user_id == localStorage.getItem('id')){
    //         this.isNotification = true;
    //       }
    //       if (data[key].screen_name === 'Extension Master' && localStorage.getItem('type') == '6') {
    //         data[key].message = data[key].displayname + ' has been updated extension setting.'
    //       }
    //       else if (data[key].screen_name === 'Extension Master' && localStorage.getItem('type') == '1') {

    //         data[key].message = data[key].displayname + ' has been updated.'
    //       }
    //       else if (data[key].screen_name === 'Ticket') {
    //         data[key].message = 'Admin has been updated ticket number: ' + data[key].displayname;
    //       }
    //       else if (data[key].screen_name === 'DID Management') {
    //         data[key].message = 'Admin has been updated DID number: ' + data[key].displayname;
    //       }
    //       else {
    //         data[key].message = data[key].message;
    //       }
    //     }
    //   }
    //   // for(let i =0;i<data[0].length;i++)
    //   this.historyData = data;
    // })
    //this.subscription = this.source.subscribe(val => this.test(localStorage.getItem('id')));
    this.profileService.getUserInfo('getUserInfo', Number(localStorage.getItem('id'))).subscribe(data => {
      if (data) {
        this.userData = data.response[0];
        if (!this.userData || this.userData.profile_img == null) {
          localStorage.setItem("userImg", 'assets/img/Profile-Image.png');
        } else {
          localStorage.setItem("userImg", this.userData.profile_img);
        }
        this.userImg = localStorage.getItem('userImg');
      }
    });        
  }


  updateImage() {
    this.userImg = localStorage.getItem('userImg');
  }

  hiddenDropDown() {
    let str = this.router.url;
    let res = str.split("?");
    if (res[0] == "/user/updateCustomer" || res[0] == "/ticket/manage" || res[0] == "/did/manage" || res[0] == "/package/customerView" || res[0] == "/extension/manage") {
      this.hiddenProduct = true;
    } else {
      this.hiddenProduct = false;
    }
  }

  disabledDropDown() {
    if (this.router.url == '/dashboard/supportDashboard' || this.router.url == '/dashboard/supportDashboard?productId=2&ocDiv=true'
      || this.router.url == '/dashboard/supportDashboard?productId=1' || this.router.url == '/dashboard/customerDashboard') {
      this.href = true;
    } else if (this.router.url == '/user/view' || this.router.url == '/ticket/view' || this.router.url == '/did/support-view' || this.router.url == '/extension/supportViewFeatures') {
      this.href = false;
    }
  }

  removeRedDot() {    
    this.userService.makeNotificationAsRead({ loginId: Number(localStorage.getItem('id')), role: Number(localStorage.getItem('type')) }).subscribe(data => {
      this.isNotification = false;
    })
  }

  goToHome(){
    if(localStorage.getItem('ByCustomer') && !localStorage.getItem('ByAdmin')){
      
      this.userService.getCustomerIdByExtensionId(localStorage.getItem('id')).subscribe(data=>{
        let ip = localStorage.getItem('ip')
        let role = localStorage.getItem('type');
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            // localStorage.setItem('ByAdmin', '1');
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
      })
    }else if(localStorage.getItem('ByCustomer') && localStorage.getItem('ByAdmin')  && !localStorage.getItem('subAdminId') && !localStorage.getItem('resellerId')){
      
      this.userService.getAdminCredentials().subscribe(data=>{
        
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
        
      })
    }else if(!localStorage.getItem('ByReseller') && localStorage.getItem('ByAdmin') && !localStorage.getItem('BySubadmin') && !localStorage.getItem('subAdminId') && localStorage.getItem('resellerId')){      

      this.userService.getResellerCredByCust(localStorage.getItem('id')).subscribe(data=>{
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
        
      })


    }else if(localStorage.getItem('ByReseller') && localStorage.getItem('ByAdmin')){      
      
      this.userService.getAdminCredentials().subscribe(data=>{
        
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
        
      })
    }else if(localStorage.getItem('BySubadmin') && localStorage.getItem('ByAdmin')){
      this.userService.getAdminCredentials().subscribe(data=>{
        
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
        
      })
    } else if(localStorage.getItem('subAdminId')){
      this.userService.getSubadminCredById(localStorage.getItem('subAdminId')).subscribe(data=>{        
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
        
      })

    }else if(localStorage.getItem('resellerId')){
        this.userService.getResellerCredById(localStorage.getItem('resellerId')).subscribe(data=>{
          var user_id = data.username;
          var pass = data.password;
          let body = {
            ip: 'null',
            username: user_id,
            password: pass,
            loginType: 'byAdmin',
            flag: '1',
          };
          this.userService.attemptAuth(body).subscribe(data => {
            if (data['code'] == 200) {
              this.userService.purgeAuth();
              let ip = localStorage.getItem('ip');
              window.localStorage.clear();
              localStorage.setItem('ip', ip);
              this.dialog.closeAll();
              this.userService.setAuth(data);
              this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
              let menuList = JSON.parse(localStorage.getItem('menu'));
              let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
              setTimeout(() => {
                window.location.href = newV.url;
              }, 500);
            }
          });
        })
    }else{
      
      this.userService.getAdminCredentials().subscribe(data=>{
        
        var user_id = data.username;
        var pass = data.password;
        let body = {
          ip: 'null',
          username: user_id,
          password: pass,
          loginType: 'byAdmin',
          flag: '1',
        };
        this.userService.attemptAuth(body).subscribe(data => {
          if (data['code'] == 200) {
            this.userService.purgeAuth();
            let ip = localStorage.getItem('ip');
            window.localStorage.clear();
            localStorage.setItem('ip', ip);
            this.dialog.closeAll();
            this.userService.setAuth(data);
            this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
            let menuList = JSON.parse(localStorage.getItem('menu'));
            let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
            setTimeout(() => {
              window.location.href = newV.url;
            }, 500);
          }
        });
        
      })
    }
   
    
  }

  displayMenu(menuData, queryParam?) {
    let assignArr = [];
    let newArr = JSON.parse(menuData);
    
    
    let found = newArr.filter(function (item) { return item.children == null; });
    found.forEach(element => {
      let newObj = {}, arr = [];
      newObj = { name: element['menuname'], url: element['url'], icon: element['icon'] }

      let val = newArr.find(function (o) {
        if ((o['menuname'] === element['menuname']) && (o['children'])) {
          arr.push({ name: o.children, url: o.url, icon: o.icon });
        }
      })
      if (arr.length > 0) newObj['children'] = arr;
      assignArr.push(newObj);
    });

    let newV = assignArr.find(e => { return e.name === 'Dashboard' });

    if (queryParam) {
      localStorage.setItem('supportProdId', queryParam);
      localStorage.setItem('header_product_value', queryParam);
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate(['dashboard/supportDashboard'], { queryParams: { productId: queryParam } })
      );
    }
    else {
      if (this.user_role != localStorage.getItem('type')) {
        this.router.navigateByUrl(newV.url);
      }
    }
    this.navMenuItems = assignArr;
    this.allMenuItems = assignArr;
  }

searchMenu($event: KeyboardEvent){
  this.searchValue = ($event.target as HTMLInputElement).value;
  const value = this.searchValue.trim();

  const mainMenus = this.allMenuItems.map((menu) => ({
    ...menu,
    children: menu.children && menu.children.filter((subMenu) =>
        subMenu.name.toLowerCase().match(value.toLowerCase())
    )
  }));

  this.navMenuItems = mainMenus.filter(menu => menu.name.toLowerCase().match(value.toLowerCase())
  || (menu.children && menu.children.length > 0)).map((item)=>({...item,url: item.children && value.length > 0 ? "#" : item.url}));
  
}

  gotohome() {
    alert("testttt");
    return;
  }

}

@Component({
  selector: 'did2sip-dialog',
  templateUrl: 'did2sip-dialog.html',
})

export class Did2SipDialog {
  extension_id: any;
  userRole: any;
  isDestination: boolean;
  did: any;

  constructor(
    public commonService: CommonService,
    public dialogRefInfo: MatDialogRef<Did2SipDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    this.extension_id = parseInt(localStorage.getItem('id'));
    this.userRole = parseInt(localStorage.getItem('type'));
    this.commonService.getDestinationDID(this.extension_id).subscribe(data => {
      // this.did = data.did;
      for (let i = 0; i < data.length; i++) {
        this.did = data

        if (data[i].did) {
          this.isDestination = true;
        } else {
          this.isDestination = false;
        }
      }


    });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'infoProfile-dialog',
  templateUrl: 'infoProfile-dialog.html',
})

export class InfoProfileDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoProfileDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'infoChangePassword-dialog',
  templateUrl: 'infoChangePassword-dialog.html',
})

export class InfoChangePasswordDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoChangePasswordDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }


}
