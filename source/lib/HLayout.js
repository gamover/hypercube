import $m from 'mithril'

import { HComponent } from './HComponent';

// ---------------------------------------------------------------------------------------------------------------------

export class HLayout extends HComponent {
  constructor() {
    super(...arguments);

    this._content = { default: null };
  }

  /**
   * Задание контента месту шаблона
   * @param {*} content контент
   * @param {String} placeName имя места шаблона
   * @param {Boolean} redraw флаг принудительной перерисовки
   * @returns {HLayout}
   */
  setContent(content, placeName, redraw) {
    if (content === undefined) return this;
    if (typeof placeName !== 'string') placeName = 'default';
    if (typeof redraw !== 'boolean') redraw = false;
    this._content[placeName] = content;
    if (redraw) $m.redraw();
    return this;
  }

  /**
   * Переключение контента с принудительной перерисовкой
   * @param {*} content контент
   * @param {String} placeName имя места шаблона
   * @returns {HLayout}
   */
  switchContent(content, placeName) {
    return this.setContent(content, placeName, true);
  }

  /**
   * Получение контента из места шаблона
   * @param {String} placeName имя места шаблона
   * @returns {*}
   */
  getContent(placeName) {
    if (typeof placeName !== 'string') placeName = 'default';
    let content = this._content[placeName];
    if (!content) return;
    if (content instanceof HComponent) return content.mount();
    return content;
  }
}
