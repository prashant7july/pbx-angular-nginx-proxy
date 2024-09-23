import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../src/environments/environment.prod';
import { ToastRef, ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductProfileService } from './product.profile.service';
import { DomSanitizer } from '@angular/platform-browser';

const URL = environment.api_url + 'profile';
const URLS = environment.api_url + 'favicon';
const PoweredBy_URL = environment.api_url + 'powered_by';
// const URL = 'http://localhost:3000' + '/profile';
// const URLS = 'http://localhost:3000/favicon';
// const PoweredBy_URL = 'http://localhost:3000/powered_by';



export let imagePath: any;
export let imagePaths: any;
let _validFileExtensions = [".png", ".jpg", ".jpeg"];
let _validFaviconExtensions = [".png", ".jpg", ".jpeg"];
let _validPoweredByExtensions = [".png", ".jpg", ".jpeg"];

@Component({
  selector: 'app-product-profile',
  templateUrl: './product-profile.component.html',
  styleUrls: ['./product-profile.component.css']
})
export class ProductProfileComponent implements OnInit {
  imageFile = "";
  imageFile2 = "";
  imageFile3 = "";
  imagePath1 = "";
  imagePath2 = "";
  imagePath3 = "";
  userData: any = {};
  userDatas: any = {};
  poweredByData: any = {};
  pageloader: boolean;
  enableProfile:boolean = false;
  userForm: FormGroup;
  // checkValue: boolean = false;
  flag: boolean;
  footer_text = "";
  footer_right_text = "";
  title: "";
  disableSubmit = false;
  checkLogo: boolean = false;
  checkFavicon: boolean = false;
  checkPoweredBy: boolean = false;
  menus: any;
  productProfileMenu: any;
  is_poweredBy:any;
  role:any;
  serverData: any = {};

  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'profileImg',
    allowedFileType: ['image'], method: 'post',
    maxFileSize: 1024 * 1024 * 1
  });
  public uploaders: FileUploader = new FileUploader({
    url: URLS, itemAlias: 'favicon',
    allowedFileType: ['image'], method: 'post',
    maxFileSize: 1024 * 1024 * 1
  });
  public poweredBy_uploader: FileUploader = new FileUploader({
    url: PoweredBy_URL, itemAlias: 'powered_by',
    allowedFileType: ['image'], method: 'post',
    maxFileSize: 1024 * 1024 * 1
  });

  constructor(
    private toastr: ToastrService,
    private formBuilders: FormBuilder,
    private ProfileService: ProductProfileService,
    private domSanitizer: DomSanitizer
  ) {
    this.userForm = this.formBuilders.group({
      'profileImg': [''],
      'footer_text': [''],
      'favicon': [''],
      "footer_right_text": [''],
      "title": [''],
      'powered_by': [''],
      'is_poweredBy': ['']
    });    

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.productProfileMenu = this.menus.find((o) => o.url === '/product-profile');
  }


  ngOnInit() { 
    this.role = localStorage.getItem('type');   
    if(this.productProfileMenu.all_permission == '0' && this.productProfileMenu.view_permission == '1'){
      this.userForm.disable();
    }
    let data = localStorage.getItem('id');
    this.ProfileService.getLogo(data, localStorage.getItem('type')).subscribe(data => {            
      if (data.logo_path[0]['is_poweredBy'] == '1') {
        this.is_poweredBy = true
      }
      else{
        this.is_poweredBy = false
      }          

      this.userData.profile_img = data.logo_path[0]['minIoImage'];
      this.userDatas.favicons = data.logo_path[0]['minIoFavicon'];            
      this.poweredByData.powered_by = data.logo_path[0]['minIoPoweredBy'];
      this.footer_text = data.logo_path[0]['footer_text_left'];
      this.footer_right_text = data.logo_path[0]['footer_text'];
      this.title = data.logo_path[0]['title'];
      this.serverData.profile_img = data.logo_path[0]['logo_img'];
      this.serverData.favicons = data.logo_path[0]['favicon_img'];            
      this.serverData.powered_by = data.logo_path[0]['powered_by'];
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false
      this.uploadProfile();
    };

    this.uploaders.onAfterAddingFile = (file) => {
      file.withCredentials = false
      this.uploadProfiles();
    };

    this.poweredBy_uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false
      this.uploadPoweredByProfile();
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = URL + item.file.name;
      var res = JSON.parse(response);
      this.imageFile = res['file'];
      this.imagePath1 = item.file.name;
    };
    this.uploader.onCompleteAll = () => {
      this.pageloader = false;
    }

    this.uploaders.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = URLS + item.file.name;
      var res = JSON.parse(response);
      this.imageFile2 = res['file']
      this.imagePath2 = item.file.name;
    };
    this.uploaders.onCompleteAll = () => {
      this.pageloader = false;
    }

    this.poweredBy_uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = PoweredBy_URL + item.file.name;
      var res = JSON.parse(response);
      this.imageFile3 = res['file']
      this.imagePath3 = item.file.name;
    };
    this.poweredBy_uploader.onCompleteAll = () => {
      this.pageloader = false;
    }
  }
  UpdateProfile(event){
    console.log(event);
    
    if (event.checked == true) {
      this.enableProfile = true
      this.userForm.get('powered_by').setValidators(Validators.required);
      this.userForm.updateValueAndValidity();
    }
    else{
      this.enableProfile = false
      this.userForm.controls.powered_by.clearValidators();
      this.userForm.controls.powered_by.updateValueAndValidity();
      this.userForm.get('powered_by').reset();
      this.checkPoweredBy = false;

      // this.userForm.get('powered_by').clearValidators();
      // this.userForm.get('powered_by').updateValueAndValidity();
      // this.userForm.updateValueAndValidity();
    }
    

  }

  Validate(event: any) {
    // for file preview  
    this.checkLogo = false;
    const reader = new FileReader();
    const [file] = event.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.flag = false;
      this.userData.profile_img = reader.result as any
    }
    let sFileName = file.name;
    let blnValid = false;
    for (let j = 0; j < _validFileExtensions.length; j++) {
      let sCurExtension = _validFileExtensions[j];
      if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        blnValid = true;
        break;
      }
    }
    if (!blnValid) {
      this.imageFile = "";
      this.checkLogo = true;
      this.toastr.error('Error!', "Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "), { timeOut: 4000 });
      event.srcElement.value = null;
      return false;
    }
  }

  Validates(event: any) {
    // for file preview  
    this.checkFavicon = false;
    const reader = new FileReader();
    const [file] = event.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.flag = true;
      this.userDatas.favicons = reader.result as any
    }
    let sFileName = file.name;
    let blnValid = false;
    for (let j = 0; j < _validFaviconExtensions.length; j++) {
      let sCurExtension = _validFaviconExtensions[j];
      if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        blnValid = true;
        break;
      }
    }
    if (!blnValid) {
      this.imageFile2 = "";
      this.checkFavicon = true;
      this.toastr.error('Error!', "Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFaviconExtensions.join(", "), { timeOut: 4000 });
      event.srcElement.value = null;
      return false;
    }
  }

  ValidatePoweredBy(event: any) {
    // for file preview  
    this.checkPoweredBy = false;
    const reader = new FileReader();
    const [file] = event.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.flag = true;
      this.poweredByData.powered_by = reader.result as any
    }
    let sFileName = file.name;
    let blnValid = false;
    for (let j = 0; j < _validPoweredByExtensions.length; j++) {
      let sCurExtension = _validPoweredByExtensions[j];
      if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        blnValid = true;
        break;        
      }
    }
    if (!blnValid) {
      this.imageFile3 = "";
      this.checkPoweredBy = true;
      this.toastr.error('Error!', "Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validPoweredByExtensions.join(", "), { timeOut: 4000 });
      event.srcElement.value = null;
      return false;
    }
  }

  uploadProfile() {    
    this.profileAdditionalInformation();    
    this.uploader.uploadAll();    
  }

  uploadProfiles() {
    this.faviconAdditionalInformation();
    this.uploaders.uploadAll();
  }

  uploadPoweredByProfile(){
    this.poweredByAdditionalInformation();
    this.poweredBy_uploader.uploadAll();
  }

  profileAdditionalInformation(){
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id' , localStorage.getItem("id"));
      form.append('role' , localStorage.getItem("type"));      
     };   
  }

  faviconAdditionalInformation(){
    this.uploaders.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id' , localStorage.getItem("id"));
      form.append('role' , localStorage.getItem("type"));      
    };
  }

  poweredByAdditionalInformation(){
    this.poweredBy_uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id' , localStorage.getItem("id"));
      form.append('role' , localStorage.getItem("type"));      
    };
  }

  submitForm() {     
    let credential = {}; 
    let user_id = localStorage.getItem("id");
    let role = localStorage.getItem('type');
    credential['id'] = user_id;
    credential['role_id'] = role;
    credential['logo'] = this.imageFile ? "assets/uploads/" + this.imageFile : this.userData.profile_img;
    credential['logo1'] = this.imageFile2 ? "assets/uploads/" + this.imageFile2 : this.userDatas.favicons;
    credential['logo2'] = this.imageFile3 ? "assets/uploads/" + this.imageFile3 : this.poweredByData.powered_by;
    credential['footer_text'] = this.userForm.value['footer_text'];
    credential['footer_text_right'] = this.userForm.value['footer_right_text'];
    credential['title'] = this.userForm.value['title'];
    let enable = this.userForm.get('is_poweredBy').value;
    credential['is_poweredBy'] = this.userForm.value['is_poweredBy'];
    if (!credential['footer_text'] && !credential['footer_text_right'] && !credential['title']) {
      this.toastr.error('!Error', 'Please choose atleast one text field.', { timeOut: 2000 });
      return;
    }
    
    
    this.ProfileService.setLogo(credential).subscribe(data => {
      if (data['status_code'] == 200) {
        this.toastr.success('Success', 'Logo Updated.', { timeOut: 2000 })
        window.location.reload();
      }
    });
  }

  afterValidImage() {
    this.disableSubmit = (this.checkLogo == true || this.checkFavicon == true || this.checkPoweredBy == true) ? true : false;
    if (this.disableSubmit) {
      this.toastr.error('!Error', 'Provide Valid Image.', { timeOut: 2000 });
      return;
    } else {
      this.submitForm();
      this.pageloader = true
    }
  }
}
