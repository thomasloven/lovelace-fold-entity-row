const e=customElements.get("home-assistant-main")?Object.getPrototypeOf(customElements.get("home-assistant-main")):Object.getPrototypeOf(customElements.get("hui-view")),t=e.prototype.html,o=e.prototype.css;function n(){return document.querySelector("hc-main")?document.querySelector("hc-main").hass:document.querySelector("home-assistant")?document.querySelector("home-assistant").hass:void 0}function i(e,t,o=null){if((e=new Event(e,{bubbles:!0,cancelable:!1,composed:!0})).detail=t||{},o)o.dispatchEvent(e);else{var n=function(){var e=document.querySelector("hc-main");return e?(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("hc-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-view")||e.querySelector("hui-panel-view"):(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=document.querySelector("home-assistant"))&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root"))&&e.shadowRoot)&&e.querySelector("ha-app-layout"))&&e.querySelector("#view"))&&e.firstElementChild}();n&&n.dispatchEvent(e)}}const s=["input_number","input_select","input_text","scene","weblink"];let r=window.cardHelpers;const a=new Promise((async(e,t)=>{r&&e();const o=async()=>{r=await window.loadCardHelpers(),window.cardHelpers=r,e()};window.loadCardHelpers?o():window.addEventListener("load",(async()=>{!async function(){if(customElements.get("hui-view"))return!0;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");if(e.hass={panels:[{url_path:"tmp",component_name:"lovelace"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),!customElements.get("ha-panel-lovelace"))return!1;const t=document.createElement("ha-panel-lovelace");t.hass=n(),void 0===t.hass&&(await new Promise((e=>{window.addEventListener("connection-status",(t=>{console.log(t),e()}),{once:!0})})),t.hass=n()),t.panel={config:{mode:null}},t._fetchConfig()}(),window.loadCardHelpers&&o()}))}));function l(e,t){const o={type:"error",error:e,origConfig:t},n=document.createElement("hui-error-card");return customElements.whenDefined("hui-error-card").then((()=>{const e=document.createElement("hui-error-card");e.setConfig(o),n.parentElement&&n.parentElement.replaceChild(e,n)})),a.then((()=>{i("ll-rebuild",{},n)})),n}function c(e,t){if(!t||"object"!=typeof t||!t.type)return l(`No ${e} type configured`,t);let o=t.type;if(o=o.startsWith("custom:")?o.substr("custom:".length):`hui-${o}-${e}`,customElements.get(o))return function(e,t){let o=document.createElement(e);try{o.setConfig(JSON.parse(JSON.stringify(t)))}catch(e){o=l(e,t)}return a.then((()=>{i("ll-rebuild",{},o)})),o}(o,t);const n=l(`Custom element doesn't exist: ${o}.`,t);n.style.display="None";const s=setTimeout((()=>{n.style.display=""}),2e3);return customElements.whenDefined(o).then((()=>{clearTimeout(s),i("ll-rebuild",{},n)})),n}function d(e){if(r)return r.createRowElement(e);const t=new Set(["call-service","cast","conditional","divider","section","select","weblink"]),o={alert:"toggle",automation:"toggle",climate:"climate",cover:"cover",fan:"toggle",group:"group",input_boolean:"toggle",input_number:"input-number",input_select:"input-select",input_text:"input-text",light:"toggle",lock:"lock",media_player:"media-player",remote:"toggle",scene:"scene",script:"script",sensor:"sensor",timer:"timer",switch:"toggle",vacuum:"toggle",water_heater:"climate",input_datetime:"input-datetime",none:void 0};if(!e)return l("Invalid configuration given.",e);if("string"==typeof e&&(e={entity:e}),"object"!=typeof e||!e.entity&&!e.type)return l("Invalid configuration given.",e);const n=e.type||"default";if(t.has(n)||n.startsWith("custom:"))return c("row",e);return c("entity-row",{type:o[e.entity?e.entity.split(".",1)[0]:"none"]||"text",...e})}var h="20.0.0b0";class u extends e{static get properties(){return{open:Boolean,rows:{}}}setConfig(e){this._config=Object.assign({},{open:!1,padding:20,group_config:{}},e),this.open=this.open||this._config.open;let t=this._config.head;if(this._config.entity&&(t=this._config.entity),!t)throw new Error("No fold head specified");"string"==typeof t&&(t={entity:t});let o=this._config.items;if(void 0!==this._config.entities&&(o=this._config.entities),t.entity&&t.entity.startsWith("group.")&&void 0===o)o=n().states[t.entity].attributes.entity_id;else{if(void 0===o)throw new Error("No entities specified.");if(!o||void 0===o.length)throw new Error("Entities must be a list.")}const i=e=>("string"==typeof e&&(e={entity:e}),Object.assign({},this._config.group_config,e));this.head=d(t),this.head.hass=n(),this.head.addEventListener("click",(e=>{this.hasMoreInfo(t)||t.tap_action||this.toggle(e)})),this.head.setAttribute("head","head"),this.applyStyle(this.head,t),"HUI-SECTION-ROW"===this.head.tagName&&customElements.whenDefined(this.head.localName).then((async()=>{await this.updateComplete,await this.head.updateComplete,this.head.shadowRoot.querySelector(".divider").style.marginRight="-56px"})),this.rows=o.map((e=>{const t=d(i(e));return t.hass=n(),this.hasMoreInfo(e)&&t.classList.add("state-card-dialog"),this.applyStyle(t,i(e)),t}))}async applyStyle(e,t){await customElements.whenDefined("card-mod"),customElements.get("card-mod").applyToElement(e,"row",t.card_mod?t.card_mod.style:t.style,{config:t})}toggle(e){e&&e.stopPropagation(),this.open=!this.open}hasMoreInfo(e){const t=e.entity||("string"==typeof e?e:null);return!(!t||s.includes(t.split(".",1)[0]))}set hass(e){this.rows.forEach((t=>t.hass=e)),this.head.hass=e}render(){return t`
      <div id="head" ?open=${this.open}>
        ${this.head}
        <ha-icon
          @click=${this.toggle}
          icon=${this.open?"mdi:chevron-up":"mdi:chevron-down"}
        ></ha-icon>
      </div>

      <div
        id="items"
        ?open=${this.open}
        style=${this._config.padding?`padding-left: ${this._config.padding}px;`:""}
      >
        ${this.rows}
      </div>
    `}static get styles(){return o`
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
    `}}customElements.get("fold-entity-row")||(customElements.define("fold-entity-row",u),console.info(`%cFOLD-ENTITY-ROW ${h} IS INSTALLED`,"color: green; font-weight: bold",""));
