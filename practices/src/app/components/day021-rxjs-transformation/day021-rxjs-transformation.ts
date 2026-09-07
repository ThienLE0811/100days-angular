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
  Observable,
  Subject,
  Subscription,
  from,
  fromEvent,
  interval,
  merge,
  of,
  buffer,
  bufferTime,
  map,
  mapTo,
  pluck,
  reduce,
  scan,
  toArray,
} from 'rxjs';

/**
 * ============================================================================
 * INTERFACES & DATA MODELS (Based on docs/Day021-rxjs-transformation.md)
 * ============================================================================
 */
export interface UserItem {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  postCount: number;
}

export interface UserViewModel extends UserItem {
  fullname: string;
}

export interface ActivityLog {
  id: number;
  time: string;
  type: 'NEXT' | 'ACCUMULATE' | 'COMPLETE' | 'BUFFER' | 'INFO';
  operator: string;
  message: string;
}

export interface OperatorSpec {
  name: string;
  category: string;
  signature: string;
  emitsWhen: 'Mỗi lần source emit' | 'Đợi source complete' | 'Đợi notifier/timer';
  rxjsStatus: 'Khuyên dùng' | 'Deprecated (Dùng map thay thế)';
  summary: string;
  angularExample: string;
}

export interface QuickTransformationSummary {
  requirement: string;
  operator: string;
  autoComplete: string;
  badgeClass: string;
  icon: string;
  angularUseCase: string;
}

@Component({
  selector: 'app-day021-rxjs-transformation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day021-rxjs-transformation.html',
  styleUrl: './day021-rxjs-transformation.scss',
})
export class Day021RxjsTransformation implements OnInit, AfterViewInit, OnDestroy {
  // Active Tab
  activeTab: 'map-pluck-mapto' | 'scan-vs-reduce' | 'toarray' | 'buffer' | 'cheatsheet' =
    'map-pluck-mapto';

  // ============================================================================
  // DEMO 1: map(), pluck(), mapTo()
  // ============================================================================
  // Mock users from Day 21 docs
  readonly initialUsers: UserItem[] = [
    {
      id: 'ddfe3653-1569-4f2f-b57f-bf9bae542662',
      username: 'tiepphan',
      firstname: 'tiep',
      lastname: 'phan',
      postCount: 5,
    },
    {
      id: '34784716-019b-4868-86cd-02287e49c2d3',
      username: 'nartc',
      firstname: 'chau',
      lastname: 'tran',
      postCount: 22,
    },
    {
      id: '7b8310c9-3a1b-4f9e-bc45-981249b01ae4',
      username: 'thienle',
      firstname: 'thien',
      lastname: 'le',
      postCount: 15,
    },
  ];

  mapMode: 'fullname' | 'id' | 'pluck-id' | 'username-upper' = 'fullname';
  mapResults: Array<{ id: number; raw: any; transformed: any }> = [];
  isMapStreaming: boolean = false;
  private mapSub?: Subscription;

  // Hover demo for mapTo()
  @ViewChild('hoverTargetBox') hoverTargetBoxRef!: ElementRef<HTMLDivElement>;
  isHovered: boolean = false;
  hoverStatusText: string = 'Rê chuột vào vùng này để kích hoạt stream mapTo(true / false)';
  hoverEventCount: number = 0;
  private hoverSub?: Subscription;

  // ============================================================================
  // DEMO 2: scan() vs reduce()
  // ============================================================================
  // Interactive click counter for scan()
  scanClickCounter: number = 0;

  // Stream accumulation side-by-side
  scanStepResults: Array<{ step: number; user: string; postCount: number; currentTotal: number }> =
    [];
  reduceFinalResult: number | null = null;
  isAccumulating: boolean = false;
  accumulatorSourceIndex: number = 0;
  private accumulatorSub?: Subscription;

  // ============================================================================
  // DEMO 3: toArray()
  // ============================================================================
  toArrayItems: string[] = ['Angular 22', 'RxJS 7.8', 'TypeScript 5', 'Signals', 'Standalone'];
  toArrayEmittedItems: string[] = [];
  toArrayFinalArray: string[] | null = null;
  toArrayStatus: 'IDLE' | 'EMITTING' | 'COMPLETED' = 'IDLE';
  private toArraySub?: Subscription;

