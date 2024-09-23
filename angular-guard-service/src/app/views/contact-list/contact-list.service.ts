import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { ContactList } from '../../core/models/contactList.model';
import { ContactGroup } from 'src/app/core/models/contactGroup.model';

@Injectable({
  providedIn: 'root'
})
export class ContactListService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createContact(type, credentials): Observable<ContactList> {
    return this.apiService.post('contactList/createContact', { contactList: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getContactList(cond) {
    return this.apiService.post(`contactList/viewContactList`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  deleteContact(id) {
    return this.apiService.post(`contactList/deleteContact?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }


  copyToBlackList(cond) {
    return this.apiService.post('contactList/copyToBlackList',cond).pipe(map(data => {
      return data.response;
    }));
  }
  
  filterContactList(filters,id,role) {
    const url = `contactList/getContactListByFilters`;
    return this.apiService.post(url, {filters,id,role}).pipe(map(data => {
      return data.response;
    }));
  }

  getCustomerEmailContact(customerId) {
    const url = `contactList/getCustomerEmailContact?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  click2Call(cond) {
    return this.apiService.postBackEndAPI('esl_api',cond).pipe(map(data => {
      return data;
    }));
  }

  getclick2CallStatus(uuid) {
    const url = `c2c/getStatus?uuid=${uuid}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  //--------------------------------- Contact Group -------------------------------------------

 createContactGroup(type, credentials): Observable<ContactGroup> {
    return this.apiService.post('contact/createContactGroup', { contactGroup: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
  getContactGroups(cond) {
    return this.apiService.get(`contact/viewContactGroup?id=${cond}`).pipe(map(data => {
      return data.response; 
    }));
  }
  getContactGroupByID(id) {
    return this.apiService.get(`contact/viewGroup?id=${id}`).pipe(map(data => {
      return data.response; 
    }));
  }

  updateContactGroup(type, credentials): Observable<ContactGroup> {
    return this.apiService.post('contact/updateContactGroup', { contactGroup: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  updateContactGroupWithContacts(type, credentials): Observable<ContactGroup> {
    return this.apiService.post('contact/updateContactGroupWithContact', { contactGroup: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkContactInGroup(groupID){
    return this.apiService.get(`contact/getContactFromGroup?id=${groupID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  addContactInGroup( credentials) {
    return this.apiService.post('contact/createContactInGroup', { contactGroup: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getAllContactInGroup(groupID){
    return this.apiService.get(`contact/getAllContactFromGroup?id=${groupID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  getAssociatedUser(groupID){
    return this.apiService.get(`contact/getAssociatedUser?id=${groupID}`).pipe(map(data=>{     //akshay
      return data.response;
    }))
  }

  filterContactGroups(customerID,filters) {
    
    return this.apiService.post(`contact/getContactGroupByFilters?id=${customerID}`, { filters: filters })
    .pipe(map(
      data => {
        return data.response;
      }, err => {
        this.errors = err;
      }
    ));
  }

  checkGroupNameExist(groupName, customerId, groupId){
    return this.apiService.get(`contact/getGroupName?gn=${groupName}&id=${customerId}&gid=${groupId}`).pipe(map(data => {
      return data.response; 
    }));
  }

  isContactAssociate(customerId){
    return this.apiService.get(`contact/isContactAssociateGroup?id=${customerId}`).pipe(map(data => {
      return data.response; 
    }));
  }

  deleteContactGroup(id) {
    return this.apiService.post(`contactList/deleteContactGroup?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }
  // getMappingContactList(cond) {
  //   return this.apiService.post(`contact/getMappingContactList`, cond).pipe(map(data => {
  //     return data.response;
  //   }));
  // }


}
