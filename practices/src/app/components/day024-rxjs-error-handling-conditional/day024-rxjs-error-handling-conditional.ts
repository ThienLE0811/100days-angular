import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EMPTY,
  Observable,
  Subject,
  Subscription,
  catchError,
  concatMap,
  defaultIfEmpty,
  delay,
  every,
  first,
  forkJoin,
  from,
  iif,
  map,
  of,
  retry,
  take,
  takeUntil,
  throwError,
  throwIfEmpty,
  timer,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS (Based on docs/Day024-rxjs-error-handling-conditional.md)
 * ============================================================================
 */
export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'ERROR' | 'CATCH' | 'RETRY' | 'COMPLETE' | 'INFO';
  operator: string;
  message: string;
}

export interface ErrorConditionalSpec {
  operator: string;
  category: 'Error Handling' | 'Conditional';
  description: string;
  behaviorOnErrorOrEmpty: string;
  angularUseCase: string;
  syntax: string;
}

export interface QuickSummaryItem {
  requirement: string;
  operator: string;
  badgeClass: string;
  icon: string;
  autoComplete: string;
  angularUseCase: string;
}

export interface ForkJoinResponseItem {
  name: string;
  status: 'SUCCESS' | 'ERROR';
  data?: any;
  errorMsg?: string;
}

@Component({
  selector: 'app-day024-rxjs-error-handling-conditional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day024-rxjs-error-handling-conditional.html',
  styleUrl: './day024-rxjs-error-handling-conditional.scss',
})
export class Day024RxjsErrorHandlingConditional implements OnInit, OnDestroy {
  // Navigation tabs
  activeTab: 'catch-error' | 'retry' | 'empty-conditional' | 'every-iif' | 'cheatsheet' =
    'catch-error';

  // ============================================================================
  // DEMO 1: catchError & Safe forkJoin
  // ============================================================================
  // Demo 1A: Basic Catch & Fallback
  catchMode: 'without-catch' | 'catch-and-fallback' | 'catch-retry-limit' = 'catch-and-fallback';
  catchSourceValues: number[] = [1, 2, 3, 4, 5];
  cachedDuplicates: number[] = [4, 5];
  catchExecutionItems: Array<{ value: any; isError: boolean; note: string }> = [];
  isCatchRunning: boolean = false;
  catchTerminalStatus: string = '';
  private catchSub?: Subscription;

  // Demo 1B: Resilient forkJoin
  forkJoinMode: 'unsafe' | 'safe' = 'safe';
  isForkJoinLoading: boolean = false;
  forkJoinResults: ForkJoinResponseItem[] = [];
  forkJoinErrorMessage: string = '';
  private forkJoinSub?: Subscription;

  // ============================================================================
  // DEMO 2: retry & Exponential Backoff
  // ============================================================================
  // Demo 2A: Fixed Retry
  retryMaxCount: number = 3;
  failTimesBeforeSuccess: number = 2; // Sẽ lỗi 2 lần rồi thành công ở lần 3
  private currentAttemptCount: number = 0;
  retryStatusText: string = 'Sẵn sàng mô phỏng kết nối API không ổn định';
  retryState: 'IDLE' | 'ATTEMPTING' | 'SUCCESS' | 'FAILED' = 'IDLE';
  retryHistory: Array<{ attempt: number; time: string; status: 'FAIL' | 'SUCCESS'; detail: string }> =
    [];
  private retrySub?: Subscription;

  // Demo 2B: Exponential Backoff Retry
  isBackoffRunning: boolean = false;
  backoffAttempts: Array<{ attempt: number; delayMs: number; time: string }> = [];
  backoffFinalMessage: string = '';

  // ============================================================================
  // DEMO 3: defaultIfEmpty & throwIfEmpty
  // ============================================================================
  // Demo 3A: defaultIfEmpty
  searchQuery: string = 'Ruby';
  availableItems: string[] = ['Angular 19', 'RxJS 7', 'TypeScript', 'NgRx SignalStore'];
  filteredResults: string[] = [];
  defaultIfEmptyResult: string = '';

  // Demo 3B: throwIfEmpty (Transaction / OTP confirmation timeout)
  isTransactionActive: boolean = false;
  transactionCountdown: number = 5;
  transactionStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'EXPIRED' = 'IDLE';
  transactionMessage: string = '';
  private confirmAction$ = new Subject<string>();
  private transactionCountdownSub?: Subscription;
  private transactionSub?: Subscription;