  // ============================================================================
  // DEMO 4: buffer() & bufferTime()
  // ============================================================================
  // buffer(closingNotifier$)
  isBufferActive: boolean = false;
  private bufferNotifier$ = new Subject<void>();
  private bufferSub?: Subscription;
  currentBufferStash: number[] = [];
  flushedBufferChunks: Array<{ id: number; chunk: number[]; time: string }> = [];

  // bufferTime(ms)
  bufferTimeSpanMs: number = 2000;
  isBufferTimeActive: boolean = false;
  bufferTimeChunks: Array<{ id: number; chunk: number[]; time: string }> = [];
  private bufferTimeSub?: Subscription;

  // ============================================================================
  // ACTIVITY LOGGER
  // ============================================================================
  logs: ActivityLog[] = [];
  private logIdCounter: number = 1;

  // ============================================================================
  // CHEAT SHEET DATA
  // ============================================================================
  readonly quickTransformationSummaryList: QuickTransformationSummary[] = [
    {
      requirement: 'Biến đổi dữ liệu sang định dạng mới (format, tính toán, trích xuất)',
      operator: 'map(fn)',
      autoComplete: 'Theo source stream',
      badgeClass: 'badge-primary',
      icon: '🔄',
      angularUseCase: 'Format API response, ghép chuỗi fullname, trích xuất dữ liệu từ DTO.',
    },
    {
      requirement: 'Cộng dồn / Tích lũy và EMIT NGAY sau mỗi lần phát (Realtime state)',
      operator: 'scan(acc, seed)',
      autoComplete: 'Không cần complete',
      badgeClass: 'badge-accent',
      icon: '📈',
      angularUseCase: 'Đếm số lần click, cộng dồn tổng tiền giỏ hàng realtime, quản lý state cục bộ.',
    },
    {
      requirement: 'Cộng dồn / Tích lũy nhưng CHỈ EMIT 1 LẦN khi stream hoàn tất',
      operator: 'reduce(acc, seed)',
      autoComplete: 'BẮT BUỘC complete',
      badgeClass: 'badge-warning',
      icon: '📊',
      angularUseCase: 'Tổng hợp danh sách hoặc tính tổng chi phí sau khi tải toàn bộ dữ liệu.',
    },
    {
      requirement: 'Gom toàn bộ các giá trị phát ra thành 1 mảng (Array)',
      operator: 'toArray()',
      autoComplete: 'BẮT BUỘC complete',
      badgeClass: 'badge-syntax',
      icon: '📦',
      angularUseCase: 'Gom các chunks phân trang hoặc dữ liệu tải theo dòng thành một mảng hoàn chỉnh.',
    },
    {
      requirement: 'Gom nhóm dữ liệu tạm thời cho đến khi có SỰ KIỆN KHÁC kích hoạt',
      operator: 'buffer(notifier$)',
      autoComplete: 'Theo notifier/source',
      badgeClass: 'badge-info',
      icon: '🛑',
      angularUseCase: 'Bắt multi-click chuột, hoặc gom các thao tác chỉnh sửa cho đến khi bấm "Lưu".',
    },
    {
      requirement: 'Gom nhóm dữ liệu tạm thời theo CHU KỲ THỜI GIAN (X mili-giây)',
      operator: 'bufferTime(ms)',
      autoComplete: 'Theo chu kỳ thời gian',
      badgeClass: 'badge-secondary',
      icon: '⏳',
      angularUseCase: 'Gom log lỗi hoặc sự kiện telemetry gửi về server theo mẻ mỗi 2-5 giây.',
    },
    {
      requirement: 'Biến đổi sang một giá trị hằng số cố định (VD: true/false khi hover)',
      operator: 'mapTo(val) ➔ map(() => val)',
      autoComplete: 'Theo source stream',
      badgeClass: 'badge-syntax',
      icon: '🎯',
      angularUseCase: 'Lắng nghe hover (mouseover ➔ true, mouseleave ➔ false). Khuyên dùng map(() => val).',
    },
    {
      requirement: 'Trích xuất thuộc tính trong object theo tên key',
      operator: "pluck('key') ➔ map(x => x.key)",
      autoComplete: 'Theo source stream',
      badgeClass: 'badge-syntax',
      icon: '🏷️',
      angularUseCase: "Lấy route.params['id']. Khuyên dùng map(x => x.key) để đảm bảo Type-Safety.",
    },
  ];

