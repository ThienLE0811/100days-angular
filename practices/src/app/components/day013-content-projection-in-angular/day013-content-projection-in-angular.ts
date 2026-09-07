import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ============================================================================
 * KIẾN TRÚC & NGUYÊN LÝ CỐT LÕI: CONTENT PROJECTION TRONG ANGULAR
 * ============================================================================
 *
 * 1. Khái niệm Content Projection (Chiếu nội dung):
 *    - Là kỹ thuật cho phép component cha truyền toàn bộ một khối HTML / Component /
 *      Template vào giữa cặp thẻ mở/đóng của component con:
 *      <app-card>
 *        <p>Nội dung này được project vào trong card</p>
 *      </app-card>
 *    - Trong component con, vị trí hiển thị được đánh dấu bằng thẻ `<ng-content></ng-content>`.
 *    - Tương đương với khái niệm `<slot>` trong Web Components và Vue.js.
 *
 * 2. So sánh ng-content vs ng-template (Day 13 vs Day 14):
 *    - <ng-content> (Eager Evaluation): DOM do cha quản lý và khởi tạo ngay lập tức,
 *      sau đó được "nhét" (project) vào vị trí của con. Kể cả khi con ẩn đi bằng *ngIf,
 *      component bên trong ng-content VẪN được khởi tạo từ trước.
 *    - <ng-template> (Lazy Evaluation): Chỉ là bản vẽ thiết kế (blueprint), không tự
 *      render ra DOM thật trừ khi được chỉ thị (ngTemplateOutlet, ViewContainerRef) kích hoạt.
 *
 * 3. Single-slot Projection:
 *    - Component con chỉ có một thẻ `<ng-content></ng-content>` duy nhất không selector.
 *    - Mọi nội dung đặt giữa cặp thẻ cha đều đổ về đúng vị trí đó.
 *
 * 4. Cạm bẫy Multiple ng-content không có Selector:
 *    - Nếu bạn khai báo 2 thẻ `<ng-content></ng-content>` không có selector trong cùng
 *      một template con, Angular sẽ CHỈ RENDER NỘI DUNG VÀO THẺ CUỐI CÙNG!
 *    - Thẻ đầu tiên sẽ hoàn toàn trống rỗng vì một DOM node không thể đồng thời nằm ở
 *      hai vị trí khác nhau trên cây DOM.
 *
 * 5. Multi-slot Projection với Selector (`select`):
 *    - Tương tự như cấu trúc thẻ <table> (thead, tbody, tfoot), Angular cho phép định
 *      nghĩa nhiều slot riêng biệt qua thuộc tính `select`:
 *      + Tag selector: <ng-content select="app-custom-badge, h3, button"></ng-content>
 *      + CSS Class selector: <ng-content select=".card-header, .card-footer"></ng-content>
 *      + Attribute selector: <ng-content select="[card-body], [custom-action]"></ng-content>
 *      + Combined selector: <ng-content select="div.card-body[highlight]"></ng-content>
 *      + Catch-all (Default slot): <ng-content></ng-content> hứng tất cả nội dung còn lại.
 *    - ĐẶC BIỆT: Bất kể cha truyền vào theo thứ tự nào, Angular luôn sắp xếp các phần tử
 *      đúng vào vị trí slot đã được định nghĩa trong template của con!
 *
 * 6. Kỹ thuật `ngProjectAs`:
 *    - Dùng khi phần tử ở cha bị bọc bởi một thẻ HTML khác (div, section...) hoặc là thẻ
 *      thông thường nhưng cần giả lập (alias) để khớp với selector của con.
 *    - Ví dụ: con yêu cầu `select="app-custom-badge"`, cha dùng `<span ngProjectAs="app-custom-badge">`
 *      sẽ giúp Angular chiếu phần tử vào đúng slot mong muốn!
 * ============================================================================
 */

