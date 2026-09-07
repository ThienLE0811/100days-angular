import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ============================================================================
 * KIẾN TRÚC & NGUYÊN LÝ CỐT LÕI: ATTRIBUTE DIRECTIVE (CLASS & STYLE BINDINGS)
 * ============================================================================
 *
 * 1. Phân biệt Structural Directive vs Attribute Directive:
 *    - Structural Directive (NgIf, NgFor, @if, @for):
 *      Thay đổi trực tiếp cấu trúc cây DOM (thêm, xóa, hoán đổi vị trí các node).
 *    - Attribute Directive (Class, Style, NgClass, NgStyle, Custom Attribute Directives):
 *      Không thay đổi cấu trúc DOM, mà thay đổi giao diện hiển thị (styles, classes)
 *      hoặc hành vi (behavior, event handling) của một phần tử DOM sẵn có.
 *
 * 2. Class Binding trong Angular:
 *    - Cú pháp đơn lẻ (Single Class Toggle):
 *      [class.class-name]="booleanCondition"
 *      -> Nếu điều kiện là truthy, thêm class vào classList. Nếu falsy, gỡ class.
 *    - Cú pháp đa lớp (Multi-class Expression):
 *      [class]="classExpr"
 *      Hỗ trợ 3 dạng biểu thức dữ liệu:
 *      + Dạng String:       "btn btn-primary rounded shadow"
 *      + Dạng Array String: ['badge', 'badge-success', 'uppercase']
 *      + Dạng Object Map:   { 'active': isActive, 'has-error': hasError }
 *
 * 3. Style Binding trong Angular:
 *    - Cú pháp đơn lẻ (Single Style Property):
 *      [style.property]="expression"
 *      -> Ví dụ: [style.width]="myWidthString" (chuỗi có kèm đơn vị: '100px')
 *    - Cú pháp kèm đơn vị đo lường (Unit Suffix):
 *      [style.property.unit]="numericExpression"
 *      -> Ví dụ: [style.height.%]="containerHeight", [style.fontSize.px]="fontSize", [style.transform.deg]="rotation"
 *      -> Giúp code ngắn gọn, chỉ cần truyền giá trị số number, không cần cộng chuỗi đơn vị!
 *    - Cú pháp đa style (Multi-style Expression):
 *      [style]="styleExpr"
 *      + Dạng String:       "width: 100%; background-color: blue"
 *      + Dạng Object Map:   { width: '100px', backgroundColor: 'blue', 'font-size': '16px' }
 *      + Hỗ trợ cả dash-case (font-size, background-color) lẫn camelCase (fontSize, backgroundColor).
 *
 * 4. Khuyến cáo Angular Hiện Đại:
 *    - Ưu tiên dùng cú pháp template chuẩn [class] và [style] thay vì directive [ngClass] và [ngStyle].
 *    - Cú pháp chuẩn được trình biên dịch Angular tối ưu hiệu năng tốt hơn, sạch sẽ hơn và không đòi hỏi
 *      phải import NgClass/NgStyle từ @angular/common.
 * ============================================================================
 */

export type ActiveLessonTab =
  | 'all'
  | 'single-class'
  | 'multi-class'
  | 'style-units'
  | 'multi-style'
  | 'vs-ngclass'
  | 'product-lab';

export type ClassExpressionFormat = 'string' | 'array' | 'object';

export interface DemoTabItem {
  id: number;
  label: string;
  icon: string;
  badge?: string;
  description: string;
}

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-day006-attribute-directive-class-style',
  styleUrl: './day006-attribute-directive-class-style.scss',
  templateUrl: './day006-attribute-directive-class-style.html',
})
export class Day006AttributeDirectiveClassStyle {
  // Navigation tabs trong phòng lab
  readonly currentTab = signal<ActiveLessonTab>('all');

  // Thông báo hành động vừa tương tác
  readonly lastActionMessage = signal<string>(
    'Khởi tạo thành công phòng lab Attribute Directive (Class & Style)!'
  );

