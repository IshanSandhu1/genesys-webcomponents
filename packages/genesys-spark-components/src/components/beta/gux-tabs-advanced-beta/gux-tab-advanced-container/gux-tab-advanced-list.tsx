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
  State,
  Watch
} from '@stencil/core';
import Sortable, { MoveEvent } from 'sortablejs';
import { OnMutation } from '@utils/decorator/on-mutation';
import { eventIsFrom } from '@utils/dom/event-is-from';
import { afterNextRenderTimeout } from '@utils/dom/after-next-render';

@Component({
  styleUrl: 'gux-tab-advanced-list.less',
  tag: 'gux-tab-advanced-list-beta',
  shadow: true
})
export class GuxTabAdvancedContainer {
  private triggerIds: string;
  private sortableInstance?: Sortable;

  @Element()
  root: HTMLElement;

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

  @Watch('allowSort')
  watchAllowSort(allowSort: boolean): void {
    if (allowSort) {
      this.validateSortableInstance();
    } else {
      this.destroySortable();
    }
  }

  @State()
  focused: number = 0;

  /**
   * Disable new tab button event
   */
  @State()
  disableAddTabButton: boolean = false;

  @State()
  tabTriggers: NodeListOf<HTMLGuxTabAdvancedTitleBetaElement>;

  /**
   * Keyboard sort has been triggered using space
   */
  @State()
  private keyboardSort: boolean = false;

  /**
   * Index of sort target before sort starts
   */
  @State()
  private initialSortIndex: number = 0;

  /**
   * Selected target for sort
   */
  @State()
  private sortTarget: Node;
  /**
   * Translation key for aria live alert for keyboard sort
   */
  @State()
  private ariaLiveAlert: string = '';
  //
  /**
   * Triggers when the new tab button is selected.
   */
  @Event()
  newTab: EventEmitter;

