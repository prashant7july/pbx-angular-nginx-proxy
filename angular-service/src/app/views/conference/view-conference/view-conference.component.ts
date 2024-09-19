import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ConferenceService } from '../conference.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Conference } from '../../../core/models/conference.model';
import { CommonService, equalPin, formError, joiningComparison } from '../../../core';
import { ContactListService } from '../../contact-list/contact-list.service';
import { PromptsService } from '../../prompts/prompts.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-view-conference',
  templateUrl: './view-conference.component.html',
  styleUrls: ['./view-conference.component.css']
})
export class ViewConferenceComponent implements OnInit {
  error = '';
  isFilter = false;
  filterForm: FormGroup;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  todayDate = new Date();
  bsValue = new Date();
  bsRangeValue: Date[];
  defaultPageSize = '10';

  constructor(private router: Router,
    private fb: FormBuilder,
    private conferenceService: ConferenceService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
  ) {
    this.todayDate.setDate(this.todayDate.getDate() + 0);
    this.bsRangeValue = [this.bsValue, this.todayDate];
    this.filterForm = this.fb.group({
      'name': [""],
      'conf_ext': [""],
      'by_range': [""],
      'admin_pin': [""],
      'participant_pin': [""]
    });
  }

  ngOnInit() {
    this.conferenceService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'conf_ext', headerName: 'Conf Exten', hide: false, width: 15 },
      { field: 'conf_join_start_date', headerName: 'Conf Join Start Date', hide: false, width: 25 },
      { field: 'conf_join_end_date', headerName: 'Conf Join End Date', hide: false, width: 25 },
      { field: 'admin_pin', headerName: 'Admin PIN', hide: false, width: 15 },
      { field: 'participant_pin', headerName: 'Participant PIN', hide: false, width: 20 },
      { field: 'recordingDisplay', headerName: 'Recording', hide: false, width: 15 },


    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.admin_pin = Number(credentials.admin_pin);
      credentials.conf_ext = Number(credentials.conf_ext);
      credentials.participant_pin = Number(credentials.participant_pin);

      this.conferenceService.filterConferencelist({ credentials: credentials, id: Number(localStorage.getItem('id')) }).subscribe(data => {

        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.conferenceService.viewConference({ id: null, name: null, adminPin: null, participantPin: null, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
  }


  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(data) {

    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      let conf_ext = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if (data[i]['status'] == '1') {
        finalBtn += "<i class='fa fa-circle active-button' style='cursor:pointer; display: inline' data-action-type='active' title='Active'></i>";
      }
      finalBtn += "</span>";
      conf_ext += data[i].conf_ext;
      data[i]['conf_ext'] = conf_ext;
      data[i]['action'] = finalBtn;
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
    }
  }

  editData(event) {
    this.openDialog(event.id);
  }


  deleteData(event) {
    this.conferenceService.getConferenceCount(event.id).subscribe(data => {
      if (data.count > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> conference can't be deleted because it is " + data['message'],
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover Conference </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.conferenceService.deleteConference({ 'id': event.id }).subscribe(data => {
              this.displayAllRecord();
            },
              err => {
                this.error = err.message;
              });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html: "<span style='color:#FFFFFF;'>Conference </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>conference </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 3000
            });
          }
        })
      }
    })
  }


  openDialog(id?): void {
    const dialogRef = this.dialog.open(ConferenceDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoConferenceDialog, {
      width: '80%', disableClose: true, autoFocus: false,
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
  selector: 'infoConference-dialog',
  templateUrl: 'infoConference-dialog.html',
})

export class InfoConferenceDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoConferenceDialog>, @Inject(MAT_DIALOG_DATA) public data: Conference,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'conference-dialog',
  templateUrl: 'conference-dialog.html',
})

