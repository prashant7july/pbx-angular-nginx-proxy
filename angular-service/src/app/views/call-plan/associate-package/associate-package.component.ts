import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute  } from '@angular/router';
import { emailCategoryCreated } from 'src/app/core';
@Component({
  selector: 'app-associate-package',
  templateUrl: './associate-package.component.html',
  styleUrls: ['./associate-package.component.css']
})
export class AssociatePackageComponent implements OnInit {
packageDetail = [];
planName;
  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {        
    this.planName = this.route.snapshot.queryParams.name;
    this.route.data.subscribe(result => {
      
      result['packageData']['package'].map(name => {        
        this.packageDetail.push({name: name.company_name,
        email: name.email,
        mobile: name.mobile,
        package: name.package
      });
      })
    })
  }

}
