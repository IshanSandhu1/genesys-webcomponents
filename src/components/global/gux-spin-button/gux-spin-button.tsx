import {
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Method,
  Prop,
  Watch
} from '@stencil/core';

import { buildI18nForComponent } from '../../i18n';
import defaultResources from './gux-spin-button.i18n.json';

@Component({
  styleUrl: 'gux-spin-button.less',
  tag: 'gux-spin-button'
})
export class GuxSpinButton {
  @Element()
  element: HTMLElement;

  /**
   * The current number value of the text field
   */
  @Prop({ reflectToAttr: true, mutable: true })
  value: number;

  /**
   * The minimum number the value can be when using the spin buttons
   */
  @Prop({ reflectToAttr: true })
  min: number;

  /**
   * the maximum number the value can be when using the spin buttons
   */
  @Prop({ reflectToAttr: true })
  max: number;

  /**
   * The number which the value increments / decrements
   */
  @Prop({ reflectToAttr: true })
  step: number;

  /**
   * If the component is disabled or not
   */
  @Prop({ reflectToAttr: true })
  disabled: boolean;

  /**
   * The message shown to the user on an error
   */
  @Prop({ reflectToAttr: true, mutable: true })
  errorMessage: string;

  /**
   * If the component should show validation warnings or not
   */
  @Prop({ reflectToAttr: true })
  ignoreValidation: boolean;

  /**
   * Triggered when user inputs.
   */
  @Event()
  input: EventEmitter<number>;

  private i18n: (resourceKey: string, context?: any) => string;

  emitInput(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.value = Number(event.detail);
  }

  /**
   * Checks if the component is valid
   */
  @Method()
  async validate(): Promise<boolean> {
    if (isNaN(this.value)) {
      this.value = 0;
      return false;
    } else if (this.value > this.max) {
      this.errorMessage = this.ignoreValidation
        ? null
        : this.i18n('validation.max', { max: this.max });
      return false;
    } else if (this.value < this.min) {
      this.errorMessage = this.ignoreValidation
        ? null
        : this.i18n('validation.min', { min: this.min });
      return false;
    } else if (this.value % this.step !== 0) {
      this.errorMessage = this.ignoreValidation
        ? null
        : this.i18n('validation.increment', { increment: this.step });
      return false;
    } else {
      this.errorMessage = null;
      return true;
    }
  }

  @Watch('value')
  valueWatchHandler() {
    if (!this.ignoreValidation) {
      this.validate();
    }

    this.input.emit(this.value);
  }

  @Listen('keydown')
  handleKeyDown(ev: KeyboardEvent) {
    switch (ev.key) {
      case 'ArrowDown':
        this.incrementValue(false);
        ev.preventDefault();
        ev.stopPropagation();
        break;
      case 'ArrowUp':
        this.incrementValue(true);
        ev.preventDefault();
        ev.stopPropagation();
        break;
    }
  }

  async componentWillLoad() {
    this.i18n = await buildI18nForComponent(this.element, defaultResources);
    this.validate();
  }

  incrementValue(up: boolean) {
    let total: number;
    const mod = this.value % this.step;
    if (mod === 0) {
      total = up ? this.step + this.value : this.value - this.step;
    } else {
      total = up ? this.step - mod + this.value : this.value - mod;
    }

    if (total > this.max) {
      total = this.max;
    } else if (total < this.min) {
      total = this.min;
    }

    this.value = total;
  }

  render() {
    return (
      <div class="gux-spin-container">
        <gux-text-field
          id="gux-spin-button-text-field"
          type={'number'}
          value={this.value.toString()}
          onInput={ev => this.emitInput(ev)}
          useClearButton={false}
          disabled={this.disabled}
          errorMessage={this.errorMessage}
        />
        <div class="gux-spin-button-container">
          <button
            id="gux-spin-button-increment"
            aria-label={this.i18n('increment')}
            onClick={() => {
              this.incrementValue(true);
            }}
            class="genesys-icon-iw-circle-no-chevron-up gux-spin-button"
            disabled={this.disabled || this.value >= this.max}
          />
          <button
            id="gux-spin-button-decrement"
            aria-label={this.i18n('decrement')}
            onClick={() => {
              this.incrementValue(false);
            }}
            class="genesys-icon-iw-circle-no-chevron-down gux-spin-button"
            disabled={this.disabled || this.value <= this.min}
          />
        </div>
      </div>
    );
  }
}