export class ConferenceDialog {
  @ViewChild('dataSelect', { static: true }) dataSelect: MultiSelect;
  conferenceForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  contactlist: any[] = [];
  SelectPartFilter: any;
  filterPart: any;
  selectedContactList: any[] = [];
  selectedMOHValue = [];
  MOHselected = [];
  MOHFilter: any;
  filter: any;
  selectedConferenceValue = [];
  allselectedconference = [];
  WelcomeFilter: any;
  filters: any;
  validParticipantPin = false;
  productFeatures = "";
  selectContact: any;
  moh = 0;
  recording = 0;
  minDate: Date;
  minEndDate: Date;
  conferenceData: any = {};
  public participantArr = [];
  addPar: any = {};
  arrP = [];
  data1: Date;
  endDateValue: Date;
  todayDate: Date;
  conferenceName = false;
  adminPIN: any;
  participantPIN: any;
  errorField: any;
  mySelections: any;
  welcomePrompt = 0;
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public popupHeight: string = '200px';
  public popupWidth: string = '220px';
  public fields: Object = { text: 'prompt_name', value: 'id' };
  public fields2: Object = { text: 'prompt_name', value: 'id' };
  public fields3: Object = { text: 'label', value: 'value.id' };
  public placeholder: string = 'Welcome Prompt';
  public placeholder2: string = 'MOH';
  public placeholder3: string = 'Select Participants';

  constructor(
    public dialogRef: MatDialogRef<ConferenceDialog>, @Inject(MAT_DIALOG_DATA) public data: Conference,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private conferenceService: ConferenceService,
    private contactListService: ContactListService,
  ) {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());

