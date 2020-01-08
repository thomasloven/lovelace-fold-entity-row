import { LitElement, html, css } from "card-tools/src/lit-element.js";
import { hass } from "card-tools/src/hass.js";
import { DOMAINS_HIDE_MORE_INFO, createEntityRow } from "card-tools/src/lovelace-element.js";

class FoldEntityRow extends LitElement {
  static get properties() {
    return {
      open: Boolean,
      items: {},
    };
  }

  setConfig(config) {
    const defaults = {
      open: false,
      padding: 20,
      group_config: {},
    };

    this._config = Object.assign({}, defaults, config);
    this.open = this.open || this._config.open;

    let head = this._config.head;
    if (this._config.entity)
      head = this._config.entity;
    if (typeof head === "string")
      head = {entity: head};

    // Items are taken from the first available of the following
    // - The group specified as head
    // - config entities: (this allows auto-population of the list)
    // - config items: (for backwards compatibility - not recommended)
    let items = this._config.items;
    if (this._config.entities)
      items = this._config.entities;
    if (head.entity && head.entity.startsWith("group.") && !items)
      items = hass().states[head.entity].attributes.entity_id;

    const fix_config = (config) => {
      if(typeof config === "string")
        config = {entity: config};
      return Object.assign({}, this._config.group_config, config);
    }

    this.head = createEntityRow(head);
    this.head.hass = hass();
    this.head.addEventListener("click", (ev) => {
      if(!this.hasMoreInfo(head) && !head.tap_action)
      this.toggle(ev);
    });
    this.head.setAttribute('head', 'head');

    this.rows = items.map((i) => {
      const row = createEntityRow(fix_config(i));
      row.hass = hass();
      if(this.hasMoreInfo(i))
        row.classList.add("state-card-dialog");
      return row;
    });
  }

  toggle(ev) {
    if(ev)
      ev.stopPropagation();
    this.open = !this.open;
  }

  hasMoreInfo(config) {
    const entity = config.entity || (typeof config === "string" ? config : null);
    if(entity && !DOMAINS_HIDE_MORE_INFO.includes(entity.split(".",1)[0]))
      return true;
    return false;
  }

  firstUpdated() {
    // If the header is a section-row, adjust the divider line a bit to look better
    const headRow = this.head;
    headRow.updateComplete.then(() => {
     const element = headRow.querySelector("hui-section-row");
      if(element) {
        element.updateComplete.then(() => {
          element.shadowRoot.querySelector(".divider").style.marginRight = "-56px";
        });
      }
    });
  }

  set hass(hass) {
    this.rows.forEach((e) => e.hass = hass);
    this.head.hass = hass;
  }

  render() {
    return html`
    <div id="head" ?open=${this.open}>
      ${this.head}
      <ha-icon
        @click=${this.toggle}
        icon=${this.open ? "mdi:chevron-up" : "mdi:chevron-down"}
      ></ha-icon>
    </div>

    <div id="items"
      ?open=${this.open}
      style=
        ${this._config.padding
          ? `padding-left: ${this._config.padding}px;`
          : ''
        }
    >
      ${this.rows}
    </div>
    `;
  }

  static get styles() {
    return css`
      #head {
        --toggle-icon-width: 40px;
        display: flex;
        cursor: pointer;
        align-items: center;
      }
      #head :not(ha-icon) {
        flex-grow: 1;
        max-width: calc(100% - var(--toggle-icon-width));
      }
      #head ha-icon {
        width: var(--toggle-icon-width);
        cursor: pointer
      }

      #items {
        padding: 0;
        margin: 0;
        overflow: hidden;
        max-height: 0;
      }
      #items[open] {
        overflow: visible;
        max-height: none;
      }
      .state-card-dialog {
        cursor: pointer;
      }
    `;
  }

}

customElements.define('fold-entity-row', FoldEntityRow);
