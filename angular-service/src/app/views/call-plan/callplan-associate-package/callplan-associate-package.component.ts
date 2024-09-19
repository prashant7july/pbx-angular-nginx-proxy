import { Component, OnInit } from '@angular/core';
import { CallplanService } from '../callplan.service';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot,ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-callplan-associate-package',
  templateUrl: './callplan-associate-package.component.html',
  styleUrls: ['./callplan-associate-package.component.css']
})
export class CallplanAssociatePackageComponent implements OnInit {
  callplan = '';
  package = '';
  packageDetail = [];

  constructor( private callplanService: CallplanService,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    let id = this.route.snapshot.queryParams.id;
    
    let flag = '0';
    this.callplanService.getAssociatePackageDetail(id,flag).subscribe(data =>{
      
      this.callplan = data['response'][0]['callplan'];
      this.packageDetail = data.response;
  
      
    })

  }

}
