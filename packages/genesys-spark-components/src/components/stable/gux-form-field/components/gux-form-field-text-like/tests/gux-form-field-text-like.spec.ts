import { newSpecPage } from '@stencil/core/testing';
import MutationObserver from 'mutation-observer';

import { GuxFormFieldTextLike } from '../gux-form-field-text-like';

const components = [GuxFormFieldTextLike];
const language = 'en';

describe('gux-form-field-text-like', () => {
  beforeEach(async () => {
    (
      global as NodeJS.Global & {
        MutationObserver: any;
      }
    ).MutationObserver = MutationObserver;
  });

  it('should build', async () => {
    const html = `
      <gux-form-field-text-like>
        <input slot="input" type="text" value="Sample text"/>
        <label slot="label">Label</label>
        <span slot="error">Error message</span>
      </gux-form-field-text-like>
    `;
    const page = await newSpecPage({ components, html, language });

    expect(page.rootInstance).toBeInstanceOf(GuxFormFieldTextLike);
  });

  describe('#render', () => {
    describe('clearable', () => {
      [
        { componentAttribute: '', inputAttribute: '' },
        { componentAttribute: 'clearable', inputAttribute: '' },
        { componentAttribute: 'clearable="true"', inputAttribute: '' },
        { componentAttribute: 'clearable="false"', inputAttribute: '' },
        { componentAttribute: 'clearable', inputAttribute: 'disabled' }
      ].forEach(({ componentAttribute, inputAttribute }, index) => {
        it(`should render component as expected (${index + 1})`, async () => {
          const html = `
            <gux-form-field-text-like ${componentAttribute}>
              <input slot="input" type="text" value="Sample text" ${inputAttribute}/>
              <label slot="label">Label</label>
            </gux-form-field-text-like>
          `;
          const page = await newSpecPage({ components, html, language });

          expect(page.root).toMatchSnapshot();
        });
      });
    });

    describe('prefix', () => {
      it('should render component as expected', async () => {
        const html = `
          <gux-form-field-text-like>
            <span slot="prefix">Prefix</span>
            <input slot="input" type="text" value="Sample text"/>
            <label slot="label">Label</label>
          </gux-form-field-text-like>
        `;
        const page = await newSpecPage({ components, html, language });

        expect(page.root).toMatchSnapshot();
      });
    });

    describe('suffix', () => {
      it('should render component as expected', async () => {
        const html = `
          <gux-form-field-text-like>
            <input slot="input" type="text" value="Sample text"/>
            <span slot="suffix">Suffix</span>
            <label slot="label">Label</label>
          </gux-form-field-text-like>
        `;
        const page = await newSpecPage({ components, html, language });

        expect(page.root).toMatchSnapshot();
      });
    });

    describe('help', () => {
      it('should render component as expected', async () => {
        const html = `
          <gux-form-field-text-like>
          <input slot="input" type="text" name="e-1" />
          <label slot="label">Default</label>
          <span slot="help">This is a help message</span>
        </gux-form-field-text-like>
        `;
        const page = await newSpecPage({ components, html, language });

        expect(page.root).toMatchSnapshot();
      });
    });

    describe('label-position', () => {
      [
        '',
        'label-position="above"',
        'label-position="beside"',
        'label-position="screenreader"'
      ].forEach((componentAttribute, index) => {
        it(`should render component as expected (${index + 1})`, async () => {
          const html = `
            <gux-form-field-text-like ${componentAttribute}>
              <input slot="input" type="text" value="Sample text"/>
              <label slot="label">Label</label>
            </gux-form-field-text-like>
          `;
          const page = await newSpecPage({ components, html, language });

          expect(page.root).toMatchSnapshot();
        });
      });
    });

    describe('input type attribute', () => {
      ['email', 'password', 'text'].forEach((inputTypeAttribute, index) => {
        it(`should render component as expected (${index + 1})`, async () => {
          const html = `
            <gux-form-field-text-like>
              <input slot="input" type="${inputTypeAttribute}" value="Sample text" />
              <label slot="label">Label</label>
            </gux-form-field-text-like>
          `;
          const page = await newSpecPage({ components, html, language });

          expect(page.root).toMatchSnapshot();
        });
      });
    });

    describe('input attributes', () => {
      ['', 'disabled', 'required'].forEach((inputAttribute, index) => {
        it(`should render component as expected (${index + 1})`, async () => {
          const html = `
            <gux-form-field-text-like>
              <input slot="input" type="text" value="Sample text" ${inputAttribute}/>
              <label slot="label">Label</label>
            </gux-form-field-text-like>
          `;
          const page = await newSpecPage({ components, html, language });

          expect(page.root).toMatchSnapshot();
        });
      });
    });
  });
});
