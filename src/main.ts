import { LitElement, html, css, noChange } from "lit";
import { property } from "lit/decorators.js";
import { hass } from "card-tools/src/hass";
import pjson from "../package.json";
import { selectTree } from "card-tools/src/helpers";
import { Directive, directive } from "lit/directive.js";

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
  slowclick?: boolean;
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

export async function findParentCard(
  node: any,
  step = 0
): Promise<any | false> {
  if (step == 100) return false;
  if (!node) return false;

  if (node.localName === "hui-entities-card") return node;
  if (node.localName === "hui-picture-elements-card") return node;

  if (node.updateComplete) await node.updateComplete;
  if (node.parentElement) return findParentCard(node.parentElement, step + 1);
  else if (node.parentNode) return findParentCard(node.parentNode, step + 1);
  if ((node as any).host) return findParentCard(node.host, step + 1);
  return false;
}

const actionHandlerBind = (element, options) => {
  const actionHandler: any = document.body.querySelector("action-handler");
  if (!actionHandler) return;
  actionHandler.bind(element, options);
};

const actionHandler = directive(
  class extends Directive {
    update(part, [options]) {
      actionHandlerBind(part.element, options);
      return noChange;
    }

    render(_options) {}
  }
);

class FoldEntityRow extends LitElement {
  @property() open: boolean;
  @property() renderRows: boolean;
  @property() head?: LovelaceElement;
  @property() rows?: LovelaceElement[];
  @property() height = 0;
  @property() maxheight = 0;
  @property() entitiesWarning = false;
  _config: FoldEntityRowConfig;
  _hass: any;
  observer;
  slowclick = false;

  setConfig(config: FoldEntityRowConfig) {
    this._config = config = Object.assign({}, DEFAULT_CONFIG, config);
    this.open = this.open ?? this._config.open ?? false;
    this.renderRows = this.open;

    let head = ensureObject(config.entity || config.head);
    if (!head) {
      throw new Error("No fold head specified");
    }
    if (this._config.clickable === undefined) {
      if (head.entity === undefined && head.tap_action === undefined) {
        this._config.clickable = true;
      }
    }
    if (this._config.slowclick) this.slowclick = true;

    // Items are taken from the first available of the following
    // - config entities: (this allows auto-population of the list)
    // - config items: (for backwards compatibility - not recommended)
    // - The group specified as head
    let items = config.entities || config.items;
    if (head.entity && items === undefined) {
      items = hass().states[head.entity]?.attributes?.entity_id;
    }
    if (items === undefined) {
      throw new Error("No entities specified.");
    }
    if (!items || !Array.isArray(items)) {
      throw new Error("Entities must be a list.");
    }

    (async () => {
      this.head = await this._createRow(head, true);

      if (this._config.clickable) {
        actionHandlerBind(this.head, {});
        this.head.addEventListener(
          "action",
          (ev: CustomEvent) => this._handleClick(ev),
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
    })();
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
        if (el) el.style.marginRight = "-40px";
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

  toggle(ev: Event) {
    this.shadowRoot.querySelector("#items")?.classList.add("clip");
    if (this.open) {
      this.open = false;
      setTimeout(() => {
        this.renderRows = false;
      }, 250);
    } else {
      this.open = true;
      this.renderRows = true;
      setTimeout(() => {
        this.shadowRoot.querySelector("#items")?.classList.remove("clip");
      }, 250);
    }
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
  }

  async updateHeight() {
    this.height = this.open ? this.maxheight : 0;
  }

  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("open") || changedProperties.has("maxheight")) {
      this.updateHeight();
      if ((this as any)._cardMod)
        (this as any)._cardMod.forEach((cm) => cm.refresh());
    }
  }

  firstUpdated() {
    if (this._config.open) {
      window.setTimeout(() => {
        this.updateHeight();
      }, 100);
    }

    const el = this.shadowRoot.querySelector("#measure") as HTMLElement;
    this.observer = new ResizeObserver(() => {
      this.maxheight = el.scrollHeight;
    });
    this.observer.observe(el);
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

  async _handleClick(ev: CustomEvent) {
    // If any other action than tap is received, that must have come from the head row
    // It will be immediately followed
    const hc = this._handleClick as any;
    if (hc.coolDown) {
      ev.stopPropagation();
      return;
    }
    // If any action other than tap is received, it must have come from the head row
    // It will be immediately followed or preceded by a tap action which
    // we then want to ignore. This is handled through cooldowns.
    if (ev.detail.action !== "tap") {
      hc.coolDown = setTimeout(() => (hc.coolDown = undefined), 300);
      if (ev.detail.action === "double_tap") hc.doubleTapped = true;
      return;
    }
    const path = ev.composedPath();
    ev.stopPropagation();
    hc.doubleTapped = false;
    if (this.slowclick)
      await new Promise((resolve) => setTimeout(resolve, 250));
    if (hc.doubleTapped) return;

    // Check if the event came from the #head div
    // Events from the head row itself are swallowed
    if (path[0] != this.head) {
      return;
    }
    this.toggle(ev);
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
        style=${`padding-left: ${this._config.padding}px; max-height: ${this.height}px;`}
      >
        <div id="measure">
          ${this.renderRows
            ? this.rows?.map((row) => html`<div>${row}</div>`)
            : ""}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      #head {
        display: flex;
        align-items: center;
        --toggle-icon-width: 24px;
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
        overflow: hidden;
        transition: max-height 0.2s ease-in-out;
        height: 100%;
        overflow: clip visible;
      }

      #items.clip {
        overflow: clip;
      }

      #measure {
        overflow: clip visible;
      }
      #measure > * {
        margin: 8px 0;
        overflow: clip visible;
      }
      #measure > *:last-child {
        margin-bottom: 0;
      }

      #measure > div * {
        overflow: clip visible;
      }
      #head > *:first-child {
        overflow: clip visible;
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
