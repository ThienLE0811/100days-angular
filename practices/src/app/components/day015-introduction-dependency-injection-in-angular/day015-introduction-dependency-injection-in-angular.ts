import { Component, Injectable, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================================================
// 1. DATA MODELS & INTERFACES (Theo ví dụ trong docs/Day015)
// ============================================================================
export class ProductModel {
  constructor(
    public sku: string,
    public name: string,
    public price: number,
    public image: string,
    public category: string
  ) {}
}

export interface CartItem {
  product: ProductModel;
  quantity: number;
}

// ============================================================================
// 2. SERVICES: CartService (Mặc định) & CartExtService (Override Provider)
// ============================================================================
@Injectable({
  providedIn: 'root',
})
export class CartService {
  serviceId: string = 'Local_Cart_Service';
  serviceName: string = 'CartService (Local Client Calculation)';
  serviceType: 'local' | 'external' = 'local';
  selectedProducts: CartItem[] = [];

  calculateTotal(): number {
    return this.selectedProducts.reduce(
      (total, item) => item.product.price * item.quantity + total,
      0
    );
  }

  addToCart(product: ProductModel): void {
    const existing = this.selectedProducts.find(item => item.product.sku === product.sku);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.selectedProducts.push({ product, quantity: 1 });
    }
  }

  removeFromCart(sku: string): void {
    this.selectedProducts = this.selectedProducts.filter(item => item.product.sku !== sku);
  }

  clearCart(): void {
    this.selectedProducts = [];
  }
}

/**
 * Service mở rộng dùng để Override Provider thông qua { provide: CartService, useClass: CartExtService }
 * Giả lập gọi API máy chủ ngoài và áp dụng chiết khấu VIP 10%
 */
@Injectable()
export class CartExtService extends CartService {
  override serviceId: string = 'External_VIP_Cart_Service';
  override serviceName: string = 'CartExtService (External Datasource & VIP Discount 10%)';
  override serviceType: 'external' = 'external';

  override calculateTotal(): number {
    const subtotal = super.calculateTotal();
    // Giả lập logic tính toán từ server ngoài: áp dụng giảm giá 10%
    return Math.round(subtotal * 0.9);
  }
}

// ============================================================================
// 3. SUB-COMPONENTS MINH HỌA 3 CÁCH KHỞI TẠO VÀ INJECT DEPENDENCY
// ============================================================================

/**
 * 1. TIGHT COUPLING COMPONENT: Tự khởi tạo bằng từ khóa `new CartService()`
 * (Nhược điểm: Ràng buộc cứng, không thể override, khó viết unit test)
 */
@Component({
  selector: 'app-tight-coupled-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card tight">
      <div class="card-status-badge tight-badge">Tight Coupling (new CartService)</div>
      <div class="card-body-content">
        <h4>{{ product.name }}</h4>
        <p class="price">{{ product.price | currency : 'USD' : 'symbol' : '1.0-0' }}</p>
        <p class="desc">Khởi tạo trực tiếp bằng <code>new CartService()</code> bên trong constructor.</p>
        <div class="service-info">
          <small>Service: <strong>{{ cartService.serviceId }}</strong></small>
          <small>Số mặt hàng: <strong>{{ cartService.selectedProducts.length }}</strong></small>
        </div>
        <button class="btn btn-tight" (click)="addToLocalCart()">
          + Thêm vào giỏ hàng riêng (Tight)
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        background: #fff;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(239, 68, 68, 0.05);
      }
      .card-status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      .tight-badge {
        background: #fee2e2;
        color: #991b1b;
      }
      h4 {
        margin: 0 0 0.25rem;
        color: #1e293b;
      }
      .price {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.5rem;
      }
      .desc {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.75rem;
      }
      .service-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.75rem;
        color: #475569;
        margin-bottom: 0.75rem;
        background: #f8fafc;
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
      }
      .btn {
        width: 100%;
        padding: 0.45rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-tight {
        background: #ef4444;
        color: #fff;
      }
      .btn-tight:hover {
        background: #dc2626;
      }
    `,
  ],
})
export class TightCoupledProductComponent {
  @Input() product!: ProductModel;
  // Khởi tạo trực tiếp bằng new - Tight Coupling
  cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  addToLocalCart(): void {
    this.cartService.addToCart(this.product);
  }
}

/**
 * 2. STANDARD DI COMPONENT: Inject CartService thông qua Constructor Injection
 * (Sử dụng Singleton Instance toàn app do providedIn: 'root' cung cấp)
 */
@Component({
  selector: 'app-standard-di-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card standard">
      <div class="card-status-badge standard-badge">Angular DI (providedIn: 'root')</div>
      <div class="card-body-content">
        <h4>{{ product.name }}</h4>
        <p class="price">{{ product.price | currency : 'USD' : 'symbol' : '1.0-0' }}</p>
        <p class="desc">Nhận <code>CartService</code> qua Constructor Injection (Singleton toàn app).</p>
        <div class="service-info">
          <small>Service: <strong>{{ cartService.serviceId }}</strong></small>
          <small>Tổng giỏ chung: <strong>{{ cartService.calculateTotal() | currency : 'USD' : 'symbol' : '1.0-0' }}</strong></small>
        </div>
        <button class="btn btn-standard" (click)="addToSharedCart()">
          + Thêm vào giỏ hàng chung
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        background: #fff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.05);
      }
      .card-status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      .standard-badge {
        background: #dbeafe;
        color: #1e40af;
      }
      h4 {
        margin: 0 0 0.25rem;
        color: #1e293b;
      }
      .price {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.5rem;
      }
      .desc {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.75rem;
      }
      .service-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.75rem;
        color: #475569;
        margin-bottom: 0.75rem;
        background: #f0f9ff;
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
      }
      .btn {
        width: 100%;
        padding: 0.45rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-standard {
        background: #2563eb;
        color: #fff;
      }
      .btn-standard:hover {
        background: #1d4ed8;
      }
    `,
  ],
})
export class StandardDiProductComponent {
  @Input() product!: ProductModel;

