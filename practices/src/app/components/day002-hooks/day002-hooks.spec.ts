import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { Day002Hooks, LifecycleChildComponent } from './day002-hooks';

describe('Day002Hooks', () => {
  let hostComponent: Day002Hooks;
  let hostFixture: ComponentFixture<Day002Hooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day002Hooks, LifecycleChildComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(Day002Hooks);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    await hostFixture.whenStable();
  });

  it('should create Day002Hooks host component', () => {
    expect(hostComponent).toBeTruthy();
    expect(hostComponent.hookDefinitions.length).toBe(8);
  });

  it('should toggle child mount state and record corresponding logs', () => {
    expect(hostComponent.isChildMounted).toBe(true);

    // Unmount
    hostComponent.toggleChildMount();
    expect(hostComponent.isChildMounted).toBe(false);
    expect(hostComponent.logs[0].hookName).toBe('ngOnDestroy');

    // Mount again
    hostComponent.toggleChildMount();
    expect(hostComponent.isChildMounted).toBe(true);
    expect(hostComponent.logs[0].hookName).toBe('ngOnInit');
  });

  it('should change primitive inputs and log OnChanges', () => {
    const initialCount = hostComponent.childCount;
    hostComponent.changePrimitiveInputs();

    expect(hostComponent.childCount).toBe(initialCount + 10);
    expect(hostComponent.logs[0].hookName).toBe('ngOnChanges');
    expect(hostComponent.logs[0].detail).toContain('Update Primitive');
  });

  it('should mutate object without changing reference and trigger DoCheck log', () => {
    const initialAge = hostComponent.childUser.age;
    const initialRef = hostComponent.childUser;

    hostComponent.mutateObjectInput();

    expect(hostComponent.childUser).toBe(initialRef); // Same reference!
    expect(hostComponent.childUser.age).toBe(initialAge + 1);
    expect(hostComponent.logs[0].hookName).toBe('ngDoCheck');
  });

  it('should update object immutably with new reference and trigger OnChanges log', () => {
    const initialRef = hostComponent.childUser;
    const initialAge = hostComponent.childUser.age;

    hostComponent.immutableObjectInput();

    expect(hostComponent.childUser).not.toBe(initialRef); // New reference!
    expect(hostComponent.childUser.age).toBe(initialAge + 1);
    expect(hostComponent.logs[0].hookName).toBe('ngOnChanges');
  });

  it('should toggle projected content', () => {
    expect(hostComponent.isContentProjected).toBe(true);
    hostComponent.toggleProjectedContent();
    expect(hostComponent.isContentProjected).toBe(false);
  });

  it('should clear logs', () => {
    expect(hostComponent.logs.length).toBeGreaterThan(0);
    hostComponent.clearLogs();
    expect(hostComponent.logs.length).toBe(0);
  });
});

describe('LifecycleChildComponent', () => {
  let childComponent: LifecycleChildComponent;
  let childFixture: ComponentFixture<LifecycleChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifecycleChildComponent],
    }).compileComponents();

    childFixture = TestBed.createComponent(LifecycleChildComponent);
    childComponent = childFixture.componentInstance;
    childComponent.title = 'Test Title';
    childComponent.count = 42;
    childComponent.user = { name: 'Test User', age: 20 };
    childFixture.detectChanges();
    await childFixture.whenStable();
  });

  it('should create LifecycleChildComponent and trigger initial lifecycle hooks', () => {
    expect(childComponent).toBeTruthy();
    expect(childComponent.hookCounts['ngOnInit']).toBe(1);
    expect(childComponent.hookCounts['ngAfterContentInit']).toBe(1);
    expect(childComponent.hookCounts['ngAfterViewInit']).toBe(1);
  });

  it('should react to ngOnChanges with SimpleChanges', () => {
    const initialCount = childComponent.hookCounts['ngOnChanges'] || 0;

    childComponent.ngOnChanges({
      count: new SimpleChange(42, 50, false),
    });

    expect(childComponent.hookCounts['ngOnChanges']).toBe(initialCount + 1);
  });

  it('should detect object mutation in ngDoCheck', () => {
    childComponent.user = { name: 'Test User', age: 20 };
    childComponent.ngOnInit(); // establishes previousUserAge = 20

    // Mutate age internally without changing object reference
    childComponent.user.age = 25;

    let emittedDetail = '';
    childComponent.hookEvent.subscribe((e) => {
      if (e.hook === 'ngDoCheck') {
        emittedDetail = e.detail;
      }
    });

    childComponent.ngDoCheck();

    expect(emittedDetail).toContain('BẮT ĐƯỢC THỦ CÔNG');
    expect(emittedDetail).toContain('25');
  });

  it('should cleanup timer in ngOnDestroy', () => {
    expect(childComponent.isTimerAlive).toBe(true);

    childComponent.ngOnDestroy();

    expect(childComponent.isTimerAlive).toBe(false);
    expect(childComponent.hookCounts['ngOnDestroy']).toBe(1);
  });
});
