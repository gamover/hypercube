export class HController {
  constructor(component) {
    this._h_y_p_e_r_c_u_b_e_ = { component };
  }

  watch() {
    return this._h_y_p_e_r_c_u_b_e_.component.watch(...arguments);
  }

  autorun() {
    return this._h_y_p_e_r_c_u_b_e_.component.autorun(...arguments);
  }

  subscribe() {
    return this._h_y_p_e_r_c_u_b_e_.component.subscribe(...arguments);
  }

  setInterval() {
    return this._h_y_p_e_r_c_u_b_e_.component.setInterval(...arguments);
  }

  setTimeout() {
    return this._h_y_p_e_r_c_u_b_e_.component.setTimeout(...arguments);
  }
}
