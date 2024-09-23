import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeleConsultationCdrComponent } from './tele-consultation-cdr.component';

describe('TeleConsultationCdrComponent', () => {
  let component: TeleConsultationCdrComponent;
  let fixture: ComponentFixture<TeleConsultationCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeleConsultationCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeleConsultationCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
