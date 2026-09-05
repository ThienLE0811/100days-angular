import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EMPTY,
  Observable,
  Subject,
  Subscription,
  auditTime,
  debounceTime,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  find,
  first,
  from,
  fromEvent,
  interval,
  last,
  of,
  sampleTime,
  single,
  skip,
  skipUntil,
  skipWhile,
  take,
  takeLast,
  takeUntil,
  takeWhile,
  throttleTime,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS (Based on docs/Day022-rxjs-filtering.md)
 * ============================================================================
 */
export interface PersonItem {
  name: string;
  age: number;
}

export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'DROP' | 'ERROR' | 'COMPLETE' | 'INFO';
  operator: string;
  message: string;
}

export interface FilteringSpec {
  name: string;
  category: string;
  signature: string;
  autoComplete: boolean;
  summary: string;
  angularUseCase: string;
}

@Component({
  selector: 'app-day022-rxjs-filtering',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day022-rxjs-filtering.html',
  styleUrl: './day022-rxjs-filtering.scss',
})
export class Day022RxjsFiltering implements OnInit, AfterViewInit, OnDestroy {
  // Active Navigation Tab
  activeTab: 'basic' | 'take-skip' | 'distinct' | 'rate-limit' | 'cheatsheet' = 'basic';

  // ============================================================================
  // DEMO 1: filter, first, last, find, single
  // ============================================================================
  readonly sampleNumbers: number[] = [1, 2, 3, 4, 5, 6];
  basicFilterResults: Array<{ id: number; value: any; status: string }> = [];
  basicOperatorName: string = '';
  basicErrorMsg: string = '';

  // ============================================================================
  // DEMO 2: take & skip variations
  // ============================================================================
  takeSkipResults: Array<{ id: number; value: any }> = [];
  takeSkipOperatorName: string = '';
  isTakeUntilActive: boolean = false;
  takeUntilCounter: number = 0;
  private takeUntilNotifier$ = new Subject<void>();
  private takeUntilSub?: Subscription;

  // ============================================================================
  // DEMO 3: distinct, distinctUntilChanged, distinctUntilKeyChanged
  // ============================================================================
  readonly duplicateNumbers: number[] = [1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4];
  readonly personList: PersonItem[] = [
    { age: 4, name: 'Foo' },
    { age: 6, name: 'Foo' },
    { age: 7, name: 'Bar' },
    { age: 5, name: 'Foo' },
  ];

  distinctResults: Array<{ id: number; value: any }> = [];
  distinctModeName: string = '';

  // ============================================================================
  // DEMO 4: Time-based Quad (debounceTime, throttleTime, auditTime, sampleTime)
  // ============================================================================
  @ViewChild('searchDebounceInput') searchDebounceInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('rapidActionBtn') rapidActionBtnRef!: ElementRef<HTMLButtonElement>;

  // debounceTime state
  debounceSearchTerm: string = '';
  debouncedEmittedTerms: Array<{ time: string; text: string }> = [];
  private debounceSub?: Subscription;

  // throttleTime, auditTime, sampleTime state
  rapidClickRawCount: number = 0;
  throttleEmittedCount: number = 0;
  auditEmittedCount: number = 0;
  sampleEmittedCount: number = 0;
  private rateLimitSubs = new Subscription();