  // ==========================================================================
  // PHẦN 1: Single Class Binding ([class.tab-active]="condition")
  // ==========================================================================
  readonly tabsList: DemoTabItem[] = [
    {
      id: 1,
      label: 'Tổng Quan',
      icon: '📊',
      badge: 'Mới',
      description: 'Giao diện bảng điều khiển tổng hợp thông tin dự án.',
    },
    {
      id: 2,
      label: 'Bảo Mật',
      icon: '🛡️',
      badge: '2FA',
      description: 'Cấu hình quyền truy cập và chứng thực đa yếu tố.',
    },
    {
      id: 3,
      label: 'Thông Báo',
      icon: '🔔',
      badge: '5',
      description: 'Quản lý kênh thông báo qua Email, SMS và Push Notification.',
    },
    {
      id: 4,
      label: 'Thanh Toán',
      icon: '💳',
      description: 'Lịch sử giao dịch và hóa đơn điện tử hàng tháng.',
    },
  ];

  readonly activeTabId = signal<number>(1);
  readonly isDarkMode = signal<boolean>(false);
  readonly isElevated = signal<boolean>(true);
  readonly isPulsing = signal<boolean>(false);
  readonly hasBorder = signal<boolean>(true);

  selectTab(id: number): void {
    this.activeTabId.set(id);
    const target = this.tabsList.find((t) => t.id === id);
    this.lastActionMessage.set(
      `[Single Class] Kích hoạt tab: "${target?.label}" -> [class.tab-active]=true`
    );
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((v) => !v);
    this.lastActionMessage.set(
      `[Single Class] Dark Mode: ${this.isDarkMode() ? 'BẬT ([class.dark-theme]=true)' : 'TẮT ([class.dark-theme]=false)'}`
    );
  }

  // ==========================================================================
  // PHẦN 2: Multi-format Class Expressions ([class]="classExpr")
  // ==========================================================================
  readonly classFormat = signal<ClassExpressionFormat>('object');
  readonly cbRounded = signal<boolean>(true);
  readonly cbShadow = signal<boolean>(true);
  readonly cbGlow = signal<boolean>(false);
  readonly cbBordered = signal<boolean>(true);
  readonly cbUppercase = signal<boolean>(false);
  readonly cbGradient = signal<boolean>(true);

  // Biểu thức dạng String: "class1 class2 class3"
  readonly stringClassExpr = computed(() => {
    const classes: string[] = ['demo-box'];
    if (this.cbRounded()) classes.push('box-rounded');
    if (this.cbShadow()) classes.push('box-shadow');
    if (this.cbGlow()) classes.push('box-glow');
    if (this.cbBordered()) classes.push('box-bordered');
    if (this.cbUppercase()) classes.push('box-uppercase');
    if (this.cbGradient()) classes.push('box-gradient');
    return classes.join(' ');
  });

  // Biểu thức dạng Array String: ['class1', 'class2']
  readonly arrayClassExpr = computed(() => {
    const classes: string[] = ['demo-box'];
    if (this.cbRounded()) classes.push('box-rounded');
    if (this.cbShadow()) classes.push('box-shadow');
    if (this.cbGlow()) classes.push('box-glow');
    if (this.cbBordered()) classes.push('box-bordered');
    if (this.cbUppercase()) classes.push('box-uppercase');
    if (this.cbGradient()) classes.push('box-gradient');
    return classes;
  });

  // Biểu thức dạng Object Map: { 'class1': boolean, 'class2': boolean }
  readonly objectClassExpr = computed(() => {
    return {
      'demo-box': true,
      'box-rounded': this.cbRounded(),
      'box-shadow': this.cbShadow(),
      'box-glow': this.cbGlow(),
      'box-bordered': this.cbBordered(),
      'box-uppercase': this.cbUppercase(),
      'box-gradient': this.cbGradient(),
    };
  });

