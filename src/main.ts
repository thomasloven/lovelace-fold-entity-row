import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import pjson from "../package.json";
import { selectTree } from "card-tools/src/helpers";
import { findParentCard, actionHandlerBind, actionHandler } from "./helpers.js";

interface LovelaceElement extends HTMLElement {
  hass?: any;
}

interface FoldEntityRowConfig {
  type: string;
  open: boolean;
  entity?: any;
  head?: any;
  items?: any[];
  entities?: any[];
  group_config?: any;
  padding?: number;
  clickable?: boolean;
  mute?: boolean;
  state_color?: boolean;
}

const DEFAULT_CONFIG = {
  open: false,
  padding: 24,
  group_config: {},
  tap_unfold: undefined,
};

function ensureObject(config: any) {
  if (config === undefined) return undefined;
  return typeof config === "string" ? { entity: config } : config;
}

class FoldEntityRow extends LitElement {
  @property() open: boolean;
  @property() head?: LovelaceElement;
  @property() rows?: LovelaceElement[];
  @property() entitiesWarning = false;
  _config: FoldEntityRowConfig;
  _hass: any;
  _hassResolve?: any;

  setConfig(config: FoldEntityRowConfig) {
    this._config = config = Object.assign({}, DEFAULT_CONFIG, config);
    this.open = this.open ?? this._config.open ?? false;

    this._finishSetup();
  }

  async _finishSetup() {
    let head = ensureObject(this._config.entity || this._config.head);
    if (!head) {
      throw new Error("No fold head specified");
    }
    if (this._config.clickable === undefined) {
      if (head.entity === undefined && head.tap_action === undefined) {
        this._config.clickable = true;
      }
    }

    // Items are taken from the first available of the following
    // - config entities: (this allows auto-population of the list)
    // - config items: (for backwards compatibility - not recommended)
    // - The group specified as head
    let items = this._config.entities || this._config.items;
    if (head.entity && items === undefined) {
      if (this.hass === undefined)
        await new Promise((resolve) => (this._hassResolve = resolve));
      this._hassResolve = undefined;
      items = this._hass.states[head.entity]?.attributes?.entity_id;
    }
    if (items === undefined) {
      throw new Error("No entities specified.");
    }
    if (!items || !Array.isArray(items)) {
      throw new Error("Entities must be a list.");
    }

    this.head = await this._createRow(head, true);

    if (this._config.clickable) {
      actionHandlerBind(this.head, {});
      this.head.addEventListener(
        "action",
        (ev: CustomEvent) => this.toggle(ev),
        {
          capture: true,
        }
      );
      this.head.tabIndex = 0;
      this.head.setAttribute("role", "switch");
      this.head.ariaLabel = this.open
        ? "Toggle fold closed"
        : "Toggle fold open";
    }

    this.rows = await Promise.all(
      items.map(async (i) => this._createRow(ensureObject(i)))
    );
  }

  async _createRow(config: any, head = false) {
    const helpers = await (window as any).loadCardHelpers();
    const parentCard = await findParentCard(this);
    const state_color =
      this._config.state_color ??
      parentCard?._config?.state_color ??
      parentCard?.config?.state_color;
    config = {
      state_color,
      ...(head ? {} : this._config.group_config),
      ...config,
    };

    const el = helpers.createRowElement(config);
    this.applyStyle(el, config, head);
    if (this._hass) {
      el.hass = this._hass;
    }

    return el;
  }

  async applyStyle(root: HTMLElement, config: any, head = false) {
    if (head) {
      // Special styling to stretch
      if (root.localName === "hui-section-row") {
        this.classList.add("section-head");
        root.style.minHeight = "53px";
        const el = await selectTree(root, "$.divider");
        if (el) el.style.marginRight = "-48px";
      } else {
        this.classList.remove("section-head");
      }
    }
    await customElements.whenDefined("card-mod");
    (customElements.get("card-mod") as any).applyToElement(
      root,
      "row",
      config.card_mod ? config.card_mod.style : config.style,
      { config }
    );
  }

