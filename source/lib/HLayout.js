import { HComponent } from './HComponent';

// ---------------------------------------------------------------------------------------------------------------------

export class HLayout extends HComponent {
  constructor() {
    super(...arguments);

    this._content = { default: null };
  }

  setContent(content, placeName = 'default') {
    if (content === undefined) return this;
    this._content[placeName] = content;
    return this;
  }

  getContent(placeName = 'default') {
    let content = this._content[placeName];
    if (!content) return;
    if (content instanceof HComponent) return content.mount();
    return content;
  }
}