// ============================================================================
// TYPESCRIPT ADVANCED TYPES (KẾ THỪA TINH THẦN DAY 12)
// ============================================================================
export type ThemeColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
export type CardVariant = 'elevated' | 'bordered' | 'glass' | 'gradient';
export type ActiveTab =
  | 'all'
  | 'basics'
  | 'multi-trap'
  | 'multi-slot'
  | 'project-as'
  | 'eager-lifecycle'
  | 'survey';

export interface BaseQuestion {
  id: string;
  title: string;
  description: string;
  theme: ThemeColor;
}

export interface SurveyQuestion extends BaseQuestion {
  category: 'ux' | 'security' | 'feature';
  checked: boolean;
  isRequired?: boolean;
}

// Type Guard kiểm tra câu hỏi bắt buộc (Day 12 Type Guard concept)
export function isRequiredQuestion(q: SurveyQuestion): boolean {
  return q.isRequired === true;
}

// ============================================================================
// SUB-COMPONENT 1: AppCustomToggle (Single-slot Projection)
// Minh họa ví dụ gốc từ tài liệu Day 13: Toggle nhận nhãn động qua ng-content
// ============================================================================
@Component({
  selector: 'app-custom-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-toggle-wrapper" [class.disabled]="disabled">
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked"
        class="toggle-switch-btn"
        [class.checked]="checked"
        [class]="'theme-' + theme"
        [disabled]="disabled"
        (click)="toggle()"
      >
        <span class="toggle-thumb"></span>
      </button>
      <div class="toggle-projected-label" (click)="!disabled && toggle()">
        <!-- Single-slot Projection: Toàn bộ nội dung cha truyền vào sẽ hiện tại đây -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-toggle-wrapper {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        user-select: none;
        transition: opacity 0.2s ease;
        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          .toggle-projected-label {
            cursor: not-allowed;
          }
        }
      }
      .toggle-switch-btn {
        position: relative;
        width: 48px;
        height: 26px;
        border-radius: 9999px;
        border: none;
        background: #cbd5e1;
        cursor: pointer;
        outline: none;
        padding: 2px;
        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;

        &:focus-visible {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
        }

        .toggle-thumb {
          display: block;
          width: 22px;
          height: 22px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.checked {
          &.theme-blue {
            background: #2563eb;
          }
          &.theme-emerald {
            background: #059669;
          }
          &.theme-purple {
            background: #7c3aed;
          }
          &.theme-amber {
            background: #d97706;
          }
          &.theme-rose {
            background: #e11d48;
          }
          .toggle-thumb {
            transform: translateX(22px);
          }
        }
      }
      .toggle-projected-label {
        font-size: 0.925rem;
        color: #1e293b;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
    `,
  ],
})
export class AppCustomToggleComponent {
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() theme: ThemeColor = 'blue';
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}

// ============================================================================
// SUB-COMPONENT 2: AppMultiContentTrap (Cạm bẫy Multiple ng-content không selector)
// Minh họa đúng cảnh báo trong tài liệu Day 13: Chỉ thẻ cuối cùng nhận nội dung
// ============================================================================
@Component({
  selector: 'app-multi-content-trap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trap-container">
      <div class="trap-slot slot-first">
        <div class="slot-header">
          <span class="slot-badge badge-warning">Slot 1 (Khai báo trước)</span>
          <span class="slot-status">⚠️ Không có selector - Bị RỖNG</span>
        </div>
        <div class="slot-body empty-placeholder">
          <!-- Thẻ ng-content thứ 1 -->
          <ng-content></ng-content>
          <span class="empty-notice">(Không hiển thị phần tử nào tại đây!)</span>
        </div>
      </div>

      <div class="trap-slot slot-second">
        <div class="slot-header">
          <span class="slot-badge badge-success">Slot 2 (Khai báo sau)</span>
          <span class="slot-status">✅ Nhận trọn vẹn nội dung chiếu</span>
        </div>
        <div class="slot-body filled-content">
          <!-- Thẻ ng-content thứ 2 -->
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .trap-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .trap-slot {
        border-radius: 8px;
        padding: 0.85rem 1rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
      }
      .slot-first {
        border-left: 4px solid #f59e0b;
        background: #fffbeb;
      }
      .slot-second {
        border-left: 4px solid #10b981;
        background: #f0fdf4;
      }
      .slot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .slot-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        &.badge-warning {
          background: #fef3c7;
          color: #92400e;
        }
        &.badge-success {
          background: #dcfce7;
          color: #166534;
        }
      }
      .slot-status {
        font-size: 0.8rem;
        font-weight: 600;
      }
      .slot-body {
        min-height: 42px;
        display: flex;
        align-items: center;
        padding: 0.5rem;
        background: #ffffff;
        border: 1px dashed #cbd5e1;
        border-radius: 6px;
      }
      .empty-notice {
        font-size: 0.8rem;
        color: #94a3b8;
        font-style: italic;
      }
    `,
  ],
})
export class AppMultiContentTrapComponent {}