  // ============================================================================
  // ACTIVITY LOGGER & SUBSCRIPTIONS
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CHEATSHEET DATA
  // ============================================================================
  readonly specsList: FilteringSpec[] = [
    {
      name: 'filter(predicate)',
      category: 'Condition Filter',
      signature: 'filter(x => x % 2 === 0)',
      autoComplete: false,
      summary:
        'Lọc các giá trị thỏa mãn predicate (truthy). Giá trị falsy sẽ bị chặn lại (giống Array.prototype.filter).',
      angularUseCase:
        'router.events.pipe(filter(e => e instanceof NavigationEnd)) để chỉ lắng nghe khi navigation hoàn tất.',
    },
    {
      name: 'first(predicate?, default?)',
      category: 'Single Item',
      signature: "first(x => x > 3, 'defaultValue')",
      autoComplete: true,
      summary:
        'Lấy giá trị đầu tiên thỏa mãn điều kiện rồi complete. Ném EmptyError nếu stream rỗng mà không có defaultValue.',
      angularUseCase:
        'Lấy giá trị đầu tiên từ một config Observable hoặc UserService rồi tự hủy subscription.',
    },
    {
      name: 'last(predicate?, default?)',
      category: 'Single Item',
      signature: 'last(x => x % 2 === 0)',
      autoComplete: true,
      summary:
        'Lấy giá trị cuối cùng trước khi stream complete. Ném EmptyError nếu không có giá trị nào thỏa mãn.',
      angularUseCase:
        'Lấy trạng thái cuối cùng của một quá trình tải tệp hoặc tiến trình xử lý hàng loạt.',
    },
    {
      name: 'find(predicate)',
      category: 'Search Item',
      signature: 'find(x => x === 2)',
      autoComplete: true,
      summary:
        'Tìm giá trị đầu tiên thỏa mãn predicate. Khác first(), find() không bao giờ throw error (trả về undefined nếu không tìm thấy).',
      angularUseCase:
        'Tìm kiếm một entity trong danh sách stream mà không lo bị gián đoạn luồng bởi EmptyError.',
    },
    {
      name: 'single(predicate?)',
      category: 'Strict Verification',
      signature: 'single(x => x === 2)',
      autoComplete: true,
      summary:
        'Yêu cầu CHỈ ĐƯỢC CÓ ĐÚNG 1 giá trị thỏa mãn điều kiện. Ném Error nếu có từ 2 giá trị trở lên thỏa mãn!',
      angularUseCase:
        'Xác thực dữ liệu đơn nhất (ví dụ: kiểm tra trùng lặp ID hoặc đảm bảo chỉ có đúng 1 bản ghi thỏa mãn).',
    },
    {
      name: 'take(count) / take(1)',
      category: 'Quantity Limit',
      signature: 'take(count)',
      autoComplete: true,
      summary:
        'Lấy đúng N giá trị đầu tiên rồi complete. Đặc biệt take(1) không bao giờ throw EmptyError nếu stream tự complete rỗng.',
      angularUseCase:
        'Dùng take(1) trong CanActivateFn Route Guards hoặc khi cần snapshot dữ liệu 1 lần duy nhất.',
    },
    {
      name: 'takeUntil(notifier$)',
      category: 'External Signal',
      signature: 'takeUntil(this.destroy$)',
      autoComplete: true,
      summary:
        'Lắng nghe source cho đến khi Observable notifier phát tín hiệu thì tự động hủy subscription.',
      angularUseCase:
        'Pattern kinh điển để chống rò rỉ bộ nhớ (Memory Leak) trong ngOnDestroy: source$.pipe(takeUntil(this.destroy$)).',
    },
    {
      name: 'takeWhile(predicate, inclusive?)',
      category: 'Internal Condition',
      signature: 'takeWhile(x => x < 5, true)',
      autoComplete: true,
      summary:
        'Lấy giá trị chừng nào điều kiện predicate còn đúng. Dừng ngay khi gặp giá trị đầu tiên sai.',
      angularUseCase:
        'Đếm giờ đếm ngược (countdown timer) hoặc tiến trình tải phần trăm cho đến khi đạt 100%.',
    },
    {
      name: 'distinct(keySelector?)',
      category: 'Uniqueness (Full History)',
      signature: 'distinct(user => user.id)',
      autoComplete: false,
      summary:
        'Loại bỏ tất cả các giá trị trùng lặp trong TOÀN BỘ lịch sử của stream. Lưu ý cần cẩn thận bộ nhớ nếu stream vô hạn.',
      angularUseCase:
        'Đảm bảo không xử lý lại các ID sự kiện hoặc mã thông báo đã gặp từ trước.',
    },
    {
      name: 'distinctUntilChanged()',
      category: 'Uniqueness (Immediate)',
      signature: 'distinctUntilChanged()',
      autoComplete: false,
      summary:
        'Chỉ loại bỏ giá trị trùng lặp nếu nó GIỐNG VỚI GIÁ TRỊ LIỀN TRƯỚC (không lưu toàn bộ lịch sử).',
      angularUseCase:
        'inputControl.valueChanges.pipe(distinctUntilChanged()) để tránh gọi API lặp lại khi người dùng gõ rồi xóa về giá trị cũ.',
    },
    {
      name: 'debounceTime(dueTime)',
      category: 'Rate Limiting',
      signature: 'debounceTime(400)',
      autoComplete: false,
      summary:
        'Chờ người dùng ngừng phát tín hiệu đủ khoảng thời gian dueTime rồi mới emit giá trị gần nhất.',
      angularUseCase:
        'Ô tìm kiếm gõ phím tức thì (Typeahead / Autocomplete Search) để tránh spam API.',
    },
    {
      name: 'throttleTime(duration)',
      category: 'Rate Limiting',
      signature: 'throttleTime(800)',
      autoComplete: false,
      summary:
        'Phát ngay giá trị đầu tiên, sau đó chặn toàn bộ các giá trị phát sinh trong suốt thời gian cooldown.',
      angularUseCase:
        'Chặn người dùng click liên tục vào nút đặt hàng/submit form, hoặc giảm tải sự kiện mousemove / scroll.',
    },
  ];

