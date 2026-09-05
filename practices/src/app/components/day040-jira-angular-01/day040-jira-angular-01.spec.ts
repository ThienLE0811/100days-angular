import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day040JiraAngular01 } from './day040-jira-angular-01';

describe('Day040JiraAngular01', () => {
  let component: Day040JiraAngular01;
  let fixture: ComponentFixture<Day040JiraAngular01>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day040JiraAngular01],
    }).compileComponents();

    fixture = TestBed.createComponent(Day040JiraAngular01);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