  readonly specsList: OperatorSpec[] = [
    {
      name: 'map(projectFn)',
      category: 'Value Transform',
      signature: 'map((val, index) => transformedVal)',
      emitsWhen: 'Mỗi lần source emit',
      rxjsStatus: 'Khuyên dùng',
      summary:
        'Biến đổi mỗi giá trị do source phát ra theo một projection function (tương tự Array.prototype.map).',
      angularExample:
        'HttpClient.get<UserDto>().pipe(map(dto => UserMapper.toDomain(dto))) để chuyển DTO sang Model.',
    },
    {
      name: 'pluck(...props)',
      category: 'Property Extract',
      signature: "pluck('user', 'address', 'city')",
      emitsWhen: 'Mỗi lần source emit',
      rxjsStatus: 'Deprecated (Dùng map thay thế)',
      summary:
        'Trích xuất một hoặc nhiều thuộc tính lồng nhau theo chuỗi tên property. Đã deprecated từ RxJS 7+ vì thiếu type-safety.',
      angularExample:
        "Trước đây: route.params.pipe(pluck('id')). Nay khuyên dùng: route.params.pipe(map(p => p['id'])).",
    },
    {
      name: 'mapTo(constantValue)',
      category: 'Constant Mapping',
      signature: 'mapTo(true)',
      emitsWhen: 'Mỗi lần source emit',
      rxjsStatus: 'Deprecated (Dùng map thay thế)',
      summary:
        'Bất cứ khi nào source phát tín hiệu, luôn trả về đúng một giá trị hằng số cố định.',
      angularExample:
        'mouseover$.pipe(mapTo(true)). Nay khuyên dùng: mouseover$.pipe(map(() => true)).',
    },
    {
      name: 'scan(accumulator, seed)',
      category: 'Running Accumulator',
      signature: 'scan((acc, curr) => acc + curr, 0)',
      emitsWhen: 'Mỗi lần source emit',
      rxjsStatus: 'Khuyên dùng',
      summary:
        'Tích lũy giá trị qua thời gian và EMIT KẾT QUẢ TRUNG GIAN sau mỗi lần source phát (giống reduce nhưng phát liên tục).',
      angularExample:
        'State management thủ công, tính giỏ hàng theo thời gian, hoặc đếm sự kiện spam click.',
    },
    {
      name: 'reduce(accumulator, seed)',
      category: 'Final Accumulator',
      signature: 'reduce((acc, curr) => acc + curr, 0)',
      emitsWhen: 'Đợi source complete',
      rxjsStatus: 'Khuyên dùng',
      summary:
        'Tích lũy giá trị qua thời gian, nhưng CHỈ EMIT 1 LẦN DUY NHẤT khi source stream complete.',
      angularExample:
        'Tổng hợp danh sách upload file hoặc tính tổng chi phí sau khi luồng tải toàn bộ danh sách kết thúc.',
    },
    {
      name: 'toArray()',
      category: 'Collection',
      signature: 'toArray()',
      emitsWhen: 'Đợi source complete',
      rxjsStatus: 'Khuyên dùng',
      summary:
        'Thu thập toàn bộ các giá trị phát ra của source thành một Array và emit mảng đó khi source complete.',
      angularExample:
        'Gom các event hoặc paging chunks thành một mảng hoàn chỉnh để xử lý hàng loạt.',
    },
    {
      name: 'buffer(closingNotifier$)',
      category: 'Event-driven Chunking',
      signature: 'buffer(click$)',
      emitsWhen: 'Đợi notifier/timer',
      rxjsStatus: 'Khuyên dùng',
      summary:
        'Lưu tạm các giá trị vào bộ đệm nội bộ và chỉ phát ra mảng gom cụm khi Observable closingNotifier phát tín hiệu.',
      angularExample:
        'Bắt double-click / triple-click, hoặc gom các keystrokes gửi đi khi người dùng bấm nút Send.',
    },
    {
      name: 'bufferTime(timeSpanMs)',
      category: 'Time-driven Chunking',
      signature: 'bufferTime(2000)',
      emitsWhen: 'Đợi notifier/timer',
      rxjsStatus: 'Khuyên dùng',
      summary:
        'Gom cụm các giá trị phát ra theo từng cửa sổ thời gian cố định và emit mảng gom sau mỗi chu kỳ timeSpan.',
      angularExample:
        'Batching telemetry / error logs để gửi 1 HTTP request mỗi 5 giây thay vì spam API cho từng log nhỏ.',
    },
  ];

