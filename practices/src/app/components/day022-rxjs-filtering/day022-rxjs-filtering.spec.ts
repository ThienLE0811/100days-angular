import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day022RxjsFiltering } from './day022-rxjs-filtering';

describe('Day022RxjsFiltering', () => {
  let component: Day022RxjsFiltering;
  let fixture: ComponentFixture<Day022RxjsFiltering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day022RxjsFiltering],
    }).compileComponents();

    fixture = TestBed.createComponent(Day022RxjsFiltering);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create Day022RxjsFiltering component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter even numbers with filter()', () => {
    component.runFilterDemo('filter-even');
    expect(component.basicFilterResults.length).toBe(3); // 2, 4, 6
    expect(component.basicFilterResults[0].value).toBe(2);
    expect(component.basicFilterResults[1].value).toBe(4);
    expect(component.basicFilterResults[2].value).toBe(6);
  });

  it('should emit first element with first()', () => {
    component.runFilterDemo('first');
    expect(component.basicFilterResults.length).toBe(1);
    expect(component.basicFilterResults[0].value).toBe(1);
  });

  it('should emit last element with last()', () => {
    component.runFilterDemo('last');
    expect(component.basicFilterResults.length).toBe(1);
    expect(component.basicFilterResults[0].value).toBe(6);
  });

  it('should find first even number with find()', () => {
    component.runFilterDemo('find');
    expect(component.basicFilterResults.length).toBe(1);
    expect(component.basicFilterResults[0].value).toBe(2);
  });

  it('should succeed with single() on exactly 1 matching item', () => {
    component.runFilterDemo('single-success');
    expect(component.basicFilterResults.length).toBe(1);
    expect(component.basicFilterResults[0].value).toBe(2);
    expect(component.basicErrorMsg).toBe('');
  });

  it('should catch error with single() when multiple items match', () => {
    component.runFilterDemo('single-error');
    expect(component.basicErrorMsg).toBeTruthy();
  });

  it('should take 2 items with take(2)', () => {
    component.runTakeSkipDemo('take-2');
    expect(component.takeSkipResults.length).toBe(2);
    expect(component.takeSkipResults[0].value).toBe(1);
    expect(component.takeSkipResults[1].value).toBe(2);
  });

  it('should skip 2 items with skip(2)', () => {
    component.runTakeSkipDemo('skip-2');
    expect(component.takeSkipResults.length).toBe(3); // 3, 4, 5
    expect(component.takeSkipResults[0].value).toBe(3);
    expect(component.takeSkipResults[1].value).toBe(4);
    expect(component.takeSkipResults[2].value).toBe(5);
  });

  it('should filter distinct numbers with distinct() and distinctUntilChanged()', () => {
    // distinct(): [1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4] -> [1, 2, 3, 4]
    component.runDistinctNumbers('distinct-all');
    expect(component.distinctResults.length).toBe(4);

    // distinctUntilChanged(): [1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4] -> [1, 2, 1, 2, 3, 4]
    component.runDistinctNumbers('distinct-until-changed');
    expect(component.distinctResults.length).toBe(6);
  });

  it('should start and stop takeUntil demo correctly', () => {
    component.startTakeUntilDemo();
    expect(component.isTakeUntilActive).toBe(true);

    component.triggerTakeUntilNotifier();
    expect(component.isTakeUntilActive).toBe(false);
  });

  it('should increment raw clicks and reset rate limit stats', () => {
    expect(component.rapidClickRawCount).toBe(0);
    component.onRawRapidClick();
    component.onRawRapidClick();
    expect(component.rapidClickRawCount).toBe(2);

    component.resetRateLimitStats();
    expect(component.rapidClickRawCount).toBe(0);
  });

  it('should clear activity logs when clearLogs() is called', () => {
    component.runFilterDemo('filter-even');
    expect(component.logs.length).toBeGreaterThan(0);

    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
