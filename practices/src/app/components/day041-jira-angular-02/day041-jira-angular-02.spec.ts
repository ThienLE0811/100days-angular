import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day041JiraAngular02 } from './day041-jira-angular-02';

describe('Day041JiraAngular02', () => {
  let component: Day041JiraAngular02;
  let fixture: ComponentFixture<Day041JiraAngular02>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day041JiraAngular02],
    }).compileComponents();

    fixture = TestBed.createComponent(Day041JiraAngular02);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
