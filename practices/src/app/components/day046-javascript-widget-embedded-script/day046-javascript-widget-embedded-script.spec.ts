import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day046JavascriptWidgetEmbeddedScript } from './day046-javascript-widget-embedded-script';

describe('Day046JavascriptWidgetEmbeddedScript', () => {
  let component: Day046JavascriptWidgetEmbeddedScript;
  let fixture: ComponentFixture<Day046JavascriptWidgetEmbeddedScript>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day046JavascriptWidgetEmbeddedScript],
    }).compileComponents();

    fixture = TestBed.createComponent(Day046JavascriptWidgetEmbeddedScript);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
