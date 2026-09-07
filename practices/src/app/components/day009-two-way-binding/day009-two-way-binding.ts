import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ============================================================================
 * KIẾN TRÚC & NGUYÊN LÝ CỐT LÕI: CUSTOM TWO-WAY BINDING TRONG ANGULAR
 * ============================================================================
 *
 * 1. Khái niệm Two-way Binding ("Banana-in-a-box" [()]):
 *    - Là cơ chế đồng bộ dữ liệu hai chiều tự động giữa Component Class (TypeScript)
 *      và Giao diện Template (HTML/DOM).
 *    - Cú pháp [(property)] kết hợp giữa:
 *      + Ngoặc vuông [] (Property Binding - Dữ liệu truyền XUỐNG từ Cha vào Con)
 *      + Ngoặc tròn () (Event Binding - Sự kiện bắn LÊN từ Con ra Cha)
 *
 * 2. Bản chất của ngModel:
 *    - Cú pháp [(ngModel)]="name" thực chất là cú pháp viết tắt của:
 *      [ngModel]="name" (ngModelChange)="name = $event"
 *    - Thuộc về FormsModule, cần import FormsModule khi sử dụng.
 *
 * 3. Quy ước đặt tên (Naming Convention) để tạo Custom Two-way Binding:
 *    - Bất kỳ component nào cũng có thể hỗ trợ cú pháp [(foo)]="myVar" nếu tuân thủ:
 *      + Định nghĩa Input:  @Input() foo: Type;
 *      + Định nghĩa Output: @Output() fooChange = new EventEmitter<Type>();
 *    - BẮT BUỘC: Tên của Output phải bằng chính xác [Tên của Input] + hậu tố "Change".
 *      Ví dụ: checked -> checkedChange, count -> countChange, rating -> ratingChange.
 *
 * 4. Mở rộng hiện đại (Angular 17+/19+):
 *    - Giới thiệu Signal Two-way model():
 *      readonly checked = model<boolean>(false);
 *      -> Tự động sinh ra input 'checked' và output 'checkedChange' ngầm định chỉ với 1 dòng code!
 * ============================================================================
 */

export type ActiveLessonTab =
  | 'all'
  | 'ngmodel-basics'
  | 'toggle-demo'
  | 'stepper-demo'
  | 'rating-demo'
  | 'model-signal'
  | 'device-settings';

// ============================================================================
// SUB-COMPONENT 1: AppCustomToggleDay9 (Toggle Two-way [(checked)] chuẩn tài liệu)
// ============================================================================
@Component({
  selector: 'app-toggle-day9',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toggle-wrapper"
      [class.checked]="checked"
      tabindex="0"
      (click)="toggle()"
      (keydown.enter)="toggle()"
      (keydown.space)="toggle()"
      role="switch"
      [attr.aria-checked]="checked"
    >
      <div class="toggle"></div>
    </div>
  `,
  styles: [
    `
      .toggle-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: #fe4551;
        box-shadow: 0 10px 20px 0 rgba(254, 69, 81, 0.35);
        outline: none;

        &:focus-visible {
          box-shadow: 0 0 0 4px rgba(254, 69, 81, 0.4);
        }

        &:active {
          transform: scale(0.92);
          box-shadow: 0 6px 12px 0 rgba(254, 69, 81, 0.5);
        }

        .toggle {
          transition: all 0.25s ease-in-out;
          height: 16px;
          width: 16px;
          background-color: transparent;
          border: 6px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
        }

        &.checked {
          background-color: #10b981;
          box-shadow: 0 10px 20px 0 rgba(16, 185, 129, 0.35);

          &:focus-visible {
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.4);
          }

          &:active {
            box-shadow: 0 6px 12px 0 rgba(16, 185, 129, 0.5);
          }

          .toggle {
            width: 8px;
            height: 24px;
            background-color: #ffffff;
            border-color: transparent;
            border-radius: 12px;
          }
        }
      }
    `,
  ],
})
export class AppCustomToggleDay9Component {
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}

// ============================================================================
// SUB-COMPONENT 2: AppNumberStepper (Stepper Two-way [(count)])
// ============================================================================
@Component({
  selector: 'app-number-stepper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stepper-box">
      <button
        type="button"
        class="stepper-btn btn-minus"
        [disabled]="count <= min"
        (click)="decrement()"
        title="Giảm giá trị"
      >
        −
      </button>

      <div class="stepper-input-wrap">
        <input
          type="number"
          class="stepper-input"
          [ngModel]="count"
          (ngModelChange)="onInputChange($event)"
          [min]="min"
          [max]="max"
          [step]="step"
        />
        @if (unit) {
          <span class="stepper-unit">{{ unit }}</span>
        }
      </div>

      <button
        type="button"
        class="stepper-btn btn-plus"
        [disabled]="count >= max"
        (click)="increment()"
        title="Tăng giá trị"
      >
        +
      </button>
    </div>
  `,
  styles: [
    `
      .stepper-box {
        display: inline-flex;
        align-items: center;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0.25rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .stepper-btn {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        font-size: 1.15rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f1f5f9;
        }
      }
      .stepper-input-wrap {
        display: flex;
        align-items: center;
        padding: 0 0.5rem;
        position: relative;
      }
      .stepper-input {
        width: 56px;
        text-align: center;
        font-size: 0.95rem;
        font-weight: 700;
        color: #1e293b;
        border: none;
        background: transparent;
        outline: none;

        /* Hide spin arrows */
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
      .stepper-unit {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        margin-left: 0.2rem;
      }
    `,
  ],
})
export class AppNumberStepperComponent {
  @Input() count: number = 0;
  @Output() countChange = new EventEmitter<number>();
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() unit: string = '';

