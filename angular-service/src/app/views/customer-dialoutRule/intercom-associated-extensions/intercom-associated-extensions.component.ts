import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerDialoutServiceService } from '../customer-dialout-service.service';

@Component({
  selector: 'app-intercom-associated-extensions',
  templateUrl: './intercom-associated-extensions.component.html',
  styleUrls: ['./intercom-associated-extensions.component.css']
})
export class IntercomAssociatedExtensionsComponent implements OnInit {

  extensionDetails: any = [];
  name : any;

  constructor(
    private CustomerDialoutServiceService: CustomerDialoutServiceService,
    private route: ActivatedRoute

  ) { }

  ngOnInit() {
    let id = this.route.snapshot.queryParams.id;
    console.log(id,"----id");
    

    
this.CustomerDialoutServiceService.getAssociatedExtensions(id).subscribe(data=>{
  

  this.extensionDetails = data;
  console.log(this.extensionDetails,"----data---");
  this.name = this.extensionDetails['name']

})
    
  }

}
