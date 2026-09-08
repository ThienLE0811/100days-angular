import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day049AdvancedJavascript } from './day049-advanced-javascript';

describe('Day049AdvancedJavascript', () => {
  let component: Day049AdvancedJavascript;
  let fixture: ComponentFixture<Day049AdvancedJavascript>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day049AdvancedJavascript],
    }).compileComponents();

    fixture = TestBed.createComponent(Day049AdvancedJavascript);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on event-loop tab', () => {
    expect(component.activeTab).toBe('event-loop');
  });

  it('should switch tabs correctly', () => {
    component.setTab('async-generator');
    expect(component.activeTab).toBe('async-generator');

    component.setTab('proxy-reactivity');
    expect(component.activeTab).toBe('proxy-reactivity');
  });

  it('should init proxy on ngOnInit', () => {
    fixture.detectChanges();
    expect(component.reactiveProxy).toBeDefined();
  });

  it('should track generator steps', () => {
    component.generatorMode = 'fibonacci';
    component.initGenerator();
    expect(component.generatorSteps.length).toBe(0);

    component.nextGenStep();
    expect(component.generatorSteps.length).toBe(1);
    expect(component.generatorSteps[0].yielded).toBe(0); // First fibonacci = 0

    component.nextGenStep();
    expect(component.generatorSteps.length).toBe(2);
    expect(component.generatorSteps[1].yielded).toBe(1); // Second fibonacci = 1
  });

  it('should create leaky closure and cleanup', () => {
    expect(component.closureState.isLeaking).toBeFalsy();

    component.createLeakyClosure();
    expect(component.closureState.isLeaking).toBeTruthy();
    expect(component.closureState.listenerCount).toBe(1);
    expect(component.closureState.arraySize).toBeGreaterThan(0);

    component.cleanupClosures();
    expect(component.closureState.isLeaking).toBeFalsy();
    expect(component.closureState.arraySize).toBe(0);
  });

  it('should run this binding demo', () => {
    component.runThisDemo();
    expect(component.thisResults.length).toBe(4);
    expect(component.thisResults[0].mode).toContain('Default');
    expect(component.thisResults[1].mode).toContain('Implicit');
    expect(component.thisResults[2].mode).toContain('Explicit');
    expect(component.thisResults[3].mode).toContain('Arrow');
  });

  it('should build prototype chain', () => {
    component.runThisDemo(); // triggers buildPrototypeChain
    expect(component.prototypeChain.length).toBe(5);
    expect(component.prototypeChain[0].level).toContain('Dog instance');
    expect(component.prototypeChain[4].level).toContain('null');
  });

  it('should filter cheatsheet by category', () => {
    component.selectedCategory = 'all';
    expect(component.filteredCheatsheet.length).toBe(component.cheatsheetRows.length);

    component.selectedCategory = 'Memory';
    expect(component.filteredCheatsheet.every(r => r.category === 'Memory')).toBeTruthy();
  });

  it('should proxy set and get trigger state update', () => {
    fixture.detectChanges();
    component.proxyKey = 'name';
    component.proxyValue = 'Updated Name';
    component.proxySet();

    expect(component.proxyState['name']).toBe('Updated Name');
    expect(component.proxyLogs[0].trap).toBe('set');
  });

  it('should clear logs', () => {
    component.createLeakyClosure(); // generates logs
    expect(component.logs.length).toBeGreaterThan(0);

    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
