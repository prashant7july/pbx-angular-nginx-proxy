import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Errors, ProductService, AccountManagerService, TicketServerResultService, UserService } from '../../../core';
import { DashboardService } from '../dashboard.service';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { PackageService } from '../../package/package.service';
import { CompanyService } from '../../../core/services/company.service';
import { CdrService } from '../../cdr/cdr.service';
import { DateAdapter } from '@angular/material';
import { TicketService } from '../../ticket/ticket.service';
import { BodyDropPivotTarget } from '@ag-grid-community/all-modules';
import { ProfileService } from '../../profile/profile.service';
import { AllCommunityModules, Module } from '@ag-grid-enterprise/all-modules';


export var productId = '1';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  packageData = '';
  data = '';
  action = 'reply';
  status: any[];
  product = "";
  selectedValue = '';
  errors = '';
  pbxDiv = true;
  ocDiv = false;
  viewTicketPBX = "";
  viewTicketOC = "";
  selectedaccountManagerValue = "";
  getConcurrentCall = 0;
  productId = "1"; //bydefault Pbx is selected
  supportEmail = '';
  supportNumber = 0;
  totalExtension = "";
  totalQueue = "";
  totalConference = "";
  columnDefs: any;
  dataSource: any = [];
  totalRecords: any = [];
  rowData: any;
  pageSize: number = 10;
  defaultPageSize = '10';
  currentPage : any ;
  showIVR = false;
  showQueue = false;
  showConference = false;
  totalChartCalls: any = [];
  totalAnsweredCalls: any = 0;
  totalFailedCalls: any = 0;
  totalMissedCalls: any = 0;
  totalTransferredCalls: any = 0;
  totalRejectedCalls: any = 0;
  totalActiveCalls: any = 0;
  totalBusyCalls: any = 0;
  totalCalls: any = 0;
  totalDiskSpaceUsage: any = 0;
  totalDiskSpace: any = [];
  single: any[];
  cdrDetail = [];
  callColumnDefs: any;
  callDataSource: any = [];
  callRowData: any;
  totalFileSize: any = 0;
  maxDate: Date;
  todayDate: Date;
  totalCallsPerHours: any = 0;
  selectMonth: any = [];
  selectedMonth: any = '';
  todayDate2: Date;
  todayDate3: Date;
  todayDate4: Date;
  dateAlreadySelected: Date;
  totalAsrCallsPerHours: any = 0;
  totalAcdCallsPerHours: any = 0;
  userImg = '';
  id = '';
  answerCall: any = '0';
  failCall: any = '0';
  rejectCall: any = '0';
  noAnscall: any = '0';
  busyCall: any = '0';
  invoiceMonth: number = 0;
  inactiveExtensions: any = 0;
  ActiveExtensionn: any;
  TotalActiveExtension: any = 0;
  public pbxdiv = true;
  public ocdi = false;
  ActiveExtension: any;
  didchargesdata: any = "";
  totalcall: boolean = false;
  invoiceDetails;
  TotalCustomizeCall: boolean = false;
  AnsCustomizeCall: boolean = false;
  MissedCustomizeCall: boolean = false;
  failedCustomizeCall: boolean = false;
  busyCustomizeCall: boolean = false;
  concurrentCustomizeCall: boolean = false;
  advanceCustomizeCall: boolean = false;
  LastInvoiceCustomizeCall: boolean = false;
  TotalcallsdiagramCustomizeCall: boolean = false;
  storagesizeCustomizeCall: boolean = false;
  MinuteConsume: boolean = false;
  Callsperhours: boolean = false;
  AvarageCallDuration: boolean = false;
  AnswerSeizureratio: boolean = false;
  CallRecords: boolean = false;
  ExtensionInformation: boolean = false;
  AccountInformation: boolean = false;
  FeaturesInformation: boolean = false;
  TicketInformation: boolean = false;
  Invoice_Details: boolean = false;
  ExtensionDetails: boolean = false;
  loading: boolean = false;
  // mainChart
  public mainChartData1: Array<any> = [];
  public mainChartData2: Array<any> = [];
  public mainChartData3: Array<any> = [];
  public mainChartData: Array<any> = [];
  public mainChartLabels: Array<any> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
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
  public mainChartType: string = 'line';




  showActiveExtension() {
    this.router.navigateByUrl('dashboard/customer-realtime-dashboard');
  }



  //////////////////////////////////Totla Monthly calls////////////////////////////////////////////////
  public callData = [];
  public callLabels = [];
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
  public doughnutChartLabels: string[] = ['Answered', 'Failed', 'Missed', 'Rejected', 'Busy'];
  public doughnutChartData: any = [];
  public doughnutChartType = 'doughnut';
  public doughnutColors = [
    {
      backgroundColor: [
        '#ffc107',
        '#f86c6b',
        '#2f353a',
        '#20c997',
        '#4B0082'
      ]
    }
  ];
  ////////////////////////////////////////Disk space////////////////////////////////////////////////////////////////
  //pie chart 
  // view: any[] = [100, 350]
  // gradient: boolean = true;
  // showLegend: boolean = true;
  // showLabels: boolean = true;
  // isDoughnut: boolean = true;
  // legendPosition: string = 'left';
  // pieColorScheme = {
  //   domain: ['#A10A28', '#5AA454']
  // };
  // pieChartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: true,
  //   plugins: {
  //     labels: {
  //       render: 'percentage',
  //       fontColor: ['green', 'white', 'red'],
  //       precision: 2
  //     }
  //   },
  // };

  public doughnutChartLabels1: string[] = ['Free Space (GB)', 'Used Space (GB)'];
  public doughnutChartData1: any = [];
  public doughnutChartType1 = 'doughnut';
  public doughnutColors1 = [
    {
      backgroundColor: [
        '#20c997',
        '#f86c6b',
      ]
    }
  ];
  // ///////////////////////////////////////////////////////////////////////////////////////////////


  // barChart2
  public barChart2Data: Array<any> = [];
  public barChart2Labels: Array<any> = [];
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
    },
    labels: {
      display: "rotate"
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
  colorScheme = {
    domain: ['#5AA454']
  };

  yAxisTickFormatting = (value: number) => {
    if (Math.floor(value) !== value) {
      return '';
    }
    return value;
  }

  /////////////////////////////////////////Calls per Hour Bar chart///////////////////////////////////////
  // barChart
  public barChartHoursOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
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
  public barChartHoursLabels: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursType = 'bar';
  public barChartHoursLegend = false;

  public barChartHoursData: any[] = [];
  public barChartHoursColours: Array<any> = [
    {
      backgroundColor: '#CC5F00',
      borderWidth: 0
    }
  ];
  totalPbxIvr: any;

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
  //

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
  public barChartHoursLabels3: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursType3 = 'bar';
  public barChartHoursLegend3 = false;

  public barChartHoursData3: any[] = [{ data: [], label: '' }]; 
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
  public barChartHoursLabels2: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  public barChartHoursType2 = 'bar';
  public barChartHoursLegend2 = false;

  public barChartHoursData2: any[] = [{ data: [], label: '' }]; 
  public barChartHoursColours2: Array<any> = [
    {
      backgroundColor: '#CC5F00',
      borderWidth: 0
    }
  ];

  specificGridOptions: any = {
    columnDefs: this.columnDefs,
    rowData: this.rowData || null,
    rowModelType: 'infinite',
    modules: AllCommunityModules,
    //cacheOverflowSize: 3,
    //maxBlocksInCache: 3,
    // enableColResize: true,
    pagination: false,
    suppressHorizontalScroll: true,
    scrollbarWidth: 10,
    rowSelection: 'Multiple',
   // resizable: true,

   colResizeDefault : 'Shift',

    enableSorting: false, // to stop column sorting
    enableServerSideSorting: false, // to stop column sorting
    localeText: { noRowsToShow: 'No Record Found' },
    defaultColDef: {
      suppressFilter: false, // to stop column sorting
      suppressMovable: true,
      filter: false, // to stop column sorting
      resizable: true,
    }
  } 

  //
  //


  constructor(
    private customerdashboardService: DashboardService,
    private productService: ProductService,
    private accountManagerService: AccountManagerService,
    private packageService: PackageService,
    private router: Router,
    private companyService: CompanyService,
    private ticketServerResultService: TicketServerResultService,
    private route: ActivatedRoute,
    private userService: UserService,
    private dashboardService: DashboardService,
    private cdrService: CdrService,
    private dateAdapter: DateAdapter<Date>,
    public ticketService: TicketService,
    public ProfileService: ProfileService,
  ) {
    this.maxDate = new Date();
    this.todayDate = new Date();
    this.todayDate2 = new Date();
    this.todayDate3 = new Date();
    this.todayDate4 = new Date();
    this.dateAdapter.setLocale('en-GB');
    this.selectedMonth = this.todayDate.getMonth() + 1;
    this.invoiceMonth = this.todayDate.getMonth();
  }

  ngOnInit() {


    // let calls;
    // this.TotalCustomizeCall = calls = this.route.snapshot.queryParams['customize_dashboard'];
    let exten_id = localStorage.getItem("id");
    this.userImg = localStorage.getItem('userImg');
    if (localStorage.getItem('type') != '1') {
      this.userService.purgeAuth();
      let ip = localStorage.getItem('ip');
      window.localStorage.clear();
      localStorage.setItem('ip', ip);
      this.router.navigateByUrl('/auth/login');
    }
    this.dashboardService.getRegisExtension(localStorage.getItem('id')).subscribe(data => {
      this.ActiveExtension = data.response[0].count;
    });
    this.ProfileService.viewCustomDashboard(exten_id).subscribe((data) => {
      if (data['ext_details'] == 'true') {
        this.ExtensionDetails = true
        this.dashboardService.ActiveExtensions(localStorage.getItem('id')).subscribe(data => {
          this.ActiveExtensionn = data.response[0].count;
        })
      }
    });
    this.dashboardService.inactiveExtensions(localStorage.getItem('id')).subscribe(data => {
      this.inactiveExtensions = data.response[0].count;
    })
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
    //ticket information
    this.setPage();
    //shows extension information
    this.extensionGraph();
    //shows Account manager information
    this.accountManagerInfo();
    //shows total queue,extension,conference 
    this.getFeaturesInfo();
    //total call graph
    this.totalCallsGraphData();
    //minute consumed answer
    //this.minuteConsumedGraphData();
    this.productService.getProductCustomerWise(localStorage.getItem('id')).subscribe(data => {
      this.selectedValue = data.response[0];
      this.product = data.response[0].id;
      if (this.product == '1') {
        this.pbxDiv = true;
        this.ocDiv = false;
        productId = '1';
        this.setPage();
      }
      else if (this.product == '2') {
        this.pbxDiv = false;
        this.ocDiv = true;
        productId = '2';
        this.setPage();
      }
    });
    //get concurrent call value
    this.getProductFeatures();
    this.getProductFeaturess();
    // if (this.TotalCustomizeCall) {  
    //   this.dashboardService.getTotalMonthlyCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {        
    //     this.totalCalls = data.response[0].totalCall;
    //   }, err => {
    //     this.errors = err.message;
    //   });

    // }    
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['total_call'] == 'true') {
        this.TotalCustomizeCall = true
        this.dashboardService.getTotalMonthlyCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
          this.totalCalls = data.response[0].totalCall;
        }, err => {
          this.errors = err.message;
        });
      }
    })

    this.getCDR(); //cdr
    //shows calls per hour graph
    this.callsPerHour(this.todayDate);
    //show minute consumed
    this.dateWiseMinuteConsumed(this.todayDate);
    this.asrCallsPerHour(this.todayDate4);
    this.acdCallsPerHour(this.todayDate3);
    this.getInvoiceData();
    this.getInvoiceDataa();
    this.getInvoiceDataaa();



  }


  //--------------------------------------acd and asr method -----------------------------//
  asrCallsPerHour(selectedDate) {
    let sel_date = selectedDate.value ? selectedDate.value : selectedDate;

    this.dateAlreadySelected = sel_date;
    let newArray = [];
    let hourlyCallsDetails3 = [];    
    if (sel_date) {
      let cust_id = localStorage.getItem("id");
      this.dashboardService.getAsrCallsPerHours({ 'date': sel_date, customerId: cust_id }).subscribe(data => {
        var data1 = [];
        for (let k = 0; k < data['coneectedCall'].length; k++) {
          if (data['coneectedCall'].length > 0) {
            if (data['totalCall'][k].start_Hour == data['coneectedCall'][k].start_Hour) {
              let asr = (data['coneectedCall'][k].totalCalls / data['totalCall'][k].totalCalls * 100).toFixed(2);
              data1.push({ totalCalls: parseFloat(asr), start_Hour: data['totalCall'][k].start_Hour });
            }
          } else {
            data1 = [];
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
              data: hourlyCallsDetails3 ? hourlyCallsDetails3 : 0,
              label: ''
            }
          ];
        }
      });
      this.ProfileService.viewCustomDashboard(cust_id).subscribe((data) => {
        if (data['Answer_Seizure_ratio'] == 'true') {
          this.AnswerSeizureratio = true
          this.dashboardService.getTotalAsrCallsPerHours({ 'date': sel_date, customerId: cust_id }).subscribe(data => {
            this.totalAsrCallsPerHours = data.response[0].totalCalls;
          });
        }
      });
    }
  }  

  // acdCallsPerHour(selectedDate) {
  //   let sel_date = selectedDate.value ? selectedDate.value : selectedDate;

  //   this.dateAlreadySelected = sel_date;
  //   let newArray = [];
  //   let hourlyCallsDetails2 = [];

  //   if (sel_date) {
  //     let cust_id = localStorage.getItem("id");
  //     this.dashboardService.getAcdCallsPerHours({ 'date': sel_date, customerId: cust_id }).subscribe(data => {
  //       var data1 = [];
  //       for (let k = 0; k < data.response.length; k++) {

  //         let acd = ((data.response[k]['totalMinutes'] / 60) / data.response[k]['totalCalls']).toFixed(2);
  //         data1.push({ totalCalls: acd, start_Hour: data.response[k]['start_Hour'] });

  //       }
  //       if (data1) {
  //         for (let i = 0; i < this.barChartHoursLabels.length; i++) {
  //           newArray.push({ Hours: this.barChartHoursLabels[i], id: i + 1 });
  //         }

  //         newArray.map(function (x) {

  //           let result = data1.filter(a1 => a1.start_Hour == x.Hours);
  //           if (result.length > 0) {
  //             hourlyCallsDetails2.push(result[0].totalCalls);
  //           }
  //           else {
  //             hourlyCallsDetails2.push(0);
  //           }
  //           return x;
  //         });
  //         this.barChartHoursData2 = [
  //           {
  //             data: hourlyCallsDetails2 ? hourlyCallsDetails2 : [],
  //             //data : [],
  //             label: ''
  //           }
  //         ];
  //       }
  //     });
  //     // let user_id = localStorage.getItem("id");
  //     this.ProfileService.viewCustomDashboard(cust_id).subscribe((data) => {
  //       if (data['Average_call_duration'] == 'true') {
  //         this.AvarageCallDuration = true
  //         this.dashboardService.getTotalAcdCallsPerHours({ 'date': sel_date, customerId: cust_id }).subscribe(data => {
  //           this.totalAcdCallsPerHours = data.response[0].totalCalls;
  //         });
  //       }
  //     });
  //   }
  // }
  //--------------------------------------------------/////-------------------------------//

  //------------------------------------Last month Invoice details------------------------------------------ //



  

  acdCallsPerHour(selectedDate): void {
    let sel_date = selectedDate.value ? selectedDate.value : selectedDate;
  
    this.dateAlreadySelected = sel_date;
    let newArray = [];
    let hourlyCallsDetails2 = [];
  
    if (sel_date) {
      let cust_id = localStorage.getItem("id");
      this.loading = true;
      
      this.dashboardService.getAcdCallsPerHours({ 'date': sel_date, customerId: cust_id }).subscribe(data => {
        var data1 = [];
        for (let k = 0; k < data.response.length; k++) {
          let acd = ((data.response[k]['totalMinutes'] / 60) / data.response[k]['totalCalls']).toFixed(2);
          data1.push({ totalCalls: acd, start_Hour: data.response[k]['start_Hour'] });
        }
        if (data1) {
          for (let i = 0; i < this.barChartHoursLabels.length; i++) {
            newArray.push({ Hours: this.barChartHoursLabels[i], id: i + 1 });
          }
  
          newArray.map(x => {
            let result = data1.filter(a1 => a1.start_Hour == x.Hours);
            if (result.length > 0) {
              hourlyCallsDetails2.push(result[0].totalCalls);
            } else {
              hourlyCallsDetails2.push(0);
            }
            return x;
          });
  
          this.barChartHoursData2 = [{
            data: hourlyCallsDetails2 ? hourlyCallsDetails2 : [],
            label: ''
          }];
        }
        this.loading = false;
      }, error => {
        console.error('Error fetching data:', error);
        this.loading = false;
      });
        
      this.ProfileService.viewCustomDashboard(cust_id).subscribe((data) => {
        if (data['Average_call_duration'] == 'true') {
          this.AvarageCallDuration = true
          this.dashboardService.getTotalAcdCallsPerHours({ 'date': sel_date, customerId: cust_id }).subscribe(data => {
            this.totalAcdCallsPerHours = data.response[0].totalCalls;
          });
        }
      });
    }
  }
  


  getInvoiceDataaa() {
    let cust_id = localStorage.getItem("id");
    // let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(cust_id).subscribe((data) => {
      if (data['Inv_details'] == 'true') {
        this.Invoice_Details = true
        if (cust_id) {
          this.dashboardService.getInvoiceDetails({ customerId: cust_id }).subscribe(data => {


            // this.invoiceDetails['balance'] = parseFloat(this.invoiceDetails['balance']) + parseFloat(this.invoiceDetails['credit_limit'])
            if (data != undefined) {
              this.didchargesdata = data.amount
              this.invoiceDetails = data;
            } else {
              this.invoiceDetails = "";
            }
          });
        }
      }
    });
  }
  getInvoiceData() {
    let cust_id = localStorage.getItem("id");
    // let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(cust_id).subscribe((data) => {
      if (data['Advance_call'] == 'true') {
        this.advanceCustomizeCall = true
        if (cust_id) {
          this.dashboardService.getInvoiceDetails({ customerId: cust_id }).subscribe(data => {
            // this.invoiceDetails['balance'] = parseFloat(this.invoiceDetails['balance']) + parseFloat(this.invoiceDetails['credit_limit'])
            if (data != undefined) {
              this.didchargesdata = data.amount
              this.invoiceDetails = data;
            } else {
              this.invoiceDetails = "";
            }
          });
        }
      }
    });
  }
  getInvoiceDataa() {
    let cust_id = localStorage.getItem("id");
    // let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(cust_id).subscribe((data) => {
      if (data['Last_invoice_call'] == 'true') {
        this.LastInvoiceCustomizeCall = true
        if (cust_id) {
          this.dashboardService.getInvoiceDetails({ customerId: cust_id }).subscribe(data => {
            // this.invoiceDetails['balance'] = parseFloat(this.invoiceDetails['balance']) + parseFloat(this.invoiceDetails['credit_limit'])
            if (data != undefined) {
              this.didchargesdata = data.amount
              this.invoiceDetails = data;
            } else {
              this.invoiceDetails = "";
            }
          });
        }
      }
    });
  }
  //------------------------------------------------------------------------------------------------------------//


  extensionGraph() {
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Extension_information'] == 'true') {
        this.ExtensionInformation = true

        this.barChart2Data = [
          {
            data: [],
            label: ''
          }
        ];

        //yearly Extension Info bar graph
        this.customerdashboardService.getMonthlyTotalExtension(localStorage.getItem('id'), '').subscribe(data => {
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
                label: 'Extension created'
              }
            ];
          }
        }, err => {
          this.errors = err.message;
        });
      }
    });
  }

  accountManagerInfo() {
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Account_Manager_Information'] == 'true') {
        this.AccountInformation = true
        this.accountManagerService.getAccountManagerInfo(localStorage.getItem('type'), localStorage.getItem('id')).subscribe(data => {
          this.selectedaccountManagerValue = data.response;
        }, err => {
          this.errors = err.message;
        });
      }
    });

    //get manager company info
    this.companyService.getCompanyInfo().subscribe(data => {
      this.supportEmail = data.response[0].support_email;
      this.supportNumber = data.response[0].support_number;
    }, err => {
      this.errors = err.message;
    });
  }

  getFeaturesInfo() {//get total extension in features info
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Features_Information'] == 'true') {
        this.FeaturesInformation = true
        this.customerdashboardService.getTotalExtension(localStorage.getItem('id')).subscribe(data => {
          this.totalExtension = data[0].count;
        }, err => {
          this.errors = err.message;
        });

        //get total queue in features info
        this.customerdashboardService.getTotalQueue(localStorage.getItem('id')).subscribe(data => {
          this.totalQueue = data[0].count;
        }, err => {
          this.errors = err.message;
        });
        //get total conference in features info
        this.customerdashboardService.getTotalConference(localStorage.getItem('id')).subscribe(data => {
          this.totalConference = data[0].count;
        }, err => {
          this.errors = err.message;
        });

        this.customerdashboardService.getPbxTotalIvrByCustomer(localStorage.getItem('id')).subscribe(data => {
          this.totalPbxIvr = data[0].count;
        }, err => {
          this.errors = err.message;
        });
      }
    });
  }

  totalCallsGraphData() {
    this.totalcall = true;
    let callArr = [];
    let totalCallArr = [];
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['ans_call'] == 'true') {
        this.AnsCustomizeCall = true
        this.dashboardService.getAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
          this.totalAnsweredCalls = data.response[0].answeredCount;
          this.answerCall = data.response[0].answeredCount;
        }, err => {
          this.errors = err.message;
        });
      }
    })
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['missed_call'] == 'true') {
        this.MissedCustomizeCall = true
        this.dashboardService.getNotAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data2 => {
          this.totalMissedCalls = data2.response[0].noansweredCount;
          this.noAnscall = data2.response[0].noansweredCount;
        }, err => {
          this.errors = err.message;
        });
      }
    })
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['failed_calls'] == 'true') {
        this.failedCustomizeCall = true
        this.dashboardService.getFailedCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data1 => {
          this.totalFailedCalls = data1.response[0].failedCount;
          this.failCall = data1.response[0].failedCount;

        }, err => {
          this.errors = err.message;
        });
      }
    })
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['busy_call'] == 'true') {
        this.busyCustomizeCall = true
        this.dashboardService.getBusyCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data4 => {
          this.totalBusyCalls = data4.response[0].busyCount;
          this.busyCall = data4.response[0].busyCount;

        }, err => {
          this.errors = err.message;
        });
      }
    })


    // this.dashboardService.getAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data => {
    //   this.totalAnsweredCalls = data.response[0].answeredCount;

    // this.dashboardService.getFailedCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data1 => {
    //   this.totalFailedCalls = data1.response[0].failedCount;
    // this.dashboardService.getNotAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data2 => {
    //   this.totalMissedCalls = data2.response[0].noansweredCount;
    this.dashboardService.getRejectedCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data3 => {
      this.totalRejectedCalls = data3.response[0].rejectedCount;
      // this.dashboardService.getBusyCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data4 => {
      //   this.totalBusyCalls = data4.response[0].busyCount;

      this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
        if (data['total_call_diagram'] == 'true') {
          this.TotalcallsdiagramCustomizeCall = true
          this.dashboardService.getForwardedCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id') }).subscribe(data5 => {
            // this.totalTransferredCalls = data5.response[0].forwardedCount;
            //  this.doughnutChartData =[this.totalAnsweredCalls, this.totalFailedCalls, this.totalMissedCalls, this.totalRejectedCalls, data.response[0].busyCount];
            // this.answerCall = data.response[0].answeredCount;
            // this.failCall = data1.response[0].failedCount;
            // this.noAnscall = data2.response[0].noansweredCount;
            
          });
          this.rejectCall = data3.response[0].rejectedCount;          
          totalCallArr.push({ 'callType': 'Answered', 'totalCall': this.answerCall }, { 'callType': 'Failed', 'totalCall': this.failCall }, { 'callType': 'Missed', 'totalCall': this.noAnscall }, { 'callType': 'Busy', 'totalCall': this.busyCall });
          for (var i = 0; i < totalCallArr.length; i++) {            
            this.callLabels.push(totalCallArr[i].callType);
            callArr.push(totalCallArr[i].totalCall);       
          }          
          this.callData = [
            { "data": callArr, "label": '' },
          ];          
        }
      });
    });
    // });
    // })
    // });
    // });
  }  

  dateWiseMinuteConsumed(e) {
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['minutes_consumed'] == 'true') {
        this.MinuteConsume = true        
        let sel_date = e.value ? e.value : e;
        this.dashboardService.getDateWiseMinuteConsumedAnsweredCalls({ role: localStorage.getItem('type'), user_id: localStorage.getItem('id'), date: sel_date }).subscribe(data => {          
          let minutesData = ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
          let failedData = new Array(minutesData.length).fill(null);
          let notAnsweredData = new Array(minutesData.length).fill(null);
  
          for (let i = 0; i < data.response.length; i++) {
            let hour = data.response[i].start_Hour;
            let bridgeTime = (data.response[i].bridge_time / 60).toFixed(2);
            minutesData[hour] = bridgeTime;
          }            
          let combinedData = [
            minutesData.map(dataPoint => parseFloat(dataPoint)),
            failedData,
            notAnsweredData
          ];            
          this.mainChartData = combinedData;

        });
      }
    });
  }

  onSelect(data): void {
  }

  onActivate(data): void {
  }

  onDeactivate(data): void {
  }

  setPage() {
    let user_id = Number(localStorage.getItem("id"));
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Ticket_Information'] == 'true') {
        this.TicketInformation = true
        this.dataSource = [{ 'fields': '', 'data': '' }];
        this.columnDefs = [
          { field: 'id', headerName: 'ID', hide: true, width: 10 },
          { field: 'created_at', headerName: 'Date', hide: false, width: 15 },
          { field: 'company_name', headerName: 'Company', hide: true, width: 20 },
          { field: 'product', headerName: 'Product', hide: false, width: 10 },
          { field: 'ticket_number', headerName: 'Ticket Number', hide: false, width: 10 },
          { field: 'ticket_type', headerName: 'Type', hide: false, width: 10 },
          { field: 'assignedTo', headerName: 'Assignee', hide: false, width: 10 },
          { field: 'message', headerName: 'Message', hide: false, width: 10 },
          { field: 'status', headerName: 'Status', hide: false, width: 10 },
          { field: 'action', headerName: 'Action', hide: true, width: 10 },
        ];
        this.ticketServerResultService.viewTicketProductandCustomerwise(Number(localStorage.getItem('id')), Number(productId), 1).subscribe(pagedData => {
          pagedData = this.manageUserActionBtn(pagedData);

          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        }, err => {
          this.errors = err.message;
        });
      }
    });
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

  showTotalCall() { //redirect to cdr page
    this.router.navigateByUrl('cdr/customer-cdr');
  }

  getProductFeatures() {
    let user_id = localStorage.getItem("id");

    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Concurrent_call'] == 'true') {
        this.concurrentCustomizeCall = true
        this.packageService.getPbxFeatures(Number(localStorage.getItem('id')), Number(productId)).subscribe(data => {
          if (this.pbxDiv === true) {
            this.getConcurrentCall = data.response[0].concurrent_call ? data.response[0].concurrent_call : 0;
            this.showIVR = data.response[0].ivr == '1' ? true : false;
            this.showQueue = data.response[0].queue == '1' ? true : false;
            this.showConference = data.response[0].conference == '1' ? true : false;
            this.dashboardService.getDiskSpaceUsage({ 'id': localStorage.getItem('id') }).subscribe(data1 => {
              let remaining_space = 0;
              this.totalDiskSpaceUsage = parseFloat(data1.response);
              this.totalFileSize = data.response[0].file_storage_size;
              remaining_space = (Number(this.totalFileSize) - Number(this.totalDiskSpaceUsage));
              let Remaining_space = remaining_space.toFixed(2)

              this.totalDiskSpace = [Remaining_space, this.totalDiskSpaceUsage];
              this.doughnutChartData1 = this.totalDiskSpace;
            });
          } else if (this.ocDiv === true) {
            this.getConcurrentCall = data.response[0].participant_limit ? data.response[0].participant_limit : 0;
          }
        }, err => {
          this.errors = err.message;
        });
      }
    });
  }

  getProductFeaturess() {
    let user_id = localStorage.getItem("id");

    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Storage_Size'] == 'true') {
        this.storagesizeCustomizeCall = true
        this.packageService.getPbxFeatures(Number(localStorage.getItem('id')), Number(productId)).subscribe(data => {
          if (this.pbxDiv === true) {
            this.getConcurrentCall = data.response[0].concurrent_call ? data.response[0].concurrent_call : 0;
            this.showIVR = data.response[0].ivr == '1' ? true : false;
            this.showQueue = data.response[0].queue == '1' ? true : false;
            this.showConference = data.response[0].conference == '1' ? true : false;
            this.dashboardService.getDiskSpaceUsage({ 'id': localStorage.getItem('id') }).subscribe(data1 => {
              let remaining_space = 0;
              this.totalDiskSpaceUsage = parseFloat(data1.response);
              this.totalFileSize = data.response[0].file_storage_size;
              remaining_space = (Number(this.totalFileSize) - Number(this.totalDiskSpaceUsage));
              let Remaining_space = remaining_space.toFixed(2)

              this.totalDiskSpace = [Remaining_space, this.totalDiskSpaceUsage];
              this.doughnutChartData1 = this.totalDiskSpace;
            });
          } else if (this.ocDiv === true) {
            this.getConcurrentCall = data.response[0].participant_limit ? data.response[0].participant_limit : 0;
          }
        }, err => {
          this.errors = err.message;
        });
      }
    });
  }

  manageAction(e) {
    let data = e.data;
    return this.ticketEdit(e.data);
  }

  ticketEdit(event) {
    this.action = (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2' || localStorage.getItem('type') === '4' || localStorage.getItem('type') === '5') ? 'reply' : 'view';
    if (this.action === 'reply') {
      localStorage.setItem('addMessageText', 'true');
    }
    if (event.id) {
      this.ticketService.updateTicketNewStatus({ id: event.id, user_id: localStorage.getItem('id'), role: localStorage.getItem('type') }).subscribe(data => {
        // this.resetTable();
      }, err => {
        this.errors = err.message;
      });
      this.router.navigate(['ticket/manage'], { queryParams: { id: event.id, customerId: event.customer_id } });
    }
  }
  // showCustomer(customerStatus, productId) {
  //   if (customerStatus === 'active') {
  //     this.router.navigate(['user/view'], { queryParams: { customerStatus: customerStatus, productId: productId, viewFrom: 'AdminDashboard' } });
  //   } else if (customerStatus === 'inactive') {
  //     this.router.navigate(['user/view'], { queryParams: { customerStatus: customerStatus, productId: productId, viewFrom: 'AdminDashboard' } });
  //   } else if (customerStatus === 'other') {
  //     this.router.navigate(['user/view'], { queryParams: { customerStatus: customerStatus, productId: productId, viewFrom: 'AdminDashboard' } });
  //   }
  // }



  // productWiseDashboard() {
  //   this.dashboardService.getProductwiseDashboardInfo().subscribe(data => {
  //     for (let i = 0; i < data.response.length; i++) {
  //       if (data.response[i].product_id) {
  //         if (data.response[i].product_id == 1 && this.pbxDiv == true) {
  //           this.totalActiveCustomer = data.response[i].active;
  //           this.totalInactiveCustomer = data.response[i].inactive;
  //           this.totalOtherCustomer = data.response[i].expired + data.response[i].suspendedForUnderpayment + data.response[i].suspendedForLitigation;
  //         } else if (data.response[i].product_id == 2 && this.ocDiv == true) {
  //           this.totalOCActiveCustomer = data.response[i].active;
  //           this.totalOCInactiveCustomer = data.response[i].inactive;
  //         }
  //       }
  //     }
  //   });
  // }
  // selectProductDiv(product) {
  //   let myproduct = product.value;
  //   if (myproduct == '1') {
  //     this.pbxDiv = true;
  //     this.ocDiv = false;
  //     this.productWiseDashboard();
  //     this.setPage();
  //   } else if (myproduct == '2') {
  //     this.ocDiv = true;
  //     this.pbxDiv = false;
  //     this.productWiseDashboard();
  //     this.setPage();
  //   }
  // }

  chartHovered(e) {
    //no caption
  }

  getCDR() {

    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['Call_records'] == 'true') {
        this.CallRecords = true
        this.callDataSource = [];

        this.callColumnDefs = [
          { field: 'id', headerName: 'ID', hide: true, width: 10 },
          { field: 'startTime', headerName: 'Start Time', hide: false, width: 10 },
          { field: 'endTime', headerName: 'End Time', hide: false, width: 10 },
          { field: 'src', headerName: 'Caller', hide: false, width: 15 },
          { field: 'dispDst', headerName: 'Callee', hide: false, width: 15 },
          { field: 'dispCallerId', headerName: 'Caller ID', hide: false, width: 15 },
          { field: 'sessionTime', headerName: 'Session Time', hide: false, width: 15 },
          { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, width: 15 },
          { field: 'dnid', headerName: 'DNID', hide: false, width: 10 },
          { field: 'sellCost', headerName: 'Buy Cost', hide: false, width: 10 },
          { field: 'callCost', headerName: 'Call Cost', hide: false, width: 10 },
          { field: 'termDescription', headerName: 'Terminate Cause', hide: false, width: 20 },
          { field: 'dispDestination', headerName: 'Country', hide: false, width: 15 },
          { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false, width: 15 },
          { field: 'uuid', headerName: 'UUID', hide: false, width: 20 },
        ];

        var id = localStorage.getItem("id");
        const page = this.currentPage || 1; // current page
    const pageSize = this.defaultPageSize || 10; // default page size
    const offset = (page - 1) * Number(pageSize);
        //call reports
        this.cdrService.getCustomerCdrInfo(user_id, 1, pageSize, offset).subscribe(data => {
          console.log(data,"=--------------------data---------------------")
          // this.callDataSource = data.response;
              this.totalRecords = data.total;
              // data = this.manageUserActionBtn(data.response);
              this.callDataSource = [{ 'fields': this.callColumnDefs, 'data': data.response }];
          });
      }
    });
  }

  manageCallAction(e) {
    let data = e.data;
    return this.showCdr(e.data);
  }
  onPageChanged(page: number) {
    this.currentPage = page;
    this.getCDR();
}

  showCdr(event) {
    this.router.navigateByUrl('cdr/customer-cdr');
  }

  callsPerHour(selectedDate) {
    let user_id = localStorage.getItem("id");
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) => {
      if (data['calls_per_hours'] == 'true') {
        this.Callsperhours = true
        let sel_date = selectedDate.value ? selectedDate.value : selectedDate;
        let newArray = [];
        let hourlyCallsDetails = [];
        this.barChartHoursData = [
          {
            data: [],
            label: ''
          }
        ];



        if (sel_date) {
          this.dashboardService.getCallsPerHours({ 'date': sel_date, 'user_id': localStorage.getItem('id') }).subscribe(data => {
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
                  data: hourlyCallsDetails ? hourlyCallsDetails : 0,
                  label: ''
                }
              ];
            }
          });

          this.dashboardService.getTotalCallsPerHours({ 'date': sel_date, 'user_id': localStorage.getItem('id') }).subscribe(data => {
            this.totalCallsPerHours = data.response[0].totalCalls;
          });
        }
      }
    });

  }

  public moveOnInvoicePage(invoiceDetails) {
    this.router.navigateByUrl(`invoice/view?id=${invoiceDetails.id}`)
    ///invoice/view?id=1743
  }
}