  ngOnInit(): void {
    this.addLog(
      'INFO',
      'System',
      'Khởi tạo Day021RxjsTransformation: Đã sẵn sàng khám phá các Transformation Operators!'
    );
  }

  ngAfterViewInit(): void {
    this.setupHoverMapToDemo();
  }

  ngOnDestroy(): void {
    this.mapSub?.unsubscribe();
    this.hoverSub?.unsubscribe();
    this.accumulatorSub?.unsubscribe();
    this.toArraySub?.unsubscribe();
    this.bufferSub?.unsubscribe();
    this.bufferTimeSub?.unsubscribe();
  }

  // ============================================================================
  // 1. DEMO: map(), pluck(), mapTo()
  // ============================================================================
  runMapDemo(): void {
    this.mapSub?.unsubscribe();
    this.mapResults = [];
    this.isMapStreaming = true;

    this.addLog('INFO', 'map()', `Bắt đầu stream mô phỏng User Login với chế độ: "${this.mapMode}"`);

    // Stream mô phỏng theo Day 21 docs: phát từng User theo khoảng cách thời gian
    const usersSource$ = new Observable<UserItem>((observer) => {
      let index = 0;
      const sendNextUser = () => {
        if (index < this.initialUsers.length) {
          observer.next(this.initialUsers[index]);
          index++;
          setTimeout(sendNextUser, 800);
        } else {
          observer.complete();
        }
      };
      sendNextUser();
    });

    let transformedStream$: Observable<any>;

    if (this.mapMode === 'fullname') {
      // Theo Day 21 docs:
      // source.pipe(map((user) => ({ ...user, fullname: `${user.firstname} ${user.lastname}` })))
      transformedStream$ = usersSource$.pipe(
        map((user) => ({
          ...user,
          fullname: `${user.firstname} ${user.lastname}`,
        }))
      );
    } else if (this.mapMode === 'id') {
      // source.pipe(map((user) => user.id))
      transformedStream$ = usersSource$.pipe(map((user) => user.id));
    } else if (this.mapMode === 'pluck-id') {
      // source.pipe(pluck('id'))
      transformedStream$ = usersSource$.pipe(pluck('id'));
    } else {
      // Custom projection
      transformedStream$ = usersSource$.pipe(
        map((user) => `@${user.username.toUpperCase()} (Posts: ${user.postCount})`)
      );
    }

    this.mapSub = transformedStream$.subscribe({
      next: (val) => {
        const rawItem = this.initialUsers[this.mapResults.length];
        this.mapResults.push({
          id: this.mapResults.length + 1,
          raw: rawItem,
          transformed: val,
        });
        this.addLog(
          'NEXT',
          this.mapMode.includes('pluck') ? 'pluck()' : 'map()',
          `Emitted: ${JSON.stringify(val)}`
        );
      },
      complete: () => {
        this.isMapStreaming = false;
        this.addLog('COMPLETE', 'map()', 'Stream User hoàn tất thành công!');
      },
    });
  }

  // Setup hover stream using mapTo() based on docs Day 21
  private setupHoverMapToDemo(): void {
    if (!this.hoverTargetBoxRef) return;

    const el = this.hoverTargetBoxRef.nativeElement;

    // Theo docs Day 21:
    // const mouseover$ = fromEvent(element, 'mouseover');
    // const mouseleave$ = fromEvent(element, 'mouseleave');
    // const hover$ = merge(mouseover$.pipe(mapTo(true)), mouseleave$.pipe(mapTo(false)));
    const mouseover$ = fromEvent(el, 'mouseenter');
    const mouseleave$ = fromEvent(el, 'mouseleave');

    const hover$ = merge(
      mouseover$.pipe(mapTo(true)),
      mouseleave$.pipe(mapTo(false))
    );

    this.hoverSub = hover$.subscribe({
      next: (isHover) => {
        this.isHovered = isHover;
        this.hoverEventCount++;
        this.hoverStatusText = isHover
          ? '🔥 mouseenter -> mapTo(true) -> Con trỏ chuột ĐANG Ở TRONG element'
          : '🍃 mouseleave -> mapTo(false) -> Con trỏ chuột ĐÃ RỜI KHỎI element';
        this.addLog(
          'NEXT',
          'mapTo()',
          `Hover stream: ${isHover} (Event #${this.hoverEventCount})`
        );
      },
    });
  }

