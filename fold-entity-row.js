!function(e){var t={};function n(i){if(t[i])return t[i].exports;var o=t[i]={i:i,l:!1,exports:{}};return e[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(i,o,function(t){return e[t]}.bind(null,o));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);const i=Object.getPrototypeOf(customElements.get("home-assistant-main")),o=i.prototype.html,s=i.prototype.css;function r(e,t,n=null){if((e=new Event(e,{bubbles:!0,cancelable:!1,composed:!0})).detail=t||{},n)n.dispatchEvent(e);else{var i=document.querySelector("home-assistant");(i=(i=(i=(i=(i=(i=(i=(i=(i=(i=(i=i&&i.shadowRoot)&&i.querySelector("home-assistant-main"))&&i.shadowRoot)&&i.querySelector("app-drawer-layout partial-panel-resolver"))&&i.shadowRoot||i)&&i.querySelector("ha-panel-lovelace"))&&i.shadowRoot)&&i.querySelector("hui-root"))&&i.shadowRoot)&&i.querySelector("ha-app-layout #view"))&&i.firstElementChild)&&i.dispatchEvent(e)}}const a="custom:",c=["input_number","input_select","input_text","input_datetime","scene","weblink"];function l(e,t){const n=document.createElement("hui-error-card");return n.setConfig({type:"error",error:e,config:t}),n}function u(e,t){if(!t||"object"!=typeof t||!t.type)return l(`No ${e} type configured`,t);let n=t.type;if(n=n.startsWith(a)?n.substr(a.length):`hui-${n}-${e}`,customElements.get(n))return function(e,t){const n=document.createElement(e);try{n.setConfig(t)}catch(e){return l(e,t)}return n}(n,t);const i=l(`Custom element doesn't exist: ${n}.`,t);i.style.display="None";const o=setTimeout(()=>{i.style.display=""},2e3);return customElements.whenDefined(n).then(()=>{clearTimeout(o),r("ll-rebuild",{},i)}),i}class h extends i{static get properties(){return{hass:{},config:{}}}setConfig(e){var t;this._config=e,this.el?this.el.setConfig(e):this.el=this.create(e),this._hass&&(this.el.hass=this._hass),this.noHass&&(t=this,document.querySelector("home-assistant").provideHass(t))}set config(e){this.setConfig(e)}set hass(e){this._hass=e,this.el&&(this.el.hass=e)}createRenderRoot(){return this}render(){return o`${this.el}`}}if(!customElements.get("card-maker")){class e extends h{create(e){return function(e){return u("card",e)}(e)}}customElements.define("card-maker",e)}if(!customElements.get("element-maker")){class e extends h{create(e){return function(e){return u("element",e)}(e)}}customElements.define("element-maker",e)}if(!customElements.get("entity-row-maker")){class e extends h{create(e){return function(e){const t=new Set(["call-service","divider","section","weblink"]);if(!e)return l("Invalid configuration given.",e);if("string"==typeof e&&(e={entity:e}),"object"!=typeof e||!e.entity&&!e.type)return l("Invalid configuration given.",e);const n=e.type||"default";if(t.has(n)||n.startsWith(a))return u("row",e);const i=e.entity.split(".",1)[0];return Object.assign(e,{type:{alert:"toggle",automation:"toggle",climate:"climate",cover:"cover",fan:"toggle",group:"group",input_boolean:"toggle",input_number:"input-number",input_select:"input-select",input_text:"input-text",light:"toggle",lock:"lock",media_player:"media-player",remote:"toggle",scene:"scene",script:"script",sensor:"sensor",timer:"timer",switch:"toggle",vacuum:"toggle",water_heater:"climate",input_datetime:"input-datetime"}[i]||"text"}),u("entity-row",e)}(e)}}customElements.define("entity-row-maker",e)}customElements.define("fold-entity-row",class extends i{static get properties(){return{hass:{},open:Boolean,items:{}}}setConfig(e){this._config=Object.assign({},{open:!1,padding:20,group_config:{}},e),this.open=this.open||this._config.open,this.items=this._config.items,this._config.entities&&(this.items=this._config.entities),"string"==typeof this._config.head&&this._config.head.startsWith("group.")&&(this.items=document.querySelector("home-assistant").hass.states[this._config.head].attributes.entity_id)}clickRow(e){const t=e.target.parentElement._config,n=t.entity||("string"==typeof t?t:null);e.stopPropagation(),this.hasMoreInfo(t)?function(e,t=!1){r("hass-more-info",{entityId:e},document.querySelector("home-assistant"));const n=document.querySelector("home-assistant")._moreInfoEl;n.large=t}(n):e.target.parentElement.hasAttribute("head")&&this.toggle(e)}toggle(e){e&&e.stopPropagation(),this.open=!this.open}hasMoreInfo(e){const t=e.entity||("string"==typeof e?e:null);return!(!t||c.includes(t.split(".",1)[0]))}firstUpdated(){const e=this.shadowRoot.querySelector("#head > entity-row-maker");e.updateComplete.then(()=>{const t=e.querySelector("hui-section-row");t&&t.updateComplete.then(()=>{t.shadowRoot.querySelector(".divider").style.marginRight="-56px"})})}render(){this._entities&&this._entities.forEach(e=>e.hass=this.hass);const e=e=>("string"==typeof e&&(e={entity:e}),Object.assign({},this._config.group_config,e));return o`
    <div id="head" ?open=${this.open}>
      <entity-row-maker
        .config=${this._config.head}
        .hass=${this.hass}
        @click=${this.clickRow}
        head
      ></entity-row-maker>
      <ha-icon
        @click=${this.toggle}
        icon=${this.open?"mdi:chevron-up":"mdi:chevron-down"}
      ></ha-icon>
    </div>

    <div id="items"
      ?open=${this.open}
      style=
        ${this._config.padding?`padding-left: ${this._config.padding}px;`:""}
    >
      ${this.items.map(t=>o`
        <entity-row-maker
          .config=${e(t)}
          .hass=${this.hass}
          @click=${this.clickRow}
          class=${this.hasMoreInfo(t)?"state-card-dialog":""}
        ></entity-row-maker>
      `)}
    </div>
    `}static get styles(){return s`
      #head {
        display: flex;
        cursor: pointer;
        align-items: center;
      }
      #head entity-row-maker {
        flex-grow: 1;
      }
      #head ha-icon {
        width: 40px;
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
    `}})}]);