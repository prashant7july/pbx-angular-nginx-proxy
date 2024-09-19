import { Component, OnInit } from '@angular/core';
import { Errors, ProductService,AccountManagerService } from '../../../core';
import { DashboardService } from '../dashboard.service';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Router } from '@angular/router';
import { TicketServerResultService, CommonService } from '../../../core/services';
import { CdrService } from '../../cdr/cdr.service';
import { DateAdapter } from '@angular/material';
import { TicketService } from '../../ticket/ticket.service';
import { UserService } from '../../user/user.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
export var productId = '1';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  defaultProduct = 1;
  error = '';
  data: any = {};
  action = 'reply';
  status: any[];
  public pbxDiv = true;
  public ocDiv = false;
  public selectedValue = '';
  public errors = '';
  viewTicketPBX = "";
  viewTicketOC = "";
  customerStatus = "";
  totalActiveCustomer: any;
  totalInactiveCustomer: any;
  totalOtherCustomer: any;
  totalOCActiveCustomer: any;
  totalOCInactiveCustomer: any;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  totalCalls: any = 0;
  totalIncomingCalls: any = 0;
  totalOutgoingCalls: any = 0;
  totalMonthlyDuration: any = 0;
  totalChartCalls: any = [];
  selectedMonthlyRevenue: any = {};
  cdrDetail = [];
  callColumnDefs: any;
  callDataSource: any = [];
  callRowData: any;
  maxDate: Date;
  todayDate: Date;
  todayDate1: Date;
  todayDate2: Date;
  todayDate3: Date;
  todayDate4: Date;
  // companyData:any = "";
  companyData: any[] = [];
  companyID = "0";
  totalCallsPerTenant: any = 0;
  totalCallsPerHours: any = 0;
  totalAsrCallsPerHours: any = 0;
  totalAcdCallsPerHours: any = 0;
  dateAlreadySelected: Date;
  totalRevenueCost: any = 0;
  TotalActiveExtension: any = 0;
  selectMonth: any = [];
  selectedMonth: any = '';
  answerCall: any = '';
  failCall: any = '';
  rejectCall: any = '';
  noAnscall: any = '';
  busyCall: any = '';
  userType: any;
  customerId: any;
  public fields1: Object = { text: 'company_name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';    
  public placeholder1: string = 'Company Name';
  ////////////Monthly Revenue Cost For Customer/////////////////////////////////////////////////////////
  public revenueData: ChartDataSets[] = [{ "data": [], "label": '' }];
  public revenueLabels: Label[] = [];
  public revenueOptions: any = {
    maintainAspectRatio: false,
    responsive: true,
    axisX: {
      includeZero: true,
    },
    axisY: {
      includeZero: true,
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
    scales: {
      xAxes: [{
        interval: 1,
        display: true,
        includeZero: true,
      }],
      yAxes: [{
        display: true,
        includeZero: true,
      }]
    },
    legend: {
      display: false,
      backgroundColor: "transparent"
    }
  };
  public revenueLegend = false;
  public revenueType = 'horizontalBar';
  public revenueColours = [
    { backgroundColor: ['#f59bac', '#00FA9A', '#FFA500', '#20B2AA', '#EE82EE'] }
  ];

  //////////////////////////////////Totla Monthly calls////////////////////////////////////////////////
  // public callData: Array<any> = [];
  // public callLabels: Array<any> = [];
  public callData: ChartDataSets[] = [{ "data": [], "label": '' }];
  public callLabels: Label[] = [];

  public callOptions: any = {
    maintainAspectRatio: false,
    responsive: true,
    axisX: {
      includeZero: true,
    },
    axisY: {
      includeZero: true,
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
    scales: {
      xAxes: [{
        interval: 1,
        display: true,
        includeZero: true,
      }],
      yAxes: [{
        display: true,
        includeZero: true,
      }]
    },
    legend: {
      display: false,
      backgroundColor: "transparent"
    }
  };
  public callLegend = false;
  public callTypeGraph = 'horizontalBar';
  public callColours = [
    { backgroundColor: ['#20B2AA', '#EE82EE', '#FFA500', '#f59bac', '#00FA9A'] }
  ];
  ////////////////////////////////////////////end-------------------------------------------//////////
  //////////////////////////////////Total Monthly Calls///////////////////////////////////////////////////
  // Doughnut
  public doughnutChartLabels: string[] = ['Answered', 'Failed', 'Missed', 'Rejected', 'Busy'];
  public doughnutChartData: number[] = [];
  public doughnutChartType = 'doughnut';
  public doughnutColors = [
    { backgroundColor: ['#ffc107', '#f86c6b', '#2f353a', '#20c997', '#4B0082'] }
  ];
  //////////////////////////////////Extension Graph///////////////////////////////////////////////////////
  // barChart2
  // public barChart2Data: Array<any> = [];
  public barChart2Data: ChartDataSets[] = [{ "data": [], "label": '' }];

  // public barChart2Labels: Array<any> = [];
  public barChart2Labels: Label[] = [];

  public barChart2Options: any = {
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        display: true,
        barPercentage: 0.6,
        rotateXAxisTicks: true
      }],
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (value % 1 === 0) { return value; } }
        }
      }]
    },
    legend: {
      display: false
    }
  };
  public barChart2Colours: Array<any> = [
    {
      backgroundColor: '#4dbd74',
      borderWidth: 0
    }
  ];
  public barChart2Legend = false;
  public barChart2Type = 'bar';
  ///////////////////////////////////////Minutes Consumed////////////////////////////////////////////////////////
  public mainChartData1: Array<any> = [];
  public mainChartData2: Array<any> = [];
  public mainChartData3: Array<any> = [];
  // public mainChartData: Array<any> = [];
  public mainChartData: ChartDataSets[] = [{ "data": [], "label": '' }];


  // public mainChartLabels: Array<any> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public mainChartLabels: Label[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  public mainChartOptions: any = {
    tooltips: {
      enabled: false,
      custom: CustomTooltips,
      intersect: true,
      mode: 'index',
      position: 'nearest',
      callbacks: {
        labelColor: function (tooltipItem, chart) {
          return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          drawOnChartArea: false,
        },
        scaleLabel: {
          display: true,
          labelString: 'Hours'
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: 5,
        },
        scaleLabel: {
          display: true,
          labelString: 'Minutes'
        }
      }]
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      }
    },
    legend: {
      display: false
    }
  };
  public mainChartColours: Array<any> = [
    { // brandInfo
      backgroundColor: hexToRgba(getStyle('--info'), 10),
      borderColor: getStyle('--success'),
      pointHoverBackgroundColor: '#fff'
    },
    { // brandSuccess
      backgroundColor: 'transparent',
      borderColor: getStyle('--danger'),
      pointHoverBackgroundColor: '#fff'
    },
    { // brandDanger
      backgroundColor: 'transparent',
      borderColor: getStyle('--info'),
      pointHoverBackgroundColor: '#fff',
      borderWidth: 1,
      borderDash: [8, 5]
    }
  ];
  public mainChartLegend = false;
  public mainChartType = 'line';
  //////////////////////////////////////////Calls per tenant Pie chart/////////////////////////////////////////////
  public pieChartLabels: string[] = [];
  public pieChartData: number[] = [];
  public pieChartType = 'pie';
  public pieChartColours = [
    { backgroundColor: ['#FA8072', '#CD5C5C', '#DC143C', '#B22222', '#4B0082'] }
  ];
  /////////////////////////////////////////Calls per Hour Bar chart///////////////////////////////////////
  public barChartHoursOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      scaleShowVerticalLines: false,
      xAxes: [{
        display: true,
        rotateXAxisTicks: true,
        scaleLabel: {
          display: true,
          labelString: 'Hours'
        },
        gridLines: {
          lineWidth: 0,
          color: "rgba(255,255,255,0)"
        }
      }],
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (value % 1 === 0) { return value; } }
        },
        scaleLabel: {
          display: true,
          labelString: 'Total Calls'
        }
      }]
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
  };
  // public barChartHoursLabels: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursLabels: Label[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  public barChartHoursType = 'bar';
  public barChartHoursLegend = false;

  // public barChartHoursData: any[] = [];
  public barChartHoursData = [{ "data": [], "label": '' }];

  public barChartHoursColours: Array<any> = [
    {
      backgroundColor: '#CC5F00',
      borderWidth: 0
    }
  ];

  //AZS chart
  public barChartHoursOptions1: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      scaleShowVerticalLines: false,
      xAxes: [{
        display: true,
        rotateXAxisTicks: true,
        scaleLabel: {
          display: true,
          labelString: 'Hours'
        },
        gridLines: {
          lineWidth: 0,
          color: "rgba(255,255,255,0)"
        }
      }],
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (value % 1 === 0) { return value; } }
        },
        scaleLabel: {
          display: true,
          labelString: 'Total Calls'
        }
      }]
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
  };
  public barChartHoursLabels1: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursType1 = 'bar';
  public barChartHoursLegend1 = false;

  public barChartHoursData1: any[] = [];
  public barChartHoursColours1: Array<any> = [
    {
      backgroundColor: '#CC5F00',
      borderWidth: 0
    }
  ];

  //---------------------//
  public barChartHoursOptions3: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      scaleShowVerticalLines: false,
      xAxes: [{
        display: true,
        rotateXAxisTicks: true,
        scaleLabel: {
          display: true,
          labelString: 'Hours'
        },
        gridLines: {
          lineWidth: 0,
          color: "rgba(255,255,255,0)"
        }
      }],
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (value % 1 === 0) { return value; } }
        },
        scaleLabel: {
          display: true,
          labelString: 'Percentage (%)'
        }
      }]
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
  };
  public barChartHoursLabels3: Label[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursType3 = 'bar';
  public barChartHoursLegend3 = false;

  // public barChartHoursData3: any[] = [];
  public barChartHoursData3: ChartDataSets[] = [{ "data": [], "label": '' }];


  public barChartHoursColours3: Array<any> = [
    {
      backgroundColor: '#CC5F00',
      borderWidth: 0
    }
  ];
  //
  //--------------------//
  //

  public barChartHoursOptions2: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      scaleShowVerticalLines: false,
      xAxes: [{
        display: true,
        rotateXAxisTicks: true,
        scaleLabel: {
          display: true,
          labelString: 'Hours'
        },
        gridLines: {
          lineWidth: 0,
          color: "rgba(255,255,255,0)"
        }
      }],
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (value % 1 === 0) { return value; } }
        },
        scaleLabel: {
          display: true,
          labelString: 'Minutes'
        }
      }]
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = '';
          let label = data.labels[tooltipItem.index];
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      },
      displayColors: false
    },
  };
  public barChartHoursLabels2: Label[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursType2 = 'bar';
  public barChartHoursLegend2 = false;

  // public barChartHoursData2: any[] = [];
  public barChartHoursData2: ChartDataSets[] = [{ "data": [], "label": '' }];

  public barChartHoursColours2: Array<any> = [
    {
      backgroundColor: '#CC5F00',
      borderWidth: 0
    }
  ];
  //

  ActiveExtension: any;
  isCustomerMenuExist: boolean = false;
  isExtMenuExist: boolean = false;
  isInvoiceMenuExist: boolean = false;
  isCDRMenuExist: boolean = false;
  isTicketMenuExist: boolean = false;
  menus: any;
  pageMenu: any;

  constructor(
    private dashboardService: DashboardService,
    private productService: ProductService,
    private router: Router,
    private ticketServerResultService: TicketServerResultService,
    private userService: UserService,
    private cdrService: CdrService,
    public commonService: CommonService,
    private dateAdapter: DateAdapter<Date>,
    public ticketService: TicketService,
    private accountManagerService: AccountManagerService,


  ) {
    this.maxDate = new Date();
    this.todayDate = new Date();
    this.todayDate1 = new Date();
    this.todayDate2 = new Date();
    this.todayDate4 = new Date();
    this.todayDate3 = new Date();
    this.dateAdapter.setLocale('en-IN');
    this.selectedMonth = this.todayDate.getMonth() + 1;
  }

  ngOnInit() {
    this.userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    this.menus = JSON.parse(localStorage.getItem('menu'));

    this.isCustomerMenuExist = this.menus.find((o) => o.url == '/user');
    this.isExtMenuExist = this.menus.find((o) => o.url == '/extension');
    this.isInvoiceMenuExist = this.menus.find((o) => o.url == "/invoice");
    this.isCDRMenuExist = this.menus.find((o) => o.url == "/cdr");
    this.isTicketMenuExist = this.menus.find((o) => o.url == "/ticket");

    if (localStorage.getItem('type') == '0' || localStorage.getItem('type') == '2' || localStorage.getItem('type') == '3') {          
    } else {
      this.userService.purgeAuth();
      let ip = localStorage.getItem('ip');
      window.localStorage.clear();
      localStorage.setItem('ip', ip);
      this.router.navigateByUrl('/auth/login');
    }
    this.selectMonth = [
      { id: 1, name: 'January' },
      { id: 2, name: 'February' },
      { id: 3, name: 'March' },
      { id: 4, name: 'April' },
      { id: 5, name: 'May' },
      { id: 6, name: 'June' },
      { id: 7, name: 'July' },
      { id: 8, name: 'August' },
      { id: 9, name: 'September' },
      { id: 10, name: 'October' },
      { id: 11, name: 'November' },
      { id: 12, name: 'December' }
    ]
    //get company
    if (this.userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          // this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')',  });
          this.companyData.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    }
    if (this.userType == 0) {
      this.commonService.getAllCustomerCompany().subscribe(data => {
        this.companyData = data.response;
        // this.companyID = data.response[16].id;
        // this.companyID = "0";
      });
    }
    // this.commonService.getAllCustomerCompany().subscribe(data => {
    //   // this.companyData = data.response;
    //   let datas = data.response;
      
    //   this.companyID = "0";
    //   for (let i = 0; i < datas.length; i++) {
    //     this.companyData.push({ id: datas[i].id, name: datas[i].company_name + '(Ref. Code: ' + datas[i].id + ')'});
    //   }
    // }, err => {
    //   this.error = err.message;
    // });

    //get product
    this.productService.getProductInfo().subscribe(data => {
      this.selectedValue = data.response;
    });

    //get total revenue cost
    this.dashboardService.getTotalRevenue(localStorage.getItem('type'),localStorage.getItem('id')).subscribe(data => {

      if (data.response[0].totalRevenue > 0) {
        this.totalRevenueCost = data.response[0].totalRevenue;
      } else {
        this.totalRevenueCost = 0.00;
      }
      //this.totalRevenueCost = data.response[0].totalRevenue;
    });

    //get active extension
    this.dashboardService.getActiveExtension().subscribe(data => {
      this.ActiveExtension = data.response[0].count;
    });

    this.dashboardService.getTotalActiveExtension().subscribe(data => {
      this.TotalActiveExtension = data.response[0].count;
    });
    if (localStorage.getItem('type') == '3') {
      this.dashboardService.getActiveResellerExtension(localStorage.getItem('id')).subscribe(data => {
        this.ActiveExtension = data.response[0].count;
      });
      this.dashboardService.getTotalActiveResellerExtension(localStorage.getItem('id')).subscribe(data => {
        this.TotalActiveExtension = data.response[0].count;
      });
    }

    //show active,inactive n others customer info
    this.productWiseDashboard();
    //Extension graph
    this.getTotalExtension(); // we require total extension not customer wise that's why blank parameter passed
    //revenueGraph
    this.revenueGraphData();
    //monthly calls
    this.totalMonthlyCalls();
    //incoming calls
    this.totalMonthlyIncomingCalls(); ///not implemented right now
    //outgoing calls
    this.totalMonthlyOutgoingCalls();
    //call duration
    this.totalCallDuration();
    //total call graph
    this.totalCallsGraphData();
    //minute consumed answer
    //this.minuteConsumedGraphData();
    //cdr
    this.getCDR();
    //show tickets records
    this.setPage();
    //shows calls per tenant graph
    this.callsPerTenant(this.todayDate);
    //shows calls per hour graph
    this.callsPerHour(this.todayDate, this.companyID);
    //show minute consumed
    this.dateWiseMinuteConsumed(this.todayDate);
    this.asrCallsPerHour(this.todayDate4);
    this.acdCallsPerHour(this.todayDate3);
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyData.filter((data) =>{    
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  setPage() {
    this.dataSource = [{ 'fields': '', 'data': '' }];
    this.columnDefs = [
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
    let role = localStorage.getItem('type');
    let user_id = localStorage.getItem('id');
    if (this.pbxDiv === true) {
      if (role == '3') {
        this.ticketServerResultService.viewResellerTicketPBX(1,role,user_id).subscribe(data => {
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
      else{
      this.ticketServerResultService.viewTicketPBX(1).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    }
    } else if (this.ocDiv === true) {
      this.ticketServerResultService.viewTicketOC(1).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    }
  }
  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      pagedData[i]['message'] = pagedData[i]['message'].replace(/<[^>]*>/g, '');//handle spacing     
      pagedData[i]['message'] = pagedData[i]['message'].trim();
      if (pagedData[i].status == 'Open') {
        pagedData[i].status = "<span style='color:#f5302e;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Inprogress') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Close') {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
      } else {
        pagedData[i].status = "<span style='color:#0000CD;'><strong>" + pagedData[i].status + "</strong></span>";
      }
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    return this.ticketEdit(e.data);
  }
  ticketEdit(event) {
    if (this.isTicketMenuExist) {
      this.action = (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2' || localStorage.getItem('type') === '4' || localStorage.getItem('type') === '5') ? 'reply' : 'view';
      if (this.action === 'reply') {
        localStorage.setItem('addMessageText', 'true');
      }
      if (event.id) {
        this.ticketService.updateTicketNewStatus({ id: event.id, user_id: localStorage.getItem('id'), role: localStorage.getItem('type') }).subscribe(data => {
          // this.resetTable();
        });
        this.router.navigate(['ticket/manage'], { queryParams: { id: event.id, customerId: event.customer_id } });
      }
    } else {
      return
    }
  }

  showCustomer(customerStatus, productId) {

    if (customerStatus === 'active' && this.isCustomerMenuExist) {
      this.router.navigate(['user/view'], { queryParams: { customerStatus: customerStatus, productId: productId, viewFrom: 'AdminDashboard' } });
    } else if (customerStatus === 'inactive' && this.isCustomerMenuExist) {
      this.router.navigate(['user/view'], { queryParams: { customerStatus: customerStatus, productId: productId, viewFrom: 'AdminDashboard' } });
    } else if (customerStatus === 'other' && this.isCustomerMenuExist) {
      this.router.navigate(['user/view'], { queryParams: { customerStatus: customerStatus, productId: productId, viewFrom: 'AdminDashboard' } });
    }
    return
  }

  showRevenue() {
    if (this.isInvoiceMenuExist) {
      this.router.navigateByUrl('invoice/view-invoice');
    }
    return
  }

  showActiveExtension() {
    if (this.isExtMenuExist) {
      this.router.navigateByUrl('extension/supportViewExtension');
    }
    return
  }

  selectProductDiv(product) {
    let myproduct = product.value;
    if (myproduct == '1') {
      this.pbxDiv = true;
      this.ocDiv = false;
      this.productWiseDashboard();
      this.setPage();
    } else if (myproduct == '2') {
      this.ocDiv = true;
      this.pbxDiv = false;
      this.productWiseDashboard();
      this.setPage();
    }
  }

  productWiseDashboard() {
    // this.dashboardService.getResellerStatus().subscribe(data => {
      
    // })
    this.dashboardService.getProductwiseDashboardInfo(localStorage.getItem('type'),localStorage.getItem('id')).subscribe(data => {
      if (data.response == '') {
        this.totalActiveCustomer = '0'
        this.totalInactiveCustomer = '0'
        this.totalOtherCustomer = '0'
      }
      else{
      for (let i = 0; i < data.response.length; i++) {
        if (data.response[i].product_id) {
          if (data.response[i].product_id == 1 && this.pbxDiv == true) {
            this.totalActiveCustomer = data.response[i].active;
            this.totalInactiveCustomer = data.response[i].inactive;
            this.totalOtherCustomer = data.response[i].expired + data.response[i].suspendedForUnderpayment + data.response[i].suspendedForLitigation;
          } else if (data.response[i].product_id == 2 && this.ocDiv == true) {
            this.totalOCActiveCustomer = data.response[i].active;
            this.totalOCInactiveCustomer = data.response[i].inactive;
          }
        }
      }
    }
    });
  }

  getTotalExtension() {
    let role = localStorage.getItem('type');
    let user_id = localStorage.getItem('id');
    if (role == '3') {
      this.dashboardService.getMonthlyTotalExtension(user_id,role).subscribe(data => {
        let yearlyExtension: any = [];
        let newArray: any = [];
        if (data) {
          let dateObj = new Date();
          let dateStrings = [];
          let dateFormatOptions = {
            month: 'short'
          };
          //fetch last 11 month from the current date
          for (let i = 0; i < 12; ++i) {
            dateStrings.unshift(dateObj.toLocaleString('en-US', dateFormatOptions));
            dateObj.setMonth(dateObj.getMonth() - 1);
          }        
          for (let i = 0; i < dateStrings.length; i++) {
            newArray.push({ Month: dateStrings[i], id: i + 1 });
          }        
          this.barChart2Labels = dateStrings;
  
          newArray.map(function (x) {
            let result = data.filter(a1 => a1.Month == x.Month);
            if (result.length > 0) {
              yearlyExtension.push(result[0].id);
            }
            else {
              yearlyExtension.push(0);
            }
            return x;
          })
  
          this.barChart2Data = [
            {
              data: yearlyExtension,
              label: ''
            }
          ];
        }
      }, err => {
        this.errors = err.message;
      });
      
    }
    else{
    this.dashboardService.getMonthlyTotalExtension('','').subscribe(data => {
      let yearlyExtension: any = [];
      let newArray: any = [];
      if (data) {
        let dateObj = new Date();
        let dateStrings = [];
        let dateFormatOptions = {
          month: 'short'
        };
        //fetch last 11 month from the current date
        for (let i = 0; i < 12; ++i) {
          dateStrings.unshift(dateObj.toLocaleString('en-US', dateFormatOptions));
          dateObj.setMonth(dateObj.getMonth() - 1);
        }        
        for (let i = 0; i < dateStrings.length; i++) {
          newArray.push({ Month: dateStrings[i], id: i + 1 });
        }        
        this.barChart2Labels = dateStrings;

        newArray.map(function (x) {
          let result = data.filter(a1 => a1.Month == x.Month);
          if (result.length > 0) {
            yearlyExtension.push(result[0].id);
          }
          else {
            yearlyExtension.push(0);
          }
          return x;
        })

        this.barChart2Data = [
          {
            data: yearlyExtension,
            label: ''
          }
        ];
      }
    }, err => {
      this.errors = err.message;
    });
  }
  }

  revenueGraphData() {
    this.dashboardService.getMonthlyRevenue(localStorage.getItem('type'),localStorage.getItem('id')).subscribe(data => {
      this.selectedMonthlyRevenue = data.response;
      let revenueArr = [];
      data.response = data.response.sort((a, b) => parseFloat(b.revenueCost) - parseFloat(a.revenueCost));
      for (var i = 0; i < data.response.length; i++) {
        if (data.response[i].revenueCost > 0) {
          this.revenueLabels.push(data.response[i].company_name);

          revenueArr.push(data.response[i].revenueCost);
          this.revenueData = [
            { "data": revenueArr, "label": '' },
          ];
        } else {
          this.revenueLabels.push('');
          revenueArr.push(0);
        }
      }
    });
  }

  revenueChartClicked(e) {
    let revenueCompany = e.active[0]._model.label;
    for (let i = 0; i < this.selectedMonthlyRevenue.length; i++) {
      if (this.selectedMonthlyRevenue[i].company_name == revenueCompany) {
        var revenueId = this.selectedMonthlyRevenue[i].id;
      }
    }
    if (this.isInvoiceMenuExist) {
      this.router.navigate(['invoice/view'], { queryParams: { id: revenueId } });
    }
  }

  totalMonthlyCalls() {
    this.dashboardService.getTotalMonthlyCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
      this.totalCalls = data.response[0].totalCall;
    });
  }

  totalMonthlyIncomingCalls() {
    this.dashboardService.getTotalMonthlyIncomingCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
      if (localStorage.getItem('type') == '3') {
      this.totalIncomingCalls = data.response[0].totalCall;
      }
      else{
      this.totalIncomingCalls = data.response[0].count;
      }
    });
  }

  totalMonthlyOutgoingCalls() {
    this.dashboardService.getTotalMonthlyOutgoingCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
      if (localStorage.getItem('type') == '3') {
      this.totalOutgoingCalls = data.response[0].totalCall;
      }else{
      this.totalOutgoingCalls = data.response[0].count;
      }
    });
  }

  totalCallDuration() {
    this.dashboardService.getTotalMonthlyCallDuration({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
      this.totalMonthlyDuration = data.response[0].duration;
    });
  }

  totalCallsGraphData() {
    let callArr = [];
    let totalCallArr = [];
    this.dashboardService.getAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
      this.totalChartCalls.push(data.response[0].answeredCount);
      this.dashboardService.getFailedCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data1 => {
        this.totalChartCalls.push(data1.response[0].failedCount);
        this.dashboardService.getNotAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data2 => {
          this.totalChartCalls.push(data2.response[0].noansweredCount);                    
          // this.dashboardService.getRejectedCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data3 => {
          //   this.totalChartCalls.push(data.response[0].rejectedCount);
          if(data2){
            this.dashboardService.getBusyCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data4 => {
              this.totalChartCalls.push(data4.response[0].busyCount);              
              this.answerCall = data.response[0].answeredCount;
              this.failCall = data1.response[0].failedCount;
              this.noAnscall = data2.response[0].noansweredCount;              
              this.busyCall = data4.response[0].busyCount;
              totalCallArr.push({ 'callType': 'Answered', 'totalCall': this.answerCall }, { 'callType': 'Failed', 'totalCall': this.failCall }, { 'callType': 'Missed', 'totalCall': this.noAnscall }, { 'callType': 'Busy', 'totalCall': this.busyCall });
              for (var i = 0; i < totalCallArr.length; i++) {

                this.callLabels.push(totalCallArr[i].callType);

                callArr.push(totalCallArr[i].totalCall);
                
                this.callData = [
                  { "data": callArr, "label": '' },
                ];                
              }
            });
          }
          });
        });
      });
  }

  dateWiseMinuteConsumed(e) {
    // this.mainChartData = [];
    let sel_date = e.value ? e.value : e;
    this.dashboardService.getDateWiseMinuteConsumedAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id'), date: sel_date }).subscribe(data => {
      this.mainChartData1 = ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
      for (let i = 0; i < data.response.length; i++) {
        this.mainChartData1[data.response[i].start_Hour] = (data.response[i].bridge_time / 60).toFixed(2);
      }
      this.mainChartData = [
        {
          data: this.mainChartData1,
          label: 'Minutes'
        },
        {
          data: [],
          label: 'Failed'
        },
        {
          data: [],
          label: 'Not answered'
        }
      ];
    });
  }


  getCDR() {
    this.callDataSource = [];
    this.callColumnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'company', headerName: 'Company', hide: false, width: 20 },
      { field: 'buyCost', headerName: 'Buy Cost', hide: false, width: 10 },
      { field: 'sellCost', headerName: 'Sell Cost', hide: false, width: 10 },
      { field: 'callCost', headerName: 'Call Cost', hide: false, width: 10 },
      { field: 'gatewayName', headerName: 'Gateway', hide: false, width: 10 },
      { field: 'callPlanName', headerName: 'Call Plan', hide: false, width: 15 },
      { field: 'startTime', headerName: 'Start Time', hide: false, width: 10 },
      { field: 'endTime', headerName: 'End Time', hide: false, width: 10 },
      { field: 'src', headerName: 'Caller', hide: false, width: 15 },
      { field: 'dispDst', headerName: 'Callee', hide: false, width: 15 },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, width: 15 },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, width: 15 },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: false, width: 15 },
      { field: 'dnid', headerName: 'DNID', hide: false, width: 10 },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false, width: 20 },
      { field: 'dispDestination', headerName: 'Country', hide: false, width: 15 },
    ];

    //call reports
    var id = localStorage.getItem("id");
    let role = localStorage.getItem('type');
    let user_id = localStorage.getItem('id');

    if(role == '3'){
      this.cdrService.getResellerCdrInfo(role, user_id).subscribe(pagedData => {
        this.callDataSource = [];
        this.callDataSource.push({ 'fields': this.callColumnDefs, 'data': pagedData });
      });
    }
    else{
    // this.cdrService.getAdminCdrInfo(1).subscribe(pagedData => { // before code
    //   this.callDataSource = [];
    //   this.callDataSource.push({ 'fields': this.callColumnDefs, 'data': pagedData });
    // });
    this.cdrService.getAdminCdrInfodash(1).subscribe(pagedData => {
      this.callDataSource = [];
      this.callDataSource.push({ 'fields': this.callColumnDefs, 'data': pagedData });
    });
  }
  }

  manageCallAction(e) {
    let data = e.data;
    return this.showCdr(e.data);
  }

  showCdr(event) {
    if (this.isCDRMenuExist) {
      this.router.navigateByUrl('cdr/admin-cdr');
    }
  }

  callsPerTenant(event) {
    let pieDataArr = [];
    let pieLabelArr = [];
    let sel_date = event.value ? event.value : event;
    if (sel_date) {
      this.dashboardService.getCallsPerTenant({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id'), 'date': sel_date }).subscribe(data => {
        for (let i = 0; i < data.response.length; i++) {
          // In database company_name name is saving 
          // so it's wrong on database that'y we put the company_name condition
          if (data.response[i].company_name) {
            pieLabelArr.push(data.response[i].company_name);
            pieDataArr.push(data.response[i].totalCalls);
          }
        }
        if (pieDataArr.length > 0) {

          this.pieChartLabels = pieLabelArr;
          this.pieChartData = pieDataArr;
        } else {
          this.pieChartLabels = ['No Data Found.'];
          this.pieChartData = [0];
        }
      });

      this.dashboardService.getTotalCallsPerTenant({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id'),'date': sel_date }).subscribe(data => {
        
        this.totalCallsPerTenant = data.response[0].totalCalls;
      });
    }
  }

  callsPerHour(selectedDate, customerId) {
    let sel_date = selectedDate.value ? selectedDate.value : selectedDate;
    let cust_id = customerId.value ? customerId.value : customerId;
    this.dateAlreadySelected = sel_date;
    let newArray = [];
    let hourlyCallsDetails = [];
    // this.barChartHoursData = [];
    if (sel_date || cust_id) {
      this.dashboardService.getCallsPerHours({ 'date': sel_date, 'user_id': cust_id,role: localStorage.getItem('type'), userr_id: localStorage.getItem('id') }).subscribe(data => {

        if (data) {
          for (let i = 0; i < this.barChartHoursLabels.length; i++) {
            newArray.push({ Hours: this.barChartHoursLabels[i], id: i + 1 });
          }
          newArray.map(function (x) {
            let result = data.response.filter(a1 => a1.start_Hour == x.Hours);
            if (result.length > 0) {
              hourlyCallsDetails.push(result[0].totalCalls);
            }
            else {
              hourlyCallsDetails.push(0);
            }
            return x;
          });
          this.barChartHoursData = [
            {
              data: hourlyCallsDetails,
              label: ''
            }
          ];
        }
      });

      this.dashboardService.getTotalCallsPerHours({ role: localStorage.getItem('type'),'date': sel_date, 'user_id': cust_id, userr_id: localStorage.getItem('id') }).subscribe(data => {
        this.totalCallsPerHours = data.response[0].totalCalls;
      });
    }
  }

  //---------------------//
  asrCallsPerHour(selectedDate) {
    let sel_date = selectedDate.value ? selectedDate.value : selectedDate;
    // let cust_id = customerId.value ? customerId.value : customerId;
    this.dateAlreadySelected = sel_date;
    let newArray = [];
    let hourlyCallsDetails3 = [];
    // this.barChartHoursData3 = [];
    if (sel_date) {
      this.dashboardService.getAsrCallsPerHours({ 'date': sel_date,role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {      
        var data1 = [];
        //var asrData = [];
        for (let k = 0; k < data['coneectedCall'].length; k++) {          
          if (data['coneectedCall'].length > 0) {
            if (data['totalCall'][k].start_Hour == data['coneectedCall'][k].start_Hour) {
              let asr = (data['coneectedCall'][k].totalCalls / data['totalCall'][k].totalCalls * 100).toFixed(2);
              data1.push({ totalCalls: parseFloat(asr), start_Hour: data['totalCall'][k].start_Hour });
            }
          }
        }        
        if (data1) {
          for (let i = 0; i < this.barChartHoursLabels.length; i++) {
            newArray.push({ Hours: this.barChartHoursLabels[i], id: i + 1 });
          }

          newArray.map(function (x) {

            let result = data1.filter(a1 => a1.start_Hour == x.Hours);
            if (result.length > 0) {
              hourlyCallsDetails3.push(result[0].totalCalls);
            }
            else {
              hourlyCallsDetails3.push(0);
            }
            return x;
          });          
          this.barChartHoursData3 = [
            {
              data: hourlyCallsDetails3,
              //data : [],
              label: ''
            }
          ];         
        }
      });
      this.dashboardService.getTotalAsrCallsPerHours({ 'date': sel_date ,role: localStorage.getItem('type'), user_id: localStorage.getItem('id')}).subscribe(data => {
        this.totalAsrCallsPerHours = data.response[0].totalCalls;
      });
    }
  }
  //--------------------//

  acdCallsPerHour(selectedDate) {
    let sel_date = selectedDate.value ? selectedDate.value : selectedDate;
    // let cust_id = customerId.value ? customerId.value : customerId;
    this.dateAlreadySelected = sel_date;
    let newArray = [];
    let hourlyCallsDetails2 = [];
    // this.barChartHoursData2 = [];

    if (sel_date) {
      this.dashboardService.getAcdCallsPerHours({ 'date': sel_date,role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
        var data1 = [];
        for (let k = 0; k < data.response.length; k++) {
          let acd = ((data.response[k]['totalMinutes'] / 60) / data.response[k]['totalCalls']).toFixed(2);
          data1.push({ totalCalls: acd, start_Hour: data.response[k]['start_Hour'] });
        }
        if (data1) {
          for (let i = 0; i < this.barChartHoursLabels.length; i++) {
            newArray.push({ Hours: this.barChartHoursLabels[i], id: i + 1 });
          }
          newArray.map(function (x) {
            let result = data1.filter(a1 => a1.start_Hour == x.Hours);
            if (result.length > 0) {
              hourlyCallsDetails2.push(result[0].totalCalls);
            }
            else {
              hourlyCallsDetails2.push(0);
            }
            return x;
          });
          this.barChartHoursData2 = [
            {
              data: hourlyCallsDetails2,
              //data : [],
              label: ''
            }
          ];
        }
      });
      this.dashboardService.getTotalAcdCallsPerHours({ 'date': sel_date ,role: localStorage.getItem('type'), user_id: localStorage.getItem('id')}).subscribe(data => {
        this.totalAcdCallsPerHours = data.response[0].totalCalls;
      });
    }
  }

  customerCallsPerHour(customerId) {
    let newArray = [];
    let hourlyCallsDetails = [];

    this.dashboardService.getCallsPerHours({ 'date': this.dateAlreadySelected, 'user_id': customerId.value,role: localStorage.getItem('type'), userr_id: localStorage.getItem('id') }).subscribe(data => {

      if (data) {
        for (let i = 0; i < this.barChartHoursLabels.length; i++) {
          newArray.push({ Hours: this.barChartHoursLabels[i], id: i + 1 });
        }
        newArray.map(function (x) {
          let result = data.response.filter(a1 => a1.start_Hour == x.Hours);
          if (result.length > 0) {
            hourlyCallsDetails.push(result[0].totalCalls);
          }
          else {
            hourlyCallsDetails.push(0);
          }
          return x;
        });
        this.barChartHoursLabels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
        this.barChartHoursData = [
          {
            data: hourlyCallsDetails,
            label: ''
          }
        ];
      }
    });

    this.dashboardService.getTotalCallsPerHours({ role: localStorage.getItem('type'),'date': this.dateAlreadySelected, 'user_id': customerId.value, userr_id: localStorage.getItem('id') }).subscribe(data => {
      this.totalCallsPerHours = data.response[0].totalCalls;
    });
  }

  



}