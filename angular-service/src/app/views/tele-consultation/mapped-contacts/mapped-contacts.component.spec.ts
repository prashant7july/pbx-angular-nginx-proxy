import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappedContactsComponent } from './mapped-contacts.component';

describe('MappedContactsComponent', () => {
  let component: MappedContactsComponent;
  let fixture: ComponentFixture<MappedContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappedContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappedContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
