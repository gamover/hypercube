import $m from 'mithril';

import { HComponent } from './HComponent.js';

// ---------------------------------------------------------------------------------------------------------------------

export class HLayout extends HComponent {
  constructor() {
    super(...arguments);

    this._mounters = { default: null };
  }

  setContent(content, placeName = 'default') {
    if (content === undefined) return this;

    this._mounters[placeName] = {
      oncreate: (vnode)=> {
        if (content instanceof HComponent) return content.mount(vnode.dom);
        if (typeof content === 'object' && typeof content.view === 'function') return $m.mount(vnode.dom, content);
        $m.render(vnode.dom, content);
      },
      onremove: (vnode)=> $m.mount(vnode.dom, null)
    };

    return this;
  }

  getContent(placeName = 'default') {
    return this._mounters[placeName];
  }
}
