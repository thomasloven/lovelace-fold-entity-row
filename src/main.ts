import { LitElement, html, css, noChange } from "lit";
import { property, query } from "lit/decorators.js";
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
  no_animation?: boolean;
}

const DEFAULT_CONFIG = {
  open: false,
  padding: 24,
  group_config: {},
  tap_unfold: undefined,
};

const TRANSITION_DELAY = 200;

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
  @property() head?: LovelaceElement;
  @property() rows?: LovelaceElement[];
  @property() entitiesWarning = false;
  _config: FoldEntityRowConfig;
  _hass: any;
  _toggleCooldown = false;

  @query("#items") itemsContainer;
  @query("#measure") measureContainer;

  setConfig(config: FoldEntityRowConfig) {
    this._config = config = Object.assign({}, DEFAULT_CONFIG, config);
    this.open = this.open ?? this._config.open ?? false;

    let head = ensureObject(config.entity || config.head);
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

  async snapHeight(height: number) {
    this.itemsContainer.style.transition = "none";
    getComputedStyle(this.itemsContainer).transition;
    this.itemsContainer.style.maxHeight = `${height}px`;
    getComputedStyle(this.itemsContainer).maxHeight;
    this.itemsContainer.style.transition = null;
  }

  async flowHeight(height: number) {
    if (this._config.no_animation) return this.snapHeight(height);
    this.itemsContainer.style.maxHeight = `${height}px`;
    this.requestUpdate();
    await this.updateComplete;
  }

  async toggle(ev: CustomEvent) {
    if (ev) ev.stopPropagation();
    if (this._toggleCooldown) return;
    this._toggleCooldown = true;
    setTimeout(() => (this._toggleCooldown = false), TRANSITION_DELAY + 50);
    this.itemsContainer.classList.add("clip");
    if (this.open) {
      await this.snapHeight(this.measureContainer.scrollHeight);
      this.open = false;
      await this.flowHeight(0);
    } else {
      await this.flowHeight(this.measureContainer.scrollHeight);
      this.open = true;
      setTimeout(() => this.snapHeight(1e6), TRANSITION_DELAY + 50);
      setTimeout(
        () => this.itemsContainer.classList.remove("clip"),
        TRANSITION_DELAY + 50
      );
    }

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
  }

  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("open")) {
      if ((this as any)._cardMod)
        (this as any)._cardMod.forEach((cm) => cm.refresh());
    }
  }

  firstUpdated() {
    if (this._config.open) {
      this.itemsContainer.style.maxHeight = "1000000px";
    } else {
      this.itemsContainer.style.maxHeight = "0px";
      this.itemsContainer.classList.add("clip");
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
        class=${this._config.no_animation ? "notransition" : ""}
      >
        <div id="measure">
          ${this.rows?.map((row) => html`<div>${row}</div>`)}
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
        transition: max-height ${TRANSITION_DELAY}ms ease-in-out;
        height: 100%;
      }
      #items.clip {
        overflow: hidden;
      }
      #items.notransition {
        transition: none;
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