  async toggle(ev: CustomEvent) {
    if (ev) ev.stopPropagation();
    this.open = this.open == false;

    // Accessibility
    if (this._config.clickable) {
      this.head.ariaLabel = this.open
        ? "Toggle fold closed"
        : "Toggle fold open";
      this.head.ariaChecked = this.open ? "true" : "false";
    }
  }

  set hass(hass: any) {
    this._hass = hass;
    this.rows?.forEach((e) => (e.hass = hass));
    if (this.head) this.head.hass = hass;
    if (this._hassResolve) this._hassResolve();
  }

  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("open")) {
      if ((this as any)._cardMod)
        (this as any)._cardMod.forEach((cm) => cm.refresh());
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    window.setTimeout(() => {
      if (!this.isConnected || this.entitiesWarning) return;
      findParentCard(this).then((result) => {
        if (!result && this._config.mute !== true) {
          this.entitiesWarning = true;
          console.group(
            "%cYou are doing it wrong!",
            "color: red; font-weight: bold"
          );
          console.info(
            "Fold-entity-row should only EVER be used INSIDE an ENTITIES CARD."
          );
          console.info(
            "See https://github.com/thomasloven/lovelace-fold-entity-row/issues/146"
          );
          console.info(this);
          console.groupEnd();
          // Silence this warning by placing the fold-entity-row inside an entities card.
          // or by setting mute: true
        }
      });
    }, 1000);
  }

  _customEvent(ev: CustomEvent) {
    const detail: any = ev.detail;
    if (detail.fold_row) {
      this.toggle(ev);
    }
  }

  render() {
    return html`
      <div id="head" @ll-custom=${this._customEvent} ?open=${this.open}>
        ${this.head}
        <ha-icon
          icon=${this.open ? "mdi:chevron-up" : "mdi:chevron-down"}
          @action=${this.toggle}
          .actionHandler=${actionHandler({})}
          role="${this._config.clickable ? "" : "switch"}"
          tabindex="${this._config.clickable ? "-1" : "0"}"
          aria-checked=${this.open ? "true" : "false"}
          aria-label="${this._config.clickable
            ? ""
            : this.open
            ? "Toggle fold closed"
            : "Toggle fold open"}"
        ></ha-icon>
      </div>

      <div
        id="items"
        ?open=${this.open}
        aria-hidden="${String(!this.open)}"
        aria-expanded="${String(this.open)}"
        style=${`padding-left: ${this._config.padding}px;`}
      >
        <div id="measure">
          ${this.open ? this.rows?.map((row) => html`<div>${row}</div>`) : ""}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      #head {
        display: flex;
        align-items: center;
        --toggle-icon-width: 32px;
      }
      #head :not(ha-icon) {
        flex-grow: 1;
        max-width: calc(100% - var(--toggle-icon-width));
      }
      ha-icon {
        width: var(--toggle-icon-width);
        cursor: pointer;
        border-radius: 50%;
        background-size: cover;
        --mdc-icon-size: var(--toggle-icon-width);
      }
      ha-icon:focus {
        outline: none;
        background: var(--divider-color);
      }
      :host(.section-head) ha-icon {
        margin-top: 16px;
      }

      #head :not(ha-icon):focus-visible {
        outline: none;
        background: var(--divider-color);
        border-radius: 24px;
        background-size: cover;
      }
      #head :not(ha-icon):focus {
        outline: none;
      }

      #items {
        padding: 0;
        margin: 0;
        height: 100%;
        overflow-y: visible;
      }

      #measure > * {
        margin: 8px 0;
      }
      #measure > *:first-child {
        margin-top: 0;
      }
      #measure > *:last-child {
        margin-bottom: 0;
      }
    `;
  }
}

if (!customElements.get("fold-entity-row")) {
  customElements.define("fold-entity-row", FoldEntityRow);
  console.info(
    `%cFOLD-ENTITY-ROW ${pjson.version} IS INSTALLED`,
    "color: green; font-weight: bold",
    ""
  );
}