    this.conferenceForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'conf_ext': ['', [Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.min(1000)]],
      'conf_join_start_date': ['', Validators.required],
      'conf_join_end_date': ['', Validators.required],
      'admin_pin': [this.getRandomPin(), [Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.min(10000)]],
      'participant_pin': [this.getRandomPin(), [Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.min(10000)]],
      'recording': [''],
      'welcome_prompt': ['0'],
      'moh': ['0'],
      'participant': ['', Validators.required],
      'participantValue': [''],
      'end_conf': [''],
      'name_record': [''],
      'wait_moderator': ['']
    });
  }

  get name() { return this.conferenceForm.get('name'); }
  get conf_ext() { return this.conferenceForm.get('conf_ext'); }
  get conf_join_start_date() { return this.conferenceForm.get('conf_join_start_date'); }
  get conf_join_end_date() { return this.conferenceForm.get('conf_join_end_date'); }
  get admin_pin() { return this.conferenceForm.get('admin_pin'); }
  get participant_pin() { return this.conferenceForm.get('participant_pin'); }
  get participant() { return this.conferenceForm.get('participant'); }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;

  }



  ngOnInit() {
    this.mode = 'CheckBox';
    this.selectAllText = 'Select All';
    this.todayDate = new Date();
    this.endDate(new Date());
    this.getRandomPin();
    //add Participants
    if (!this.data.id) {
      this.contactListService.getCustomerEmailContact(localStorage.getItem('id')).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.contactlist.push({ label: data[i].name + ' - ' + data[i].email, value: { id: data[i].id + '/' + data[i].name + ' = ' + data[i].email, name: data[i].name + ' - ' + data[i].email } });
          this.filterPart = this.SelectPartFilter = this.contactlist.slice();

        }
      }, err => {
        this.error = err.message;
      });
    }
    //showing moh and recording
    this.commonService.getCustomerProductFeatures(localStorage.getItem('id')).subscribe(data => {
      this.productFeatures = data.response[0];
      this.welcomePrompt = data.response[0].custom_prompt == '1' ? 1 : 0;
      this.moh = (data.response[0].custom_prompt == '1' && data.response[0].music_on_hold == '1') ? 1 : 0;
      this.recording = data.response[0].storage == '0' ? 0 : data.response[0].recording;
    }, err => {
      this.error = err.message;
    });

    //get moh from prompt
    this.promptsService.getMOHPrompt(localStorage.getItem('id')).subscribe(data => {
      this.MOHselected = this.selectedMOHValue = data.response;
      this.MOHselected.unshift({ id: 0, prompt_name: 'default' })
      this.filter = this.MOHFilter = this.selectedMOHValue.slice();
    }, err => {
      this.error = err.message;
    });

    //get conference from prompt    

    if (this.data.id) {
      this.participantArr = [];
      this.contactlist = [];
      this.filterPart = this.SelectPartFilter = this.contactlist.slice();

      this.arrP = [];
      this.promptsService.getConferencePrompt(localStorage.getItem('id')).subscribe(data => {
        // this.selectedConferenceValue = data.response ? sdata.response : [];
        if (data.response && this.welcomePrompt == 1) {          
          this.selectedConferenceValue = data.response;
        } else if (this.welcomePrompt == 0) {          
          this.selectedConferenceValue.unshift({ prompt_name: 'default', id: '0' });
        } else {
          this.selectedConferenceValue = [];
        }
        // this.result = this.selectedConferenceValue.trim()
        this.filters = this.WelcomeFilter = this.selectedConferenceValue.slice();
      }, err => {
        this.error = err.message;
      });
      this.conferenceService.viewConference({ id: this.data.id, name: null, adminPin: null, participantPin: null, 'customer_id': localStorage.getItem('id') }).subscribe(data => {
        this.conferenceData = data[0];

        this.conferenceData.welcome_prompt = this.conferenceData.welcome_prompt == 0 ? '0' : this.conferenceData.welcome_prompt;
        this.todayDate = data[0].conf_join_start_date;
        this.endDateValue = data[0].conf_join_end_date;
        this.conferenceName = data[0].name;
        this.adminPIN = data[0].admin_pin;
        this.participantPIN = data[0].participant_pin;

        this.addPar = data
        let splitPart = [];
        for (let i = 0; i < this.addPar.length; i++) {
          splitPart = this.addPar[i].participant.split(",");
          this.participantArr.push(splitPart);
        }

        let str = [];
        let arr = [];
        str = this.participantArr[0];
        let res = "";
        this.contactlist = [];
        this.filterPart = this.SelectPartFilter = this.contactlist.slice();
        for (let i = 0; i < str.length; i++) {
          res = str[i].split("/");
          arr.push(res[1]);

          this.contactlist.push({ label: res[1], value: str[i] });
          this.filterPart = this.SelectPartFilter = this.contactlist.slice();
          this.arrP.push({ label: res[1], value: { id: str[i], name: res[1] } });
        }
        this.selectContact = arr;
        this.selectedContactList = [];
        this.contactlist.map((item) => {

          this.selectedContactList.push(item.value)
        });
        this.filterPart = this.SelectPartFilter = this.contactlist.slice();

        // this.dataSelect.maxSelectionLimitReached = this.selectedContactList.length >= 5;
      }, err => {
        this.error = err.message;
      });


      //add Participants
      let mergeArr = [];
      this.contactListService.getCustomerEmailContact(localStorage.getItem('id')).subscribe(data => {
        setTimeout(() => {
          for (let i = 0; i < data.length; i++) {
            mergeArr.push({ label: data[i].name + ' - ' + data[i].email, value: { id: data[i].id + '/ ' + data[i].name + ' = ' + data[i].email, name: data[i].name + '- ' + data[i].email } });
          }
          for (let j = 0; j < this.arrP.length; j++) {
            for (let i = 0; i < mergeArr.length; i++) {
              if (this.arrP[j].value == mergeArr[i].value) {
                mergeArr.splice(i, 1);
              }
            }
          }

          this.contactlist = mergeArr;
          this.filterPart = this.SelectPartFilter = this.contactlist.slice();

        }, 200);
      }, err => {
        this.error = err.message;
      });
    } else {
      this.conferenceData.moh = 0;
      this.promptsService.getConferencePrompt(localStorage.getItem('id')).subscribe(data => {
        //  this.selectedConferenceValue = data.response ? data.response : [];
        if (data.response && this.welcomePrompt == 1) {          
          this.selectedConferenceValue = data.response;
        } else if (this.welcomePrompt == 0) {          
          this.selectedConferenceValue.unshift({ prompt_name: 'default', id: '0' });
        } else {
          this.selectedConferenceValue = [];
        }
        // this.result = this.selectedConferenceValue.trim()
        if (this.selectedConferenceValue.length > 0) this.conferenceForm.get('welcome_prompt').setValue(this.selectedConferenceValue[0]['id']);
      });
    }
  }

  removedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedConferenceValue.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  mohremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.MOHselected.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }
  Participantsremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.contactlist.filter((data) => {
      return data['label'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }

  submitConferenceForm() {

    this.checkForm = this.findInvalidControls();

    if (this.conferenceForm.valid) {
      this.submitted = true;
      const credentials = this.conferenceForm.value;
      credentials.conf_ext = Number(credentials.conf_ext);          
      credentials.customer_id = Number(localStorage.getItem('id'));
      let val = [];
      let email = credentials.participant;

      email.map(data => {
        val.push(data.split('=')[1]);
      })

      credentials['email'] = val;


      if (credentials.conf_join_end_date < credentials.conf_join_start_date) {
        this.toastr.error('Error!', joiningComparison, { timeOut: 4000 });
        return;
      }
      let str1 = [];
      let arr1 = [];
      str1 = credentials.participant;


      let res1 = "";
      for (let i = 0; i < str1.length; i++) {
        res1 = str1[i].split("/");
        arr1.push(res1[0]);
      }
      credentials.participant = arr1;
      credentials.participant = credentials.participant.map(item => Number(item));

      credentials.id = Number(this.data.id) ? Number(this.data.id) : null;

      if (credentials.admin_pin != credentials.participant_pin) {
        this.conferenceService.viewConference({ id: null, name: null, adminPin: credentials.admin_pin, participantPin: null, 'customer_id': localStorage.getItem('id') }).subscribe(data => {
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.conferenceForm.controls['admin_pin'].setValue('');
            credentials.admin_pin = '';
            return;
          } else {
            this.conferenceService.viewConference({ id: null, name: credentials.name, adminPin: null, participantPin: null, 'customer_id': localStorage.getItem('id') }).subscribe(data => {
              if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
                this.errorField = data[0].MESSAGE_TEXT;
                this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
                this.conferenceForm.controls['name'].setValue('');
                credentials.name = '';
                return;
              } else {
                this.conferenceService.viewConference({ id: null, name: null, adminPin: null, participantPin: credentials.participant_pin, 'customer_id': localStorage.getItem('id') }).subscribe(data => {
                  if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
                    this.errorField = data[0].MESSAGE_TEXT;
                    this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
                    this.conferenceForm.controls['participant_pin'].setValue('');
                    credentials.participant_pin = '';
                    return;
                  } else {
                    this.commonService.getExten({ extenid: parseInt(credentials.conf_ext), 'customer_id': localStorage.getItem('id') }).subscribe(data => {
                      if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
                        this.errorField = data[0].MESSAGE_TEXT;
                        this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
                        this.conferenceForm.controls['conf_ext'].setValue('');
                        credentials.conf_ext = '';
                      } else {
                        
                        credentials.moh_name = this.selectedMOHValue.filter(item => item.id == credentials.moh).length ? this.selectedMOHValue.filter(item => item.id == credentials.moh)[0].prompt_name : "";
                        credentials.welcome_prompt_name = this.selectedConferenceValue.filter(item => item.id == credentials.welcome_prompt).length ? this.selectedConferenceValue.filter(item => item.id == credentials.welcome_prompt)[0].prompt_name : "";
                        this.conferenceService.createConference('createConference', credentials)
                          .subscribe(data => {
                            if (data['code'] == 200) {
                              this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                              this.cancelForm();
                            }
                            else {
                              this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                            }
                          });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      } else {
        this.toastr.error('Error!', equalPin, { timeOut: 2000 });
        return;
      }
    }
    else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  cancelForm() {
    this.conferenceForm.reset();
    this.conferenceService.updateGridList();
    this.dialogRef.close();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.conferenceForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  getRandomPin() {
    var randomstring: any;
    randomstring = Math.floor(10000 + Math.random() * 90000);
    this.adminPIN = randomstring;
    this.participantPIN = randomstring + 575;
    return randomstring;
    // var chars = "123456789";
    // var string_length = 5;
    // var randomstring = '';
    // for (var i = 0; i < string_length; i++) {
    //   var rnum = Math.floor(Math.random() * chars.length);
    //   randomstring += chars.substring(rnum, rnum + 1);
    // }
    // this.adminPIN = randomstring;
    // let num2 = '250';
    // this.participantPIN = (+randomstring) + (+num2);
    // return randomstring;


  }

  endDate(value: Date): void {
    this.data1 = value;
    this.data1.setMinutes(this.data1.getMinutes() + 15);
    this.endDateValue = this.data1;
  }

  onSelect(e) {
    let mykeyword = new Date();
    mykeyword = e;
    let d2 = new Date(mykeyword);
    d2.setTime(d2.getTime() + (15 * 60 * 1000));
    this.endDateValue = d2;
  }



  selectedOption() {
    let partArr = [];
    let res = "";
    let str = [];
    if (this.participant.value.id.length <= 5) {
      this.mySelections = this.participant.value.id; // restrict selected option
      str = this.conferenceForm.controls['participant'].value;
      for (let i = 0; i < str.length; i++) {
        res = str[i].split("/");
        partArr.push(res[1]);
      }
      this.selectContact = partArr;
    } else {
      this.participant.setValue(this.mySelections);
    }
  }
}
