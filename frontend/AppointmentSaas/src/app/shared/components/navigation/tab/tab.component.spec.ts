import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComponent, TabItemComponent, TabItem } from './tab.component';

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;

  const mockTabs: TabItem[] = [
    { label: 'Tab 1', icon: 'fas fa-home' },
    { label: 'Tab 2', icon: 'fas fa-user', disabled: true },
    { label: 'Tab 3', icon: 'fas fa-cog', badge: 5, removable: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabComponent, TabItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    component.tabs = mockTabs;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.variant).toBe('default');
    expect(component.config.size).toBe('md');
    expect(component.config.orientation).toBe('horizontal');
    expect(component.config.swipeable).toBe(false);
    expect(component.config.animated).toBe(true);
    expect(component.config.showIcons).toBe(true);
    expect(component.config.showBadges).toBe(true);
    expect(component.config.closable).toBe(false);
  });

  it('should display all tabs', () => {
    const tabElements = fixture.nativeElement.querySelectorAll('app-tab');
    expect(tabElements.length).toBe(3);
  });

  it('should set first tab as active by default', () => {
    expect(component.activeTabIndex).toBe(0);
  });

  it('should show active tab content', () => {
    const activePanel = fixture.nativeElement.querySelector('.tab-content__panel--active');
    expect(activePanel).toBeTruthy();
    expect(activePanel.getAttribute('aria-labelledby')).toBe('tab-0');
  });

  it('should hide inactive tab content', () => {
    const hiddenPanels = fixture.nativeElement.querySelectorAll('.tab-content__panel[hidden]');
    expect(hiddenPanels.length).toBe(2); // 2 inactive panels
  });

  it('should handle tab click', () => {
    spyOn(component.tabChange, 'emit');

    component.setActiveTab(2);

    expect(component.activeTabIndex).toBe(2);
    expect(component.tabChange.emit).toHaveBeenCalledWith(2);
  });

  it('should not activate disabled tab', () => {
    spyOn(component.tabChange, 'emit');

    component.setActiveTab(1); // Disabled tab

    expect(component.activeTabIndex).toBe(0); // Should remain at 0
    expect(component.tabChange.emit).not.toHaveBeenCalled();
  });

  it('should handle tab close', () => {
    spyOn(component.tabClose, 'emit');

    component.closeTab(2);

    expect(component.tabClose.emit).toHaveBeenCalledWith(2);
  });

  it('should navigate to next tab', () => {
    spyOn(component, 'setActiveTab');

    component.nextTab();

    expect(component.setActiveTab).toHaveBeenCalledWith(1);
  });

  it('should wrap to first tab when on last tab', () => {
    component.activeTabIndex = 2;
    spyOn(component, 'setActiveTab');

    component.nextTab();

    expect(component.setActiveTab).toHaveBeenCalledWith(0);
  });

  it('should navigate to previous tab', () => {
    component.activeTabIndex = 2;
    spyOn(component, 'setActiveTab');

    component.previousTab();

    expect(component.setActiveTab).toHaveBeenCalledWith(1);
  });

  it('should wrap to last tab when on first tab', () => {
    spyOn(component, 'setActiveTab');

    component.previousTab();

    expect(component.setActiveTab).toHaveBeenCalledWith(2);
  });

  it('should display tab icons when enabled', () => {
    const icons = fixture.nativeElement.querySelectorAll('.tab-item__icon');
    expect(icons.length).toBe(3);
  });

  it('should hide tab icons when disabled', () => {
    component.config.showIcons = false;
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelector('.tab-item__icon');
    expect(icons).toBeFalsy();
  });

  it('should display tab badges when enabled', () => {
    const badges = fixture.nativeElement.querySelectorAll('.tab-item__badge');
    expect(badges.length).toBe(1); // Only tab 3 has a badge
    expect(badges[0].textContent.trim()).toBe('5');
  });

  it('should hide tab badges when disabled', () => {
    component.config.showBadges = false;
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelector('.tab-item__badge');
    expect(badges).toBeFalsy();
  });

  it('should show close buttons when closable', () => {
    component.config.closable = true;
    fixture.detectChanges();

    const closeButtons = fixture.nativeElement.querySelectorAll('.tab-item__close');
    expect(closeButtons.length).toBe(1); // Only removable tab has close button
  });

  it('should hide close buttons when not closable', () => {
    const closeButtons = fixture.nativeElement.querySelectorAll('.tab-item__close');
    expect(closeButtons.length).toBe(0);
  });

  it('should apply orientation styles', () => {
    component.config.orientation = 'vertical';
    fixture.detectChanges();

    const tabGroup = fixture.nativeElement.querySelector('.tab-group');
    expect(tabGroup.classList.contains('tab-group--vertical')).toBe(true);
  });

  it('should apply variant styles', () => {
    const variants: Array<'default' | 'outlined' | 'filled'> = ['default', 'outlined', 'filled'];

    variants.forEach(variant => {
      component.config.variant = variant;
      fixture.detectChanges();

      const tabItems = fixture.nativeElement.querySelectorAll('.tab-item');
      tabItems.forEach((item: Element) => {
        expect(item.classList.contains(`tab-item--${variant}`)).toBe(true);
      });
    });
  });

  it('should apply size variants', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      component.config.size = size;
      fixture.detectChanges();

      const tabItems = fixture.nativeElement.querySelectorAll('.tab-item');
      tabItems.forEach((item: Element) => {
        expect(item.classList.contains(`tab-item--${size}`)).toBe(true);
      });
    });
  });

  it('should handle empty tabs array', () => {
    component.tabs = [];
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('app-tab');
    expect(tabElements.length).toBe(0);
  });

  it('should handle single tab', () => {
    component.tabs = [{ label: 'Single Tab' }];
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('app-tab');
    expect(tabElements.length).toBe(1);
  });

  it('should have proper accessibility attributes', () => {
    const navigation = fixture.nativeElement.querySelector('.tab-navigation');
    const activePanel = fixture.nativeElement.querySelector('.tab-content__panel--active');

    expect(navigation.getAttribute('role')).toBe('tablist');
    expect(navigation.getAttribute('aria-label')).toBe('Tab navigation');
    expect(activePanel.getAttribute('role')).toBe('tabpanel');
    expect(activePanel.getAttribute('aria-labelledby')).toBe('tab-0');
  });

  it('should have proper component structure', () => {
    const tabGroup = fixture.nativeElement.querySelector('.tab-group');
    const navigation = fixture.nativeElement.querySelector('.tab-navigation');
    const content = fixture.nativeElement.querySelector('.tab-content');

    expect(tabGroup).toBeTruthy();
    expect(navigation).toBeTruthy();
    expect(content).toBeTruthy();
  });
});