// ============================================================================
// SUB-COMPONENT 3: AppModernCard (Multi-slot Projection với Selectors)
// Minh họa selectors: [card-header], [card-media], [card-body], [card-actions], default slot
// ============================================================================
@Component({
  selector: 'app-modern-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modern-card" [class]="'variant-' + variant">
      <!-- Slot 1: Header (Hỗ trợ attribute [card-header], class .card-header hoặc thẻ header) -->
      <div class="card-section section-header">
        <div class="slot-marker">
          <span class="marker-tag">Slot: [card-header] / .card-header</span>
        </div>
        <ng-content select="[card-header], .card-header, header"></ng-content>
      </div>

      <!-- Slot 2: Media Cover (Hình ảnh hoặc Banner) -->
      <div class="card-section section-media">
        <div class="slot-marker">
          <span class="marker-tag">Slot: [card-media]</span>
        </div>
        <ng-content select="[card-media]"></ng-content>
      </div>

      <!-- Slot 3: Body nội dung chính -->
      <div class="card-section section-body">
        <div class="slot-marker">
          <span class="marker-tag">Slot: [card-body], .card-body</span>
        </div>
        <ng-content select="[card-body], .card-body"></ng-content>
      </div>

      <!-- Slot 4: Catch-all Default Slot (Mọi thẻ không khớp selector sẽ rơi vào đây) -->
      <div class="card-section section-default">
        <div class="slot-marker">
          <span class="marker-tag">Default Slot: &lt;ng-content&gt; (Không selector)</span>
        </div>
        <ng-content></ng-content>
      </div>

      <!-- Slot 5: Actions / Footer -->
      <div class="card-section section-footer">
        <div class="slot-marker">
          <span class="marker-tag">Slot: [card-actions], footer</span>
        </div>
        <ng-content select="[card-actions], footer"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .modern-card {
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background: #ffffff;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;

        &.variant-bordered {
          box-shadow: none;
          border: 2px solid #cbd5e1;
        }

        &.variant-glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);
        }

        &.variant-gradient {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border-top: 4px solid #6366f1;
        }
      }
      .card-section {
        position: relative;
        padding: 0.85rem 1.25rem;
        border-bottom: 1px solid #f1f5f9;

        &:last-child {
          border-bottom: none;
        }
      }
      .section-header {
        background: #f8fafc;
      }
      .section-media {
        padding: 0;
        background: #0f172a;
        overflow: hidden;
      }
      .section-body {
        font-size: 0.9rem;
        line-height: 1.6;
        color: #334155;
      }
      .section-default {
        background: #fafafa;
        border-left: 3px solid #8b5cf6;
      }
      .section-footer {
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .slot-marker {
        margin-bottom: 0.35rem;
        .marker-tag {
          font-size: 0.68rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          background: #e2e8f0;
          color: #475569;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-weight: 600;
        }
      }
    `,
  ],
})
export class AppModernCardComponent {
  @Input() variant: CardVariant = 'elevated';
}

// ============================================================================
// SUB-COMPONENT 4: AppProjectAsDemo (Tuyệt chiêu ngProjectAs)
// Minh họa cách thức đưa một thẻ bất kỳ vào slot mong muốn bằng ngProjectAs
// ============================================================================
@Component({
  selector: 'app-project-as-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-as-card">
      <div class="slot-box target-slot">
        <div class="slot-desc">
          🎯 <strong>Slot Đích:</strong> <code>select="app-custom-badge"</code>
        </div>
        <div class="slot-content-area">
          <ng-content select="app-custom-badge"></ng-content>
        </div>
      </div>

      <div class="slot-box fallback-slot">
        <div class="slot-desc">
          📥 <strong>Slot Mặc Định (Fallback):</strong> <code>&lt;ng-content&gt;</code>
        </div>
        <div class="slot-content-area">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .project-as-card {
        border-radius: 10px;
        border: 1px solid #cbd5e1;
        overflow: hidden;
        background: #ffffff;
      }
      .slot-box {
        padding: 0.85rem 1.1rem;
        &.target-slot {
          background: #f0fdf4;
          border-bottom: 2px dashed #86efac;
        }
        &.fallback-slot {
          background: #f8fafc;
        }
      }
      .slot-desc {
        font-size: 0.825rem;
        margin-bottom: 0.4rem;
        color: #334155;
        code {
          font-size: 0.75rem;
          background: rgba(0, 0, 0, 0.06);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }
      }
      .slot-content-area {
        min-height: 38px;
        display: flex;
        align-items: center;
        padding: 0.4rem 0.6rem;
        background: #ffffff;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
    `,
  ],
})
export class AppProjectAsDemoComponent {}

