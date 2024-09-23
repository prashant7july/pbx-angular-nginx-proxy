import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappTemplateComponent } from './whatsapp-template.component';

describe('WhatsappTemplateComponent', () => {
  let component: WhatsappTemplateComponent;
  let fixture: ComponentFixture<WhatsappTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
