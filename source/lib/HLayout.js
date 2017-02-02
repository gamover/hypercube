import { HComponent } from './HComponent.js';

// ---------------------------------------------------------------------------------------------------------------------

export class HLayout extends HComponent {
  constructor() {
    super(...arguments);

    this._content = { default: [] };
  }

  setContent(content, placeName = 'default') {
    if (content === undefined) return this;
    this._content[placeName] = [].concat(content);
    return this;
  }

  getContent(placeName = 'default') {
    return (this._content[placeName] || []).map(item => {
      if (item instanceof HComponent) return item.mount();
      return item;
    });
  }
}