// ============================================================================
// SUB-COMPONENT 5: AppLifecycleTracker (Kiểm chứng Eager Evaluation trong ng-content)
// Component con được chiếu vào để kiểm chứng thời điểm chạy ngOnInit & constructor
// ============================================================================
let trackerInstanceCounter = 0;

@Component({
  selector: 'app-lifecycle-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracker-badge">
      <span class="tracker-icon">⚡</span>
      <div class="tracker-info">
        <strong>Instance #{{ instanceId }}: {{ label }}</strong>
        <span class="tracker-time">Khởi tạo lúc: {{ initializedAt }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .tracker-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        background: #eff6ff;
        border: 1px solid #93c5fd;
        border-radius: 6px;
        padding: 0.4rem 0.75rem;
        font-size: 0.825rem;
        color: #1e3a8a;
      }
      .tracker-icon {
        font-size: 1.1rem;
      }
      .tracker-info {
        display: flex;
        flex-direction: column;
      }
      .tracker-time {
        font-size: 0.725rem;
        color: #64748b;
      }
    `,
  ],
})
export class AppLifecycleTrackerComponent implements OnInit, OnDestroy {
  @Input() label: string = 'Component Bên Trong ng-content';
  @Output() lifecycleLog = new EventEmitter<string>();

  readonly instanceId = ++trackerInstanceCounter;
  initializedAt: string = '';

  constructor() {
    this.initializedAt = new Date().toLocaleTimeString('vi-VN');
  }

  ngOnInit(): void {
    const msg = `[${this.initializedAt}] ⚡ Instance #${this.instanceId} ("${this.label}") ĐÃ GỌI ngOnInit()!`;
    this.lifecycleLog.emit(msg);
  }

  ngOnDestroy(): void {
    const time = new Date().toLocaleTimeString('vi-VN');
    this.lifecycleLog.emit(
      `[${time}] 🛑 Instance #${this.instanceId} ("${this.label}") ngOnDestroy()`
    );
  }
}