  ngOnInit(): void {
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day022RxjsFiltering: Đã sẵn sàng khám phá tất cả các Filtering Operators!'
    );
  }

  ngAfterViewInit(): void {
    this.setupDebounceSearchListener();
    this.setupRateLimitingListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.takeUntilSub?.unsubscribe();
    this.debounceSub?.unsubscribe();
    this.rateLimitSubs.unsubscribe();
  }

  // ============================================================================
  // 1. DEMO: filter(), first(), last(), find(), single()
  // ============================================================================
  runFilterDemo(type: 'filter-even' | 'first' | 'first-pred' | 'first-default' | 'last' | 'find' | 'single-success' | 'single-error'): void {
    this.basicFilterResults = [];
    this.basicErrorMsg = '';
    const src$ = from(this.sampleNumbers);

    switch (type) {
      case 'filter-even':
        this.basicOperatorName = 'filter(x => x % 2 === 0)';
        this.addLog('INFO', 'filter()', 'Lọc lấy các số chẵn từ [1, 2, 3, 4, 5, 6]');
        src$.pipe(filter((x) => x % 2 === 0)).subscribe(this.createBasicObserver('filter()'));
        break;

      case 'first':
        this.basicOperatorName = 'first()';
        this.addLog('INFO', 'first()', 'Lấy giá trị đầu tiên và complete ngay');
        src$.pipe(first()).subscribe(this.createBasicObserver('first()'));
        break;

      case 'first-pred':
        this.basicOperatorName = 'first(x => x > 3)';
        this.addLog('INFO', 'first(predicate)', 'Lấy giá trị đầu tiên thỏa mãn x > 3');
        src$.pipe(first((x) => x > 3)).subscribe(this.createBasicObserver('first(x > 3)'));
        break;

      case 'first-default':
        this.basicOperatorName = "first(x => x > 10, 'Giá trị mặc định')";
        this.addLog('INFO', 'first(with default)', 'Không có x > 10, emit defaultValue thay vì ném lỗi');
        src$
          .pipe(first((x) => x > 10, 'Giá trị mặc định'))
          .subscribe(this.createBasicObserver('first(default)'));
        break;

      case 'last':
        this.basicOperatorName = 'last()';
        this.addLog('INFO', 'last()', 'Lấy giá trị cuối cùng trước khi stream complete');
        src$.pipe(last()).subscribe(this.createBasicObserver('last()'));
        break;

      case 'find':
        this.basicOperatorName = 'find(x => x % 2 === 0)';
        this.addLog('INFO', 'find()', 'Tìm giá trị chẵn đầu tiên (không bao giờ throw EmptyError)');
        src$.pipe(find((x) => x % 2 === 0)).subscribe(this.createBasicObserver('find()'));
        break;

      case 'single-success':
        this.basicOperatorName = 'single(x => x === 2)';
        this.addLog('INFO', 'single()', 'Chỉ có duy nhất 1 số 2 thỏa mãn -> Thành công');
        src$.pipe(single((x) => x === 2)).subscribe(this.createBasicObserver('single()'));
        break;

      case 'single-error':
        this.basicOperatorName = 'single(x => x > 1) [Ném lỗi]';
        this.addLog('INFO', 'single()', 'Có nhiều hơn 1 số > 1 trong mảng -> Sẽ ném Error!');
        src$.pipe(single((x) => x > 1)).subscribe(this.createBasicObserver('single()'));
        break;
    }
  }

  private createBasicObserver(opName: string) {
    return {
      next: (val: any) => {
        this.basicFilterResults.push({
          id: this.basicFilterResults.length + 1,
          value: val,
          status: 'EMITTED',
        });
        this.addLog('NEXT', opName, `Emitted giá trị: ${val}`);
      },
      error: (err: any) => {
        this.basicErrorMsg = String(err?.message || err);
        this.addLog('ERROR', opName, `Bắt được lỗi: "${this.basicErrorMsg}"`);
      },
      complete: () => {
        this.addLog('COMPLETE', opName, 'Stream đã hoàn tất (COMPLETE)!');
      },
    };
  }

  // ============================================================================
  // 2. DEMO: take & skip variations
  // ============================================================================
  runTakeSkipDemo(type: 'take-2' | 'take-1' | 'take-last-2' | 'skip-2' | 'take-while' | 'skip-while'): void {
    this.takeSkipResults = [];
    const src$ = from([1, 2, 3, 4, 5]);

    switch (type) {
      case 'take-2':
        this.takeSkipOperatorName = 'take(2)';
        this.addLog('INFO', 'take(2)', 'Lấy đúng 2 giá trị đầu tiên từ [1, 2, 3, 4, 5] rồi complete');
        src$.pipe(take(2)).subscribe(this.createTakeSkipObserver('take(2)'));
        break;

      case 'take-1':
        this.takeSkipOperatorName = 'take(1)';
        this.addLog('INFO', 'take(1)', 'Lấy 1 giá trị duy nhất (an toàn hơn first() vì không throw trên empty stream)');
        src$.pipe(take(1)).subscribe(this.createTakeSkipObserver('take(1)'));
        break;

      case 'take-last-2':
        this.takeSkipOperatorName = 'takeLast(2)';
        this.addLog('INFO', 'takeLast(2)', 'Lấy 2 giá trị cuối cùng khi stream complete');
        src$.pipe(takeLast(2)).subscribe(this.createTakeSkipObserver('takeLast(2)'));
        break;

      case 'skip-2':
        this.takeSkipOperatorName = 'skip(2)';
        this.addLog('INFO', 'skip(2)', 'Bỏ qua 2 giá trị đầu, chỉ lấy các giá trị từ 3 trở đi');
        src$.pipe(skip(2)).subscribe(this.createTakeSkipObserver('skip(2)'));
        break;

      case 'take-while':
        this.takeSkipOperatorName = 'takeWhile(x => x < 4)';
        this.addLog('INFO', 'takeWhile()', 'Lấy giá trị khi x < 4, dừng ngay khi x = 4');
        src$.pipe(takeWhile((x) => x < 4)).subscribe(this.createTakeSkipObserver('takeWhile()'));
        break;

      case 'skip-while':
        this.takeSkipOperatorName = 'skipWhile(x => x < 3)';
        this.addLog('INFO', 'skipWhile()', 'Bỏ qua khi x < 3, bắt đầu lấy từ khi x >= 3');
        src$.pipe(skipWhile((x) => x < 3)).subscribe(this.createTakeSkipObserver('skipWhile()'));
        break;
    }
  }

  // takeUntil interactive demonstration
  startTakeUntilDemo(): void {
    this.stopTakeUntilDemo();
    this.isTakeUntilActive = true;
    this.takeUntilCounter = 0;

    this.addLog(
      'INFO',
      'takeUntil()',
      'Khởi động interval(600ms) kết hợp takeUntil(notifier$). Bấm nút "Phát Tín Hiệu Notifier" để hủy stream!'
    );

    // Theo docs Day 22: interval(1000).pipe(takeUntil(fromEvent(document, 'click')))
    this.takeUntilSub = interval(600)
      .pipe(takeUntil(this.takeUntilNotifier$))
      .subscribe({
        next: (val) => {
          this.takeUntilCounter = val;
          this.addLog('NEXT', 'takeUntil()', `Tick #${val}`);
        },
        complete: () => {
          this.isTakeUntilActive = false;
          this.addLog(
            'COMPLETE',
            'takeUntil()',
            'Notifier đã emit -> takeUntil hủy stream và hoàn tất ngay lập tức!'
          );
        },
      });
  }

  triggerTakeUntilNotifier(): void {
    if (!this.isTakeUntilActive) return;
    this.takeUntilNotifier$.next();
  }

  stopTakeUntilDemo(): void {
    if (this.takeUntilSub) {
      this.takeUntilSub.unsubscribe();
      this.isTakeUntilActive = false;
    }
  }

  private createTakeSkipObserver(opName: string) {
    return {
      next: (val: any) => {
        this.takeSkipResults.push({ id: this.takeSkipResults.length + 1, value: val });
        this.addLog('NEXT', opName, `Emitted: ${val}`);
      },
      complete: () => {
        this.addLog('COMPLETE', opName, 'Stream hoàn tất thành công!');
      },
    };
  }

  // ============================================================================
  // 3. DEMO: distinct, distinctUntilChanged, distinctUntilKeyChanged
  // ============================================================================
  runDistinctNumbers(type: 'distinct-all' | 'distinct-until-changed'): void {
    this.distinctResults = [];

    if (type === 'distinct-all') {
      this.distinctModeName = 'distinct() [Nhớ toàn bộ lịch sử]';
      this.addLog(
        'INFO',
        'distinct()',
        'Duyệt mảng [1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4] -> Loại bỏ TOÀN BỘ số trùng lặp trong lịch sử'
      );
      from(this.duplicateNumbers)
        .pipe(distinct())
        .subscribe({
          next: (val) => {
            this.distinctResults.push({ id: this.distinctResults.length + 1, value: val });
            this.addLog('NEXT', 'distinct()', `Emitted giá trị duy nhất: ${val}`);
          },
        });
    } else {
      this.distinctModeName = 'distinctUntilChanged() [Chỉ so với liền trước]';
      this.addLog(
        'INFO',
        'distinctUntilChanged()',
        'Duyệt mảng [1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4] -> Chỉ loại bỏ nếu trùng với số liền trước'
      );
      from(this.duplicateNumbers)
        .pipe(distinctUntilChanged())
        .subscribe({
          next: (val) => {
            this.distinctResults.push({ id: this.distinctResults.length + 1, value: val });
            this.addLog('NEXT', 'distinctUntilChanged()', `Emitted: ${val}`);
          },
        });
    }
  }

  runDistinctObjects(type: 'distinct-key' | 'distinct-until-key-changed'): void {
    this.distinctResults = [];

    if (type === 'distinct-key') {
      this.distinctModeName = "distinct(p => p.name) [Toàn bộ lịch sử]";
      this.addLog('INFO', 'distinct(keySelector)', 'Lọc person theo name: Foo, Foo, Bar, Foo -> Chỉ Foo, Bar');
      from(this.personList)
        .pipe(distinct((p) => p.name))
        .subscribe({
          next: (p) => {
            this.distinctResults.push({ id: this.distinctResults.length + 1, value: `${p.name} (${p.age})` });
            this.addLog('NEXT', 'distinct(name)', `Person: ${p.name} (${p.age})`);
          },
        });
    } else {
      this.distinctModeName = "distinctUntilKeyChanged('name') [Liền trước]";
      this.addLog('INFO', 'distinctUntilKeyChanged()', 'Lọc person: Foo, Foo, Bar, Foo -> Foo, Bar, Foo');
      from(this.personList)
        .pipe(distinctUntilKeyChanged('name'))
        .subscribe({
          next: (p) => {
            this.distinctResults.push({ id: this.distinctResults.length + 1, value: `${p.name} (${p.age})` });
            this.addLog('NEXT', 'distinctUntilKeyChanged(name)', `Person: ${p.name} (${p.age})`);
          },
        });
    }
  }

  // ============================================================================
  // 4. DEMO: debounceTime, throttleTime, auditTime, sampleTime
  // ============================================================================
  private setupDebounceSearchListener(): void {
    if (!this.searchDebounceInputRef) return;

    // Theo docs Day 22:
    // this.filterControl.valueChanges.pipe(debounceTime(500)).subscribe(...)
    const inputEl = this.searchDebounceInputRef.nativeElement;
    this.debounceSub = fromEvent<Event>(inputEl, 'input')
      .pipe(
        debounceTime(400),
        takeUntil(this.destroy$)
      )
      .subscribe((e) => {
        const query = (e.target as HTMLInputElement).value;
        this.debouncedEmittedTerms.unshift({
          time: new Date().toLocaleTimeString(),
          text: query || '(trống)',
        });
        if (this.debouncedEmittedTerms.length > 6) this.debouncedEmittedTerms.pop();
        this.addLog('NEXT', 'debounceTime(400ms)', `Đã dừng gõ 400ms -> Emit query: "${query}"`);
      });
  }

  private setupRateLimitingListeners(): void {
    if (!this.rapidActionBtnRef) return;

    const btnEl = this.rapidActionBtnRef.nativeElement;
    const clicks$ = fromEvent<MouseEvent>(btnEl, 'click');

    // 1. throttleTime(1000): emit đầu tiên, chặn trong 1000ms
    const throttleSub = clicks$.pipe(throttleTime(1000)).subscribe(() => {
      this.throttleEmittedCount++;
      this.addLog(
        'NEXT',
        'throttleTime(1000ms)',
        `[Leading Pass] Click phát ra! (Tổng pass: ${this.throttleEmittedCount})`
      );
    });

    // 2. auditTime(1000): chờ 1000ms sau click rồi emit giá trị cuối cùng
    const auditSub = clicks$.pipe(auditTime(1000)).subscribe(() => {
      this.auditEmittedCount++;
      this.addLog(
        'NEXT',
        'auditTime(1000ms)',
        `[Trailing Pass] Hết chu kỳ 1s -> Emit click gần nhất (Tổng pass: ${this.auditEmittedCount})`
      );
    });

    // 3. sampleTime(1500): kiểm tra định kỳ mỗi 1.5s và emit nếu có click
    const sampleSub = clicks$.pipe(sampleTime(1500)).subscribe(() => {
      this.sampleEmittedCount++;
      this.addLog(
        'NEXT',
        'sampleTime(1500ms)',
        `[Periodic Sample] Lấy mẫu click gần nhất sau 1.5s (Tổng pass: ${this.sampleEmittedCount})`
      );
    });

    this.rateLimitSubs.add(throttleSub);
    this.rateLimitSubs.add(auditSub);
    this.rateLimitSubs.add(sampleSub);
  }

  onRawRapidClick(): void {
    this.rapidClickRawCount++;
  }

  resetRateLimitStats(): void {
    this.rapidClickRawCount = 0;
    this.throttleEmittedCount = 0;
    this.auditEmittedCount = 0;
    this.sampleEmittedCount = 0;
    this.addLog('INFO', 'Rate Limit', 'Đã reset thống kê spam click về 0');
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'DROP' | 'ERROR' | 'COMPLETE' | 'INFO',
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
