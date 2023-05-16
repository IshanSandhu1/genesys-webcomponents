export function addClassToElements(
  elements: HTMLElement | HTMLElement[] | Element[],
  className: string
) {
  manipulateElementsClasses(elements, 'add', className);
}

export function removeClassToElements(
  elements: HTMLElement | HTMLElement[] | Element[],
  className: string
) {
  manipulateElementsClasses(elements, 'remove', className);
}

function manipulateElementsClasses(
  elements: HTMLElement | Element[] | HTMLElement[] = [],
  action: 'add' | 'remove',
  className: string
) {
  const arr: HTMLElement[] = [].concat(elements);
  for (const el of arr) {
    el.classList[action](className);
  }
}
