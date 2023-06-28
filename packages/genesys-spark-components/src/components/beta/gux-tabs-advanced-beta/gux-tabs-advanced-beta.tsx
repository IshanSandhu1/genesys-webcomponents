import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  JSX,
  Listen,
  Method,
  Prop,
  readTask,
  State,
  Watch,
  writeTask
} from '@stencil/core';
import translationResources from './i18n/en.json';

import { afterNextRenderTimeout } from '@utils/dom/after-next-render';
import { trackComponent } from '@utils/tracking/usage';
import { buildI18nForComponent, GetI18nValue } from '../../../i18n';

/**
 * @slot tab-list - Slot for gux-tab-advanced-list element
 * @slot - collection of gux-tab-advanced-panel elements
 */

@Component({
  styleUrl: 'gux-tabs-advanced-beta.less',
  tag: 'gux-tabs-advanced-beta',
  shadow: true
})
export class GuxTabsAdvanced {
  private i18n: GetI18nValue;

  @Element()
  private root: HTMLElement;

  @State()
  tabList: HTMLGuxTabAdvancedListElement;

  @State()
  tabPanels: HTMLGuxTabAdvancedPanelElement[] = [];

  /**
   * tabId of the currently selected tab
   */
  @Prop({ mutable: true })
  activeTab: string;

  /**
   * Enable new tab button
   */
  @Prop()
  showNewTabButton: boolean = true;

  /**
   * Maximum number of tabs created
   */
  @Prop()
  tabLimit: number = Infinity;

  /**
   * Enable tab sorting by drag/drop
   */
  @Prop()
  allowSort: boolean = true;

  @State()
  focused: number = 0;

  /**
   * Disable new tab button event
   */
  @State()
  disableAddTabButton: boolean = false;

  @State()
  tabTriggers: NodeListOf<HTMLGuxTabAdvancedElement>;

  /**
   * Tabs show scrollbar when tabs overflow container
   */
  @State()
  private hasScrollbar: boolean = false;

  /**
   * Triggers when the new tab button is selected.
   */
  @Event()
  newTab: EventEmitter;

  /**
   * Triggers when the active tab changes.
   */
  @Event()
  guxactivetabchange: EventEmitter<string>;

  @Watch('activeTab')
  watchActiveTab(newValue: string) {
    this.activateTab(newValue, this.tabList, this.tabPanels);
    this.guxactivetabchange.emit(newValue);
  }