  // Constructor Injection - Loose Coupling
  constructor(public cartService: CartService) {}

  addToSharedCart(): void {
    this.cartService.addToCart(this.product);
  }
}

/**
 * 3. OVERRIDDEN DI COMPONENT: Khai báo override provider với `useClass: CartExtService`
 * (Mã nguồn component HOÀN TOÀN KHÔNG ĐỔI, chỉ đổi cấu hình provider!)
 */
@Component({
  selector: 'app-overridden-di-product',
  standalone: true,
  imports: [CommonModule],
  providers: [
    // Điểm nhấn của Day 15: Override Provider mà không sửa code class
    {
      provide: CartService,
      useClass: CartExtService,
    },
  ],
  template: `
    <div class="product-card overridden">
      <div class="card-status-badge overridden-badge">Override Provider (useClass)</div>
      <div class="card-body-content">
        <h4>{{ product.name }}</h4>
        <p class="price">{{ product.price | currency : 'USD' : 'symbol' : '1.0-0' }}</p>
        <p class="desc">Vẫn inject <code>CartService</code>, nhưng Angular cấp <code>CartExtService</code> (VIP -10%).</p>
        <div class="service-info">
          <small>Service: <strong>{{ cartService.serviceId }}</strong></small>
          <small>Tổng sau chiết khấu: <strong>{{ cartService.calculateTotal() | currency : 'USD' : 'symbol' : '1.0-0' }}</strong></small>
        </div>
        <button class="btn btn-overridden" (click)="addToVipCart()">
          + Thêm vào giỏ hàng VIP
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        background: #fff;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(34, 197, 94, 0.05);
      }
      .card-status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      .overridden-badge {
        background: #dcfce7;
        color: #15803d;
      }
      h4 {
        margin: 0 0 0.25rem;
        color: #1e293b;
      }
      .price {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.5rem;
      }
      .desc {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.75rem;
      }
      .service-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.75rem;
        color: #475569;
        margin-bottom: 0.75rem;
        background: #f0fdf4;
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
      }
      .btn {
        width: 100%;
        padding: 0.45rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-overridden {
        background: #16a34a;
        color: #fff;
      }
      .btn-overridden:hover {
        background: #15803d;
      }
    `,
  ],
})
export class OverriddenDiProductComponent {
  @Input() product!: ProductModel;

  // Giữ nguyên kiểu CartService, không cần sửa sang CartExtService!
  constructor(public cartService: CartService) {}

  addToVipCart(): void {
    this.cartService.addToCart(this.product);
  }
}

// ============================================================================
// 4. MAIN HOST COMPONENT (Day015IntroductionDependencyInjectionInAngular)
// ============================================================================
export interface DiLog {
  id: number;
  time: string;
  source: string;
  message: string;
}

@Component({
  imports: [
    CommonModule,
    TightCoupledProductComponent,
    StandardDiProductComponent,
    OverriddenDiProductComponent,
  ],
  selector: 'app-day015-introduction-dependency-injection-in-angular',
  styleUrl: './day015-introduction-dependency-injection-in-angular.scss',
  templateUrl: './day015-introduction-dependency-injection-in-angular.html',
})
export class Day015IntroductionDependencyInjectionInAngular implements OnInit {
  // Sản phẩm mẫu (theo ví dụ Ecommerce ProductModel trong Day015.md)
  products: ProductModel[] = [
    {
      sku: 'PRD-001',
      name: 'Bàn phím cơ Không dây Keychron Q1 Pro',
      price: 199,
      image: '⌨️',
      category: 'Phụ kiện máy tính',
    },
    {
      sku: 'PRD-002',
      name: 'Màn hình Dell UltraSharp 27" 4K',
      price: 580,
      image: '🖥️',
      category: 'Màn hình hiển thị',
    },
    {
      sku: 'PRD-003',
      name: 'Tai nghe Chống ồn Sony WH-1000XM5',
      price: 349,
      image: '🎧',
      category: 'Thiết bị âm thanh',
    },
  ];

  selectedProductForDemo: ProductModel = this.products[0];

  // Logs tương tác
  logs: DiLog[] = [];
  private logId = 1;

  // Host Component cũng inject CartService chung (Singleton 'root')
  constructor(public rootCartService: CartService) {}

  ngOnInit(): void {
    this.addLog('SYSTEM', 'Khởi tạo Day015 Component. Injector đã liên kết rootCartService.');
  }

  selectProduct(product: ProductModel): void {
    this.selectedProductForDemo = product;
    this.addLog('PRODUCT', `Chọn demo sản phẩm: "${product.name}" (${product.sku})`);
  }

  addSampleItemToRootCart(product: ProductModel): void {
    this.rootCartService.addToCart(product);
    this.addLog(
      'ROOT_CART',
      `Đã thêm "${product.name}" vào rootCartService. Tổng cộng: ${this.rootCartService.calculateTotal()} USD`
    );
  }

  clearRootCart(): void {
    this.rootCartService.clearCart();
    this.addLog('ROOT_CART', 'Đã xóa toàn bộ giỏ hàng Root Cart');
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(source: string, message: string): void {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    this.logs.unshift({
      id: this.logId++,
      time,
      source,
      message,
    });

    if (this.logs.length > 20) {
      this.logs.pop();
    }
  }
}
