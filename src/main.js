import { LitElement, html, css } from "/card-tools/lit-element.js";
import { hass } from "/card-tools/hass.js";
import "/card-tools/card-maker.js";
import { DOMAINS_HIDE_MORE_INFO } from "/card-tools/lovelace-element.js";

class FoldEntityRow extends LitElement {
  static get properties() {
    return {
      _hass: {},
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

    this.head = this._config.head;
    if (this._config.entity)
      this.head = this._config.entity;
    if (typeof this.head === "string")
      this.head = {entity: this.head};

    // Items are taken from the first available of the following
    // - The group specified as head
    // - config entities: (this allows auto-population of the list)
    // - config items: (for backwards compatibility - not recommended)
    this.items = this._config.items;
    if (this._config.entities)
      this.items = this._config.entities;
    if (this.head.entity && this.head.entity.startsWith("group.") && !this.items)
      this.items = hass().states[this.head.entity].attributes.entity_id;
  }

  clickRow(ev) {
    ev.stopPropagation();

    const config = ev.target.parentElement._config;

    if(this.hasMoreInfo(config) || config.tap_action) {
      customElements.get('hui-entities-card').prototype._handleClick.bind(this)(config);
    } else if(ev.target.parentElement.hasAttribute('head')) {
      this.toggle(ev);
    }
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
    const headRow = this.shadowRoot.querySelector("#head > entity-row-maker");
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
    this._hass = hass;
  }

  render() {
    if (this._entities)
      this._entities.forEach((e) => e.hass = this._hass);

    const fix_config = (config) => {
      if(typeof config === "string")
        config = {entity: config};
      return Object.assign({}, this._config.group_config, config);
    }

    return html`
    <div id="head" ?open=${this.open}>
      <entity-row-maker
        .config=${this.head}
        .hass=${this._hass}
        @click=${this.clickRow}
        head
      ></entity-row-maker>
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
      ${this.items.map(i => html`
        <entity-row-maker
          .config=${fix_config(i)}
          .hass=${this._hass}
          @click=${this.clickRow}
          class=${this.hasMoreInfo(i) ? 'state-card-dialog' : ''}
        ></entity-row-maker>
      `)}
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
      #head entity-row-maker {
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
