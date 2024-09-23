import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-providers',
  templateUrl: './view-providers.component.html',
  styleUrls: ['./view-providers.component.css']
})
export class ViewProvidersComponent implements OnInit {
  associateSMS = [];
  headerName = '';
  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {            
    this.headerName = this.route.snapshot.queryParams['providerName'];
    this.route.data.subscribe(data => {            
      data['userData']['smsDetail'].map(item => {
        this.associateSMS.push({name: item.name})
      })                  
    })        
  }

}
