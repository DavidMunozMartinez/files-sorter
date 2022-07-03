/**
 * This is my attempt at creating a simple enough HTML render engine similar to what ALL popular front end frameworks/libriarires offer, AKA data binding
 * to templates, but withouth the extra fancy features, this is targeted to smaller "simpler" projects that only want to bind data to the HTML with as
 * minimum configuration or setup as possible
 */

const BindValues = ['inner-html', 'class', 'style', 'attr', 'if'] as const;
type ArrayAsTypes <T extends ReadonlyArray <unknown>> = T extends ReadonlyArray<infer ArrayAsTypes> ? ArrayAsTypes : never
type BindTypes = ArrayAsTypes<typeof BindValues>

const bindHandlers: any = {
  "inner-html": (bind: any) => {
    if (bind.element) {
      bind.element.innerHTML = String(bind.result);
    }
  },
  class: (bind: any) => {
    if (bind.element) {
      let className = String(bind.result);
      bind.element.className = className;
    }
  },
  style: (bind: any) => {
    if (bind.element) {
      bind.element.setAttribute("style", String(bind.result))
    }
  },
  attr: (bind: any) => { throw new Error("attr binding not implemented yet.") },
  if: (bind: any) => {
    if (bind.element) {
      bind.element.style.opacity = bind.result ? 1 : 0;
      console.log(bind);
    }
  }
};

export class Renderer {
  id: string;
  template: string;
  bind: any = {};

  private container: HTMLElement | null;
  private bindsData: any = {};

  constructor(data: IRenderer) {
    this.id = data.id;
    this.template = data.template.toString();
    this.container = document.getElementById(this.id);

    if (this.container) {
      this.container.innerHTML = this.template;
    }

    if (data.bind) {
      try {
        if (this.validateBindProps(data.bind)) {
          this.bind = new Proxy(data.bind, { set: this.update.bind(this) });
          this.mapBinds();
        } else {
          let err = new Error(
            "Cannot bind Objects, Arrays or Functions to the Renderer... Yet"
          );
          throw err;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Executed each time one of the binded properties is updates by the use or JS Proxy API
   * this is a intermetiate process between the setters and getters of the binds property sent
   * trough the Renderer class
   * @param target
   * @param key
   * @param value
   */
  update(target: any, key: string | symbol, value: any): boolean {
    key = String(key);
    target[key] = value;

    if (this.bindsData[key] && this.container) {
      // Update all DOM connections to this data
      this.bindsData[key].forEach((bindData: any) => {
        // We re-evaluate the expression after we updated the target
        bindData.result = this.evaluateDOMExpression(bindData.expression);
        bindHandlers[bindData.type](bindData);
      });
    }

    return true;
  }

  updateBinds() {
    this.mapBinds();
  }

  /**
   * Exact same document.createElement function, except it checks again for bindings to keep them updates
   * this function should be used if you inted to add a new element with a property binded to it
   */
  createElement(...args: any) {
    try {
      let element = document.createElement.apply(null, args);
      this.mapBinds();
      return element;
    } catch (e) { console.error(e) };
  }


  /**
   * This is a somewhat expensive function in an attempt to keep the data/DOM updates as quick as possible,
   * we iterate over all found bindings and create a helper object with enough references to perform quick
   * updates whenever a binded property is updated
   */
  private mapBinds() {
    let binds = Object.keys(this.bind);
    let DOMBinds: any = {};
    let rendererBinds: any = {};

    this.container?.querySelectorAll("[\\:bind]").forEach(DOMBind => {
      let pair = (DOMBind.getAttribute(":bind") || "").split(":") || [];
      if (!this.isBindingType(<BindTypes>pair[0])) {
        throw new Error(`Invalid bind type "${pair[0]}", valid bind types are: ${BindValues}.`);
      }
      let type: BindTypes = <BindTypes>pair[0];
      let expression = pair[1];
      // let expression = pair[1];
      if (pair.length > 2) {
        pair.shift();
        expression = pair.reduce((prev, current) => prev += ':' + current);
      }
      let element = DOMBind;
      let id = this.uid();
      DOMBinds[id] = {
        type: type,
        expression: expression,
        element: element,
        result: this.evaluateDOMExpression(expression)
      }

      // Once we gathered the expression we remove the attribute to keep the DOM clean
      // DOMBind.removeAttribute(':bind');
    });
    
    binds.forEach((bindKey) => {
      let DOMBindsArray = Object.values(DOMBinds);
      let uses: any = [];
      DOMBindsArray.forEach((DOMBind: any) => {
        if (DOMBind.expression.indexOf(bindKey)) {
          // This expression in DOM uses this data bind
          uses.push(DOMBind);
        }
      });
      rendererBinds[bindKey] = uses;
      if (uses.length) {
        uses.forEach((bindData: any) => {
          bindHandlers[bindData.type](bindData);
        });
      }
    });

    this.bindsData = rendererBinds;
  }

  /**
   * This is to validate that the binds object contains valid values
   * @param bins Object containing all the data that will be binded
   * @returns
   */
  private validateBindProps(binds: any): boolean {
    let values = Object.values(binds);
    let validBinds = true;
    for (let i = 0; i <= values.length; i++) {
      let val = values[i];
      if (
        (typeof val === "object" || typeof val === "function") &&
        val !== null
      ) {
        validBinds = false;
        break;
      }
    }
    return validBinds;
  }

  /**
   * Checks if the string is a valid binding type
   * @param bindType Bind type string
   * @returns
   */
  private isBindingType(bindType: BindTypes): bindType is BindTypes {
    return BindValues.includes(bindType);
  }

  private uid() {
    let firstPart: any  = (Math.random() * 46656) | 0;
    let secondPart: any = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
  }

  private evaluateDOMExpression(expression: string): unknown {
    return Function(`return ${expression}`).apply(this.bind);
  }
}

type BindHandlers = { [key in BindTypes]: (bind: IBinding) => void };

interface IRenderer {
  id: string;
  template: NodeRequire;
  bind?: any;
}

interface IBinding {
  element?: HTMLElement;
  type: BindTypes;
  val: number | string | boolean;
  expression: string;
  relatives: string[]
}

interface IBindMaps {
  [key: string]: IBinding;
}
