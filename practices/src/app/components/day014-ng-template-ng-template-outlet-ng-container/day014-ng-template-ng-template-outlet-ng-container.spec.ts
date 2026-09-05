import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day014NgTemplateNgTemplateOutletNgContainer } from './day014-ng-template-ng-template-outlet-ng-container';

describe('Day014NgTemplateNgTemplateOutletNgContainer', () => {
  let component: Day014NgTemplateNgTemplateOutletNgContainer;
  let fixture: ComponentFixture<Day014NgTemplateNgTemplateOutletNgContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day014NgTemplateNgTemplateOutletNgContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(Day014NgTemplateNgTemplateOutletNgContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
