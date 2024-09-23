import { Component, OnInit, ViewChild } from '@angular/core';
import { TicketService } from '../ticket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountManagerService, Errors, CommonService, mailSendError, commentError, commentAdded, errorMessage, textareaMessage, ticketUpdated, commentUpdated, spaceError } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../../../core/services/email.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
export let ticketSequence = 0;
export let productName = '';

@Component({
  selector: 'app-manage-ticket',
  templateUrl: './manage-ticket.component.html',
  styleUrls: ['./manage-ticket.component.css'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService],
})

export class ManageTicketComponent implements OnInit {
  public value: string = null;
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  ticketForm: FormGroup;
  selectedValue = "";
  selectedaccountManagerValue = "";
  selectAssignTo = '';
  assignedTo:any;
  role_id:any;
  created_by:any;
  sessionId: any;
  ticket_type = "";
  message = "";
  status: any;
  reply = "";
  ticket_number = "";
  assigned_to = "";
  ticketHistory = "";
  showTicket = false;
  lastMessage = false;
  ticketData: any = {};
  role = '1';
  ticketCount = 0;
  totalTicketCount = 0;
  showTicketCount = true;
  buttonName: any = 'Show';
  customerId: any = '';
  emailContentData: any = {};
  managerInfo: any = {};
  ticketStatusForEmail = '';
  userId = "";
  customerInfo: any = {};
  internalUserId = '';
  internalUserName = '';
  accountManagerId = '';
  managerId = '';
  statusDropdown: any = [{ id: '0', statusname: 'Close', hide: true }, { id: '1', statusname: 'Open', hide: true }, { id: '2', statusname: 'In Progress', hide: true }, { id: '3', statusname: 'New', hide: true }, { id: '4', statusname: 'View', hide: true }];
  ticketTypeDropdown: any = [{ id: '0', tickettypevalue: 'New feature', hide: true }, { id: '1', tickettypevalue: 'Issue', hide: true }, { id: '2', tickettypevalue: 'Others', hide: true }]
  updateHistoryId: any;
  glbVal: any;
  openFlag: any;
  assignval: any = null;
  old_tktTyp: any;
  createdTicketUserRole: any;
  selectedSupport = '';

  public tools: object = { type: 'Expand', items: ['Undo', 'Redo', '|', 'Formats', '|', 'Bold', 'Italic', 'Underline', '|', 'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|', 'Alignments', '|', 'Indent', 'Outdent', '|', 'CreateLink', 'Image'] };
  public quickTools: object = { image: ['Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension'] };
  flag: any = false;

  constructor(private ticketService: TicketService, private router: Router, private fb: FormBuilder,
    private accountManagerService: AccountManagerService, private route: ActivatedRoute, private toastr: ToastrService,
    public commonService: CommonService, private emailService: EmailService
  ) {
    this.ticketForm = this.fb.group({
      'reply': ['', Validators.required],
      'message': ['', Validators.required],
      'status': ['', Validators.required],
      'ticket_type': ['1', Validators.required],
      'assigned_to': ['Ravi singh', Validators.required],
      'ticket_number': [{ value: 'JHGH578', disabled: true }],
      'customer': ['']
    });
  }

  ngOnInit() {

    this.role = localStorage.getItem('type');
    this.sessionId = Number(this.route.snapshot.queryParams.id);
    this.userId = this.route.snapshot.queryParams.customerId;
    this.customerId = localStorage.getItem('id');

    if (this.role == '1') this.statusDropdown[0].hide = false;
    else this.statusDropdown[0].hide = false;

    this.accountManagerService.getAccountManagerInfo(this.role, this.customerId).subscribe(data => {
      this.selectedaccountManagerValue = data.response;
      setTimeout(() => {
        this.selectAssignTo = data.response
      }, 1000);
      
      this.internalUserName = data.response[0].name;
      this.internalUserId = data.response[0].id;
    });

    this.accountManagerService.getAccountManagerInfo(this.role, this.customerId).subscribe(data => {
      this.selectedSupport = data.response;
    }, err => {
      this.errors = err.message;
    });

    this.ticketService.viewTicketId(this.sessionId).subscribe(data => {  
      setTimeout(() => {
        this.assignedTo = data[0].assignedTo
        this.role_id = data[0].role
        this.created_by = data[0].created_by
      }, 500);
      
      this.ticketData = data[0];
      this.old_tktTyp = this.ticket_type = data[0].ticket_type;
      this.message = data[0].message.innerHTML;
      this.status = data[0].status;
      this.ticket_number = data[0].ticket_number;
      this.assigned_to = data[0].assigned_to;
      this.accountManagerId = data[0].account_manager_id;
      this.managerId = data[0].acctMngr;
      this.createdTicketUserRole = data[0].role; //only used to disable assigned_to when admin created ticket and assigned to the manager
      productName = data[0].product;
    });
    this.getTicketHistory();
  }

