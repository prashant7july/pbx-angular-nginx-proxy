import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-associate-provider',
  templateUrl: './associate-provider.component.html',
  styleUrls: ['./associate-provider.component.css']
})
export class AssociateProviderComponent implements OnInit {
  providerData ={};
  didArr =[];
  gatewayIpArr = [];
  gatewayDomainArr =[];
  provider ;
  isDID : boolean ;
  isIP : boolean ;
  isDomain : boolean ;

  constructor(
    private route: ActivatedRoute,

  ) { }

  ngOnInit() {

   this.providerData =  this.route.snapshot.queryParams;
   
   
   

   this.didArr =this.providerData['did_number'] ? this.providerData['did_number'].split(',') : '';
   this.gatewayIpArr = this.providerData['gateways'] ? this.providerData['gateways'].split(','): '';
  //  this.gatewayDomainArr =this.providerData['gateway_domain'] ? this.providerData['gateway_domain'].split(","): '';
   this.provider = this.providerData['provider'];

   this.isDID = this.didArr.length > 0 ? true : false;
   this.isIP = this.gatewayIpArr.length > 0 ? true : false;
   this.isDomain = this.gatewayDomainArr.length > 0 ? true : false;
   
   
   
   

  //  if(this.providerData)

   

    
    
  }

}
