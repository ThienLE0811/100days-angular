import {
  Component,
  OnInit,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Observable,
  Subscription,
  interval,
  map,
  startWith,
  takeWhile,
  tap,
} from 'rxjs';

/**
 * ============================================================================
 * GHI CHÚ KIẾN TRÚC: TÁC DỤNG CỦA PIPES TRONG ANGULAR (BEYOND DATA TRANSFORMATION)
 * ============================================================================
 * Ngoài việc nhận Input biến đổi thành Output hiển thị lên UI, Pipe đóng 6 vai trò sống còn:
 *
 * 1. TỐI ƯU HIỆU NĂNG VƯỢT TRỘI (MEMOIZATION / CACHING):
 *    - Pure Pipe tự động cache kết quả. Chỉ khi Input thay đổi tham chiếu (reference),
 *      nó mới chạy lại.
 *    - Ngược lại, nếu gọi một Method/Function trong template: {{ getFormatted() }},
 *      hàm đó sẽ bị gọi lại trong MỌI chu kỳ Change Detection (gây giật lag giao diện).
 *
 * 2. QUẢN LÝ BẤT ĐỒNG BỘ & CHỐNG RÒ RỈ BỘ NHỚ (ASYNC PIPE):
 *    - AsyncPipe tự động subscribe Observable / Promise khi hiển thị.
 *    - Tự động unsubscribe khi component bị destroy, loại bỏ 100% nguy cơ Memory Leak
 *      mà không cần viết ngOnDestroy hay Subscription thủ công.
 *
 * 3. TÁCH BIỆT TRÁCH NHIỆM (SEPARATION OF CONCERNS / SRP):
 *    - Component: Tập trung vào Business Logic, State Management, API Calls.
 *    - Pipe: Đảm nhận riêng phần Presentation Formatting.
 *
 * 4. TÁI SỬ DỤNG CAO & TUÂN THỦ NGUYÊN TẮC DRY (DON'T REPEAT YOURSELF):
 *    - Viết 1 lần, dùng cho mọi component trong toàn bộ ứng dụng mà không cần copy code.
 *
 * 5. GHÉP NỐI LINH HOẠT (PIPE CHAINING):
 *    - Cho phép kết hợp nhiều bộ biến đổi liên tiếp: {{ date | medium | uppercase }}
 *      thay vì lồng ghép hàm phức tạp uppercase(medium(date)).
 *
 * 6. CỰC KỲ DỄ KIỂM THỬ ĐỘC LẬP (TESTABILITY):
 *    - Pipe là Class thuần túy (POJO). Viết Unit Test đơn giản bằng `new Pipe().transform(...)`
 *      mà không cần dựng DOM hay TestBed phức tạp.
 * ============================================================================
 */

// ============================================================================
// 1. DATA MODELS
// ============================================================================
export interface User {
  id: number;
  name: string;
  age: number;
  role: string;
}

export interface ActivityLog {
  id: number;
  time: string;
  type: 'BUILTIN' | 'CUSTOM' | 'CHANGE_DETECTION' | 'BENCHMARK';
  message: string;
}

// ============================================================================
// 2. CUSTOM PIPE 1: AppTitlePipe (Theo ví dụ trong docs/Day018)
// ============================================================================
@Pipe({
  name: 'appTitle',
  standalone: true,
})
export class AppTitlePipe implements PipeTransform {
  /**
   * Nhận vào resourceId và hai parameter tùy chọn (addText, editText)
   * Nếu resourceId có giá trị -> trả về editText; ngược lại trả về addText.
   */
  transform(
    resourceId: string | null | undefined,
    addText: string = 'Add',
    editText: string = 'Edit'
  ): string {
    return resourceId ? editText : addText;
  }
}

// ============================================================================
// 3. CUSTOM PIPE 2: IsAdultPipe (Pure Pipe - Mặc định)
// ============================================================================
@Pipe({
  name: 'isAdult',
  standalone: true,
  pure: true, // Mặc định trong Angular là pure: true -> Kích hoạt Memoization
})
export class IsAdultPipe implements PipeTransform {
  static executionCount = 0;

