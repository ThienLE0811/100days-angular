import {
  Component,
  Input,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';
import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ============================================================================
 * KIẾN TRÚC & NGUYÊN LÝ CỐT LÕI: NG-TEMPLATE, NGTEMPLATEOUTLET, NG-CONTAINER
 * ============================================================================
 *
 * 1. ng-template (Thành phần chứa HTML Template chưa render):
 *    - HTML được bọc trong <ng-template> KHÔNG BAO GIỜ render ngay ra DOM.
 *    - Nó chỉ được biên dịch thành một TemplateRef và chờ được instantiate bởi:
 *      + Structural directives (*ngIf else, *ngFor)
 *      + ngTemplateOutlet
 *      + ViewContainerRef.createEmbeddedView()
 *    - Dùng khi:
 *      + Cần khối giao diện dự phòng (else branch)
 *      + Cần tái sử dụng 1 khối UI nhỏ (dry) trong cùng component mà không cần tách component
 *      + Truyền template vào component con để cho phép component ngoài override giao diện mặc định
 *
 * 2. ngTemplateOutlet (Chỉ thị chèn TemplateRef vào DOM):
 *    - Cú pháp: [ngTemplateOutlet]="templateRef" hoặc *ngTemplateOutlet="templateRef"
 *    - Truyền dữ liệu vào template qua ngTemplateOutletContext:
 *      + Biến tường minh (Explicit): let-myVar="contextKey" -> context: { contextKey: value }
 *      + Biến ngầm định (Implicit): let-item -> context: { $implicit: value }
 *
 * 3. ng-container (Thẻ nhóm ảo - Zero DOM Overhead):
 *    - Một custom tag không tạo ra bất kỳ thẻ HTML nào trên DOM thật khi render.
 *    - Giải quyết 3 vấn đề lớn:
 *      + Không phá vỡ CSS Flexbox / CSS Grid (vốn đòi hỏi các item là direct children)
 *      + Không làm sai bộ chọn CSS cha-con trực tiếp (.parent > .child)
 *      + Không tạo HTML không hợp lệ (ví dụ chèn <div> bên trong <table> hay <ul>)
 *      + Là giá đỡ hoàn hảo cho [ngTemplateOutlet] và structural directives
 * ============================================================================
 */

export interface DemoUser {
  id: number;
  name: string;
  role: 'Admin' | 'Developer' | 'Designer' | 'Tester';
  email: string;
  avatar: string;
  badgeCount: number;
  isActive: boolean;
}

export interface DynamicButtonContext {
  $implicit?: string;
  label: string;
  className: string;
  icon?: string;
  badge?: number;
  actionKey: string;
}

/**
 * Sub-component minh họa việc nhận TemplateRef từ bên ngoài để override Header
 */
@Component({
  selector: 'app-sub-tab-container',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  template: `
    <div class="sub-tab-card">
      <div class="sub-tab-header">
        <!-- Nếu parent truyền headerTemplate thì dùng, nếu không thì fallback về defaultTabHeader -->
        <ng-container
          [ngTemplateOutlet]="headerTemplate || defaultTabHeader"
          [ngTemplateOutletContext]="{ title: title, totalTabs: 3 }"
        ></ng-container>
      </div>
      <div class="sub-tab-content">
        <ng-content></ng-content>
      </div>
    </div>

    <!-- Template mặc định được định nghĩa sẵn trong con -->
    <ng-template #defaultTabHeader let-t="title" let-tabs="totalTabs">
      <div class="default-header-wrapper">
        <div class="default-badge">📌 Giao diện Tab Mặc Định (Từ Component Con)</div>
        <div class="default-tabs-row">
          <span class="tab-item active">📁 {{ t }}</span>
          <span class="tab-item">⚙️ Thiết lập</span>
          <span class="tab-item">📊 Thống kê ({{ tabs }} mục)</span>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .sub-tab-card {
      border: 2px dashed #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      background: #f8fafc;
    }
    .sub-tab-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
    }
    .default-header-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .default-badge {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }
    .default-tabs-row {
      display: flex;
      gap: 0.5rem;
    }
    .tab-item {
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.825rem;
      color: #64748b;
      background: #f1f5f9;
      cursor: pointer;
      &.active {
        background: #3b82f6;
        color: #ffffff;
        font-weight: 600;
      }
    }
    .sub-tab-content {
      padding: 1.25rem;
    }
  `],
})
export class SubTabContainerComponent {
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() title: string = 'Tổng quan Dự án';
}

@Component({
  imports: [
    CommonModule,
    NgTemplateOutlet,
    NgClass,
    FormsModule,
    SubTabContainerComponent,
  ],
  selector: 'app-day014-ng-template-ng-template-outlet-ng-container',
  styleUrl: './day014-ng-template-ng-template-outlet-ng-container.scss',
  templateUrl: './day014-ng-template-ng-template-outlet-ng-container.html',
})
export class Day014NgTemplateNgTemplateOutletNgContainer {
  // Navigation tabs trong bài học
  readonly currentTab = signal<'all' | 'basics' | 'reusable-ui' | 'context' | 'override' | 'ng-container' | 'advanced-list'>('all');

