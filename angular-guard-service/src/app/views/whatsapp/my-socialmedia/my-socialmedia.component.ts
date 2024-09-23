import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactListService } from '../../contact-list/contact-list.service';
import { WhatsAppService } from '../whatsapp-template/whatsapp.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';




@Component({
  selector: 'app-my-socialmedia',
  templateUrl: './my-socialmedia.component.html',
  styleUrls: ['./my-socialmedia.component.css']
})
export class MySocialmediaComponent implements OnInit {

  defaultPageSize = '10';


  constructor(
    public dialog: MatDialog,
    private whatsappService: WhatsAppService,

  ) { }

  ngOnInit() {   
  }

  addMySocialMedia () {
    this.openDialog(null)
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddMySocialMediaDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}


@Component({
  selector: 'my-socialMedia-dialog',
  templateUrl: './my-socialMedia-dialog.html'  
})

export class AddMySocialMediaDialog implements OnInit{

  contactList: any = [];
  providerList: any = [];
  public fields: Object = { text: 'display_list_phone_number', value: 'id' };
  placeholder = 'Contact List'; 
  placeholder1 = 'Provider List'; 
  placeholder2 = 'Template List'; 
  public fields1: Object = { text: 'provider_name', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '250px'; 
  MySocialForm: FormGroup;
  templateList: any = [];
  checkProvider : any = false;

  constructor(
    public dialogRef: MatDialogRef<AddMySocialMediaDialog>, @Inject(MAT_DIALOG_DATA) public data, 
    private contactService: ContactListService,
    private whatsappService: WhatsAppService,
    private fb: FormBuilder
  ) { 
    this.MySocialForm  = this.fb.group({
      'provider': [""],
      "template": [""]
    })
   }
   
   ngOnInit() {     
    let extension_id = localStorage.getItem('id');
    this.contactService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': null, 'extension_id': extension_id, 'role': localStorage.getItem('type') }).subscribe(data => {            
      this.contactList = data;
    })           

    this.whatsappService.getProviderList().subscribe(data => {            
      this.providerList = data;
    });
    
  }

  chooseProvider(e){
    this.checkProvider = true;    
    let customer_id = localStorage.getItem('cid');
    this.whatsappService.getTemplate(e.value, customer_id).subscribe(data => {  
      this.templateList = data;    
    })
  }


  cancleDialog(): void {
    this.dialogRef.close();
  } 

  cancelForm() {   
  } 

}
