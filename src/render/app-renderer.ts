export interface IRenderer {
  id: string;
  template: NodeRequire;
  binds?: any;
}

const BindTypes = ["inner-html", "class", "style", "attr"];
type BindTypes = "inner-html" | "class" | "style" | "attr";
type BindHandlers = { [T in BindTypes]: (bind: IBinding) => void };

interface IBinding {
  element: HTMLElement;
  type: BindTypes;
  val: number | string | boolean;
  path: string;
}

interface IBindMaps {
  [key: string]: IBinding;
}

const bindHandlers: BindHandlers = {
  "inner-html": (bind: IBinding) => (bind.element.innerHTML = String(bind.val)),
  class: (bind: IBinding) => (bind.element.className = String(bind.val)),
  style: (bind: IBinding) =>
    bind.element.setAttribute("style", String(bind.val)),
  attr: (bind: IBinding) => {
    throw new Error("attr binding not implemented yet.");
  },
};

export class Renderer {
  id: string;
  template: string;
  binds: any = {};

  private container: HTMLElement | null;
  private bindMaps: IBindMaps = {};

  constructor(data: IRenderer) {
    this.id = data.id;
    this.template = data.template.toString();
    this.container = document.getElementById(this.id);

    if (this.container) {
      this.container.innerHTML = this.template;
    }

    if (data.binds) {
      try {
        if (this.validateBindProps(data.binds)) {
          this.binds = new Proxy(data.binds, { set: this.update.bind(this) });
          this.mapBinds();
        } else {
          let err = new Error(
            "Cannot bind object, arrays or functions to the Renderer."
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
    let compoundKey = `this.${key}`;
    if (
      this.bindMaps[compoundKey] &&
      this.container &&
      this.bindMaps[compoundKey]
    ) {
      let binding: IBinding = this.bindMaps[compoundKey];
      binding.val = value;
      try {
        bindHandlers[binding.type](binding);
      } catch (e) {
        console.error(e);
      }
      target[key] = value;
    }
    return true;
  }

  /**
   * Creates a Bind object per bind instance found, this is just to avoid querying the dom
   * each time we want to update the values and help keep the data updates performance.
   */
  private mapBinds() {
    let binds = this.container?.querySelectorAll("[\\[bind\\]]");
    if (!binds) return;

    binds.forEach((bind) => {
      let pair = (bind.getAttribute("[bind]") || "").split(":") || [];

      if (!this.isBindingType(pair[0])) {
        throw new Error(
          `Invalid bind type "${pair[0]}", valid bind types are: ${BindTypes}.`
        );
      }

      let bindType: BindTypes = pair[0];
      let bindName: string = pair[1].replace(/\s/g, "");
      let bindKey = bindName.split(".")[1];

      this.bindMaps[bindName] = {
        element: <HTMLElement>bind,
        type: bindType,
        val: this.binds[bindKey],
        path: bindName,
      };
    });
  }

  /**
   * This is to validate that the binds object contains valid values
   * @param bins Object containing all the data that will be binded
   * @returns
   */
  private validateBindProps(binds: any) {
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
  private isBindingType(bindType: string): bindType is BindTypes {
    return BindTypes.includes(bindType);
  }
}
