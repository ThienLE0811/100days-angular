import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Day015IntroductionDependencyInjectionInAngular,
  CartService,
  CartExtService,
  ProductModel,
} from './day015-introduction-dependency-injection-in-angular';

describe('Day015IntroductionDependencyInjectionInAngular', () => {
  let component: Day015IntroductionDependencyInjectionInAngular;
  let fixture: ComponentFixture<Day015IntroductionDependencyInjectionInAngular>;
  let cartService: CartService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day015IntroductionDependencyInjectionInAngular],
      providers: [CartService],
    }).compileComponents();

    fixture = TestBed.createComponent(Day015IntroductionDependencyInjectionInAngular);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    await fixture.whenStable();
  });

  it('should create Day015IntroductionDependencyInjectionInAngular component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject rootCartService into component', () => {
    expect(component.rootCartService).toBeDefined();
    expect(component.rootCartService.serviceId).toBe('Local_Cart_Service');
  });

  it('CartService should calculate total correctly for in-memory products', () => {
    const service = new CartService();
    const product = new ProductModel('TEST-1', 'Bàn phím test', 100, '⌨️', 'Test');
    service.addToCart(product);
    service.addToCart(product); // Quantity = 2
    expect(service.selectedProducts.length).toBe(1);
    expect(service.selectedProducts[0].quantity).toBe(2);
    expect(service.calculateTotal()).toBe(200);
  });

  it('CartExtService should override calculateTotal with 10% discount', () => {
    const extService = new CartExtService();
    const product = new ProductModel('TEST-2', 'Màn hình test', 200, '🖥️', 'Test');
    extService.addToCart(product);
    expect(extService.calculateTotal()).toBe(180); // 200 - 10% = 180
    expect(extService.serviceId).toBe('External_VIP_Cart_Service');
  });

  it('should select product for demo and record log', () => {
    const targetProduct = component.products[1];
    component.selectProduct(targetProduct);
    expect(component.selectedProductForDemo).toBe(targetProduct);
    expect(component.logs.length).toBeGreaterThan(0);
    expect(component.logs[0].source).toBe('PRODUCT');
  });

  it('should add product to root cart and clear root cart', () => {
    const testProd = component.products[0];
    component.addSampleItemToRootCart(testProd);
    expect(component.rootCartService.selectedProducts.length).toBeGreaterThan(0);

    component.clearRootCart();
    expect(component.rootCartService.selectedProducts.length).toBe(0);
    expect(component.rootCartService.calculateTotal()).toBe(0);
  });

  it('should clear logs when clearLogs is called', () => {
    component.clearLogs();
    expect(component.logs.length).toBe(0);
  });
});