  // ==========================================================================
  // PHẦN 3: Style Binding Kèm Đơn Vị Đo ([style.property.unit])
  // ==========================================================================
  readonly boxWidthPercent = signal<number>(85); // Đơn vị %
  readonly boxHeightPx = signal<number>(140); // Đơn vị px
  readonly boxRadiusPx = signal<number>(16); // Đơn vị px
  readonly boxRotationDeg = signal<number>(0); // Đơn vị deg
  readonly boxOpacityPercent = signal<number>(100); // Đơn vị %
  readonly boxFontSizePx = signal<number>(16); // Đơn vị px
  readonly boxPrimaryColor = signal<string>('#4f46e5');

  resetStyleUnitSandbox(): void {
    this.boxWidthPercent.set(85);
    this.boxHeightPx.set(140);
    this.boxRadiusPx.set(16);
    this.boxRotationDeg.set(0);
    this.boxOpacityPercent.set(100);
    this.boxFontSizePx.set(16);
    this.boxPrimaryColor.set('#4f46e5');
    this.lastActionMessage.set('Đã hoàn tác thông số Style Unit Sandbox về mặc định');
  }

  // ==========================================================================
  // PHẦN 4: Multi-style Expressions & Studio Thiết Kế ([style]="styleExpr")
  // ==========================================================================
  readonly studioBgColor = signal<string>('#f0fdf4');
  readonly studioTextColor = signal<string>('#166534');
  readonly studioPaddingPx = signal<number>(24);
  readonly studioBorderWidthPx = signal<number>(2);
  readonly studioBorderColor = signal<string>('#86efac');
  readonly studioBorderStyle = signal<'solid' | 'dashed' | 'dotted'>('solid');
  readonly studioCaseMode = signal<'camelCase' | 'dash-case'>('camelCase');

  // Object Style biểu diễn theo camelCase hoặc dash-case
  readonly computedStyleObject = computed(() => {
    if (this.studioCaseMode() === 'camelCase') {
      return {
        backgroundColor: this.studioBgColor(),
        color: this.studioTextColor(),
        padding: `${this.studioPaddingPx()}px`,
        borderWidth: `${this.studioBorderWidthPx()}px`,
        borderColor: this.studioBorderColor(),
        borderStyle: this.studioBorderStyle(),
      };
    } else {
      return {
        'background-color': this.studioBgColor(),
        color: this.studioTextColor(),
        padding: `${this.studioPaddingPx()}px`,
        'border-width': `${this.studioBorderWidthPx()}px`,
        'border-color': this.studioBorderColor(),
        'border-style': this.studioBorderStyle(),
      };
    }
  });

  // String Style tương đương: "property: value; property: value;"
  readonly computedStyleString = computed(() => {
    return (
      `background-color: ${this.studioBgColor()}; ` +
      `color: ${this.studioTextColor()}; ` +
      `padding: ${this.studioPaddingPx()}px; ` +
      `border: ${this.studioBorderWidthPx()}px ${this.studioBorderStyle()} ${this.studioBorderColor()};`
    );
  });

  // ==========================================================================
  // PHẦN 6: Phòng Lab E-commerce Product Card (Kết hợp toàn diện)
  // ==========================================================================
  readonly productStockStatus = signal<'in-stock' | 'low-stock' | 'out-of-stock'>('in-stock');
  readonly isProductDiscounted = signal<boolean>(true);
  readonly productDiscountPercent = signal<number>(20);
  readonly isProductFeatured = signal<boolean>(true);
  readonly productThemeColor = signal<string>('#3b82f6');
  readonly cardElevationLevel = signal<number>(12); // Shadow blur px

  setProductStock(status: 'in-stock' | 'low-stock' | 'out-of-stock'): void {
    this.productStockStatus.set(status);
    this.lastActionMessage.set(`[Product Card] Cập nhật tình trạng kho: ${status}`);
  }
}
