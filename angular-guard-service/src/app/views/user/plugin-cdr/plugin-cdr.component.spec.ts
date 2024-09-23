import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginCDRComponent } from './plugin-cdr.component';

describe('PluginCDRComponent', () => {
  let component: PluginCDRComponent;
  let fixture: ComponentFixture<PluginCDRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PluginCDRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginCDRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
