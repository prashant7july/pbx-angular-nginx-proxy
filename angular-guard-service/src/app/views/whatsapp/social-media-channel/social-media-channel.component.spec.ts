import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaChannelComponent } from './social-media-channel.component';

describe('SocialMediaChannelComponent', () => {
  let component: SocialMediaChannelComponent;
  let fixture: ComponentFixture<SocialMediaChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialMediaChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialMediaChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