  // ============================================================================
  // DEMO 4: every & iif
  // ============================================================================
  // Demo 4A: every vs some
  studentScores: number[] = [85, 72, 90, 68, 55];
  scoreThreshold: number = 50;
  everyResult: boolean | null = null;
  someResult: boolean | null = null;

  // Demo 4B: iif (Subscription-time condition)
  isUserVip: boolean = true;
  iifResult: { title: string; discount: string; accessLevel: string } | null = null;

  // ============================================================================
  // ACTIVITY LOGGER & CLEANUP
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CHEATSHEET & DECISION MATRIX
  // ============================================================================
  readonly quickSummaryList: QuickSummaryItem[] = [
    {
      requirement: 'Bắt lỗi từ HTTP/Stream và trả về giá trị dự phòng (Fallback) tránh sập app',
      operator: 'catchError(err => of(fallback))',
      badgeClass: 'badge-danger',
      icon: '🛡️',
      autoComplete: 'Theo stream fallback',
      angularUseCase: 'Bọc từng API con trong forkJoin; hoặc trả về [] khi tải danh sách thất bại.',
    },
    {
      requirement: 'Tự động thử lại gọi API khi gặp lỗi mạng/máy chủ chập chờn (tối đa N lần)',
      operator: 'retry(3) / retry({ count, delay })',
      badgeClass: 'badge-warning',
      icon: '🔄',
      autoComplete: 'Theo stream gốc',
      angularUseCase: 'Thử lại request GET khi nhận lỗi 503/504 hoặc offline, không dùng cho POST/DELETE.',
    },
    {
      requirement: 'Thử lại có giãn cách thời gian tăng dần theo cấp số nhân (Exponential Backoff)',
      operator: 'retry({ delay: (err, retryCount) => timer(...) })',
      badgeClass: 'badge-accent',
      icon: '⏳',
      autoComplete: 'Theo luồng retry',
      angularUseCase: 'Tái kết nối WebSocket hoặc gọi lại API sau 1s, 2s, 4s, 8s để tránh nghẽn server.',
    },
    {
      requirement: 'Cung cấp giá trị mặc định nếu stream hoàn tất (complete) mà KHÔNG có giá trị nào',
      operator: 'defaultIfEmpty(defaultValue)',
      badgeClass: 'badge-info',
      icon: '📦',
      autoComplete: 'CÓ (Tự đóng)',
      angularUseCase: 'Xử lý kết quả tìm kiếm rỗng, đảm bảo template luôn nhận mảng [] thay vì undefined.',
    },
    {
      requirement: 'Chủ động ném ra lỗi nếu stream hoàn tất (complete) mà không phát ra bất kỳ value nào',
      operator: 'throwIfEmpty(() => new Error(...))',
      badgeClass: 'badge-danger',
      icon: '🚨',
      autoComplete: 'KHÔNG (Terminate bằng Error)',
      angularUseCase: 'Bắt buộc thao tác: hủy phiên giao dịch nếu người dùng không click xác nhận trong 1s.',
    },
    {
      requirement: 'Kiểm tra xem TẤT CẢ giá trị trong stream có thỏa mãn một điều kiện hay không',
      operator: 'every(x => condition)',
      badgeClass: 'badge-primary',
      icon: '⚖️',
      autoComplete: 'CÓ (Khi source complete hoặc gặp false)',
      angularUseCase: 'Kiểm tra tính hợp lệ của tất cả các bước trong Wizard Form hoặc danh sách file upload.',
    },
    {
      requirement: 'Quyết định chọn 1 trong 2 luồng Observable dựa vào điều kiện TẠI LÚC SUBSCRIBE',
      operator: 'iif(() => isVip, vipStream$, guestStream$)',
      badgeClass: 'badge-secondary',
      icon: '🔀',
      autoComplete: 'Theo stream được chọn',
      angularUseCase: 'Tải cấu hình giao diện VIP vs Thường, hoặc tải dữ liệu cache vs live API tùy trạng thái.',
    },
  ];

