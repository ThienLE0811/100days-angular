import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day013ContentProjectionInAngular } from './day013-content-projection-in-angular';

describe('Day013ContentProjectionInAngular', () => {
  let component: Day013ContentProjectionInAngular;
  let fixture: ComponentFixture<Day013ContentProjectionInAngular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day013ContentProjectionInAngular],
    }).compileComponents();

    fixture = TestBed.createComponent(Day013ContentProjectionInAngular);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the main component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with survey questions and correct statistics', () => {
    expect(component.surveyQuestions().length).toBe(5);
    expect(component.totalQuestions()).toBe(5);
    // Initially 3 questions are checked: q1, q3, q4
    expect(component.agreedCount()).toBe(3);
    expect(component.completionPercent()).toBe(60);
  });

  it('should update agreedCount when toggling a question', () => {
    // Toggle q2 (which was initially false) to true
    component.onQuestionToggle('q2', true);
    fixture.detectChanges();

    expect(component.agreedCount()).toBe(4);
    expect(component.completionPercent()).toBe(80);
    expect(component.lastActionMessage()).toContain('Bật thông báo đẩy qua Email?');

    // Toggle q1 (which was true) to false
    component.onQuestionToggle('q1', false);
    fixture.detectChanges();

    expect(component.agreedCount()).toBe(3);
    expect(component.completionPercent()).toBe(60);
  });

  it('should toggle parent order reversal for multi-slot demo', () => {
    expect(component.isParentOrderReversed()).toBe(false);
    component.toggleParentOrder();
    expect(component.isParentOrderReversed()).toBe(true);
    expect(component.lastActionMessage()).toContain('đảo lộn');

    component.toggleParentOrder();
    expect(component.isParentOrderReversed()).toBe(false);
  });

  it('should toggle ngProjectAs state', () => {
    expect(component.useProjectAs()).toBe(true);
    component.toggleProjectAs();
    expect(component.useProjectAs()).toBe(false);
    expect(component.lastActionMessage()).toContain('TẮT ngProjectAs');

    component.toggleProjectAs();
    expect(component.useProjectAs()).toBe(true);
    expect(component.lastActionMessage()).toContain('BẬT ngProjectAs');
  });

  it('should increment card likes and toggle bookmark', () => {
    const initialLikes = component.cardLikes();
    component.toggleLike();
    expect(component.cardLikes()).toBe(initialLikes + 1);

    expect(component.isBookmarked()).toBe(false);
    component.toggleBookmark();
    expect(component.isBookmarked()).toBe(true);
    component.toggleBookmark();
    expect(component.isBookmarked()).toBe(false);
  });

  it('should manage lifecycle logs', () => {
    component.addLifecycleLog('Test log message');
    expect(component.lifecycleLogs()[0]).toBe('Test log message');

    component.clearLogs();
    expect(component.lifecycleLogs().length).toBe(0);
  });
});
