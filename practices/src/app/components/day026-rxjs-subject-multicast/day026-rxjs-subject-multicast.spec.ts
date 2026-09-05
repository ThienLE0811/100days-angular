import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day026RxjsSubjectMulticast } from './day026-rxjs-subject-multicast';

describe('Day026RxjsSubjectMulticast', () => {
  let component: Day026RxjsSubjectMulticast;
  let fixture: ComponentFixture<Day026RxjsSubjectMulticast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day026RxjsSubjectMulticast],
    }).compileComponents();

    fixture = TestBed.createComponent(Day026RxjsSubjectMulticast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