  /**
   * Triggers when the sorting of the tabs is changed.
   */
  @Event()
  sortChanged: EventEmitter<string[]>;

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
  @OnMutation({ childList: true, subtree: true })
  onMutation(): void {
    this.setTabTriggers();
  }
  createSortable() {
    this.sortableInstance = new Sortable(this.root, {
      animation: 250,
      draggable: 'gux-tab-advanced-beta',
      filter: '.ignore-sort',
      onMove: (event: MoveEvent) => {
        return !event.related.classList.contains('ignore-sort');
      },
      onUpdate: () => {
        this.emitSortChanged();
      }
    });
  }
  destroySortable() {
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
      this.sortableInstance = null;
    }
  }
  emitSortChanged() {
    const tabIds = Array.from(
      this.root.querySelectorAll('gux-tab-advanced-title-beta')
    ).map(tabElement => tabElement.tabId);
    this.sortChanged.emit(tabIds);
  }
  disconnectedCallback() {
    if (this.sortableInstance) {
      this.destroySortable();
    }
  }

  private validateSortableInstance(): void {
    if (this.allowSort && !this.sortableInstance) {
      this.createSortable();
    }
  }

  componentDidLoad() {
    this.setTabTriggers();

    this.validateSortableInstance();
  }

  componentWillRender() {
    const tabs: HTMLGuxTabAdvancedElement[] = Array.from(
      this.root.querySelectorAll('gux-tab-advanced-title-beta')
    );

    this.disableAddTabButton = tabs.length >= this.tabLimit;
  }

  render(): JSX.Element {
    return (
      <Host
        role="tablist"
        class={`gux-scrollable-section`}
        aria-owns={this.triggerIds}
      >
        <slot />
      </Host>
    ) as JSX.Element;
  }

  private focusTab(tabIndex: number): void {
    this.focused = tabIndex;
    this.tabTriggers.forEach((tabTrigger, index) => {
      void tabTrigger.guxGetActive().then(activeElement => {
        if (this.focused !== index && !activeElement) {
          tabTrigger.setAttribute('tabindex', '-1');
          // if (tabTrigger.shadowRoot.querySelector('.gux-tab-options-button')) {
          //   tabTrigger.shadowRoot
          //     .querySelector('.gux-tab-options-button')
          //     .setAttribute('tabindex', '-1');
          // }
        }
      });
    });
    this.tabTriggers[this.focused].setAttribute('tabindex', '0');
    // if (
    //   this.tabTriggers[this.focused].shadowRoot.querySelector(
    //     '.gux-tab-options-button'
    //   )
    // ) {
    //   this.tabTriggers[this.focused].shadowRoot
    //     .querySelector('.gux-tab-options-button')
    //     .setAttribute('tabindex', '0');
    // }
    void this.tabTriggers[this.focused].guxFocus();
  }

  private setTabTriggers(): void {
    this.tabTriggers = this.root.querySelectorAll(
      'gux-tab-advanced-title-beta'
    );

    if (this.tabTriggers) {
      this.triggerIds = Array.from(this.tabTriggers)
        .map(trigger => `gux-${trigger.getAttribute('tab-id')}-tab`)
        .join(' ');
    } else {
      this.triggerIds = '';
    }
  }
  // keyboard stuff

  @Listen('focusin')
  onFocusin(event: FocusEvent) {
    if (
      this.allowSort &&
      eventIsFrom('gux-tab-advanced-list-beta', event) &&
      !this.keyboardSort
    ) {
      this.ariaLiveAlert = 'toggleSort';
    }
  }

  @Listen('keydown')
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (
          this.keyboardSort &&
          !eventIsFrom('.gux-tab-options-button', event)
        ) {
          this.ariaLiveAlert = '';
          // const parentNode = this.root.querySelector(
          //   'gux-tab-advanced-list-beta'
          // );
          const allNodes = this.root.querySelectorAll('gux-tab-advanced-beta');
          const targetNodeIndex = Array.prototype.indexOf.call(
            allNodes,
            this.sortTarget
          ) as number;
          let insertBeforeTab: Node;
          if (targetNodeIndex === allNodes.length - 1) {
            insertBeforeTab = allNodes[0];
          } else {
            insertBeforeTab = allNodes[targetNodeIndex + 2];
          }
          this.root.insertBefore(this.sortTarget, insertBeforeTab);

          this.tabTriggers = this.root.querySelectorAll(
            'gux-tab-advanced-title-beta'
          );
          this.tabTriggers.forEach((tabTrigger, index) => {
            const active =
              tabTrigger.tabId ===
              (this.sortTarget as Element)?.getAttribute('tab-id');
            if (active) {
              this.focused = index;
            }
          });

          this.focusTab(this.focused);
        } else if (
          !eventIsFrom('.shadowRoot.gux-tab-options-button', event) &&
          !eventIsFrom('.shadowRoot.gux-dropdown-option-container', event)
        ) {
          this.handleKeyboardScroll('forward');
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (
          this.keyboardSort &&
          !eventIsFrom('.gux-tab-options-button', event)
        ) {
          this.ariaLiveAlert = '';
          const parentNode = this.root.querySelector(
            'gux-tab-advanced-list-beta'
          );
          const allNodes = this.root.querySelectorAll('gux-tab-advanced-beta');
          const targetNodeIndex = Array.prototype.indexOf.call(
            allNodes,
            this.sortTarget
          );
          const insertBeforeTab = allNodes[targetNodeIndex - 1] || null;
          this.root.insertBefore(this.sortTarget, insertBeforeTab);
          this.tabTriggers = this.root.querySelectorAll(
            'gux-tab-advanced-title-beta'
          );
          this.tabTriggers.forEach((tabTrigger, index) => {
            const active =
              tabTrigger.tabId ===
              (this.sortTarget as Element)?.getAttribute('tab-id');
            if (active) {
              this.focused = index;
            }
          });
          this.focusTab(this.focused);
        } else if (
          !eventIsFrom('.gux-tab-options-button', event) &&
          !eventIsFrom('.gux-dropdown-option-container', event)
        ) {
          this.handleKeyboardScroll('backward');
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (this.keyboardSort && this.allowSort) {
          this.keyboardSort = false;
          this.ariaLiveAlert = 'sortCancelled';
          // const parentNode = this.root.querySelector(
          //   'gux-tab-advanced-list-beta'
          // );
          const allNodes = this.tabTriggers;
          const targetNodeIndex = this.initialSortIndex;
          const insertBeforeTab = allNodes[targetNodeIndex] || null;
          this.root.insertBefore(this.sortTarget, insertBeforeTab);
        }
        this.tabTriggers = this.root.querySelectorAll(
          'gux-tab-advanced-title-beta'
        );
        this.tabTriggers.forEach((tabTrigger, index) => {
          const active =
            tabTrigger.tabId ===
            (this.sortTarget as Element)?.getAttribute('tab-id');
          if (active) {
            this.focused = index;
          }
        });
        this.focusTab(this.initialSortIndex);
        afterNextRenderTimeout(() => {
          this.focusTab(this.initialSortIndex);
        });

        break;
      case 'Enter':
        if (this.keyboardSort) {
          event.preventDefault();
          this.keyboardSort = false;
          this.ariaLiveAlert = 'sortComplete';
          this.tabTriggers = this.root.querySelectorAll(
            'gux-tab-advanced-title-beta'
          );
          this.tabTriggers.forEach((tabTrigger, index) => {
            const active =
              tabTrigger.tabId ===
              (this.sortTarget as Element)?.getAttribute('tab-id');
            if (active) {
              this.focused = index;
            }
          });
          this.emitSortChanged();
        }
        break;
      case 'Tab':
        if (this.keyboardSort) {
          this.keyboardSort = false;
          this.ariaLiveAlert = 'sortCancelled';
        }
        break;
      case 'Home':
        event.preventDefault();
        this.focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusTab(this.tabTriggers.length - 1);
        break;
    }
  }

  @Listen('keyup')
  onKeyup(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        if (
          eventIsFrom('gux-tab-advanced-title-beta', event) &&
          !eventIsFrom('.gux-tab-options-button', event) &&
          !eventIsFrom('gux-popover-list', event) &&
          this.allowSort
        ) {
          event.preventDefault();
          if (this.keyboardSort === true) {
            this.keyboardSort = false;
            this.ariaLiveAlert = 'sortComplete';
            this.tabTriggers = this.root.querySelectorAll(
              'gux-tab-advanced-title-beta'
            );
            this.tabTriggers.forEach((tabTrigger, index) => {
              const active =
                tabTrigger.tabId ===
                (this.sortTarget as Element)?.getAttribute('tab-id');
              if (active) {
                this.focused = index;
              }
            });
            this.focusTab(this.focused);
            this.emitSortChanged();
          } else {
            this.keyboardSort = true;
            this.sortTarget = (event.target as Element).parentNode;
            this.tabTriggers.forEach((tabTrigger, index) => {
              const active =
                tabTrigger.tabId ===
                (this.sortTarget as Element)?.getAttribute('tab-id');
              if (active) {
                this.initialSortIndex = index;
              }
            });
            this.ariaLiveAlert = 'sortModeOn';
          }
        }
    }
  }

  handleKeyboardScroll(direction: 'forward' | 'backward'): void {
    const scrollableSection = this.root.shadowRoot.querySelector(
      'gux-tab-advanced-list-beta'
    );
    const currentTab = this.root.querySelectorAll('gux-tab-advanced-beta')[
      this.focused
    ];

    if (direction === 'forward') {
      if (this.focused < this.tabTriggers.length - 1) {
        // writeTask(() => {
        //   if (this.hasScrollbar) {
        //     scrollableSection.scrollBy(currentTab.clientWidth, 0);
        //   }
        // });
        this.focusTab(this.focused + 1);
      } else {
        // writeTask(() => {
        //   if (this.hasScrollbar) {
        //     scrollableSection.scrollBy(-scrollableSection.scrollWidth, 0);
        //   }
        // });
        this.focusTab(0);
      }
    } else if (direction === 'backward') {
      if (this.focused > 0) {
        // writeTask(() => {
        //   if (this.hasScrollbar) {
        //     scrollableSection.scrollBy(-currentTab.clientWidth, 0);
        //   }
        // });
        this.focusTab(this.focused - 1);
      } else {
        // writeTask(() => {
        //   if (this.hasScrollbar) {
        //     scrollableSection.scrollBy(scrollableSection.scrollWidth, 0);
        //   }
        // });
        this.focusTab(this.tabTriggers.length - 1);
      }
    }
  }
}