// ============================================================================
// SUB-COMPONENT 6: AppCollapsiblePanel (Accordion Panel kiểm chứng eager render)
// ============================================================================
@Component({
  selector: 'app-collapsible-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="collapsible-card">
      <div class="collapsible-header" (click)="toggleOpen()">
        <div class="header-left">
          <span class="chevron" [class.open]="isOpen">▶</span>
          <strong>{{ title }}</strong>
        </div>
        <span class="state-pill" [class.open]="isOpen">
          {{ isOpen ? 'Đang Mở (*ngIf=true)' : 'Đang Đóng (*ngIf=false)' }}
        </span>
      </div>

      <!-- ĐIỂM CỐT LÕI: Dù ở đây có *ngIf, thì nội dung trong <ng-content> VẪN ĐÃ ĐƯỢC CHA KHỞI TẠO! -->
      @if (isOpen) {
        <div class="collapsible-body">
          <div class="body-alert">
            ℹ️ Nội dung DOM bên dưới được hiển thị khi <code>isOpen=true</code>:
          </div>
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .collapsible-card {
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        overflow: hidden;
        background: #ffffff;
      }
      .collapsible-header {
        padding: 0.85rem 1.1rem;
        background: #f8fafc;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        &:hover {
          background: #f1f5f9;
        }
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .chevron {
        display: inline-block;
        transition: transform 0.2s ease;
        font-size: 0.75rem;
        color: #64748b;
        &.open {
          transform: rotate(90deg);
        }
      }
      .state-pill {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        background: #e2e8f0;
        color: #475569;
        &.open {
          background: #dcfce7;
          color: #166534;
        }
      }
      .collapsible-body {
        padding: 1rem 1.1rem;
        border-top: 1px solid #e2e8f0;
      }
      .body-alert {
        font-size: 0.775rem;
        color: #64748b;
        margin-bottom: 0.75rem;
        code {
          font-size: 0.725rem;
          background: #f1f5f9;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
        }
      }
    `,
  ],
})
export class AppCollapsiblePanelComponent {
  @Input() title: string = 'Collapsible Accordion';
  @Input() isOpen: boolean = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}

// ============================================================================
// MAIN COMPONENT: Day013ContentProjectionInAngular
// ============================================================================
@Component({
  imports: [
    CommonModule,
    FormsModule,
    AppCustomToggleComponent,
    AppMultiContentTrapComponent,
    AppModernCardComponent,
    AppProjectAsDemoComponent,
    AppLifecycleTrackerComponent,
    AppCollapsiblePanelComponent,
  ],
  selector: 'app-day013-content-projection-in-angular',
  styleUrl: './day013-content-projection-in-angular.scss',
  templateUrl: './day013-content-projection-in-angular.html',
})
export class Day013ContentProjectionInAngular {
  // Navigation tab
  readonly currentTab = signal<ActiveTab>('all');

  // Thông báo hành động vừa kích hoạt
  readonly lastActionMessage = signal<string>(
    'Sẵn sàng trải nghiệm Content Projection!'
  );

  // ==========================================================================
  // DEMO 1: Single-slot Toggle & Lab Khảo Sát Khách Hàng (Tài liệu gốc Day 13)
  // ==========================================================================
  readonly surveyQuestions = signal<SurveyQuestion[]>([
    {
      id: 'q1',
      title: 'Hài lòng với giao diện ứng dụng?',
      description: 'Đánh giá độ mượt mà và trực quan của hệ thống.',
      theme: 'blue',
      category: 'ux',
      checked: true,
      isRequired: true,
    },
    {
      id: 'q2',
      title: 'Bật thông báo đẩy qua Email?',
      description: 'Nhận bản tin cập nhật và báo cáo tự động mỗi sáng.',
      theme: 'emerald',
      category: 'feature',
      checked: false,
      isRequired: false,
    },
    {
      id: 'q3',
      title: 'Kích hoạt chế độ Dark Mode mặc định?',
      description: 'Giảm mỏi mắt khi làm việc vào ban đêm.',
      theme: 'purple',
      category: 'ux',
      checked: true,
      isRequired: false,
    },
    {
      id: 'q4',
      title: 'Bảo mật 2 lớp (2FA - Two Factor Authentication)?',
      description: 'Yêu cầu mã xác thực qua điện thoại khi đăng nhập.',
      theme: 'rose',
      category: 'security',
      checked: true,
      isRequired: true,
    },
    {
      id: 'q5',
      title: 'Tham gia chương trình Trải nghiệm Tính năng Sớm (Beta)?',
      description: 'Nhận quyền truy cập vào các module thử nghiệm mới.',
      theme: 'amber',
      category: 'feature',
      checked: false,
      isRequired: false,
    },
  ]);

  // Thống kê câu hỏi đã bật
  readonly agreedCount = computed(
    () => this.surveyQuestions().filter((q) => q.checked).length
  );
  readonly totalQuestions = computed(() => this.surveyQuestions().length);
  readonly completionPercent = computed(() =>
    Math.round((this.agreedCount() / this.totalQuestions()) * 100)
  );

  onQuestionToggle(questionId: string, newState: boolean): void {
    this.surveyQuestions.update((items) =>
      items.map((q) => (q.id === questionId ? { ...q, checked: newState } : q))
    );
    const target = this.surveyQuestions().find((q) => q.id === questionId);
    this.lastActionMessage.set(
      `Đã chuyển câu hỏi "${target?.title}" -> ${newState ? 'ĐỒNG Ý (Yes)' : 'TỪ CHỐI (No)'}`
    );
  }

  // ==========================================================================
  // DEMO 3: Modern Card Multi-slot & Đảo Thứ Tự Khai Báo
  // ==========================================================================
  readonly cardVariant = signal<CardVariant>('elevated');
  readonly isParentOrderReversed = signal<boolean>(false);
  readonly cardLikes = signal<number>(142);
  readonly isBookmarked = signal<boolean>(false);

  toggleParentOrder(): void {
    this.isParentOrderReversed.update((v) => !v);
    this.lastActionMessage.set(
      this.isParentOrderReversed()
        ? 'Đã đảo lộn thứ tự khai báo ở component cha! (Angular vẫn xếp đúng vị trí)'
        : 'Đã hoàn trả thứ tự khai báo chuẩn ở component cha.'
    );
  }

  toggleLike(): void {
    this.cardLikes.update((v) => v + 1);
    this.lastActionMessage.set(`Đã thả tim cho Thẻ Dự Án! (Tổng: ${this.cardLikes()})`);
  }

  toggleBookmark(): void {
    this.isBookmarked.update((v) => !v);
    this.lastActionMessage.set(
      this.isBookmarked()
        ? 'Đã lưu Thẻ Dự Án vào mục Yêu Thích!'
        : 'Đã gỡ Thẻ Dự Án khỏi mục Yêu Thích.'
    );
  }

  // ==========================================================================
  // DEMO 4: Kỹ thuật ngProjectAs
  // ==========================================================================
  readonly useProjectAs = signal<boolean>(true);

  toggleProjectAs(): void {
    this.useProjectAs.update((v) => !v);
    this.lastActionMessage.set(
      this.useProjectAs()
        ? 'Đã BẬT ngProjectAs="app-custom-badge" -> Phần tử nhảy vào Slot Đích!'
        : 'Đã TẮT ngProjectAs -> Thẻ <span> bị rơi xuống Slot Mặc Định!'
    );
  }

  // ==========================================================================
  // DEMO 5: Eager Evaluation & Vòng Đời Lifecycle
  // ==========================================================================
  readonly isCollapsibleOpen = signal<boolean>(false);
  readonly lifecycleLogs = signal<string[]>([
    `[${new Date().toLocaleTimeString('vi-VN')}] 🚀 Component Cha (Day013) vừa render xong.`,
  ]);

  addLifecycleLog(msg: string): void {
    this.lifecycleLogs.update((logs) => [msg, ...logs.slice(0, 15)]);
  }

  clearLogs(): void {
    this.lifecycleLogs.set([]);
    this.lastActionMessage.set('Đã làm trống lịch sử vòng đời.');
  }
}
