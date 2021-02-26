const LitElement = customElements.get('home-assistant-main')
  ? Object.getPrototypeOf(customElements.get('home-assistant-main'))
  : Object.getPrototypeOf(customElements.get('hui-view'));

const html = LitElement.prototype.html;

const css = LitElement.prototype.css;

function hass() {
  if(document.querySelector('hc-main'))
    return document.querySelector('hc-main').hass;

  if(document.querySelector('home-assistant'))
    return document.querySelector('home-assistant').hass;

  return undefined;
}
async function load_lovelace() {
  if(customElements.get("hui-view")) return true;

  await customElements.whenDefined("partial-panel-resolver");
  const ppr = document.createElement("partial-panel-resolver");
  ppr.hass = {panels: [{
    url_path: "tmp",
    "component_name": "lovelace",
  }]};
  ppr._updateRoutes();
  await ppr.routerOptions.routes.tmp.load();
  if(!customElements.get("ha-panel-lovelace")) return false;
  const p = document.createElement("ha-panel-lovelace");
  p.hass = hass();
  if(p.hass === undefined) {
    await new Promise(resolve => {
      window.addEventListener('connection-status', (ev) => {
        console.log(ev);
        resolve();
      }, {once: true});
    });
    p.hass = hass();
  }
  p.panel = {config: {mode: null}};
  p._fetchConfig();
  return true;
}

const DOMAINS_HIDE_MORE_INFO = [
  "input_number",
  "input_select",
  "input_text",
  "scene",
  "weblink",
];

let helpers = window.cardHelpers;
new Promise(async (resolve, reject) => {
  if(helpers) resolve();

  const updateHelpers = async () => {
    helpers = await window.loadCardHelpers();
    window.cardHelpers = helpers;
    resolve();
  };

  if(window.loadCardHelpers) {
    updateHelpers();
  } else {
    // If loadCardHelpers didn't exist, force load lovelace and try once more.
    window.addEventListener("load", async () => {
      load_lovelace();
      if(window.loadCardHelpers) {
        updateHelpers();
      }
    });
  }
});

var name = "fold-entity-row";
var version = "20.0.0b0";
var description = "";
var scripts = {
	build: "rollup -c",
	watch: "rollup -c --watch",
	"update-card-tools": "npm uninstall card-tools && npm install thomasloven/lovelace-card-tools"
};
var keywords = [
];
var author = "Thomas Lovén";
var license = "MIT";
var devDependencies = {
	"@babel/core": "^7.13.1",
	"@rollup/plugin-babel": "^5.3.0",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^11.2.0",
	rollup: "^2.39.0",
	"rollup-plugin-terser": "^7.0.2",
	"rollup-plugin-typescript2": "^0.30.0",
	typescript: "^4.1.5"
};
var dependencies = {
	"card-tools": "github:thomasloven/lovelace-card-tools",
	"lit-element": "^2.4.0"
};
var pjson = {
	name: name,
	"private": true,
	version: version,
	description: description,
	scripts: scripts,
	keywords: keywords,
	author: author,
	license: license,
	devDependencies: devDependencies,
	dependencies: dependencies
};

class FoldEntityRow extends LitElement {
  static get properties() {
    return {
      open: Boolean,
      rows: {},
      head: {}
    };
  }

  setConfig(config) {
    const defaults = {
      open: false,
      padding: 24,
      group_config: {}
    };
    this._config = Object.assign({}, defaults, config);
    this.open = this.open || this._config.open;
    let head = this._config.head;
    if (this._config.entity) head = this._config.entity;

    if (!head) {
      throw new Error("No fold head specified");
    }

    if (typeof head === "string") head = {
      entity: head
    }; // Items are taken from the first available of the following
    // - The group specified as head
    // - config entities: (this allows auto-population of the list)
    // - config items: (for backwards compatibility - not recommended)

    let items = this._config.items;
    if (this._config.entities !== undefined) items = this._config.entities;
    if (head.entity && head.entity.startsWith("group.") && items === undefined) items = hass().states[head.entity].attributes.entity_id;else if (items === undefined) throw new Error("No entities specified.");else if (!items || items.length === undefined) throw new Error("Entities must be a list.");

    this._setupHead(head);

    this.rows = [];

    this._setupItems(items);
  }

  async _setupHead(config) {
    this.head = await this._createRow(config, true);
  }

  async _setupItems(items) {
    this.rows = await Promise.all(items.map(async i => {
      console.log(i);
      if (typeof i === "string") i = {
        entity: i
      };
      return this._createRow(i);
    }));
  }

  async _createRow(config, head = false) {
    const helpers = await window.loadCardHelpers();
    if (!head) config = Object.assign({}, this._config.group_config, config);
    const el = helpers.createRowElement(config);
    this.applyStyle(el, config);
    if (this._hass) el.hass = this._hass;
    return el;
  }

  async applyStyle(root, config) {
    await customElements.whenDefined("card-mod");
    customElements.get("card-mod").applyToElement(root, "row", config.card_mod ? config.card_mod.style : config.style, {
      config
    });
  }

  toggle(ev) {
    if (ev) ev.stopPropagation();
    this.open = !this.open;
  }

  hasMoreInfo(config) {
    const entity = config.entity || (typeof config === "string" ? config : null);
    if (entity && !DOMAINS_HIDE_MORE_INFO.includes(entity.split(".", 1)[0])) return true;
    return false;
  }

  set hass(hass) {
    this._hass = hass;
    this.rows.forEach(e => e.hass = hass);
    if (this.head) this.head.hass = hass;
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

      <div
        id="items"
        ?open=${this.open}
        style=${this._config.padding ? `padding-left: ${this._config.padding}px;` : ""}
      >
        ${this.rows}
      </div>
    `;
  }

  static get styles() {
    return css`
      #head {
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
        cursor: pointer;
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

if (!customElements.get("fold-entity-row")) {
  customElements.define("fold-entity-row", FoldEntityRow);
  console.info(`%cFOLD-ENTITY-ROW ${pjson.version} IS INSTALLED`, "color: green; font-weight: bold", "");
}
