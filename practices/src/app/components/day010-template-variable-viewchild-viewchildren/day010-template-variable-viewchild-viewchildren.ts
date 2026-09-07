import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ============================================================================
 * KIẾN TRÚC & NGUYÊN LÝ CỐT LÕI: TEMPLATE VARIABLE & VIEWCHILD / VIEWCHILDREN
 * ============================================================================
 *
 * 1. Template Reference Variable (#varName):
 *    - Là cơ chế khai báo biến cục bộ trực tiếp trong template HTML bằng tiền tố "#".
 *    - Cho phép tham chiếu đến:
 *      + HTMLElement thuần túy: <input #myInput /> -> Gọi myInput.focus() ngay trên template!
 *      + Component instance: <app-toggle #myToggle /> -> Gọi myToggle.toggle() từ nút bấm của cha!
 *      + TemplateRef: <ng-template #myTmpl /> -> Truyền vào *ngIf="cond; else myTmpl".
 *
 * 2. Cú pháp exportAs (#varName="exportAs"):
 *    - Khi một phần tử có nhiều directive gắn vào, Angular cần biết bạn muốn lấy instance nào.
 *    - Ví dụ:
 *      <form #f="ngForm">: Lấy instance của NgForm directive để kiểm tra f.valid, f.submitted.
 *      <input [(ngModel)]="val" #ctrl="ngModel">: Lấy instance của NgModel để kiểm tra ctrl.touched, ctrl.dirty.
 *
 * 3. @ViewChild Decorator (Truy vấn 1 phần tử từ Template vào TypeScript Class):
 *    - Cú pháp: @ViewChild('selector', { static?: boolean, read?: any })
 *    - Options quan trọng:
 *      + static: true  -> Được resolve TRƯỚC Change Detection, có thể truy cập ngay trong ngOnInit().
 *                         Chỉ áp dụng khi phần tử KHÔNG nằm trong cấu trúc điều kiện (@if, *ngIf).
 *      + static: false -> Giá trị mặc định. Được resolve SAU Change Detection, CHỈ truy cập được từ ngAfterViewInit().
 *      + read: Cho phép đọc token cụ thể thay vì instance mặc định, ví dụ { read: ElementRef } để thao tác native DOM.
 *
 * 4. @ViewChildren Decorator & QueryList (Truy vấn danh sách phần tử):
 *    - Cú pháp: @ViewChildren(ComponentType) list: QueryList<ComponentType>;
 *    - Trả về đối tượng QueryList chứa danh sách component/element trước khi ngAfterViewInit được gọi.
 *    - Cung cấp các phương thức tiện ích: .forEach(), .map(), .filter(), .length,
 *      và Observable .changes phát tín hiệu mỗi khi số lượng phần tử trong DOM thay đổi!
 *
 * 5. Cập nhật Angular Hiện Đại (Signal Queries - Angular 17+/19+):
 *    - viewChild() và viewChildren(): Thay thế decorator bằng hàm trả về Signal,
 *      tự động theo dõi tính reactivity và tương thích hoàn hảo với zoneless/signals.
 * ============================================================================
 */

export type ActiveLessonTab =
  | 'all'
  | 'template-var'
  | 'export-as'
  | 'view-child'
  | 'view-children'
  | 'signal-queries'
  | 'smart-dashboard';

export interface SmartDevice {
  id: number;
  label: string;
  icon: string;
  checked: boolean;
  powerUsage: number; // Watt
}

// ============================================================================
// SUB-COMPONENT: AppToggleItem (Dùng cho cả ViewChild lẫn ViewChildren demo)
// ============================================================================
@Component({
  selector: 'app-toggle-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="device-card-inner"
      [class.active]="checked"
      tabindex="0"
      (click)="toggle()"
      (keydown.enter)="toggle()"
      (keydown.space)="toggle()"
      role="switch"
      [attr.aria-checked]="checked"
    >
      <div class="device-icon-box">{{ icon }}</div>
      <div class="device-meta">
        <span class="device-label">{{ label }}</span>
        <span class="device-state-pill">
          {{ checked ? 'ĐANG BẬT (ON)' : 'ĐANG TẮT (OFF)' }}
        </span>
      </div>
      <div class="device-switch-pill" [class.on]="checked">
        <span class="switch-ball"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .device-card-inner {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 1rem;
        border-radius: 12px;
        background: #ffffff;
        border: 2px solid #e2e8f0;
        cursor: pointer;
        user-select: none;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;

        &:hover {
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        &:focus-visible {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
        }

        &.active {
          background: #f0fdf4;
          border-color: #22c55e;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);

          .device-icon-box {
            background: #dcfce7;
            transform: scale(1.05);
          }

          .device-state-pill {
            color: #166534;
            font-weight: 700;
          }
        }
      }

      .device-icon-box {
        font-size: 1.5rem;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .device-meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex: 1;
      }

      .device-label {
        font-size: 0.9rem;
        font-weight: 700;
        color: #0f172a;
      }

      .device-state-pill {
        font-size: 0.725rem;
        font-weight: 600;
        color: #64748b;
      }

      .device-switch-pill {
        width: 44px;
        height: 24px;
        border-radius: 9999px;
        background: #cbd5e1;
        padding: 2px;
        display: flex;
        align-items: center;
        transition: background-color 0.25s ease;

        .switch-ball {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.on {
          background: #22c55e;
          .switch-ball {
            transform: translateX(20px);
          }
        }
      }
    `,
  ],
})
export class AppToggleItemComponent {
  @Input() label: string = 'Thiết Bị';
  @Input() icon: string = '⚡';
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }

  turnOn(): void {
    if (!this.checked) {
      this.checked = true;
      this.checkedChange.emit(true);
    }
  }

  turnOff(): void {
    if (this.checked) {
      this.checked = false;
      this.checkedChange.emit(false);
    }
  }
}

// ============================================================================
// MAIN COMPONENT: Day010TemplateVariableViewchildViewchildren
// ============================================================================
@Component({
  imports: [
    CommonModule,
    FormsModule,
    AppToggleItemComponent,
  ],
  selector: 'app-day010-template-variable-viewchild-viewchildren',
  styleUrl: './day010-template-variable-viewchild-viewchildren.scss',
  templateUrl: './day010-template-variable-viewchild-viewchildren.html',
})
export class Day010TemplateVariableViewchildViewchildren
  implements OnInit, AfterViewInit
{
  // Navigation tab
  readonly currentTab = signal<ActiveLessonTab>('all');

  // Thông báo hành động vừa kích hoạt
  readonly lastActionMessage = signal<string>(
    'Khởi tạo phòng lab Template Variable & ViewChild/ViewChildren thành công!'
  );

  // ==========================================================================
  // PHẦN 1: Template Variable cơ bản (#varName)
  // ==========================================================================
  sampleInputText = 'Angular 100 Days of Code';

  // ==========================================================================
  // PHẦN 2: Template Variable với exportAs (ngForm, ngModel)
  // ==========================================================================
  formModel = {
    fullName: 'Tiep Phan',
    email: 'tiepphan@example.com',
    role: 'Admin',
  };

  onFormSubmit(isValid: boolean | null): void {
    this.lastActionMessage.set(
      `[Form Submit] Trạng thái hợp lệ: ${isValid ? 'HỢP LỆ (Valid)' : 'KHÔNG HỢP LỆ (Invalid)'}`
    );
  }

  // ==========================================================================
  // PHẦN 3: @ViewChild (static: true vs static: false & read: ElementRef)
  // ==========================================================================
  // 1. Static: true -> Query được resolve trước Change Detection, có sẵn trong ngOnInit!
  @ViewChild('staticNativeInput', { static: true })
  staticNativeInputRef!: ElementRef<HTMLInputElement>;

  // 2. Static: false (mặc định) -> Truy vấn component con, chỉ sẵn sàng sau ngAfterViewInit!
  @ViewChild('singleTargetToggle')
  singleTargetToggleRef!: AppToggleItemComponent;

  // 3. Option read: ElementRef -> Lấy thẻ DOM native của custom component thay vì instance class
  @ViewChild('singleTargetToggle', { read: ElementRef })
  singleTargetToggleDomRef!: ElementRef<HTMLElement>;

  // Trạng thái kiểm chứng lifecycle
  readonly staticInitLog = signal<string>('Đang khởi tạo...');
  readonly afterViewInitLog = signal<string>('Đang khởi tạo...');
  readonly isSingleToggleChecked = signal<boolean>(false);

  ngOnInit(): void {
    // Kiểm chứng static: true
    if (this.staticNativeInputRef) {
      this.staticInitLog.set(
        `✅ [ngOnInit] static: true thành công! Đã lấy ElementRef: <input value="${this.staticNativeInputRef.nativeElement.value}">`
      );
    } else {
      this.staticInitLog.set('❌ [ngOnInit] Chưa tìm thấy static element');
    }
  }

  ngAfterViewInit(): void {
    // Kiểm chứng static: false cho Component
    if (this.singleTargetToggleRef) {
      this.afterViewInitLog.set(
        `✅ [ngAfterViewInit] @ViewChild thành công! Đã kết nối với Component: "${this.singleTargetToggleRef.label}"`
      );
    }

    // Lắng nghe sự kiện thay đổi danh sách QueryList (khi thêm/xóa thiết bị)
    this.allDevicesQueryList.changes.subscribe(() => {
      this.lastActionMessage.set(
        `⚡ [QueryList.changes] Số lượng component con trong DOM đã thay đổi: ${this.allDevicesQueryList.length} thiết bị`
      );
    });
  }

  toggleViaViewChild(): void {
    if (this.singleTargetToggleRef) {
      this.singleTargetToggleRef.toggle();
      this.isSingleToggleChecked.set(this.singleTargetToggleRef.checked);
      this.lastActionMessage.set(
        `[ViewChild Method Call] Đã gọi singleTargetToggleRef.toggle() từ Class -> Trạng thái: ${this.singleTargetToggleRef.checked}`
      );
    }
  }

  turnOnViaViewChild(): void {
    if (this.singleTargetToggleRef) {
      this.singleTargetToggleRef.turnOn();
      this.isSingleToggleChecked.set(true);
      this.lastActionMessage.set(
        '[ViewChild Method Call] Đã gọi singleTargetToggleRef.turnOn()'
      );
    }
  }

  turnOffViaViewChild(): void {
    if (this.singleTargetToggleRef) {
      this.singleTargetToggleRef.turnOff();
      this.isSingleToggleChecked.set(false);
      this.lastActionMessage.set(
        '[ViewChild Method Call] Đã gọi singleTargetToggleRef.turnOff()'
      );
    }
  }

  highlightViaReadElementRef(): void {
    if (this.singleTargetToggleDomRef) {
      const el = this.singleTargetToggleDomRef.nativeElement;
      el.style.transition = 'all 0.3s ease';
      el.style.transform = 'scale(1.04)';
      el.style.boxShadow = '0 0 20px 4px rgba(99, 102, 241, 0.6)';
      this.lastActionMessage.set(
        '[ViewChild read: ElementRef] Đã can thiệp trực tiếp native DOM style của Component con!'
      );
      setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '';
      }, 1200);
    }
  }

  // ==========================================================================
  // PHẦN 4 & 6: @ViewChildren, QueryList & Smart Device Control Dashboard
  // ==========================================================================
  @ViewChildren(AppToggleItemComponent)
  allDevicesQueryList!: QueryList<AppToggleItemComponent>;

  // Danh sách các thiết bị trong phòng lab
  readonly smartDevices = signal<SmartDevice[]>([
    { id: 1, label: 'Đèn Chiếu Sáng LED', icon: '💡', checked: true, powerUsage: 45 },
    { id: 2, label: 'Điều Hòa Trung Tâm', icon: '❄️', checked: true, powerUsage: 1200 },
    { id: 3, label: 'Quạt Thông Gió Lab', icon: '🌀', checked: false, powerUsage: 80 },
    { id: 4, label: 'Máy Bơm Dung Dịch', icon: '🧪', checked: false, powerUsage: 250 },
    { id: 5, label: 'Hệ Thống Báo Động', icon: '🚨', checked: true, powerUsage: 15 },
  ]);

  // Đếm số lượng thiết bị đang bật
  readonly activeCount = computed(
    () => this.smartDevices().filter((d) => d.checked).length
  );

  // Tổng công suất tiêu thụ điện (Watt)
  readonly totalPowerWatts = computed(() =>
    this.smartDevices()
      .filter((d) => d.checked)
      .reduce((acc, curr) => acc + curr.powerUsage, 0)
  );

  onDeviceToggleChange(deviceId: number, state: boolean): void {
    this.smartDevices.update((list) =>
      list.map((d) => (d.id === deviceId ? { ...d, checked: state } : d))
    );
    this.lastActionMessage.set(
      `Thiết bị #${deviceId} đã chuyển sang: ${state ? 'BẬT' : 'TẮT'}`
    );
  }

  turnAllOnViaViewChildren(): void {
    if (this.allDevicesQueryList) {
      // Gọi method turnOn() trên từng Component instance trong QueryList
      this.allDevicesQueryList.forEach((toggleComp) => toggleComp.turnOn());

      // Cập nhật lại state của cha
      this.smartDevices.update((list) =>
        list.map((d) => ({ ...d, checked: true }))
      );

      this.lastActionMessage.set(
        `[@ViewChildren Batch Action] Đã gọi turnOn() cho toàn bộ ${this.allDevicesQueryList.length} thiết bị!`
      );
    }
  }

  turnAllOffViaViewChildren(): void {
    if (this.allDevicesQueryList) {
      // Gọi method turnOff() trên từng Component instance trong QueryList
      this.allDevicesQueryList.forEach((toggleComp) => toggleComp.turnOff());

      // Cập nhật lại state của cha
      this.smartDevices.update((list) =>
        list.map((d) => ({ ...d, checked: false }))
      );

      this.lastActionMessage.set(
        `[@ViewChildren Emergency Shutdown] Đã tắt khẩn cấp toàn bộ ${this.allDevicesQueryList.length} thiết bị!`
      );
    }
  }

  addNewDevice(): void {
    const nextId = this.smartDevices().length + 1;
    const icons = ['🔬', '💻', '📡', '⚡', '🤖'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const newDevice: SmartDevice = {
      id: nextId,
      label: `Cảm Biến Ngoại Vi #${nextId}`,
      icon: randomIcon,
      checked: false,
      powerUsage: 30,
    };
    this.smartDevices.update((list) => [...list, newDevice]);
    this.lastActionMessage.set(`Đã thêm thiết bị mới: "${newDevice.label}"`);
  }

  removeLastDevice(): void {
    if (this.smartDevices().length > 1) {
      this.smartDevices.update((list) => list.slice(0, list.length - 1));
      this.lastActionMessage.set('Đã gỡ bỏ thiết bị cuối cùng khỏi hệ thống');
    }
  }
}