  transform(arr: User[] | null | undefined): User[] {
    IsAdultPipe.executionCount++;
    if (!arr) return [];
    return arr.filter((x) => x.age >= 18);
  }
}

// ============================================================================
// 4. CUSTOM PIPE 3: IsAdultImpurePipe (Impure Pipe - pure: false)
// ============================================================================
@Pipe({
  name: 'isAdultImpure',
  standalone: true,
  pure: false, // Kích hoạt lại mỗi khi Change Detection chạy
})
export class IsAdultImpurePipe implements PipeTransform {
  static executionCount = 0;

  transform(arr: User[] | null | undefined): User[] {
    IsAdultImpurePipe.executionCount++;
    if (!arr) return [];
    return arr.filter((x) => x.age >= 18);
  }
}

// ============================================================================
// 5. MAIN HOST COMPONENT: Day018Pipes
// ============================================================================
@Component({
  selector: 'app-day018-pipes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTitlePipe,
    IsAdultPipe,
    IsAdultImpurePipe,
  ],
  templateUrl: './day018-pipes.html',
  styleUrl: './day018-pipes.scss',
})
export class Day018Pipes implements OnInit, OnDestroy {
  // --- Demo 1: Built-in Pipes Data ---
  // Ngày ISO mẫu đúng theo tài liệu Day 18
  readonly isoDateString: string = '2020-06-24T09:00:00.000Z';
  currentDate: Date = new Date();
  sampleText: string = 'angular 100 days of code with pipes';
  samplePrice: number = 1250.75;
  sampleRatio: number = 0.8564;
  sampleDecimal: number = 12345.6789;
  sampleObject = {
    course: '100 Days of Angular',
    instructor: 'Trung Vo & Tiep Phan',
    topic: 'Pipes & Data Transformation',
    year: 2026,
    tags: ['Frontend', 'Angular', 'Reactive'],
  };

  // --- Demo 2: AsyncPipe & Timer ---
  countdownSeconds: number = 5;
  countdownTimer$!: Observable<number>;
  userIdChangeAfterFiveSeconds: string = 'USR-98765';
  private countdownSub?: Subscription;

  // Custom parameters cho AppTitlePipe
  customAddText: string = 'Tạo Mới';
  customEditText: string = 'Cập Nhật';

  // --- Demo 3: Pure vs Impure Pipe Data (Danh sách Users từ Day 18) ---
  users: User[] = [
    { id: 1, name: 'Tiep Phan', age: 30, role: 'Author / GDE' },
    { id: 2, name: 'Trung Vo', age: 28, role: 'Author' },
    { id: 3, name: 'Chau Tran', age: 29, role: 'Reviewer' },
    { id: 4, name: 'Tuan Anh', age: 16, role: 'Student' },
  ];

  // Inputs tạo user mới
  newUserName: string = '';
  newUserAge: number = 20;
  newUserRole: string = 'Developer';

  // --- Demo 4: Benchmark So Sánh: Template Function Call vs Pure Pipe ---
  methodExecutionCount: number = 0;
  dummyTriggerCounter: number = 0;

