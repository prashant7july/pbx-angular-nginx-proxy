import { Component, OnInit,Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DidService } from '../did.service';
import { CommonService, ProductService} from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../user/user.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export var productId = "1";

@Component({
  selector: 'app-support-did',
  templateUrl: './support-did.component.html',
  styleUrls: ['./support-did.component.css']
})
export class SupportDidComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  countryList:any = "";
  isFilter = false;
  selectedValue:any = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  defaultPageSize = '10';
  providerList = [];

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'company_name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public fields3: Object = { text: 'provider', value: 'id' };
  public placeholder3: string = 'Select Provider';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private didService: DidService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService,
    private productService: ProductService,
    private userService: UserService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group({
      'by_did': [""],
      'by_country': new FormControl([]),
      'by_status': [""],
      'by_company': new FormControl([]),
      'by_provider': new FormControl([]),
      'by_group': [""]
    });
  }

  ngOnInit() {
    // productId = this.route.snapshot.queryParams.productId ? this.route.snapshot.queryParams.productId : '1';
    productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';

    this.displayAllRecord();

    this.userService.getCustomerCompany(productId).subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.error = err.message;
    });
    //get country list    
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    }, err => {
      this.error = err.message;
    });

    //get Providers list
    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });
  }  
  Providerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.providerList.filter((data) =>{    
      return data['provider'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedValue.filter((data) =>{    
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    var user_type = localStorage.getItem("type");

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'didDisplay', headerName: 'DID', hide: false, width: 10 },
      { field: 'country', headerName: 'Country', hide: false, width: 10 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 10 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 10 },
      { field: 'max_concurrent', headerName: 'Max CC', hide: false, width: 10 },
      { field: 'did_group', headerName: 'Group', hide: false, width: 10 },
      { field: 'did_type', headerName: 'DID Type', hide: false, width: 10 },
      { field: 'destination_name', headerName: 'Assigned to', hide: false, width: 10 },
      { field: 'activated', headerName: 'Status', hide: false, width: 10 },
  
    ];

    if (user_type === '5') {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        this.didService.filterSupportCustomerDID(credentials, productId).subscribe(pagedData => {
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        }, err => {
          this.error = err.message;
        });
      } else {
        this.didService.getSupportProductWiseDID(productId).subscribe(pagedData => {
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        });
      }

    } else {
      this.toastr.error('Error!', "Unauthorise access!!!", { timeOut: 2000 });
      this.router.navigateByUrl('did/support-view');
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline;' data-action-type='view' title='View'></i>\
      ";
      finalBtn += "</span>";
      if (pagedData[i].activated == 'Active') {
        pagedData[i].activated = "<span style='color:#379457;'><strong>" + pagedData[i].activated + "</strong></span>";
      } else {
        pagedData[i].activated = "<span style='color:#c69500;'><strong>" + pagedData[i].activated + "</strong></span>";
      }
      if (pagedData[i]['active_feature'] != null) {
        pagedData[i]['destination_name'] = pagedData[i]['active_feature'] + " - " + pagedData[i]['destination_name'];
      }
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  selectCompanyDiv(e) {
    let myKeyword = e.value;
    this.displayAllRecord();
  }


  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  editDID(data) {
    this.router.navigate(['did/support-view/manage'], { queryParams: { id: data.id } });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "view":
        return this.editDID(data);
    }
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSupportDidDialog, {
      width: '80%', disableClose: true, autoFocus:false,
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
      console.log('Dialog closed');
    });
  }

}

@Component({
  selector: 'infoSupportDid-dialog',
  templateUrl: 'infoSupportDid-dialog.html',
})

export class InfoSupportDidDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoSupportDidDialog>, @Inject(MAT_DIALOG_DATA) public data:'',
  ) {}
 
  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
  
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
