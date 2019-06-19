import { LitElement, html, css } from "/card-tools/lit-element.js";
import { fireEvent } from "/card-tools/event.js";
import { createEntityRow } from "/card-tools/lovelace-element.js";
import { hass } from "/card-tools/hass.js";

class FoldEntityRow extends LitElement {
  static get properties() {
    return {
      hass: {},
      open: Boolean,
    };
  }

  setConfig(config) {
    const defaults = {
      open: false,
      padding: 20,
      group_config: {},
    };

    this._config = Object.assign({}, defaults, config);
    this.open = this._config.open;

    this._head = this._renderRow(this._config.head, true);

    let items = this._config.items;
    if (this._config.entities)
      items = this._config.entities;
    if (typeof this._config.head === "string" && this._config.head.startsWith("group."))
      items = hass().states[this._config.head].attributes.entity_id;
    if (items)
      this._entities = items.map((e) => this._renderRow(e));
  }

  _renderRow(conf, head=false) {
    conf = (typeof conf === "string") ? {entity: conf} : conf;

    if (!head) {
      conf = Object.assign({}, this._config.group_config, conf);
    }

    const DOMAINS_HIDE_MORE_INFO = [
      "input_number",
      "input_select",
      "input_text",
      "input_datetime",
      "scene",
      "weblink",
    ];

    const el = createEntityRow(conf);
    if (conf.entity && !DOMAINS_HIDE_MORE_INFO.includes(conf.entity.split(".",1)[0])) {
      el.classList.add("state-card-dialog");
      el.addEventListener("click", () => {
        fireEvent("hass-more-info", {entityId: conf.entity}, this);
      });
    } else if (head) {
      el.addEventListener("click", () => this.open = !this.open);
    }

    if (head && conf.type === "section")
      el.updateComplete.then(() => {
        const divider = el.shadowRoot.querySelector(".divider");
        divider.style.marginRight = "-56px";
      });

    return el;
  }

  render() {
    this._head.hass = this.hass;
    if (this._entities)
      this._entities.forEach((e) => e.hass = this.hass);
    return html`
    <div id="head">
      <div id="entity">
        ${this._head}
      </div>
      <div id="toggle">
        <ha-icon
        @click="${() => this.open = !this.open}"
        icon=${this.open ? "mdi:chevron-up" : "mdi:chevron-down"}
        ></ha-icon>
      </div>
      </div>
    <div id="items"
    ?open=${this.open}
    style="
      ${this._config.padding
        ? `padding-left: ${this._config.padding}px;`
        : ''}
      "
    >
      ${this._entities}
    </div>
    `;
  }

  static get styles() {
    return css`
      #head {
        display: flex;
      }
      #entity {
        flex: 1 1 auto;
        width: 0px;
      }
      #toggle {
        flex 0 1 40px;
        display: flex;
        align-items: center;
      }
      #items {
        padding: 0;
        margin: 0;
        overflow: hidden;
        max-height: 0;
      }
      #items[open] {
        overflow: none;
        max-height: none;
      }
      ha-icon {
        width: 40px;
      }
      .state-card-dialog {
        cursor: pointer;
      }

    `;
  }

}

customElements.define('fold-entity-row', FoldEntityRow);