  @Listen('internalactivatetabpanel')
  onInternalActivateTabPanel(event: CustomEvent): void {
    event.stopPropagation();

    const tabId = event.detail as string;

    this.activateTab(tabId, this.tabList, this.tabPanels);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxActivate(tabId: string): Promise<void> {
    this.activateTab(tabId, this.tabList, this.tabPanels);
  }

  private onSlotchange(): void {
    const [tabListSlot, defaultSlot] = Array.from(
      this.root.shadowRoot.querySelectorAll('slot')
    );

    this.tabList =
      tabListSlot.assignedElements()[0] as HTMLGuxTabAdvancedListBetaElement;
    this.tabPanels =
      defaultSlot.assignedElements() as HTMLGuxTabAdvancedPanelBetaElement[];

    this.activateTab(this.activeTab, this.tabList, this.tabPanels);
  }

  private activateTab(
    tabId: string,
    tabList: HTMLGuxTabAdvancedListBetaElement,
    panels: HTMLGuxTabAdvancedPanelElement[]
  ): void {
    if (tabId) {
      this.activeTab = tabId;
    } else {
      this.activeTab = tabList
        ?.querySelector('gux-tab-advanced-beta')
        ?.getAttribute('tab-id');
    }

    void tabList.guxSetActive(this.activeTab);
    panels.forEach(
      panel => void panel.guxSetActive(panel.tabId === this.activeTab)
    );
  }

  async componentWillLoad(): Promise<void> {
    trackComponent(this.root);
    this.i18n = await buildI18nForComponent(this.root, translationResources);
  }

  render(): JSX.Element {
    return (
      <Host>
        <div class="gux-tabs">
          <div class="tab-scroll-container">
            <div class="action-button-container">
              {this.renderScrollButton('scrollLeft')}
            </div>
            <div class="gux-tab-container">{this.renderTabList()}</div>
            <div class="action-button-container">
              {this.renderScrollButton('scrollRight')}
              {/* {this.showNewTabButton && this.renderNewTabButton()} */}
            </div>
          </div>
          <div>
            <slot onSlotchange={this.onSlotchange.bind(this)}></slot>
          </div>
        </div>
      </Host>
    ) as JSX.Element;
  }

  private renderNewTabButton(): JSX.Element {
    return (
      <button
        title={
          this.disableAddTabButton
            ? this.i18n('disableNewTab')
            : this.root.querySelector('[slot="add-tab"]')
            ? this.root.querySelector('[slot="add-tab"]').textContent.trim()
            : this.i18n('createNewTab')
        }
        class="add-tab-button"
        onClick={() => this.newTab.emit()}
        disabled={this.disableAddTabButton}
      >
        <slot name="add-tab">
          <gux-icon icon-name="add" decorative></gux-icon>
        </slot>
      </button>
    ) as JSX.Element;
  }

  private renderTabList(): JSX.Element {
    return [
      <div>
        <slot name="tab-list"></slot>
      </div>
    ] as JSX.Element;
  }

  private renderScrollButton(direction: string): JSX.Element {
    return (
      <div class="gux-scroll-button-container">
        {this.hasScrollbar ? (
          <button
            tabindex="-1"
            title={this.i18n(direction)}
            aria-label={this.i18n(direction)}
            class="gux-scroll-button"
            onDragOver={() => this.getScrollDirection(direction)}
            onClick={() => this.getScrollDirection(direction)}
          >
            <gux-icon
              icon-name={this.getChevronIconName(direction)}
              decorative={true}
            />
          </button>
        ) : null}
      </div>
    ) as JSX.Element;
  }

  private getScrollDirection(direction: string): void {
    switch (direction) {
      case 'scrollLeft':
        this.scrollLeft();
        break;
      case 'scrollRight':
        this.scrollRight();
        break;
    }
  }

  private getChevronIconName(direction: string): string {
    switch (direction) {
      case 'scrollLeft':
        return 'chevron-left';
      case 'scrollRight':
        return 'chevron-right';
    }
  }

  scrollLeft() {
    writeTask(() => {
      this.root.shadowRoot
        .querySelector('.gux-tab-container')
        .scrollBy(-100, 0);
    });
  }

  scrollRight() {
    writeTask(() => {
      this.root;
      this.root.shadowRoot.querySelector('.gux-tab-container').scrollBy(100, 0);
    });
  }

  private resizeObserver?: ResizeObserver;

  private domObserver?: MutationObserver;

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxSetActive(activeTab: string): Promise<void> {
    this.tabTriggers.forEach((tabTrigger, index) => {
      const active = tabTrigger.tabId === activeTab;

      void tabTrigger.guxSetActive(active);

      if (active) {
        this.focused = index;
      }
    });
  }

  private focusTab(tabIndex: number): void {
    this.focused = tabIndex;
    this.tabTriggers.forEach((tabTrigger, index) => {
      void tabTrigger.guxGetActive().then(activeElement => {
        if (this.focused !== index && !activeElement) {
          tabTrigger.shadowRoot
            .querySelector('.gux-tab-button')
            .setAttribute('tabindex', '-1');
          if (tabTrigger.shadowRoot.querySelector('.gux-tab-options-button')) {
            tabTrigger.shadowRoot
              .querySelector('.gux-tab-options-button')
              .setAttribute('tabindex', '-1');
          }
        }
      });
    });
    this.tabTriggers[this.focused].shadowRoot
      .querySelector('button')
      .setAttribute('tabindex', '0');
    if (
      this.tabTriggers[this.focused].shadowRoot.querySelector(
        '.gux-tab-options-button'
      )
    ) {
      this.tabTriggers[this.focused].shadowRoot
        .querySelector('.gux-tab-options-button')
        .setAttribute('tabindex', '0');
    }
    void this.tabTriggers[this.focused].guxFocus();
  }

  checkForScrollbarHideOrShow() {
    readTask(() => {
      const el = this.root.shadowRoot.querySelector('.gux-tab-container');
      const hasScrollbar = el.clientWidth < el.scrollWidth;

      if (hasScrollbar !== this.hasScrollbar) {
        this.hasScrollbar = hasScrollbar;
      }
    });
  }

  handleKeyboardScroll(direction: 'forward' | 'backward'): void {
    const scrollableSection =
      this.root.shadowRoot.querySelector('.gux-tab-container');
    const currentTab = this.root.querySelectorAll('gux-tab-advanced-beta')[
      this.focused
    ];
    console.log(currentTab, 'currenttab');
    if (direction === 'forward') {
      if (this.focused < this.tabTriggers.length - 1) {
        writeTask(() => {
          if (this.hasScrollbar) {
            scrollableSection.scrollBy(currentTab.clientWidth, 0);
          }
        });
        this.focusTab(this.focused + 1);
      } else {
        writeTask(() => {
          if (this.hasScrollbar) {
            scrollableSection.scrollBy(-scrollableSection.scrollWidth, 0);
          }
        });
        this.focusTab(0);
      }
    } else if (direction === 'backward') {
      if (this.focused > 0) {
        writeTask(() => {
          if (this.hasScrollbar) {
            scrollableSection.scrollBy(-currentTab.clientWidth, 0);
          }
        });
        this.focusTab(this.focused - 1);
      } else {
        writeTask(() => {
          if (this.hasScrollbar) {
            scrollableSection.scrollBy(scrollableSection.scrollWidth, 0);
          }
        });
        this.focusTab(this.tabTriggers.length - 1);
      }
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(
        this.root.shadowRoot.querySelector('.gux-tab-container')
      );
    }

    if (this.domObserver) {
      this.domObserver.disconnect();
    }
  }

  componentDidLoad() {
    if (!this.resizeObserver && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() =>
        this.checkForScrollbarHideOrShow()
      );
    }

    if (this.resizeObserver) {
      this.resizeObserver.observe(
        this.root.shadowRoot.querySelector('.gux-tab-container')
      );
    }

    if (!this.domObserver && window.MutationObserver) {
      this.domObserver = new MutationObserver(() =>
        this.checkForScrollbarHideOrShow()
      );
    }

    if (this.domObserver) {
      this.domObserver.observe(this.root, {
        childList: true,
        attributes: false,
        subtree: true
      });
    }

    afterNextRenderTimeout(() => {
      this.checkForScrollbarHideOrShow();
    }, 500);
  }

  componentWillRender() {
    const tabs: HTMLGuxTabAdvancedElement[] = Array.from(
      this.root.querySelectorAll('gux-tab-advanced-beta')
    );

    this.disableAddTabButton = tabs.length >= this.tabLimit;
  }
}