  // ==========================================
  // DEMO 1: PG-13 & ng-template Basics
  // ==========================================
  readonly userAge = signal<number>(16);
  readonly canWatchPG13 = computed(() => this.userAge() >= 13);

  // ==========================================
  // DEMO 2: Tái sử dụng UI Snippet (Counter)
  // ==========================================
  readonly counter = signal<number>(4);
  readonly counterTheme = signal<'emerald' | 'indigo' | 'rose' | 'amber'>('emerald');

  incrementCounter(): void {
    this.counter.update(v => v + 1);
  }

  decrementCounter(): void {
    this.counter.update(v => (v > 0 ? v - 1 : 0));
  }

  resetCounter(): void {
    this.counter.set(0);
  }

  // ==========================================
  // DEMO 3: ngTemplateOutlet & ngTemplateOutletContext
  // ==========================================
  readonly dynamicButtons: DynamicButtonContext[] = [
    {
      $implicit: 'Lưu thay đổi',
      label: 'Lưu vào hệ thống',
      className: 'btn-emerald',
      icon: '💾',
      badge: 3,
      actionKey: 'save',
    },
    {
      $implicit: 'Xóa bài viết',
      label: 'Gỡ bỏ dữ liệu',
      className: 'btn-rose',
      icon: '🗑️',
      badge: 0,
      actionKey: 'delete',
    },
    {
      $implicit: 'Xuất PDF',
      label: 'Tải tài liệu PDF',
      className: 'btn-indigo',
      icon: '📄',
      badge: 12,
      actionKey: 'export',
    },
    {
      $implicit: 'Gửi Email',
      label: 'Email xác thực',
      className: 'btn-amber',
      icon: '✉️',
      badge: 5,
      actionKey: 'email',
    },
  ];

  // Form thêm button linh hoạt
  customBtnLabel = 'Chạy tiến trình';
  customBtnClass = 'btn-indigo';
  customBtnIcon = '⚡';
  customBtnBadge = 8;
  implicitText = 'Nhãn ngầm định ($implicit)';
  lastActionMessage = signal<string>('Sẵn sàng thực thi...');

  onExecuteAction(action: string, label: string): void {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    this.lastActionMessage.set(`[${timestamp}] Đã kích hoạt: "${label}" (Key: ${action})`);
  }

  // ==========================================
  // DEMO 4: Template Override với SubTabContainer
  // ==========================================
  readonly useCustomHeader = signal<boolean>(false);
  readonly parentTabTitle = signal<string>('Báo cáo doanh số Q3');
  readonly loginCustomText = signal<string>('🔑 Đăng nhập Quản trị');
  readonly newAccountText = signal<string>('✨ Tạo tài khoản VIP');

  toggleCustomHeader(): void {
    this.useCustomHeader.update(v => !v);
  }

  // ==========================================
  // DEMO 5: ng-container vs <div> Layout Test
  // ==========================================
  readonly useDivBreaker = signal<boolean>(false);
  readonly showItemA = signal<boolean>(true);
  readonly showItemB = signal<boolean>(true);
  readonly showItemC = signal<boolean>(true);

  toggleDivBreaker(): void {
    this.useDivBreaker.update(v => !v);
  }

  // ==========================================
  // DEMO 6: Generic Data List Template
  // ==========================================
  readonly viewMode = signal<'grid' | 'table' | 'compact'>('grid');
  readonly filterRole = signal<string>('all');

  readonly users = signal<DemoUser[]>([
    {
      id: 1,
      name: 'Nguyễn Văn An',
      role: 'Admin',
      email: 'an.nguyen@example.com',
      avatar: '👨‍💼',
      badgeCount: 14,
      isActive: true,
    },
    {
      id: 2,
      name: 'Trần Thị Bích',
      role: 'Developer',
      email: 'bich.tran@example.com',
      avatar: '👩‍💻',
      badgeCount: 26,
      isActive: true,
    },
    {
      id: 3,
      name: 'Lê Hoàng Cường',
      role: 'Designer',
      email: 'cuong.le@example.com',
      avatar: '🎨',
      badgeCount: 8,
      isActive: false,
    },
    {
      id: 4,
      name: 'Phạm Minh Dũng',
      role: 'Developer',
      email: 'dung.pham@example.com',
      avatar: '🧑‍💻',
      badgeCount: 19,
      isActive: true,
    },
    {
      id: 5,
      name: 'Vũ Thảo Hương',
      role: 'Tester',
      email: 'huong.vu@example.com',
      avatar: '🕵️‍♀️',
      badgeCount: 11,
      isActive: true,
    },
  ]);

  readonly filteredUsers = computed(() => {
    const role = this.filterRole();
    if (role === 'all') return this.users();
    return this.users().filter(u => u.role === role);
  });
}
