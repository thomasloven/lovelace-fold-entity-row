import { LitElement, html, css } from "lit";
import { property, query, state } from "lit/decorators.js";
import { until } from "lit/directives/until.js";
import pjson from "../package.json";
import { selectTree } from "./selecttree";
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
  @property() open: boolean = false;
  @property() head?: Promise<LovelaceElement>;
  @property() rows?: Promise<LovelaceElement>[];
  @property() entitiesWarning = false;
  @state() _showContent = this.open;
  @query(".container") _container: HTMLDivElement;
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

    this.head = this._createRow(head, true);

    if (this._config.clickable) {
      this.head.then(async (head) => {
        const el = await selectTree(head, "$hui-generic-entity-row$div");
        if (el?.actionHandler) {
          const hger = await selectTree(head, "$hui-generic-entity-row");
          hger.config["tap_action"] = {
            action: "fire-dom-event",
            fold_row: true,
          };
        } else {
          actionHandlerBind(head, { fold_entity_row: true });
          head.addEventListener("action", (ev: CustomEvent) => this.toggle(ev));
        }

        head.tabIndex = 0;
        head.setAttribute("role", "switch");
        head.ariaLabel = this.open ? "Toggle fold closed" : "Toggle fold open";
        head.ariaChecked = this.open ? "true" : "false";
      });
    }

    this.rows = items.map(async (i) => this._createRow(ensureObject(i)));
  }

  async _createRow(config: any, head = false): Promise<LovelaceElement> {
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
    const newOpen = !this.open;

    this._container.style.overflow = "hidden";
    if (newOpen) {
      console.log("Opening");
      this._showContent = true;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const scrollHeight = this._container.scrollHeight;
    this._container.style.height = `${scrollHeight}px`;

    if (!newOpen) {
      console.log("Closing");
      setTimeout(() => {
        this._container.style.height = "0px";
      }, 0);
    }

    this.open = newOpen;

    // Accessibility
    if (this._config.clickable) {
      const head = await this.head;
      head.ariaLabel = this.open ? "Toggle fold closed" : "Toggle fold open";
      head.ariaChecked = this.open ? "true" : "false";
    }
  }

  set hass(hass: any) {
    this._hass = hass;
    this.rows?.forEach(async (e) => ((await e).hass = hass));
    if (this.head) this.head.then((head) => (head.hass = hass));
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

  _transitionEnd(ev: Event) {
    this._container.style.removeProperty("height");
    this._container.style.overflow = this.open ? "initial" : "hidden";
    this._showContent = this.open;
  }

  render() {
    return html`
      <div
        id="head"
        @ll-custom=${this._customEvent}
        aria-expanded="${String(this.open)}"
      >
        ${until(this.head, "")}
        <ha-icon
          icon="mdi:chevron-down"
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
          class="${this.open ? "open" : ""}"
        ></ha-icon>
      </div>

      <div
        role="region"
        aria-hidden="${!this.open}"
        style=${`padding-left: ${this._config.padding}px;`}
        class="container ${this.open ? "expanded" : ""}"
        tabindex="-1"
        @transitionend=${this._transitionEnd}
      >
        ${this.rows?.map((row) => html`<div>${until(row, "")}</div>`)}
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
      #head :not(ha-icon):focus-visible {
        outline: none;
        background: var(--divider-color);
        border-radius: 24px;
        background-size: cover;
      }
      #head :not(ha-icon):focus {
        outline: none;
      }

      ha-icon {
        width: var(--toggle-icon-width);
        cursor: pointer;
        border-radius: 50%;
        background-size: cover;
        --mdc-icon-size: var(--toggle-icon-width);
        transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      ha-icon:focus {
        outline: none;
        background: var(--divider-color);
      }
      ha-icon.open {
        transform: rotate(180deg);
      }

      :host(.section-head) ha-icon {
        margin-top: 16px;
      }

      .container {
        overflow: hidden;
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
        height: 0px;
      }

      .container.expanded {
        height: auto;
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
