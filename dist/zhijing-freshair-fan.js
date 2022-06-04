const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class ZhijJingFreshAirFan extends LitElement {
  constructor(){
    super();
  }

  static get properties() {
    return {
      _hass: {},
      config: {},
      entity: {},
    };
  }

  static get styles(){
    return css;
  }

  set hass(hass){
    if(!hass) return;
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this._entity !== entity) {
      this.entity = entity;
    }
  }

  get hass(){
    return this._hass;
  }

  render() {
    const fan = this._hass.states[this.config.entity]
    return fan
      ? html`
        <ha-card>
          <div class='zhijing_freshair__bg'></div>
          <div class='zhijing_freshair-fan'>
            <div class='zhijing_freshair__core flex'>
              <div class='entity__icon'>
                <ha-icon .icon=${fan.attributes.icon}></ha-icon>
              </div>
              <div class="entity__info">
                <div class='entity__info__name'>
                  ${fan.attributes.friendly_name}
                </div>
              </div>
              <div class="zhijing_freshair__control__container">
                <div class="zhijing_freshair__speedslider flex">
                  ${this._showSpeed(fan)}
                </div>
                <div class="zhijing_freshair__powerstrip">
                  <ha-icon-button title="Power"
                    @click=${()=>this._toggle(fan)}>
                    <ha-icon icon="hass:power" class=" ${fan.state=='on'?'power_on':''}"></ha-icon>
                  </ha-icon-button>
                </div>
              </div>
            </div>
            <div class='flex'>
              <div class = "zhijing_freshair__mode flex">
                <div class="mode_button">
                  <ha-icon-button title="Mode Auto"
                    @click=${()=>this._setMode(fan,"auto")}>
                    <ha-icon icon="mdi:alpha-a-circle-outline" class="${fan.state=='off'?'button_inactive':
                   (fan.attributes.preset_mode=='auto'?'mode_checked':'')}"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="mode_button">
                  <ha-icon-button title="Mode Manually"
                    @click=${()=>this._setMode(fan, "manually")}>
                    <ha-icon icon="mdi:alpha-m-circle-outline" class="${fan.state=='off'?'button_inactive':
                   (fan.attributes.preset_mode=='manually'?'mode_checked':'')}"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="mode_button">
                  <ha-icon-button title="Mode Timing"
                    @click=${()=>this._setMode(fan, "timing")}>
                    <ha-icon icon="mdi:alpha-t-circle-outline" class="${fan.state=='off'?'button_inactive':
                   (fan.attributes.preset_mode=='timing'?'mode_checked':'')}"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="speed__button__container">
                  <div class="speed_button">
                    <ha-icon-button title="Speed Decrease"
                      @click=${()=>this._speedDecrease(fan)}>
                      <ha-icon icon="mdi:minus-circle-outline"
                        class="${fan.state=='off' || fan.attributes.percentage==0?'button_inactive':''}">
                      </ha-icon>
                    </ha-icon-button>
                  </div>
                  <div class="speed_button">
                    <ha-icon-button title="Speed Increase"
                      @click=${()=>this._speedIncrease(fan)}>
                      <ha-icon icon="mdi:plus-circle-outline"
                        class="${fan.state=='off' || fan.attributes.percentage>=99?'button_inactive':''}">
                      </ha-icon>
                    </ha-icon-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ha-card>`
      : html`<div class="not-found">Entity ${this.config.entity} not found.</div>`  ;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You should define a entity");
    }
    this.config = deepCopy(config);
  }

  getCardSize() {
    return 1;
  }

  _showSpeed(fan){
    let numberspeed = fan.attributes.percentage
    return html`
      <div class="speed__container">
        <div class="speed__bar height__low ${fan.state=='on' && numberspeed > 0?
          'active__speed__bar':'inactive__speed__bar'}"></div>
      </div>
      <div class="speed__container">
        <div class="speed__bar height__medium ${fan.state=='on' && numberspeed > 33?
          'active__speed__bar':'inactive__speed__bar'}"></div>
      </div>
      <div class="speed__container">
        <div class="speed__bar height__high ${fan.state=='on' && numberspeed > 66?
          'active__speed__bar':'inactive__speed__bar'}"></div>
      </div>
    `
  }

  _speedDecrease(fan){
    let numberspeed = fan.attributes.percentage;
    if(numberspeed == 0)return;
    if(numberspeed == 100){
        numberspeed = 99
    }
    numberspeed -= 33;
    this._setSpeed(fan, numberspeed);
  }

  _speedIncrease(fan){
    let numberspeed = fan.attributes.percentage;
    if(numberspeed >= 99)return;
    numberspeed += 33;
    if(numberspeed == 99){
        numberspeed = 100
    }
    this._setSpeed(fan, numberspeed);
  }

  _toggle(fan) {
    if(fan.state == "on"){
      this.hass.callService("fan", "turn_off", {
        entity_id: fan.entity_id
      });
    }else{
      this.hass.callService("fan", "turn_on", {
        entity_id: fan.entity_id
      });
    }
  }

  _setMode(fan, mode){
    if(fan.state != "on") return;
    this.hass.callService("fan", "set_preset_mode", {
      entity_id: fan.entity_id,
      preset_mode: mode
    });
  }

  _setSpeed(fan, speed){
    if(fan.state != "on") return;
    this.hass.callService("fan", "set_percentage", {
      entity_id: fan.entity_id,
      percentage: speed
    });
  }

  static get styles() {
    return css`
      ha-slider {
        width: 100%;
        min-width: 80px;
      }
      
      .zhijing_freshair-fan{
        align-self: flex-end;
        box-sizing: border-box;
        position: relative;
        padding: 16px;
        transition: padding .25s ease-out;
        width: 100%;
        will-change: padding;
      }
      .zhijing_freshair__bg {
        background: var(--ha-card-background, var(--card-background-color, var(--paper-card-background-color, white)));
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        overflow: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: var(--mmp-bg-opacity);
      }
      
      .{
        align-self: flex-end;
        box-sizing: border-box;
        position: relative;
        padding: 16px;
        transition: padding 0.25s ease-out 0s;
        width: 100%;
        will-change: padding
      }
      
      .zhijing_freshair-fan__core {
         position: relative;
      }
      
      .zhijing_freshair-fan__core {
         position: relative;
      }
     
      :host {
        overflow: visible !important;
        display: block;
        --zhijing_freshair-scale: 1;
        --zhijing_freshair-unit: calc(var(--zhijing_freshair-scale) * 40px);
        --zhijing_freshair-name-font-weight: 400;
        --zhijing_freshair-accent-color: var(--accent-color, #f39c12);
        --zhijing_freshair-base-color: var(--primary-text-color, #000);
        --zhijing_freshair-overlay-color: rgba(0,0,0,0.5);
        --zhijing_freshair-overlay-color-stop: 25%;
        --zhijing_freshair-overlay-base-color: #fff;
        --zhijing_freshair-overlay-accent-color: var(--zhijing_freshair-accent-color);
        --zhijing_freshair-text-color: var(--primary-text-color, #000);
        --zhijing_freshair-media-cover-info-color: var(--zhijing_freshair-text-color);
        --zhijing_freshair-text-color-inverted: var(--disabled-text-color);
        --zhijing_freshair-active-color: var(--zhijing_freshair-active-color);
        --zhijing_freshair-button-color: rgba(255,255,255,0.25);
        --zhijing_freshair-icon-color: var(--paper-item-icon-color, #44739e);
        --zhijing_freshair-icon-active-color: var(--zhijing_freshair-active-color);
        --zhijing_freshair-info-opacity: 0.75;
        --zhijing_freshair-bg-opacity: 1;
        --zhijing_freshair-artwork-opacity: 1;
        --zhijing_freshair-progress-height: 6px;
        --mdc-theme-primary: var(--zhijing_freshair-text-color);
        --mdc-theme-on-primary: var(--zhijing_freshair-text-color);
        --paper-checkbox-unchecked-color: var(--zhijing_freshair-text-color);
        --paper-checkbox-label-color: var(--zhijing_freshair-text-color);
        color: var(--zhijing_freshair-text-color);
      }

      ha-card {
        cursor: default;
        display: flex;
        background: transparent;
        overflow: visible;
        padding: 0px;
        position: relative;
        color: inherit;
        font-size: calc(var(--zhijing_freshair-unit) * 0.35);
        --mdc-icon-button-size: calc(var(--zhijing_freshair-unit));
        --mdc-icon-size: calc(var(--zhijing_freshair-unit) * 0.6);
      }
      ha-icon {
        width: calc(var(--zhijing_freshair-unit) * 0.6);
        height: calc(var(--zhijing_freshair-unit) * 0.6);
      }
      ha-icon-button {
        width: var(--zhijing_freshair-unit);
        height: var(--zhijing_freshair-unit);
        color: var(--zhijing_freshair-text-color, var(--primary-text-color));
        transition: color 0.25s;
      }
      ha-icon-button[color] {
        color: var(--zhijing_freshair-accent-color, var(--accent-color)) !important;
        opacity: 1 !important;
      }
      ha-icon-button[inactive] {
        opacity: 0.5;
      }
      ha-icon-button ha-icon{
        display: flex;
      }


      .zhijing_freshair {
        align-self: flex-end;
        box-sizing: border-box;
        position: relative;
        padding: 16px;
        transition: padding .25s ease-out;
        width: 100%;
        will-change: padding;
      }
      
      .flex {
        display: flex;
        display: -ms-flexbox;
        display: -webkit-flex;
        flex-direction: row;
      }
      
      .entity__icon {
        color: var(--zhijing_freshair-icon-color);
        animation: fade-in .25s ease-out;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 100%;
        height: var(--zhijing_freshair-unit);
        width: var(--zhijing_freshair-unit);
        min-width: var(--zhijing_freshair-unit);
        line-height: var(--zhijing_freshair-unit);
        margin-right: calc(var(--zhijing_freshair-unit) / 5);
        position: relative;
        text-align: center;
        will-change: border-color;
        transition: border-color .25s ease-out;
      }
      .entity__icon[color] {
        color: var(--zhijing_freshair-icon-active-color);
      }
      
      .mode_button{
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 100%;
        height: var(--zhijing_freshair-unit);
        width: var(--zhijing_freshair-unit);
        min-width: var(--zhijing_freshair-unit);
        line-height: var(--zhijing_freshair-unit);
        margin-right: calc(var(--zhijing_freshair-unit) / 5);
        position: relative;
        text-align: center;
        will-change: border-color;
        transition: border-color .25s ease-out;
        display:flex;
      }
      .speed_button{
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 100%;
        height: var(--zhijing_freshair-unit);
        width: var(--zhijing_freshair-unit);
        min-width: var(--zhijing_freshair-unit);
        line-height: var(--zhijing_freshair-unit);
        margin-left: calc(var(--zhijing_freshair-unit) / 5);
        position: relative;
        text-align: center;
        will-change: border-color;
        transition: border-color .25s ease-out;
        display:flex;
        justify-content:flex-end;
      }
      
      .entity__info {
        justify-content: center;
        display: flex;
        flex-direction: column;
        margin-left: 8px;
        position: relative;
        overflow: hidden;
        user-select: none;
      }

      .entity__info__name {
        line-height: calc(var(--zhijing_freshair-unit) / 2);
        color: var(--zhijing_freshair-text-color);
        font-weight: var(--zhijing_freshair-name-font-weight);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    
      .zhijing_freshair__control__container {
        display: flex;
        
        margin-right: 0;
        margin-left: 8px;
        width: auto;
        max-width: 100%;
        min-width: 170px;
        margin-left: auto;
      }
      
      .zhijing_freshair__speedslider{
        width: 100%;
        line-height: initial;
        justify-content: flex-end;
        margin-left: 8px;
        margin-right: 8px;
        height:68%;
      }

      .zhijing_freshair__powerstrip{
        max-width: calc(var(--zhijing_freshair-unit) * 5);
        line-height: initial;
        justify-content: flex-end;
      }
      .zhijing_freshair-fan__adds{
        line-height: calc(var(--zhijing_freshair-unit) / 2);
        overflow: hidden;
      }
      .speed__container {
        position:relative;
        margin-right: 2px;
        height: 100%;
        padding:0px;
        width:33%;
        position: relative;
        text-align: right;
      }
      
      .speed__fanoff {
        position:relative;
        margin-right: 2px;
        height: 100%;
        padding:0px;
        width:100%;
        position: relative;
        text-align: right;
      }
      
      .speed__bar {
        position:absolute;
        bottom:0px;
        width: 100%;
        
      }
      .active__speed__bar{
        background-color: var(--zhijing_freshair-icon-color);
      }
      .inactive__speed__bar{
        background-color: var(--disabled-text-color);
      }
      .speed__button__container{
        margin-left: auto;
        display:flex;
        justify-content: flex-end;
      }
      .zhijing_freshair__mode{
        width:100%
      }
      .height__low{
        height:20%;
      }
      .height__medium{
        height:38%;
      }
      .height__high{
        height:56%;
      }
      
      .mode_checked{
        color: var(--zhijing_freshair-accent-color);
      }
      .power_on{
        color: var(--zhijing_freshair-accent-color)  !important
      }
      .button_inactive{
        color: var(--disabled-text-color);
      }
      
      @keyframes slide {
        100% { transform: translateX(-100%); }
      }
      @keyframes move {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
  }
}

function deepCopy(value) {
  if (!(!!value && typeof value == 'object')) {
    return value;
  }
  if (Object.prototype.toString.call(value) == '[object Date]') {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(deepCopy);
  }
  var result = {};
  Object.keys(value).forEach(
    function(key) { result[key] = deepCopy(value[key]); });
  return result;
}

customElements.define("zhijing-freshair-fan", ZhijJingFreshAirFan);