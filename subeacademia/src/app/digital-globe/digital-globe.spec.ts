import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalGlobe } from './digital-globe';

describe('DigitalGlobe', () => {
  let component: DigitalGlobe;
  let fixture: ComponentFixture<DigitalGlobe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalGlobe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalGlobe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
