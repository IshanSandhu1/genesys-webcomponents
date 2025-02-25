# gux-popup manual accessibility testing status
**Last Updated:** Wed Dec 22 2021 11:29:43 GMT-0500 (Eastern Standard Time)
| Pass | WCAG Success Criterion | Notes |
| --- | --- | --- |
| ❌ | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) | COMUI-824 popup content should close and focus should go back to the popup button if `esc` is pressed |
| ✅ | [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html) | - |
| ❌ | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html) | COMUI-824 focus should move to popup content when popup is opened |
| ❌ | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html) | COMUI-824 |
| ✅ | [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html#dfn-name) | - |
| ✅ | [3.2.1 On Focus](https://www.w3.org/WAI/WCAG21/Understanding/on-focus.html) | - |
| ✅ | [3.2.2 On Input](https://www.w3.org/WAI/WCAG21/Understanding/on-input.html) | - |
| ✅ | [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html) | - |
| ✅ | [3.2.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html) | - |
| ❌ | [4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html) | COMUI-824 button should have aria attributes 'aria-haspopup', 'aria-expanded' and 'aria-controls' |
| ✅ | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html) | - |