  readonly cheatsheetSpecs: ErrorConditionalSpec[] = [
    {
      operator: 'catchError',
      category: 'Error Handling',
      description: 'Bắt lỗi từ source Observable và trả về Observable mới hoặc ném lỗi đã biến đổi.',
      behaviorOnErrorOrEmpty: 'Chuyển hướng sang Observable fallback, stream không bị đứt đoạn.',
      angularUseCase: 'Bảo vệ forkJoin() trong trang Dashboard; hiển thị dữ liệu fallback khi API lỗi.',
      syntax: 'source$.pipe(catchError((err, caught) => of(fallbackValue)))',
    },
    {
      operator: 'retry(count)',
      category: 'Error Handling',
      description: 'Tự động subscribe lại vào source Observable khi gặp lỗi, tối đa N lần.',
      behaviorOnErrorOrEmpty: 'Resubscribe ngay khi có error. Hết lượt retry mới phát error.',
      angularUseCase: 'Tự động thử lại HTTP GET request khi rớt mạng tạm thời hoặc timeout.',
      syntax: 'http.get(...).pipe(retry(3))',
    },
    {
      operator: 'retryWhen / retryBackoff',
      category: 'Error Handling',
      description: 'Tùy biến thời điểm retry (ví dụ: khoảng thời gian chờ tăng theo cấp số nhân).',
      behaviorOnErrorOrEmpty: 'Kiểm soát chiến lược thử lại qua notifier stream.',
      angularUseCase: 'Kết nối lại WebSocket hoặc đồng bộ dữ liệu ngoại tuyến (Offline Sync).',
      syntax: 'source$.pipe(retryBackoff({ initialInterval: 1000, maxRetries: 3 }))',
    },
    {
      operator: 'defaultIfEmpty(defaultValue)',
      category: 'Conditional',
      description: 'Phát giá trị mặc định nếu source Observable complete mà KHÔNG phát bất kỳ giá trị nào.',
      behaviorOnErrorOrEmpty: 'Nếu stream rỗng (EMPTY), phát defaultValue trước khi complete.',
      angularUseCase: 'Xử lý tìm kiếm không có kết quả, đảm bảo AsyncPipe luôn nhận giá trị thay vì null.',
      syntax: 'items$.pipe(defaultIfEmpty([]))',
    },
    {
      operator: 'throwIfEmpty(errorFactory)',
      category: 'Conditional',
      description: 'Ném ra lỗi nếu source Observable complete mà chưa từng phát ra giá trị nào.',
      behaviorOnErrorOrEmpty: 'Nếu stream rỗng (EMPTY), phát ra Error từ errorFactory.',
      angularUseCase: 'Hạn chót thao tác: Hủy đơn hoặc transaction nếu người dùng không click trong X giây.',
      syntax: 'userClick$.pipe(takeUntil(timer(5000)), throwIfEmpty(() => new Error("Timeout")))',
    },
    {
      operator: 'every(predicate)',
      category: 'Conditional',
      description: 'Kiểm tra xem TẤT CẢ giá trị emit của source có thỏa mãn hàm điều kiện không.',
      behaviorOnErrorOrEmpty: 'Trả về true nếu toàn bộ thỏa mãn, false nếu có ít nhất 1 item không thỏa mãn.',
      angularUseCase: 'Validate form hàng loạt, kiểm tra toàn bộ file upload có hợp lệ trước khi gửi.',
      syntax: 'scores$.pipe(every(x => x >= 50))',
    },
    {
      operator: 'iif(condition, trueResult$, falseResult$)',
      category: 'Conditional',
      description: 'Đánh giá hàm condition() tại THỜI ĐIỂM SUBSCRIBE để quyết định subscribe vào luồng nào.',
      behaviorOnErrorOrEmpty: 'Chọn 1 trong 2 Observable để lắng nghe; stream còn lại hoàn toàn không được kích hoạt.',
      angularUseCase: 'Tải dữ liệu phân quyền (Admin vs Guest) hoặc lấy dữ liệu từ Cache vs Remote API.',
      syntax: 'iif(() => authService.isLoggedIn, userProfile$, publicInfo$)',
    },
  ];

