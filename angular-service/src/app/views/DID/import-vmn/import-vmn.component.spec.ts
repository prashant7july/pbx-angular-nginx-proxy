import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportVmnComponent } from './import-vmn.component';

describe('ImportVmnComponent', () => {
  let component: ImportVmnComponent;
  let fixture: ComponentFixture<ImportVmnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportVmnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportVmnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