  getTicketHistory() {
    this.ticketService.getTicketHistory(this.sessionId).subscribe(data => {
      
      if (data.length > 0) {
        this.reply = data[0].message ? data[0].message : '';
        this.ticketHistory = data;
        this.ticketCount = data.length;
        this.totalTicketCount = data.length;
        if (this.ticketCount == 0) this.ticketCount = 0;
        else if (this.ticketCount < 3) this.ticketCount = data.length;
        else this.ticketCount = data.length - 2;
        ticketSequence = data[0].ticket_sequence;
        this.updateHistoryId = data[0].id;
      }
    });
  }

  addTicketHistory() {
    this.submitted = true;
    const credentials = this.ticketForm.value;
    credentials.reply_by = localStorage.getItem('user_name');
    credentials.ticket_id = this.sessionId;
    credentials.reply = credentials.reply ? credentials.reply : credentials.message;
    if (credentials.reply == "") {
      this.toastr.error('Error!', commentError, { timeOut: 2000 });
      return;
    }
    credentials['uId'] = (this.role == '1') ? this.userId : localStorage.getItem('id');
    credentials['updateHistoryId'] = (this.glbVal == 2) ? this.updateHistoryId : null;
    credentials['ticket_number'] = this.ticket_number;
    credentials['product'] = productName;
    credentials['ticket_type_history'] = (this.old_tktTyp != credentials['ticket_type']) ? credentials['ticket_type'] : null;
    credentials['description'] = this.ticketData.message;
    credentials.assigned_to = (this.role == '0' || this.role == '4') ? credentials.assigned_to : this.accountManagerId;
    if (this.role == '4') {
      credentials['assignedPerson'] = localStorage.getItem('id');
    } else if (this.role == '1') {
      credentials['assignedPerson'] = this.internalUserId;
    } else if (this.role == '5') {
      credentials['assignedPerson'] = this.managerId;
    } else {
      credentials['assignedPerson'] = credentials.assigned_to;
    }

    if (credentials.ticket_type == '0') credentials['ticket_type_name'] = 'New Feature'
    else if (credentials.ticket_type == '1') credentials['ticket_type_name'] = 'Issue'
    else if (credentials.ticket_type == '2') credentials['ticket_type_name'] = 'Others'

    if (this.role != '1') {
      if (credentials['status'] == '1') credentials['status'] = '2';
      else if (credentials['status'] == '2') credentials['status'] = '2';
      else if (credentials['status'] == '3') credentials['status'] = '2';
      else if (credentials['status'] == '4') credentials['status'] = '2';
      else credentials['status'] = '0';
    }
    this.ticketService.ticketHistory(credentials).subscribe(data => {
      this.toastr.success('Success!', commentAdded, { timeOut: 2000 });
      this.ticketForm.controls['reply'].setValue('');
      this.router.navigateByUrl('ticket/view');
      this.getTicketHistory();
    }, err => {
      this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
      this.errors = err.message;
    });
  }

  test1() {
    this.flag = false
  }

  test(val) {
    this.glbVal = val;

  }

  test3() {
    this.openFlag = 0;
  }

  messageBox() {
    this.flag = true;
    this.openFlag = 1;
  }

  showTicketHistory() {
    this.showTicket = !this.showTicket;
    this.showTicketCount = false;
    this.buttonName = this.showTicket ? "Show" : "Hide";
  }

  enableLastMessage(e) {
    this.lastMessage = true;
    this.openFlag = 2;
  }

  selectStatus(status) {
    if (status.value != '2') this.messageBox();
  }

  selectType(type) {
    this.messageBox();
  }

  selectAssignee() {
    this.messageBox();
  }

  cancelForm() {
    this.router.navigateByUrl('ticket/view');
  }
}