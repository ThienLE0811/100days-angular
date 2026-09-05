import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Day003DataBinding } from './day003-data-binding';

describe('Day003DataBinding', () => {
  let component: Day003DataBinding;
  let fixture: ComponentFixture<Day003DataBinding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Day003DataBinding],
    }).compileComponents();

    fixture = TestBed.createComponent(Day003DataBinding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user from Day 3 docs', () => {
    expect(component.user.name).toBe('Thien Le');
    expect(component.user.age).toBe(30);
  });

  it('should increment likes on onLike()', () => {
    const initialLikes = component.user.likes;
    component.onLike();
    expect(component.user.likes).toBe(initialLikes + 1);
  });

  it('should toggle follow state and update followers count', () => {
    const initialFollowers = component.user.followers;
    expect(component.user.isFollowing).toBe(false);

    component.onToggleFollow();
    expect(component.user.isFollowing).toBe(true);
    expect(component.user.followers).toBe(initialFollowers + 1);

    component.onToggleFollow();
    expect(component.user.isFollowing).toBe(false);
    expect(component.user.followers).toBe(initialFollowers);
  });

  it('should toggle disabled property with toggleDisabled()', () => {
    expect(component.isInputDisabled).toBe(false);
    component.toggleDisabled();
    expect(component.isInputDisabled).toBe(true);
    component.toggleDisabled();
    expect(component.isInputDisabled).toBe(false);
  });

  it('should trigger toast on showInfo()', () => {
    component.showInfo(false);
    expect(component.showToast).toBe(true);
    expect(component.toastMessage).toContain('Inside Angular Component method');
  });

  it('should sync role when deconstructed two-way binding changes', () => {
    const newRole = 'Senior Angular Architect';
    component.onDeconstructedRoleChange(newRole);
    expect(component.deconstructedRole).toBe(newRole);
    expect(component.user.role).toBe(newRole);
  });

  it('should reset profile to initial values on resetProfile()', () => {
    component.user.name = 'Test User';
    component.user.age = 99;
    component.isInputDisabled = true;

    component.resetProfile();
    expect(component.user.name).toBe('Thien Le');
    expect(component.user.age).toBe(30);
    expect(component.isInputDisabled).toBe(false);
  });
});