  /**
   * Phương thức format được gọi trực tiếp trên Template (BAD PRACTICE)
   * Chứng minh việc gọi hàm trong HTML khiến hàm chạy lại không kiểm soát
   */
  formatPriceWithMethod(price: number): string {
    this.methodExecutionCount++;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  triggerChangeDetection(): void {
    this.dummyTriggerCounter++;
    this.addLog(
      'BENCHMARK',
      `Kích hoạt Change Detection lần #${this.dummyTriggerCounter}! Method formatPriceWithMethod() đã bị gọi ${this.methodExecutionCount} lần, trong khi Pure Pipe được cache tối ưu!`
    );
  }

  // Thống kê số lần thực thi của Pure và Impure pipe
  get pureExecutions(): number {
    return IsAdultPipe.executionCount;
  }

  get impureExecutions(): number {
    return IsAdultImpurePipe.executionCount;
  }

  // Logs tương tác
  logs: ActivityLog[] = [];
  private logIdCounter = 1;

  ngOnInit(): void {
    this.startCountdownTimer();
    this.addLog(
      'BUILTIN',
      'Khởi tạo Day018Pipes. Đã nạp danh sách Built-in Pipes và Custom Pipes.'
    );
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  startCountdownTimer(): void {
    this.userIdChangeAfterFiveSeconds = 'USR-98765';
    this.countdownSeconds = 5;

    this.countdownTimer$ = interval(1000).pipe(
      map((val) => 4 - val),
      startWith(5),
      takeWhile((val) => val >= 0),
      tap((val) => {
        this.countdownSeconds = val;
        if (val === 0) {
          this.userIdChangeAfterFiveSeconds = '';
          this.addLog(
            'CUSTOM',
            'Hết thời gian đếm ngược! userId chuyển thành rỗng -> AppTitlePipe đổi title từ "Edit" sang "Add".'
          );
        }
      })
    );
  }

  resetTimer(): void {
    this.startCountdownTimer();
  }

  toggleUserId(): void {
    if (this.userIdChangeAfterFiveSeconds) {
      this.userIdChangeAfterFiveSeconds = '';
      this.addLog('CUSTOM', 'Đặt userId = "" -> Title chuyển sang "Add"');
    } else {
      this.userIdChangeAfterFiveSeconds = 'USR-' + Math.floor(1000 + Math.random() * 9000);
      this.addLog('CUSTOM', `Đặt userId = "${this.userIdChangeAfterFiveSeconds}" -> Title chuyển sang "Edit"`);
    }
  }

  // --- METHOD 1: MUTATE MẢNG TRỰC TIẾP VỚI PUSH (Pure Pipe không nhận biết) ---
  addUserMutate(): void {
    if (!this.newUserName.trim()) return;
    const nextId = this.users.length + 1;
    const userToAdd: User = {
      id: nextId,
      name: this.newUserName.trim(),
      age: Number(this.newUserAge),
      role: this.newUserRole,
    };

    // Mutate trực tiếp vào mảng hiện tại: reference KHÔNG ĐỔI
    this.users.push(userToAdd);

    this.addLog(
      'CHANGE_DETECTION',
      `[Mutate .push()] Đã thêm "${userToAdd.name}" (${userToAdd.age} tuổi). Reference mảng không đổi: Pure Pipe KHÔNG cập nhật, Impure Pipe CẬP NHẬT!`
    );
    this.newUserName = '';
  }

  // --- METHOD 2: TẠO REFERENCE MỚI VỚI SPREAD OPERATOR (Pure Pipe nhận biết ngay) ---
  addUserImmutable(): void {
    if (!this.newUserName.trim()) return;
    const nextId = this.users.length + 1;
    const userToAdd: User = {
      id: nextId,
      name: this.newUserName.trim(),
      age: Number(this.newUserAge),
      role: this.newUserRole,
    };

    // Tạo reference mới hoàn toàn: Pure Pipe lập tức chạy lại
    this.users = [...this.users, userToAdd];

    this.addLog(
      'CHANGE_DETECTION',
      `[Immutable [...users]] Đã thêm "${userToAdd.name}" (${userToAdd.age} tuổi). Reference mảng đã đổi: Cả Pure Pipe và Impure Pipe đều cập nhật!`
    );
    this.newUserName = '';
  }

  resetUserList(): void {
    this.users = [
      { id: 1, name: 'Tiep Phan', age: 30, role: 'Author / GDE' },
      { id: 2, name: 'Trung Vo', age: 28, role: 'Author' },
      { id: 3, name: 'Chau Tran', age: 29, role: 'Reviewer' },
      { id: 4, name: 'Tuan Anh', age: 16, role: 'Student' },
    ];
    this.addLog('CHANGE_DETECTION', 'Đã khôi phục danh sách users mặc định ban đầu.');
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'BUILTIN' | 'CUSTOM' | 'CHANGE_DETECTION' | 'BENCHMARK',
    message: string
  ): void {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    this.logs.unshift({
      id: this.logIdCounter++,
      time,
      type,
      message,
    });

    if (this.logs.length > 25) {
      this.logs.pop();
    }
  }
}
