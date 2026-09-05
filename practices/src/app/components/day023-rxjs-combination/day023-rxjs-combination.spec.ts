import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day023RxjsCombination } from './day023-rxjs-combination';

describe('Day023RxjsCombination', () => {
  let component: Day023RxjsCombination;
  let fixture: ComponentFixture<Day023RxjsCombination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day023RxjsCombination],
    }).compileComponents();

    fixture = TestBed.createComponent(Day023RxjsCombination);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create Day023RxjsCombination component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize combineLatestVm and react to pagination & search changes', () => {
    expect(component.combineLatestVm).toBeTruthy();
    expect(component.combineLatestVm?.page).toBe(1);
    expect(component.combineLatestVm?.size).toBe(10);
    expect(component.combineLatestVm?.search).toBe('Angular');

    // Page Change
    component.onPageChange(1);
    expect(component.currentPage).toBe(2);
    expect(component.combineLatestVm?.page).toBe(2);

    // Size Change resets page to 1
    component.onSizeChange(25);
    expect(component.currentSize).toBe(25);
    expect(component.currentPage).toBe(1);
    expect(component.combineLatestVm?.size).toBe(25);

    // Search Change
    component.searchTerm = 'RxJS 7+';
    component.onSearchChange();
    expect(component.combineLatestVm?.search).toBe('RxJS 7+');
  });

  it('should execute zip() pairing index-by-index', () => {
    component.runZipDemo();
    expect(component.zipResults.length).toBe(3);
    expect(component.zipResults[0]).toEqual({ age: 29, name: 'Chau', isAdmin: true });
    expect(component.zipResults[1]).toEqual({ age: 28, name: 'Trung', isAdmin: false });
    expect(component.zipResults[2]).toEqual({ age: 30, name: 'Tiep', isAdmin: true });
  });

  it('should trigger concat and merge stream setups', () => {
    component.runConcatOrMergeDemo('concat');
    expect(component.concatMergeMode).toBe('concat');
    expect(component.isStreamRunning).toBe(true);

    component.runConcatOrMergeDemo('merge');
    expect(component.concatMergeMode).toBe('merge');
    expect(component.isStreamRunning).toBe(true);
  });

  it('should handle race() banner interaction with manual close and navigation', () => {
    // Test manual user close wins race
    component.openRaceAlertBanner();
    expect(component.isBannerVisible).toBe(true);

    component.triggerUserCloseBanner();
    expect(component.isBannerVisible).toBe(false);
    expect(component.bannerWinner).toContain('Người dùng bấm nút "Đóng Banner"');

    // Test navigation away wins race
    component.openRaceAlertBanner();
    expect(component.isBannerVisible).toBe(true);

    component.triggerNavigateAway();
    expect(component.isBannerVisible).toBe(false);
    expect(component.bannerWinner).toContain('chuyển sang trang khác');
  });

  it('should submit orders using withLatestFrom() current exchange rate', () => {
    component.liveExchangeRate = 25500;
    component.submitOrderWithLatestRate();

    expect(component.orderSubmissionLogs.length).toBe(1);
    const order = component.orderSubmissionLogs[0];
    expect(order.amountUsd).toBe(100);
    expect(order.rate).toBe(25500);
    expect(order.totalVnd).toBe(2550000);
  });

  it('should compute pairwise() deltas on stock price changes', () => {
    component.stockPrice = 100;

    // Price increase
    component.updateStockPrice(20);
    expect(component.stockPrice).toBe(120);
    expect(component.pairwiseDeltas[0]).toEqual({
      prev: 100,
      curr: 120,
      diff: 20,
      trend: 'UP',
    });

    // Price decrease
    component.updateStockPrice(-15);
    expect(component.stockPrice).toBe(105);
    expect(component.pairwiseDeltas[0]).toEqual({
      prev: 120,
      curr: 105,
      diff: -15,
      trend: 'DOWN',
    });
  });

  it('should have all 9 decision matrix operator specifications', () => {
    expect(component.decisionSpecs.length).toBe(9);
    const opNames = component.decisionSpecs.map((s) => s.operator);
    expect(opNames).toContain('forkJoin([...])');
    expect(opNames).toContain('combineLatest([...])');
    expect(opNames).toContain('zip(...)');
    expect(opNames).toContain('concat(...)');
    expect(opNames).toContain('merge(...)');
    expect(opNames).toContain('race(...)');
    expect(opNames).toContain('withLatestFrom(...)');
    expect(opNames).toContain('startWith(...) / endWith(...)');
    expect(opNames).toContain('pairwise()');
  });

  it('should clear logs when clearLogs() is called', () => {
    expect(component.logs.length).toBeGreaterThan(0);
    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});

