import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day024RxjsErrorHandlingConditional } from './day024-rxjs-error-handling-conditional';

describe('Day024RxjsErrorHandlingConditional', () => {
  let component: Day024RxjsErrorHandlingConditional;
  let fixture: ComponentFixture<Day024RxjsErrorHandlingConditional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day024RxjsErrorHandlingConditional],
    }).compileComponents();

    fixture = TestBed.createComponent(Day024RxjsErrorHandlingConditional);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create Day024RxjsErrorHandlingConditional component', () => {
    expect(component).toBeTruthy();
  });

  it('should demonstrate catchError() converting error into safe fallback value', () => {
    component.runCatchErrorDemo('catch-and-fallback');
    expect(component.catchExecutionItems.length).toBe(4); // 1, 2, 3, and Fallback
    expect(component.catchExecutionItems[0].value).toBe(1);
    expect(component.catchExecutionItems[1].value).toBe(2);
    expect(component.catchExecutionItems[2].value).toBe(3);
    expect(component.catchExecutionItems[3].isError).toBe(true);
    expect(component.catchExecutionItems[3].note).toContain('catchError');
    expect(component.catchTerminalStatus).toContain('hoàn thành thành công');
  });

  it('should terminate stream with error when catchError is NOT used', () => {
    component.runCatchErrorDemo('without-catch');
    expect(component.catchExecutionItems.length).toBe(3); // only 1, 2, 3 emitted before throw
    expect(component.catchTerminalStatus).toContain('bị hủy (Error)');
  });

  it('should retry limited times using catchError returning caught with take()', () => {
    component.runCatchErrorDemo('catch-retry-limit');
    // Emits 1, 2, 3, then retries 1, 2, 3, then retries 1, 2 (total 8 items)
    expect(component.catchExecutionItems.length).toBe(8);
    expect(component.catchTerminalStatus).toContain('hoàn thành thành công');
  });

  it('should return default value with defaultIfEmpty() when query has no matches', () => {
    component.searchQuery = 'NonExistentLanguageXYZ';
    component.runFilterSearchDemo();

    expect(component.filteredResults.length).toBe(0);
    expect(component.defaultIfEmptyResult).toContain('defaultIfEmpty');
    expect(component.defaultIfEmptyResult).toContain('Không tìm thấy kết quả nào');

    // Matching query
    component.searchQuery = 'Angular';
    component.runFilterSearchDemo();
    expect(component.filteredResults.length).toBeGreaterThan(0);
    expect(component.defaultIfEmptyResult).toContain('Angular 19');
  });

  it('should check all and some conditions using every() and first()', () => {
    // All pass (every = true, some = true)
    component.studentScores = [70, 80, 95];
    component.scoreThreshold = 50;
    component.evaluateScores();
    expect(component.everyResult).toBe(true);
    expect(component.someResult).toBe(true);

    // One failure (every = false, some = true)
    component.studentScores = [40, 80, 95];
    component.evaluateScores();
    expect(component.everyResult).toBe(false);
    expect(component.someResult).toBe(true);

    // No top scores (every = true, some = false)
    component.studentScores = [60, 70, 80];
    component.evaluateScores();
    expect(component.everyResult).toBe(true);
    expect(component.someResult).toBe(false);
  });

  it('should select branch with iif() based on user condition at subscription time', () => {
    component.isUserVip = true;
    component.evaluateIifDemo();
    expect(component.iifResult?.title).toContain('VIP');
    expect(component.iifResult?.discount).toContain('50%');

    component.toggleVipMode();
    expect(component.isUserVip).toBe(false);
    expect(component.iifResult?.title).toContain('Guest');
    expect(component.iifResult?.discount).toContain('10%');
  });

  it('should confirm transaction before timeout to satisfy throwIfEmpty()', () => {
    component.startTransactionWithTimeout();
    expect(component.isTransactionActive).toBe(true);
    expect(component.transactionStatus).toBe('PENDING');

    component.confirmTransactionNow();
    expect(component.isTransactionActive).toBe(false);
    expect(component.transactionStatus).toBe('SUCCESS');
    expect(component.transactionMessage).toContain('xác nhận thành công');
  });

  it('should include all 7 operator specifications in cheatsheet', () => {
    expect(component.cheatsheetSpecs.length).toBe(7);
    const opNames = component.cheatsheetSpecs.map((s) => s.operator);
    expect(opNames).toContain('catchError');
    expect(opNames).toContain('retry(count)');
    expect(opNames).toContain('retryWhen / retryBackoff');
    expect(opNames).toContain('defaultIfEmpty(defaultValue)');
    expect(opNames).toContain('throwIfEmpty(errorFactory)');
    expect(opNames).toContain('every(predicate)');
    expect(opNames).toContain('iif(condition, trueResult$, falseResult$)');
  });

  it('should clear activity logs when clearLogs() is called', () => {
    expect(component.logs.length).toBeGreaterThan(0);
    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
