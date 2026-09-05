import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day017ContentchildContentchildren } from './day017-contentchild-contentchildren';

describe('Day017ContentchildContentchildren', () => {
  let component: Day017ContentchildContentchildren;
  let fixture: ComponentFixture<Day017ContentchildContentchildren>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day017ContentchildContentchildren],
    }).compileComponents();

    fixture = TestBed.createComponent(Day017ContentchildContentchildren);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create Day017ContentchildContentchildren component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default dynamic tabs', () => {
    expect(component.dynamicTabs.length).toBe(3);
    expect(component.dynamicActiveTab).toBe(0);
  });

  it('should add a dynamic tab when addDynamicTab is called', () => {
    const initialCount = component.dynamicTabs.length;
    component.addDynamicTab();
    expect(component.dynamicTabs.length).toBe(initialCount + 1);
  });

  it('should remove a dynamic tab when removeDynamicTab is called', () => {
    component.addDynamicTab();
    const countBefore = component.dynamicTabs.length;
    component.removeDynamicTab(0);
    expect(component.dynamicTabs.length).toBe(countBefore - 1);
  });

  it('should switch eager and lazy tabs correctly', () => {
    component.onEagerTabChange(1);
    expect(component.eagerActiveTab).toBe(1);

    component.onLazyTabChange(2);
    expect(component.lazyActiveTab).toBe(2);
  });

  it('should record logs on interactions', () => {
    component.onLazyTabChange(1);
    expect(component.logs.length).toBeGreaterThan(0);
    expect(component.logs[0].source).toBe('LAZY');

    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
