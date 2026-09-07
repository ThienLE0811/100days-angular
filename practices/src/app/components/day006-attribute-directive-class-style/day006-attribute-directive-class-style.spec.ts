import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day006AttributeDirectiveClassStyle } from './day006-attribute-directive-class-style';

describe('Day006AttributeDirectiveClassStyle', () => {
  let component: Day006AttributeDirectiveClassStyle;
  let fixture: ComponentFixture<Day006AttributeDirectiveClassStyle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day006AttributeDirectiveClassStyle],
    }).compileComponents();

    fixture = TestBed.createComponent(Day006AttributeDirectiveClassStyle);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the main component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch active tab and update lastActionMessage', () => {
    expect(component.activeTabId()).toBe(1);
    component.selectTab(3);
    fixture.detectChanges();

    expect(component.activeTabId()).toBe(3);
    expect(component.lastActionMessage()).toContain('Thông Báo');
    expect(component.lastActionMessage()).toContain('[class.tab-active]=true');
  });

  it('should toggle dark mode state correctly', () => {
    expect(component.isDarkMode()).toBe(false);
    component.toggleDarkMode();
    expect(component.isDarkMode()).toBe(true);
    expect(component.lastActionMessage()).toContain('BẬT');

    component.toggleDarkMode();
    expect(component.isDarkMode()).toBe(false);
    expect(component.lastActionMessage()).toContain('TẮT');
  });

  it('should compute class expressions for string, array, and object formats', () => {
    // Default state: cbRounded=true, cbShadow=true, cbGlow=false, cbBordered=true, cbUppercase=false, cbGradient=true
    const stringClasses = component.stringClassExpr();
    expect(stringClasses).toContain('demo-box');
    expect(stringClasses).toContain('box-rounded');
    expect(stringClasses).toContain('box-shadow');
    expect(stringClasses).not.toContain('box-glow');

    const arrayClasses = component.arrayClassExpr();
    expect(arrayClasses).toContain('demo-box');
    expect(arrayClasses).toContain('box-rounded');
    expect(arrayClasses).not.toContain('box-glow');

    const objectClasses = component.objectClassExpr();
    expect(objectClasses['demo-box']).toBe(true);
    expect(objectClasses['box-rounded']).toBe(true);
    expect(objectClasses['box-glow']).toBe(false);

    // Toggle glow to true
    component.cbGlow.set(true);
    fixture.detectChanges();
    expect(component.stringClassExpr()).toContain('box-glow');
    expect(component.arrayClassExpr()).toContain('box-glow');
    expect(component.objectClassExpr()['box-glow']).toBe(true);
  });

  it('should reset style unit sandbox correctly', () => {
    component.boxWidthPercent.set(50);
    component.boxHeightPx.set(200);
    component.boxRotationDeg.set(15);
    fixture.detectChanges();

    expect(component.boxWidthPercent()).toBe(50);
    expect(component.boxHeightPx()).toBe(200);
    expect(component.boxRotationDeg()).toBe(15);

    component.resetStyleUnitSandbox();
    fixture.detectChanges();

    expect(component.boxWidthPercent()).toBe(85);
    expect(component.boxHeightPx()).toBe(140);
    expect(component.boxRotationDeg()).toBe(0);
    expect(component.lastActionMessage()).toContain('mặc định');
  });

  it('should compute studio style object in camelCase and dash-case modes', () => {
    // Default mode: camelCase
    expect(component.studioCaseMode()).toBe('camelCase');
    const camelStyle = component.computedStyleObject() as unknown as Record<string, string>;
    expect(camelStyle['backgroundColor']).toBe('#f0fdf4');
    expect(camelStyle['color']).toBe('#166534');
    expect(camelStyle['padding']).toBe('24px');

    // Switch to dash-case
    component.studioCaseMode.set('dash-case');
    fixture.detectChanges();
    const dashStyle = component.computedStyleObject() as unknown as Record<string, string>;
    expect(dashStyle['background-color']).toBe('#f0fdf4');
    expect(dashStyle['color']).toBe('#166534');
  });

  it('should update product stock status and lastActionMessage', () => {
    expect(component.productStockStatus()).toBe('in-stock');
    component.setProductStock('out-of-stock');
    fixture.detectChanges();

    expect(component.productStockStatus()).toBe('out-of-stock');
    expect(component.lastActionMessage()).toContain('out-of-stock');
  });
});