  // ============================================================================
  // 2. DEMO: scan() vs reduce()
  // ============================================================================
  onScanClickCounterIncrement(): void {
    // Theo docs Day 21: click$.pipe(scan((acc, curr) => acc + 1, 0))
    this.scanClickCounter++;
    this.addLog('ACCUMULATE', 'scan()', `Click Counter tích lũy qua scan: ${this.scanClickCounter}`);
  }

  resetScanClickCounter(): void {
    this.scanClickCounter = 0;
    this.addLog('INFO', 'scan()', 'Đã reset click counter về 0');
  }

  runScanVsReduceDemo(): void {
    this.accumulatorSub?.unsubscribe();
    this.scanStepResults = [];
    this.reduceFinalResult = null;
    this.isAccumulating = true;
    this.accumulatorSourceIndex = 0;

    this.addLog(
      'INFO',
      'scan vs reduce',
      'Khởi chạy stream tổng hợp postCount của các users: scan() sẽ phát liên tục, còn reduce() sẽ chờ stream complete!'
    );

    // Stream phát từng user sau mỗi 800ms rồi complete
    const users$ = new Observable<UserItem>((observer) => {
      let idx = 0;
      const timerId = setInterval(() => {
        if (idx < this.initialUsers.length) {
          observer.next(this.initialUsers[idx]);
          idx++;
        } else {
          clearInterval(timerId);
          observer.complete();
        }
      }, 900);
    });

    // 1. scan() theo docs: users$.pipe(scan((acc, curr) => acc + curr.postCount, 0))
    const scan$ = users$.pipe(scan((acc, curr) => acc + curr.postCount, 0));

    // 2. reduce() theo docs: users$.pipe(reduce((acc, curr) => acc + curr.postCount, 0))
    const reduce$ = users$.pipe(reduce((acc, curr) => acc + curr.postCount, 0));

    // Subscribe scan
    const scanSub = scan$.subscribe({
      next: (accumulatedPosts) => {
        const currentUser = this.initialUsers[this.accumulatorSourceIndex++];
        this.scanStepResults.push({
          step: this.scanStepResults.length + 1,
          user: currentUser?.firstname || 'Unknown',
          postCount: currentUser?.postCount || 0,
          currentTotal: accumulatedPosts,
        });
        this.addLog(
          'ACCUMULATE',
          'scan()',
          `[scan emit ngay] User: ${currentUser?.firstname} (+${currentUser?.postCount}) -> Tổng tạm tính: ${accumulatedPosts}`
        );
      },
    });

    // Subscribe reduce
    const reduceSub = reduce$.subscribe({
      next: (finalSum) => {
        this.reduceFinalResult = finalSum;
        this.addLog(
          'ACCUMULATE',
          'reduce()',
          `[reduce emit khi COMPLETE] Tổng cuối cùng: ${finalSum}`
        );
      },
      complete: () => {
        this.isAccumulating = false;
        this.addLog('COMPLETE', 'reduce()', 'Source đã complete -> reduce phát giá trị duy nhất!');
      },
    });

    this.accumulatorSub = new Subscription();
    this.accumulatorSub.add(scanSub);
    this.accumulatorSub.add(reduceSub);
  }

