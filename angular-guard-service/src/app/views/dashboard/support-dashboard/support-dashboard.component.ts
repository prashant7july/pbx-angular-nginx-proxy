import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { TicketServerResultService, ProductService, UserService } from '../../../core';
import { Page } from '../../../core/models';
import { CdrService } from '../../cdr/cdr.service';
import { TicketService } from '../../ticket/ticket.service';


@Component({
  selector: 'app-support-dashboard',
  templateUrl: './support-dashboard.component.html',
  styleUrls: ['./support-dashboard.component.css']
})
export class SupportDashboardComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  cdrDetail = [];
  viewTicket = ""
  errors = "";
  public globalDiv = false;
  public pbxDiv = false;
  public ocDiv = false;
  selectedValue = "";
  productId = "";
  product = "";
  columnDefs: any;
  ticketColumnDefs: any;
  didColumnDefs: any;
  callColumnDefs: any;
  dataSource: any = [];
  ticketDataSource: any = [];
  didDataSource: any = [];
  callDataSource: any = [];
  rowData: any;
  ticketRowData: any;
  didRowData: any;
  callRowData: any;
  pageSize: number = 10;
  page = new Page();

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private ticketServerResultService: TicketServerResultService,
    private route: ActivatedRoute,
    private userService: UserService,
    private cdrService: CdrService,  
    public ticketService:TicketService,
  ) {
    this.page.pageNumber = 0;
    this.page.size = 10;
  }

  ngOnInit() {
    if(localStorage.getItem('type') != '5'){
      this.userService.purgeAuth();
      let ip = localStorage.getItem('ip');
      window.localStorage.clear();
      localStorage.setItem('ip', ip);
    this.router.navigateByUrl('/auth/login');
    }
    this.productId = this.route.snapshot.queryParams.productId ? this.route.snapshot.queryParams.productId : localStorage.getItem('header_product_value');
    
    if (!this.productId) {
      this.productId = '1';
    }

    if (this.productId == '1') {
      this.pbxDiv = true;
      this.ocDiv = false;
      this.product = '1';
      this.selectProductDiv('1');
    } else if (this.productId == '2') {
      this.ocDiv = true;
      this.pbxDiv = false;
      this.product = '2';
      this.selectProductDiv('2');
    }

    this.setPage(); // for ticket
    this.getCustomerData(); // for customer
    this.getDidData(); //for did
    this.getCDR();   
  }

  getCDR(){
    this.callColumnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'company', headerName: 'Company', hide: false, width: 20 },
      { field: 'uuid', headerName: 'UUID', hide: false, width: 20 },
      { field: 'startTime', headerName: 'Start Time', hide: false, width: 10 },
      { field: 'endTime', headerName: 'End Time', hide: false, width: 10 },
      { field: 'sellCost', headerName: 'Buy Cost', hide: false, width: 10 },
      { field: 'callCost', headerName: 'Call Cost', hide: false, width: 10 },
      { field: 'gatewayName', headerName: 'Gateway', hide: false, width: 10 },
      { field: 'callPlanName', headerName: 'Call Plan', hide: false, width: 15 },
      { field: 'src', headerName: 'Caller', hide: false, width: 15 },
      { field: 'dispDst', headerName: 'Callee', hide: false, width: 15 },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: false, width: 15 },
      { field: 'codec', headerName: 'Codec', hide: false, width: 15 },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, width: 10 },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, width: 10 },
      { field: 'dnid', headerName: 'DNID', hide: false, width: 10 },
      { field: 'dispDestination', headerName: 'Country', hide: false, width: 15 },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false, width: 10 },
      { field: 'sip_endpoint_disposition', headerName: 'Sip Endpoint Disposition', hide: false, width: 10 },
      { field: 'sip_current_application', headerName: 'Sip Current Application', hide: false, width: 10 },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false, width: 10 }
    ];

    var id = localStorage.getItem("id");
    //call reports
    this.cdrService.getSupportCdrInfo(id, 1).subscribe(pagedData => {
      this.callDataSource = [];
      this.callDataSource.push({ 'fields': this.callColumnDefs, 'data': pagedData });
    });
  }

  setPage() {
    this.ticketDataSource = [];
    this.ticketColumnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'created_at', headerName: 'Date', hide: false, width: 15 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 20 },
      { field: 'product', headerName: 'Product', hide: false, width: 10 },
      { field: 'ticket_number', headerName: 'Ticket Number', hide: false, width: 10 },
      { field: 'ticket_type', headerName: 'Type', hide: false, width: 10 },
      { field: 'assignedTo', headerName: 'Assignee', hide: false, width: 10 },
      { field: 'message', headerName: 'Message', hide: false, width: 10 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },
      { field: 'action', headerName: 'Action', hide: true, width: 10 },
    ];
    if (this.pbxDiv === true) {
      this.ticketServerResultService.viewTicketPBXForSupport(1).subscribe(pagedData => { // viewTicketPBX
        pagedData = this.manageUserActionBtn(pagedData);
        this.ticketDataSource = [];
        this.ticketDataSource.push({ 'fields': this.ticketColumnDefs, 'data': pagedData });
      });
    } else if (this.ocDiv === true) {
      this.ticketServerResultService.viewTicketOC(1).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.ticketDataSource = [];
        this.ticketDataSource.push({ 'fields': this.ticketColumnDefs, 'data': pagedData });
      });
    }
  }

  manageUserActionBtn(pagedData){
    for (let i = 0; i < pagedData.length; i++) { 
      pagedData[i]['message'] = pagedData[i]['message'].replace(/<[^>]*>/g, '');//handle spacing     
      pagedData[i]['message'] = pagedData[i]['message'].trim();
      if (pagedData[i].status == 'Open') {
        pagedData[i].status = "<span style='color:#f5302e;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Inprogress') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Close'){
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
      }else{
        pagedData[i].status = "<span style='color:#0000CD;'><strong>" + pagedData[i].status + "</strong></span>";
      }
    }
    return pagedData;
  }

  getCustomerData() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 5 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 15 },
      { field: 'package_name', headerName: 'Package', hide: false, width: 15 },
      { field: 'name', headerName: 'Name', hide: false, width: 15 },
      { field: 'mobileDisplay', headerName: 'Mobile', hide: false, width: 15 },
      { field: 'email', headerName: 'Email', hide: false, width: 20 },
      { field: 'status', headerName: 'Status', hide: false, width: 20 },
      { field: 'action', headerName: 'Action', hide: true, width: 10 },
    ];
    if (this.pbxDiv === true) {
      this.dashboardService.getProductWiseCustomerDetail({ productId: '1', limit_flag:1 }).subscribe(data => {
        data = this.manageCustomerActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    } else if (this.ocDiv === true) {
      this.dashboardService.getProductWiseCustomerDetail({ productId: '2', limit_flag:1 }).subscribe(data => {
        data = this.manageCustomerActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    }
  }

  manageCustomerActionBtn(pagedData){
    for (let i = 0; i < pagedData.length; i++) { 
      if (pagedData[i].status == 'Active') {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Inactive') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
      }else if (pagedData[i].status == 'Expired') {
        pagedData[i].status = "<span style='color:#f5302e;'><strong>" + pagedData[i].status + "</strong></span>";
      }else  {
        pagedData[i].status = "<span style='color:#000000;'><strong>" + pagedData[i].status + "</strong></span>";
      }
    }
    return pagedData;
  }

  getDidData() {
    this.didDataSource = [];

    this.didColumnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'didDisplay', headerName: 'DID', hide: false, width: 15 },
      { field: 'country', headerName: 'Country', hide: false, width: 20 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 10 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 10 },
      { field: 'max_concurrent', headerName: 'Max CC', hide: false, width: 10 },
      { field: 'didTypeDisplay', headerName: 'DID Type', hide: false, width: 10 },
      { field: 'destination_name', headerName: 'Assigned to', hide: false, width: 10 },
      { field: 'activatedDisplay', headerName: 'Status', hide: false, width: 10 },
      { field: 'action', headerName: 'Action', hide: true, width: 10 },
    ];
    if (this.pbxDiv === true) {
      this.dashboardService.getProductWiseDidDetail({ productId: '1', limit_flag:1 }).subscribe(data => {
        data = this.manageDidActionBtn(data);
        this.didDataSource = [];
        this.didDataSource.push({ 'fields': this.didColumnDefs, 'data': data });
      });
    } else if (this.ocDiv === true) {
      this.dashboardService.getProductWiseDidDetail({ productId: '2',  limit_flag:1 }).subscribe(data => {
        data = this.manageDidActionBtn(data);
        this.didDataSource = [];
        this.didDataSource.push({ 'fields': this.didColumnDefs, 'data': data });
      });
    }
  }

  manageDidActionBtn(pagedData){
    for (let i = 0; i < pagedData.length; i++) {
      if (pagedData[i].activatedDisplay == 'Active') {
        pagedData[i].activatedDisplay = "<span style='color:#379457;'><strong>" + pagedData[i].activatedDisplay + "</strong></span>";
      } else {
        pagedData[i].activatedDisplay = "<span style='color:#c69500;'><strong>" + pagedData[i].activatedDisplay + "</strong></span>";
      }
      if (pagedData[i]['active_feature'] != null) {
        pagedData[i]['destination_name'] = pagedData[i]['active_feature'] + " - " + pagedData[i]['destination_name'];
      }
    }
    return pagedData;
  }

  manageDidAction(event) {
    if (this.pbxDiv == true) {
      this.router.navigate(['did/support-view'], { queryParams: { productId: '1' } });
    } else if (this.ocDiv == true) {
      this.router.navigate(['did/support-view'], { queryParams: { productId: '2' } });
    }
  }

  manageUserAction(e) {
    if (this.pbxDiv == true) {
      this.router.navigate(['user/view'], { queryParams: { customerStatus: '', productId: '1' } });
    } else if (this.ocDiv == true) {
      this.router.navigate(['user/view'], { queryParams: { customerStatus: '', productId: '2' } });
    }
  }

  manageAction(e) {
    let data = e.data;
    return this.ticketEdit(data);
  }

  ticketEdit(event) {
    this.action = (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2' || localStorage.getItem('type') === '4' || localStorage.getItem('type') === '5') ? 'reply' : 'view';
    if (this.action === 'reply') {
      localStorage.setItem('addMessageText', 'true');
    }
    this.ticketService.updateTicketNewStatus({id:event.id, user_id:localStorage.getItem('id'), role:localStorage.getItem('type') }).subscribe(data => {
      // this.resetTable();
     }, err => {
       this.error = err.message;
     });
    this.router.navigate(['ticket/manage'], { queryParams: { id: event.id, customerId: event.customer_id } });
  }

  manageCallAction(e) {
    let data = e.data;
    return this.showCdr(e.data);
  }

  showCdr(event) {
    this.router.navigateByUrl('cdr/support-cdr');
  }

  selectProductDiv(product) {
    //let myproduct = product;
    this.pbxDiv = false;
    this.ocDiv = false;
    this.globalDiv = false;
    if (product === '1') {
      this.pbxDiv = true;
    } else {
      this.ocDiv = true;
    }
      this.setPage();
      this.getCustomerData(); // for customer   
      this.getDidData(); //for did
      this.getCDR(); //cdr
  }


}