describe('TabItemComponent', () => {
  let component: TabItemComponent;
  let fixture: ComponentFixture<TabItemComponent>;

  const mockTabData: TabItem = {
    label: 'Test Tab',
    icon: 'fas fa-test',
    badge: 3,
    removable: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabItemComponent);
    component = fixture.componentInstance;
    component.data = mockTabData;
    component.active = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tab label', () => {
    const label = fixture.nativeElement.querySelector('.tab-item__label');
    expect(label.textContent.trim()).toBe('Test Tab');
  });

  it('should display tab icon', () => {
    const icon = fixture.nativeElement.querySelector('.tab-item__icon');
    expect(icon).toBeTruthy();
    expect(icon.classList.contains('fas')).toBe(true);
    expect(icon.classList.contains('fa-test')).toBe(true);
  });

  it('should display tab badge', () => {
    const badge = fixture.nativeElement.querySelector('.tab-item__badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('3');
  });

  it('should show close button when removable', () => {
    const closeBtn = fixture.nativeElement.querySelector('.tab-item__close');
    expect(closeBtn).toBeTruthy();
  });

  it('should hide close button when not removable', () => {
    component.data.removable = false;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.tab-item__close');
    expect(closeBtn).toBeFalsy();
  });

  it('should emit tabClick when clicked', () => {
    spyOn(component.tabClick, 'emit');

    component.onTabClick();

    expect(component.tabClick.emit).toHaveBeenCalled();
  });

  it('should not emit tabClick when disabled', () => {
    component.data.disabled = true;
    spyOn(component.tabClick, 'emit');

    component.onTabClick();

    expect(component.tabClick.emit).not.toHaveBeenCalled();
  });

  it('should emit tabClose when close button clicked', () => {
    spyOn(component.tabClose, 'emit');

    const closeBtn = fixture.nativeElement.querySelector('.tab-item__close');
    closeBtn.click();

    expect(component.tabClose.emit).toHaveBeenCalled();
  });

  it('should apply active styles when active', () => {
    component.active = true;
    fixture.detectChanges();

    const tabItem = fixture.nativeElement.querySelector('.tab-item');
    expect(tabItem.classList.contains('tab-item--active')).toBe(true);
  });

  it('should apply disabled styles when disabled', () => {
    component.data.disabled = true;
    fixture.detectChanges();

    const tabItem = fixture.nativeElement.querySelector('.tab-item');
    expect(tabItem.classList.contains('tab-item--disabled')).toBe(true);
  });
});