  increment(): void {
    if (this.count + this.step <= this.max) {
      this.count += this.step;
      this.countChange.emit(this.count);
    }
  }

  decrement(): void {
    if (this.count - this.step >= this.min) {
      this.count -= this.step;
      this.countChange.emit(this.count);
    }
  }

  onInputChange(val: number): void {
    const num = Number(val);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(num, this.min), this.max);
    this.count = clamped;
    this.countChange.emit(this.count);
  }
}

// ============================================================================
// SUB-COMPONENT 3: AppStarRating (Rating Two-way [(rating)])
// ============================================================================
@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating-widget" (mouseleave)="onLeave()">
      <div class="stars-row">
        @for (star of starsArray; track star) {
          <button
            type="button"
            class="star-btn"
            [class.filled]="star <= (hoveredStar() || rating)"
            (mouseenter)="onHover(star)"
            (click)="setRating(star)"
            [attr.aria-label]="'Đánh giá ' + star + ' sao'"
          >
            ★
          </button>
        }
      </div>

      <div class="rating-info-badge">
        <span class="score-text">{{ rating }}/{{ maxStars }} sao</span>
        @if (rating > 0) {
          <button type="button" class="btn-clear-rating" (click)="clearRating()" title="Đặt lại đánh giá">
            ✕
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .star-rating-widget {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.4rem 0.75rem;
      }
      .stars-row {
        display: flex;
        gap: 0.15rem;
      }
      .star-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        line-height: 1;
        color: #cbd5e1;
        cursor: pointer;
        padding: 0;
        transition: color 0.15s ease, transform 0.15s ease;

        &:hover {
          transform: scale(1.2);
        }

        &.filled {
          color: #f59e0b;
        }
      }
      .rating-info-badge {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: #475569;
      }
      .btn-clear-rating {
        background: #f1f5f9;
        border: none;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.65rem;
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: #fee2e2;
          color: #ef4444;
        }
      }
    `,
  ],
})
export class AppStarRatingComponent {
  @Input() rating: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
  @Input() maxStars: number = 5;

  readonly hoveredStar = signal<number>(0);

  get starsArray(): number[] {
    return Array.from({ length: this.maxStars }, (_, i) => i + 1);
  }

  onHover(star: number): void {
    this.hoveredStar.set(star);
  }

  onLeave(): void {
    this.hoveredStar.set(0);
  }

  setRating(star: number): void {
    this.rating = star;
    this.ratingChange.emit(this.rating);
  }

  clearRating(): void {
    this.rating = 0;
    this.ratingChange.emit(0);
  }
}

// ============================================================================
// MAIN COMPONENT: Day009TwoWayBinding
// ============================================================================
@Component({
  imports: [
    CommonModule,
    FormsModule,
    AppCustomToggleDay9Component,
    AppNumberStepperComponent,
    AppStarRatingComponent,
  ],
  selector: 'app-day009-two-way-binding',
  styleUrl: './day009-two-way-binding.scss',
  templateUrl: './day009-two-way-binding.html',
})
export class Day009TwoWayBinding {
  // Navigation tab
  readonly currentTab = signal<ActiveLessonTab>('all');

  // Thông báo hành động vừa kích hoạt
  readonly lastActionMessage = signal<string>(
    'Khởi tạo thành công phòng lab Custom Two-way Binding!'
  );

  // ==========================================================================
  // DEMO 1: ngModel & Phân rã cú pháp Banana-in-a-box
  // ==========================================================================
  userName = 'Tiep Phan'; // Giá trị mẫu từ tài liệu Day 9!

  onDeconstructedNameChange(val: string): void {
    this.userName = val;
    this.lastActionMessage.set(
      `[Deconstructed] ngModelChange phát tín hiệu: "${val}"`
    );
  }

  // ==========================================================================
  // DEMO 2: Toggle Component 2 chiều ([(checked)])
  // ==========================================================================
  toggleState = false;

  onToggleChangeFromParent(newState: boolean): void {
    this.toggleState = newState;
    this.lastActionMessage.set(
      `[Toggle 2-way] Cha nhận sự kiện checkedChange: ${newState ? 'BẬT (True)' : 'TẮT (False)'}`
    );
  }

  flipToggleFromParent(): void {
    this.toggleState = !this.toggleState;
    this.lastActionMessage.set(
      `[Toggle 2-way] Component cha chủ động đổi state: ${this.toggleState}`
    );
  }

  // ==========================================================================
  // DEMO 3: Number Stepper Component 2 chiều ([(count)])
  // ==========================================================================
  stepperQuantity = 3;

  onStepperChange(newCount: number): void {
    this.stepperQuantity = newCount;
    this.lastActionMessage.set(
      `[Stepper 2-way] Số lượng cập nhật 2 chiều: ${newCount} món`
    );
  }

  setStepperFromParent(val: number): void {
    this.stepperQuantity = val;
    this.lastActionMessage.set(
      `[Stepper 2-way] Component Cha đặt số lượng = ${val}`
    );
  }

  // ==========================================================================
  // DEMO 4: Star Rating Component 2 chiều ([(rating)])
  // ==========================================================================
  userRating = 4;

  onRatingChange(newRating: number): void {
    this.userRating = newRating;
    this.lastActionMessage.set(
      `[Rating 2-way] Đánh giá cập nhật 2 chiều: ${newRating} sao`
    );
  }

  // ==========================================================================
  // DEMO 6: Device Settings Panel (Phòng Lab Thực Tế Tổng Hợp)
  // ==========================================================================
  deviceName = 'MacBook Pro M3 Max';
  deviceWifi = true;
  deviceBluetooth = true;
  deviceBatterySaver = false;
  deviceVolume = 65;
  deviceBrightness = 80;
  deviceRating = 5;

  deviceConfigJson(): string {
    return JSON.stringify(
      {
        deviceName: this.deviceName,
        connectivity: {
          wifi: this.deviceWifi,
          bluetooth: this.deviceBluetooth,
          batterySaver: this.deviceBatterySaver,
        },
        audioAndDisplay: {
          volumePercent: this.deviceVolume,
          brightnessPercent: this.deviceBrightness,
        },
        userSatisfactionRating: `${this.deviceRating}/5 Stars`,
      },
      null,
      2
    );
  }

  resetDeviceSettings(): void {
    this.deviceName = 'MacBook Pro M3 Max';
    this.deviceWifi = true;
    this.deviceBluetooth = true;
    this.deviceBatterySaver = false;
    this.deviceVolume = 65;
    this.deviceBrightness = 80;
    this.deviceRating = 5;
    this.lastActionMessage.set('Đã hoàn tác cấu hình thiết bị về mặc định');
  }
}