  ngOnInit(): void {
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day024RxjsErrorHandlingConditional: Đã sẵn sàng khám phá Error Handling & Conditional Operators!'
    );
    this.runFilterSearchDemo();
    this.evaluateScores();
    this.evaluateIifDemo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.catchSub?.unsubscribe();
    this.forkJoinSub?.unsubscribe();
    this.retrySub?.unsubscribe();
    this.transactionCountdownSub?.unsubscribe();
    this.transactionSub?.unsubscribe();
  }

  // ============================================================================
  // 1. DEMO: catchError & Safe forkJoin
  // ============================================================================
  runCatchErrorDemo(mode: 'without-catch' | 'catch-and-fallback' | 'catch-retry-limit'): void {
    this.catchSub?.unsubscribe();
    this.catchMode = mode;
    this.catchExecutionItems = [];
    this.catchTerminalStatus = '';
    this.isCatchRunning = true;

    this.addLog(
      'INFO',
      'catchError()',
      `Khởi chạy chế độ [${mode}]: Dãy số [1, 2, 3, 4, 5]. Số 4 và 5 nằm trong danh sách cached duplicate nên sẽ throw Error!`
    );

    const source$ = of(...this.catchSourceValues).pipe(
      map((n) => {
        if (this.cachedDuplicates.includes(n)) {
          throw new Error(`Phát hiện giá trị trùng lặp: ${n}`);
        }
        return n;
      })
    );

    let stream$: Observable<any>;

    if (mode === 'without-catch') {
      // Không dùng catchError: stream sẽ bị đứt đoạn ngay tại n = 4
      stream$ = source$;
    } else if (mode === 'catch-and-fallback') {
      // Dùng catchError chuyển lỗi thành giá trị thay thế an toàn
      stream$ = source$.pipe(
        catchError((err) => {
          this.addLog('CATCH', 'catchError()', `Bắt lỗi thành công: "${err.message}". Trả về giá trị Fallback.`);
          return of({ fallback: true, message: `Dữ liệu thay thế an toàn (${err.message})` });
        })
      );
    } else {
      // Dùng catchError resubscribe kèm take(8) như trong docs Day 24
      stream$ = source$.pipe(
        catchError((err, caught) => {
          this.addLog(
            'CATCH',
            'catchError()',
            `Bắt lỗi "${err.message}". Thử retry bằng cách trả về caught Observable!`
          );
          return caught;
        }),
        take(8)
      );
    }

    this.catchSub = stream$.subscribe({
      next: (val) => {
        const isErr = val && typeof val === 'object' && val.fallback;
        this.catchExecutionItems.push({
          value: isErr ? val.message : val,
          isError: isErr,
          note: isErr ? 'Được phục hồi từ catchError' : 'Giá trị hợp lệ từ source',
        });
        this.addLog(
          'NEXT',
          'catchError()',
          `Emit giá trị: ${typeof val === 'object' ? JSON.stringify(val) : val}`
        );
      },
      error: (err) => {
        this.isCatchRunning = false;
        this.catchTerminalStatus = `❌ Stream bị hủy (Error): ${err.message}`;
        this.addLog(
          'ERROR',
          'Stream.error()',
          `Stream dừng đột ngột! Lỗi chưa được handle: ${err.message}`
        );
      },
      complete: () => {
        this.isCatchRunning = false;
        this.catchTerminalStatus = '✅ Stream hoàn thành thành công (Complete)!';
        this.addLog('COMPLETE', 'Stream.complete()', 'Stream đã hoàn tất an toàn!');
      },
    });
  }

  runForkJoinResilienceDemo(mode: 'unsafe' | 'safe'): void {
    this.forkJoinSub?.unsubscribe();
    this.forkJoinMode = mode;
    this.isForkJoinLoading = true;
    this.forkJoinResults = [];
    this.forkJoinErrorMessage = '';

    this.addLog(
      'INFO',
      'forkJoin()',
      mode === 'unsafe'
        ? 'Gọi 3 API song song KHÔNG có catchError: API #3 trả về lỗi 401 Unauthorized...'
        : 'Gọi 3 API song song CÓ catchError ở API #3: Đảm bảo dữ liệu 2 API còn lại vẫn hiển thị bình thường!'
    );

    // Mock API 1: User Profile (thành công sau 600ms)
    const profileApi$ = of({ id: 1, name: 'Nguyễn Văn A', role: 'Fullstack Dev' }).pipe(delay(600));

    // Mock API 2: Notifications (thành công sau 800ms)
    const notificationsApi$ = of(['Thông báo #1: Họp team lúc 9h', 'Thông báo #2: Deploy v1.4']).pipe(
      delay(800)
    );

    // Mock API 3: Recommendations (bị lỗi 401 Unauthorized sau 700ms)
    const failingRecommendationsApi$ = timer(700).pipe(
      concatMap(() => throwError(() => new Error('HTTP 401: Unauthorized (Hết hạn phiên đăng nhập)')))
    );

    if (mode === 'unsafe') {
      // Không bọc catchError: Một request lỗi kéo theo toàn bộ forkJoin bị chết
      this.forkJoinSub = forkJoin([profileApi$, notificationsApi$, failingRecommendationsApi$]).subscribe({
        next: ([profile, notifs, recs]) => {
          this.isForkJoinLoading = false;
          this.forkJoinResults = [
            { name: 'User Profile API', status: 'SUCCESS', data: profile },
            { name: 'Notifications API', status: 'SUCCESS', data: notifs },
            { name: 'Recommendations API', status: 'SUCCESS', data: recs },
          ];
        },
        error: (err) => {
          this.isForkJoinLoading = false;
          this.forkJoinErrorMessage = `Toàn bộ trang bị lỗi: ${err.message}. Cả 2 API thành công cũng bị hủy bỏ!`;
          this.addLog(
            'ERROR',
            'Unsafe forkJoin',
            `Sập toàn bộ giao diện do một request bị lỗi: ${err.message}`
          );
        },
      });
    } else {
      // Có bọc catchError cho failing request:
      const safeRecommendationsApi$ = failingRecommendationsApi$.pipe(
        catchError((err) => {
          this.addLog(
            'CATCH',
            'Safe forkJoin',
            `Bắt lỗi ở Recommendations API: "${err.message}". Trả về fallback state!`
          );
          return of({ error: true, message: 'Dữ liệu gợi ý tạm thời không khả dụng' });
        })
      );

      this.forkJoinSub = forkJoin([profileApi$, notificationsApi$, safeRecommendationsApi$]).subscribe({
        next: ([profile, notifs, recs]) => {
          this.isForkJoinLoading = false;
          this.forkJoinResults = [
            { name: 'User Profile API', status: 'SUCCESS', data: profile },
            { name: 'Notifications API', status: 'SUCCESS', data: notifs },
            {
              name: 'Recommendations API',
              status: 'ERROR',
              errorMsg: (recs as any).message,
              data: null,
            },
          ];
          this.addLog(
            'COMPLETE',
            'Safe forkJoin',
            'Tải dữ liệu thành công! 2 API hoạt động bình thường, 1 API hiển thị thông báo lỗi cục bộ an toàn.'
          );
        },
      });
    }
  }

  // ============================================================================
  // 2. DEMO: retry & Exponential Backoff
  // ============================================================================
  runFixedRetryDemo(): void {
    this.retrySub?.unsubscribe();
    this.currentAttemptCount = 0;
    this.retryHistory = [];
    this.retryState = 'ATTEMPTING';
    this.retryStatusText = `Đang thử kết nối API... (Số lần thử tối đa: ${this.retryMaxCount})`;

    this.addLog(
      'INFO',
      'retry()',
      `Bắt đầu request: Thiết lập mô phỏng sẽ lỗi ${this.failTimesBeforeSuccess} lần đầu, sau đó mới thành công.`
    );

    // Mô phỏng Observable ném lỗi failTimesBeforeSuccess lần đầu tiên
    const unstableApi$ = of(null).pipe(
      delay(400),
      map(() => {
        this.currentAttemptCount++;
        const now = new Date().toLocaleTimeString();

        if (this.currentAttemptCount <= this.failTimesBeforeSuccess) {
          this.retryHistory.push({
            attempt: this.currentAttemptCount,
            time: now,
            status: 'FAIL',
            detail: `Lần ${this.currentAttemptCount}: Mạng chập chờn (Network Glitch 503)`,
          });
          this.addLog(
            'RETRY',
            'retry()',
            `Thử lần ${this.currentAttemptCount} thất bại ➡️ Đang tự động retry...`
          );
          throw new Error(`Lỗi kết nối máy chủ lần ${this.currentAttemptCount}`);
        }

        this.retryHistory.push({
          attempt: this.currentAttemptCount,
          time: now,
          status: 'SUCCESS',
          detail: `Lần ${this.currentAttemptCount}: Kết nối thành công 200 OK!`,
        });
        return { message: 'Dữ liệu người dùng đã được tải hoàn tất!', status: 200 };
      }),
      retry(this.retryMaxCount)
    );

    this.retrySub = unstableApi$.subscribe({
      next: (res) => {
        this.retryState = 'SUCCESS';
        this.retryStatusText = `🎉 Thành công ở lần thử thứ ${this.currentAttemptCount}! Dữ liệu: "${res.message}"`;
        this.addLog('NEXT', 'retry()', `Hoàn tất thành công: ${res.message}`);
      },
      error: (err) => {
        this.retryState = 'FAILED';
        this.retryStatusText = `❌ Thất bại sau ${this.currentAttemptCount} lần thử! Lỗi: ${err.message}`;
        this.addLog(
          'ERROR',
          'retry()',
          `Vượt quá số lần retry (${this.retryMaxCount}). Stream đã phát ra Error.`
        );
      },
      complete: () => {
        this.addLog('COMPLETE', 'retry()', 'Chu kỳ retry hoàn tất.');
      },
    });
  }

  runExponentialBackoffDemo(): void {
    this.isBackoffRunning = true;
    this.backoffAttempts = [];
    this.backoffFinalMessage = 'Đang tiến hành mô phỏng Exponential Backoff...';

    this.addLog(
      'INFO',
      'retryBackoff',
      'Mô phỏng cơ chế Exponential Backoff: Khoảng thời gian nghỉ tăng dần (300ms ➡️ 600ms ➡️ 1200ms)...'
    );

    // Chuỗi mô phỏng thời gian chờ nhân đôi
    const delays = [300, 600, 1200];
    let step = 0;

    const executeStep = () => {
      if (step < delays.length) {
        const delayMs = delays[step];
        const attemptNum = step + 1;
        step++;

        setTimeout(() => {
          this.backoffAttempts.push({
            attempt: attemptNum,
            delayMs,
            time: new Date().toLocaleTimeString(),
          });
          this.addLog(
            'RETRY',
            'Exponential Backoff',
            `Lần thử ${attemptNum}: Sau thời gian nghỉ ${delayMs}ms`
          );

          if (step < delays.length) {
            executeStep();
          } else {
            this.isBackoffRunning = false;
            this.backoffFinalMessage = '✅ Hoàn tất chu kỳ Exponential Backoff thành công!';
            this.addLog(
              'COMPLETE',
              'Exponential Backoff',
              'Đã thử lại qua các mốc thời gian tăng dần và khôi phục kết nối!'
            );
          }
        }, delayMs);
      }
    };

    executeStep();
  }

  // ============================================================================
  // 3. DEMO: defaultIfEmpty & throwIfEmpty
  // ============================================================================
  runFilterSearchDemo(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredResults = this.availableItems.filter((item) =>
      item.toLowerCase().includes(q)
    );

    // Mô phỏng Observable từ kết quả tìm kiếm
    const search$ = this.filteredResults.length > 0 ? from(this.filteredResults) : EMPTY;

    search$
      .pipe(defaultIfEmpty('💡 [defaultIfEmpty]: Không tìm thấy kết quả nào phù hợp với từ khóa!'))
      .subscribe((val) => {
        this.defaultIfEmptyResult = val;
        this.addLog(
          'NEXT',
          'defaultIfEmpty()',
          `Kết quả tìm kiếm cho "${this.searchQuery}": ${val}`
        );
      });
  }

  startTransactionWithTimeout(): void {
    this.transactionSub?.unsubscribe();
    this.transactionCountdownSub?.unsubscribe();
    this.isTransactionActive = true;
    this.transactionCountdown = 5;
    this.transactionStatus = 'PENDING';
    this.transactionMessage = 'Vui lòng xác nhận giao dịch trong vòng 5 giây...';

    this.addLog(
      'INFO',
      'throwIfEmpty()',
      'Giao dịch được khởi tạo! Chờ người dùng click "Xác nhận ngay" trong vòng 5s...'
    );

    // Đồng hồ đếm ngược giao diện
    this.transactionCountdownSub = timer(1000, 1000)
      .pipe(take(5))
      .subscribe(() => {
        if (this.transactionCountdown > 1) {
          this.transactionCountdown--;
        }
      });

    // Luồng người dùng click xác nhận kết hợp takeUntil(timer(5000)) và throwIfEmpty()
    const userConfirm$ = this.confirmAction$.asObservable();

    this.transactionSub = userConfirm$
      .pipe(
        takeUntil(timer(5000)),
        throwIfEmpty(
          () =>
            new Error(
              'Hết hạn 5 giây! Giao dịch bị tự động hủy do người dùng không xác nhận kịp thời.'
            )
        )
      )
      .subscribe({
        next: (msg) => {
          this.isTransactionActive = false;
          this.transactionStatus = 'SUCCESS';
          this.transactionMessage = `🎉 ${msg}`;
          this.transactionCountdownSub?.unsubscribe();
          this.addLog('NEXT', 'throwIfEmpty()', `Xác nhận thành công: ${msg}`);
        },
        error: (err) => {
          this.isTransactionActive = false;
          this.transactionStatus = 'EXPIRED';
          this.transactionMessage = `⏰ ${err.message}`;
          this.transactionCountdownSub?.unsubscribe();
          this.addLog('ERROR', 'throwIfEmpty()', `throwIfEmpty phát tín hiệu Error: ${err.message}`);
        },
      });
  }

  confirmTransactionNow(): void {
    if (this.isTransactionActive) {
      this.confirmAction$.next(
        `Giao dịch chuyển khoản $500 đã được người dùng xác nhận thành công tại giây thứ ${
          5 - this.transactionCountdown + 1
        }!`
      );
    }
  }

  // ============================================================================
  // 4. DEMO: every & iif
  // ============================================================================
  evaluateScores(): void {
    const scores$ = of(...this.studentScores);

    // Kiểm tra every: Có phải TẤT CẢ điểm đều >= threshold không?
    scores$.pipe(every((x) => x >= this.scoreThreshold)).subscribe((isAllPassed) => {
      this.everyResult = isAllPassed;
      this.addLog(
        'NEXT',
        'every()',
        `Tất cả điểm [${this.studentScores.join(', ')}] >= ${this.scoreThreshold}? Kết quả: ${isAllPassed}`
      );
    });

    // Kiểm tra some (dùng first(predicate, false) và map(Boolean) như docs Day 24)
    scores$
      .pipe(
        first((x) => x >= 90, false),
        map((v) => Boolean(v))
      )
      .subscribe((hasExcellent) => {
        this.someResult = hasExcellent;
        this.addLog(
          'NEXT',
          'some (via first)',
          `Có điểm xuất sắc nào (>= 90) không? Kết quả: ${hasExcellent}`
        );
      });
  }

  addScore(newScore: number): void {
    if (newScore >= 0 && newScore <= 100) {
      this.studentScores.push(newScore);
      this.evaluateScores();
    }
  }

  resetScores(): void {
    this.studentScores = [85, 72, 90, 68, 55];
    this.evaluateScores();
  }

  evaluateIifDemo(): void {
    // iif: Đánh giá điều kiện tại thời điểm subscribe
    const vipOffer$ = of({
      title: 'Gói Hội Viên Kim Cương (VIP)',
      discount: 'Giảm 50% tất cả khóa học + Mentor 1-on-1',
      accessLevel: 'Toàn quyền truy cập mã nguồn & video độc quyền',
    });

    const guestOffer$ = of({
      title: 'Gói Người Dùng Tiêu Chuẩn (Guest)',
      discount: 'Giảm 10% đơn đầu tiên',
      accessLevel: 'Truy cập các bài học cơ bản miễn phí',
    });

    iif(() => this.isUserVip, vipOffer$, guestOffer$).subscribe((offer) => {
      this.iifResult = offer;
      this.addLog(
        'NEXT',
        'iif()',
        `iif đã chọn nhánh [${this.isUserVip ? 'VIP Member' : 'Guest'}]: ${offer.title}`
      );
    });
  }

  toggleVipMode(): void {
    this.isUserVip = !this.isUserVip;
    this.evaluateIifDemo();
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'ERROR' | 'CATCH' | 'RETRY' | 'COMPLETE' | 'INFO',
    operator: string,
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
      operator,
      message,
    });

    if (this.logs.length > 40) {
      this.logs.pop();
    }
  }
}
