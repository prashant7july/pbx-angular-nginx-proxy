import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-associate-did',
  templateUrl: './view-associate-did.component.html',
  styleUrls: ['./view-associate-did.component.css']
})
export class ViewAssociateDIDComponent implements OnInit {

  userList = [];
  vmnNumber = '';
  constructor(private route: ActivatedRoute,) { }

  ngOnInit() {
    this.vmnNumber = this.route.snapshot.queryParams.vmn_number || '';    
    this.route.data.subscribe(data => {      
      this.userList = data['didData'];
    });
  }

}