  // ============================================================================
  // 3. DEMO: toArray()
  // ============================================================================
  runToArrayDemo(): void {
    this.toArraySub?.unsubscribe();
    this.toArrayEmittedItems = [];
    this.toArrayFinalArray = null;
    this.toArrayStatus = 'EMITTING';

    this.addLog(
      'INFO',
      'toArray()',
      'Source phát 5 phần tử lần lượt. toArray() sẽ thu thập lại và phát toàn bộ mảng khi source complete!'
    );

    // Stream phát các chuỗi từng cái một
    const source$ = new Observable<string>((observer) => {
      let idx = 0;
      const intervalId = setInterval(() => {
        if (idx < this.toArrayItems.length) {
          const item = this.toArrayItems[idx];
          this.toArrayEmittedItems.push(item);
          observer.next(item);
          this.addLog('NEXT', 'Source', `Phát: "${item}"`);
          idx++;
        } else {
          clearInterval(intervalId);
          observer.complete();
        }
      }, 600);
    });

    // Theo docs Day 21: users$.pipe(toArray()).subscribe(observer)
    this.toArraySub = source$.pipe(toArray()).subscribe({
      next: (collectedArray) => {
        this.toArrayFinalArray = collectedArray;
        this.addLog(
          'COMPLETE',
          'toArray()',
          `toArray() emit mảng hoàn chỉnh: [${collectedArray.join(', ')}]`
        );
      },
      complete: () => {
        this.toArrayStatus = 'COMPLETED';
      },
    });
  }

  // ============================================================================
  // 4. DEMO: buffer() & bufferTime()
  // ============================================================================
  startBufferDemo(): void {
    this.stopBufferDemo();
    this.isBufferActive = true;
    this.currentBufferStash = [];
    this.flushedBufferChunks = [];

    this.addLog(
      'INFO',
      'buffer()',
      'Bắt đầu buffer: interval(600) sẽ sinh số liên tục, nhấn nút "Trigger Flush" để xả buffer!'
    );

    // Theo docs: const buffer$ = interval$.pipe(buffer(click$));
    const interval$ = interval(600);
    this.bufferSub = interval$.pipe(buffer(this.bufferNotifier$)).subscribe({
      next: (chunk) => {
        this.flushedBufferChunks.unshift({
          id: this.flushedBufferChunks.length + 1,
          chunk: [...chunk],
          time: new Date().toLocaleTimeString(),
        });
        if (this.flushedBufferChunks.length > 8) this.flushedBufferChunks.pop();
        this.currentBufferStash = [];
        this.addLog(
          'BUFFER',
          'buffer(notifier$)',
          `Đã flush buffer gồm ${chunk.length} phần tử: [${chunk.join(', ')}]`
        );
      },
    });
  }

  triggerBufferFlush(): void {
    if (!this.isBufferActive) return;
    this.bufferNotifier$.next();
  }

  stopBufferDemo(): void {
    if (this.bufferSub) {
      this.bufferSub.unsubscribe();
      this.isBufferActive = false;
      this.addLog('INFO', 'buffer()', 'Đã dừng buffer demo.');
    }
  }

  startBufferTimeDemo(): void {
    this.stopBufferTimeDemo();
    this.isBufferTimeActive = true;
    this.bufferTimeChunks = [];

    this.addLog(
      'INFO',
      'bufferTime()',
      `Bắt đầu bufferTime(${this.bufferTimeSpanMs}ms): Gom số sinh ra từ interval(400) sau mỗi ${this.bufferTimeSpanMs}ms!`
    );

    // Theo docs: const bufferTime = source.pipe(bufferTime(2000));
    const source$ = interval(400);
    this.bufferTimeSub = source$.pipe(bufferTime(this.bufferTimeSpanMs)).subscribe({
      next: (chunk) => {
        this.bufferTimeChunks.unshift({
          id: this.bufferTimeChunks.length + 1,
          chunk: [...chunk],
          time: new Date().toLocaleTimeString(),
        });
        if (this.bufferTimeChunks.length > 8) this.bufferTimeChunks.pop();
        this.addLog(
          'BUFFER',
          'bufferTime()',
          `Cửa sổ ${this.bufferTimeSpanMs}ms gom được: [${chunk.join(', ')}]`
        );
      },
    });
  }

  stopBufferTimeDemo(): void {
    if (this.bufferTimeSub) {
      this.bufferTimeSub.unsubscribe();
      this.isBufferTimeActive = false;
      this.addLog('INFO', 'bufferTime()', 'Đã dừng bufferTime demo.');
    }
  }

  // ============================================================================
  // ACTIVITY LOGGER HELPER
  // ============================================================================
  clearLogs(): void {
    this.logs = [];
  }

  private addLog(
    type: 'NEXT' | 'ACCUMULATE' | 'COMPLETE' | 'BUFFER' | 'INFO',
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
