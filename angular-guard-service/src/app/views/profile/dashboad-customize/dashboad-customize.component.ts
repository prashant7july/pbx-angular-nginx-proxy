import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../profile.service';


@Component({
  selector: 'app-dashboad-customize',
  templateUrl: './dashboad-customize.component.html',
  styleUrls: ['./dashboad-customize.component.css']
})
export class DashboadCustomizeComponent implements OnInit {
  CustmizeForm: FormGroup;
  timeCalls:boolean = false;
  totalCalls :boolean= false;
  AnsCalls :boolean= false;
  MissedCalls: boolean = false;
  FailedCalls: boolean  = false;
  BusyCalls: boolean  = false;
  ConcurrentCalls: boolean  = false;
  AdvanceCalls: boolean  = false;
  LastinvoiceCalls: boolean  = false;
  TotalcallsdiagramCustomizeCall:boolean = false;
  StorageSizeCustomizeCall:boolean = false;
  Callsperhours:boolean = false;
  MinuteConsume:boolean = false;  
  AvarageCallDuration:boolean = false;
  AnswerSeizureratio:boolean = false;
  CallRecords:boolean = false;
  ExtensionInformation:boolean = false;
  AccountInformation:boolean = false;
  FeaturesInformation:boolean = false;
  TicketInformation:boolean = false;
  Invoice_Details:boolean = false;
  ExtensionDetails:boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private ProfileService: ProfileService,
  ) {
    this.CustmizeForm = this.formBuilder.group({  
      'total_call': [''],
      'ans_call': [''],
      'missed_call' : [''],
      'failed_calls' : [''], 
      'busy_call' : [''], 
      'Concurrent_call' : [''], 
      'Advance_call' : [''],  
      'Last_invoice_call' : [''],  
      'total_call_diagram' : [''], 
      'Storage_Size' : [''],  
      'calls_per_hours' : [''], 
      'minutes_consumed' : [''],  
      'Average_call_duration' : [''], 
      'Answer_Seizure_ratio' : [''], 
      'Call_records' : [''],   
      'Extension_information' : [''], 
      'Account_Manager_Information' : [''], 
      'Features_Information' : [''],   
      'Ticket_Information' : [''],  
      'Inv_details' : [''],
      'ext_details' : [''],
    })
   }

  ngOnInit() {   
    let user_id = localStorage.getItem("id");
 
    
    this.ProfileService.viewCustomDashboard(user_id).subscribe((data) =>{
      this.totalCalls = data.total_call == 'true' ? true : false;
      this.AnsCalls = data.ans_call == 'true' ? true : false;
      this.MissedCalls = data.missed_call == 'true' ? true : false;
      this.FailedCalls = data.failed_calls == 'true' ? true : false;
      this.BusyCalls = data.busy_call == 'true' ? true : false;
      this.ConcurrentCalls = data.Concurrent_call == 'true' ? true : false;
      this.AdvanceCalls = data.Advance_call == 'true' ? true : false;
      this.LastinvoiceCalls = data.Last_invoice_call == 'true' ? true : false;
      this.TotalcallsdiagramCustomizeCall = data.total_call_diagram == 'true' ? true : false;
      this.StorageSizeCustomizeCall = data.Storage_Size == 'true' ? true : false;
      this.Callsperhours = data.calls_per_hours == 'true' ? true : false;
      this.MinuteConsume = data.minutes_consumed == 'true' ? true : false;
      this.AvarageCallDuration = data.Average_call_duration == 'true' ? true : false;
      this.AnswerSeizureratio = data.Answer_Seizure_ratio == 'true' ? true : false;
      this.CallRecords = data.Call_records == 'true' ? true : false;
      this.ExtensionInformation = data.Extension_information == 'true' ? true : false;
      this.AccountInformation = data.Account_Manager_Information == 'true' ? true : false;
      this.FeaturesInformation = data.Features_Information == 'true' ? true : false;
      this.TicketInformation = data.Ticket_Information == 'true' ? true : false;
      this.Invoice_Details = data.Inv_details == 'true' ? true : false;
      this.ExtensionDetails = data.ext_details == 'true' ? true : false;
    })
  }

  selectAllFeatures() {
    this.totalCalls = true;
    this.AnsCalls = true;
    this.MissedCalls = true;
    this.FailedCalls = true;
    this.BusyCalls = true;
    this.ConcurrentCalls = true;
    this.AdvanceCalls = true;
    this.LastinvoiceCalls = true;
    this.TotalcallsdiagramCustomizeCall = true;
    this.StorageSizeCustomizeCall = true;
    this.Callsperhours = true;
    this.MinuteConsume = true;
    this.AvarageCallDuration = true;
    this.AnswerSeizureratio = true;
    this.CallRecords = true;
    this.ExtensionInformation = true;
    this.AccountInformation = true;
    this.FeaturesInformation = true;
    this.TicketInformation = true;
    this.Invoice_Details = true;
    this.ExtensionDetails = true;
  }
  unselectAllFeatures(){
    this.totalCalls = false;
    this.AnsCalls = false;
    this.MissedCalls = false;
    this.FailedCalls = false;
    this.BusyCalls = false;
    this.ConcurrentCalls = false;
    this.AdvanceCalls = false;
    this.LastinvoiceCalls = false;
    this.TotalcallsdiagramCustomizeCall = false;
    this.StorageSizeCustomizeCall = false;
    this.Callsperhours = false;
    this.MinuteConsume = false;
    this.AvarageCallDuration = false;
    this.AnswerSeizureratio = false;
    this.CallRecords = false;
    this.ExtensionInformation = false;
    this.AccountInformation = false;
    this.FeaturesInformation = false;
    this.TicketInformation = false;
    this.Invoice_Details = false;
    this.ExtensionDetails = false;
  }
  // totalcalls(e){
  // }
  submitdata(){    
    const credentials = this.CustmizeForm.value;
    let user_id = localStorage.getItem("id");
    this.ProfileService.custDashInfo(credentials,user_id).subscribe((data)=>{
    })
    let total = this.CustmizeForm.value;
    // this.router.navigate(['dashboard/customerDashboard'],{ queryParams: {customize_dashboard : this.CustmizeForm.value.total_call}});
    this.router.navigate(['dashboard/customerDashboard']);
  }

}
