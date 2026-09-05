import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Day016DependencyInjectionInAngularPart2,
  APP_CONFIG,
  GREETING_TOKEN,
  LoggerService,
  TimestampLoggerService,
  TabGroupComponent,
  TabPanelComponent,
  BsTabGroupComponent,
} from './day016-dependency-injection-in-angular-part-2';

describe('Day016DependencyInjectionInAngularPart2', () => {
  let component: Day016DependencyInjectionInAngularPart2;
  let fixture: ComponentFixture<Day016DependencyInjectionInAngularPart2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day016DependencyInjectionInAngularPart2],
    }).compileComponents();

    fixture = TestBed.createComponent(Day016DependencyInjectionInAngularPart2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create Day016DependencyInjectionInAngularPart2 component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject APP_CONFIG via useValue correctly', () => {
    expect(component.appConfig).toBeDefined();
    expect(component.appConfig.appName).toContain('Day 16');
    expect(component.appConfig.environment).toBe('development');
  });

  it('should inject TimestampLoggerService via useClass correctly', () => {
    expect(component.logger).toBeDefined();
    expect(component.logger instanceof TimestampLoggerService).toBe(true);
    const logged = component.logger.log('Hello DI');
    expect(logged).toContain('[TimestampLogger');
  });

  it('should inject GREETING_TOKEN via useFactory correctly', () => {
    expect(component.greeting).toBeDefined();
    expect(component.greeting.message).toContain('Xin chào');
    expect(component.greeting.greetingTime).toBeDefined();
  });

  it('TabGroupComponent should manage TabPanelComponent list via parent-child DI', () => {
    const tabGroup = new TabGroupComponent();
    expect(tabGroup.tabPanelList.length).toBe(0);

    const tabPanelMock = { title: 'Mock Tab' } as TabPanelComponent;
    tabGroup.addTabPanel(tabPanelMock);
    expect(tabGroup.tabPanelList.length).toBe(1);

    tabGroup.removeTabPanel(tabPanelMock);
    expect(tabGroup.tabPanelList.length).toBe(0);
  });

  it('BsTabGroupComponent should extend TabGroupComponent', () => {
    const bsTabGroup = new BsTabGroupComponent();
    expect(bsTabGroup instanceof TabGroupComponent).toBe(true);
  });

  it('should add dynamic panel when addDynamicPanel is called', () => {
    const initialCount = component.dynamicPanels.length;
    component.addDynamicPanel();
    expect(component.dynamicPanels.length).toBe(initialCount + 1);
  });

  it('should remove dynamic panel when removeDynamicPanel is called', () => {
    component.addDynamicPanel();
    const countBefore = component.dynamicPanels.length;
    component.removeDynamicPanel(0);
    expect(component.dynamicPanels.length).toBe(countBefore - 1);
  });

  it('should switch tabs and record activity logs', () => {
    component.onStandardTabChange(1);
    expect(component.standardActiveTab).toBe(1);

    component.onBsTabChange(2);
    expect(component.bsActiveTab).toBe(2);

    expect(component.logs.length).toBeGreaterThan(0);
    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
