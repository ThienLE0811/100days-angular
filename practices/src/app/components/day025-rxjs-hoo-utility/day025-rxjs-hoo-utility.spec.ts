import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day025RxjsHooUtility } from './day025-rxjs-hoo-utility';

describe('Day025RxjsHooUtility', () => {
  let component: Day025RxjsHooUtility;
  let fixture: ComponentFixture<Day025RxjsHooUtility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day025RxjsHooUtility],
    }).compileComponents();

    fixture = TestBed.createComponent(Day025RxjsHooUtility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
