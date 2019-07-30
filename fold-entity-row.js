!function(e){var t={};function i(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)i.d(n,s,function(t){return e[t]}.bind(null,s));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,i){"use strict";i.r(t);const n=Object.getPrototypeOf(customElements.get("hui-view")),s=n.prototype.html,o=n.prototype.css;function r(e,t,i=null){if((e=new Event(e,{bubbles:!0,cancelable:!1,composed:!0})).detail=t||{},i)i.dispatchEvent(e);else{var n=document.querySelector("home-assistant");(n=(n=(n=(n=(n=(n=(n=(n=(n=(n=(n=n&&n.shadowRoot)&&n.querySelector("home-assistant-main"))&&n.shadowRoot)&&n.querySelector("app-drawer-layout partial-panel-resolver"))&&n.shadowRoot||n)&&n.querySelector("ha-panel-lovelace"))&&n.shadowRoot)&&n.querySelector("hui-root"))&&n.shadowRoot)&&n.querySelector("ha-app-layout #view"))&&n.firstElementChild)&&n.dispatchEvent(e)}}const a="custom:",c=["input_number","input_select","input_text","input_datetime","scene","weblink"];function l(e,t){const i=document.createElement("hui-error-card");return i.setConfig({type:"error",error:e,config:t}),i}function u(e,t){if(!t||"object"!=typeof t||!t.type)return l(`No ${e} type configured`,t);let i=t.type;if(i=i.startsWith(a)?i.substr(a.length):`hui-${i}-${e}`,customElements.get(i))return function(e,t){const i=document.createElement(e);try{i.setConfig(t)}catch(e){return l(e,t)}return i}(i,t);const n=l(`Custom element doesn't exist: ${i}.`,t);n.style.display="None";const s=setTimeout(()=>{n.style.display=""},2e3);return customElements.whenDefined(i).then(()=>{clearTimeout(s),r("ll-rebuild",{},n)}),n}class h extends n{static get properties(){return{hass:{},config:{}}}setConfig(e){var t;this._config=e,this.el?this.el.setConfig(e):this.el=this.create(e),this._hass&&(this.el.hass=this._hass),this.noHass&&(t=this,document.querySelector("home-assistant").provideHass(t))}set config(e){this.setConfig(e)}set hass(e){this._hass=e,this.el&&(this.el.hass=e)}createRenderRoot(){return this}render(){return s`${this.el}`}}if(!customElements.get("card-maker")){class e extends h{create(e){return function(e){return u("card",e)}(e)}}customElements.define("card-maker",e)}if(!customElements.get("element-maker")){class e extends h{create(e){return function(e){return u("element",e)}(e)}}customElements.define("element-maker",e)}if(!customElements.get("entity-row-maker")){class e extends h{create(e){return function(e){const t=new Set(["call-service","divider","section","weblink"]);if(!e)return l("Invalid configuration given.",e);if("string"==typeof e&&(e={entity:e}),"object"!=typeof e||!e.entity&&!e.type)return l("Invalid configuration given.",e);const i=e.type||"default";if(t.has(i)||i.startsWith(a))return u("row",e);const n=e.entity.split(".",1)[0];return Object.assign(e,{type:{alert:"toggle",automation:"toggle",climate:"climate",cover:"cover",fan:"toggle",group:"group",input_boolean:"toggle",input_number:"input-number",input_select:"input-select",input_text:"input-text",light:"toggle",lock:"lock",media_player:"media-player",remote:"toggle",scene:"scene",script:"script",sensor:"sensor",timer:"timer",switch:"toggle",vacuum:"toggle",water_heater:"climate",input_datetime:"input-datetime"}[n]||"text"}),u("entity-row",e)}(e)}}customElements.define("entity-row-maker",e)}customElements.define("fold-entity-row",class extends n{static get properties(){return{hass:{},open:Boolean,items:{}}}setConfig(e){this._config=Object.assign({},{open:!1,padding:20,group_config:{}},e),this.open=this.open||this._config.open,this.head=this._config.head,"string"==typeof this.head&&(this.head={entity:this.head}),this.items=this._config.items,this._config.entities&&(this.items=this._config.entities),this.head.entity&&this.head.entity.startsWith("group.")&&!this.items&&(this.items=document.querySelector("home-assistant").hass.states[this.head.entity].attributes.entity_id)}clickRow(e){const t=e.target.parentElement._config,i=t.entity||("string"==typeof t?t:null);e.stopPropagation(),this.hasMoreInfo(t)?function(e,t=!1){r("hass-more-info",{entityId:e},document.querySelector("home-assistant"));const i=document.querySelector("home-assistant")._moreInfoEl;i.large=t}(i):e.target.parentElement.hasAttribute("head")&&this.toggle(e)}toggle(e){e&&e.stopPropagation(),this.open=!this.open}hasMoreInfo(e){const t=e.entity||("string"==typeof e?e:null);return!(!t||c.includes(t.split(".",1)[0]))}firstUpdated(){const e=this.shadowRoot.querySelector("#head > entity-row-maker");e.updateComplete.then(()=>{const t=e.querySelector("hui-section-row");t&&t.updateComplete.then(()=>{t.shadowRoot.querySelector(".divider").style.marginRight="-56px"})})}render(){this._entities&&this._entities.forEach(e=>e.hass=this.hass);const e=e=>("string"==typeof e&&(e={entity:e}),Object.assign({},this._config.group_config,e));return s`
    <div id="head" ?open=${this.open}>
      <entity-row-maker
        .config=${this.head}
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
      ${this.items.map(t=>s`
        <entity-row-maker
          .config=${e(t)}
          .hass=${this.hass}
          @click=${this.clickRow}
          class=${this.hasMoreInfo(t)?"state-card-dialog":""}
        ></entity-row-maker>
      `)}
    </div>
    `}static get styles(){return o`
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