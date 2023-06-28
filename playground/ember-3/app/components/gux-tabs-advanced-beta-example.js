import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class GuxTabsAdvancedExample extends Component {
  @tracked tabs = [
    {
      title: 'Hello World 1',
      id: 'tab-beta-1',
    },
    {
      title: 'Hello World 2',
      id: 'tab-beta-2',
    },
    {
      title: 'Hello World 3',
      id: 'tab-beta-3',
    },
    {
      title: 'Hello World 4',
      id: 'tab-beta-4',
    },
    {
      title: 'Hello World 5',
      id: 'tab-beta-5',
    },
  ];

  @action
  onSortChanged(event) {
    let orderArray = event.detail;
    this.tabs = this.tabs.slice().sort(function (a, b) {
      return orderArray.indexOf(a.id) - orderArray.indexOf(b.id);
    });
    console.log(this.tabs);
  }

  @action
  selectTabFive() {
    document.getElementById('interactive2').guxActivate('tab-beta-5');
  }
  @action
  addNewTabToEnd() {
    this.tabs.pushObject({
      title: `Hello World ${this.tabs.length + 1}`,
      id: `tab-beta-${this.tabs.length + 1}`,
    });
  }
  @action
  addNewTabToMiddle() {
    this.tabs.insertAt(3, {
      title: `Hello World ${this.tabs.length + 1}`,
      id: `tab-beta-${this.tabs.length + 1}`,
    });
  }
  @action
  reverseTabOrder() {
    this.tabs.reverseObjects();
  }
}
