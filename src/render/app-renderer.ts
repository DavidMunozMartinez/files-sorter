export interface IRenderer {
  id: string,
  template: NodeRequire,
  innerHTMLBinds?: any;
}


export class Renderer {
  id: string;
  template: string;
  public innerHTMLBinds: any;
  private container: HTMLElement | null;
  
  constructor(data: IRenderer) {
    this.id = data.id;
    this.template = data.template.toString();
    this.container = document.getElementById(this.id);
    // this.bind = data.bind;
    this.innerHTMLBinds = data.innerHTMLBinds;

    if (this.container) {
      this.container.innerHTML = this.template;
    }

    if (data.innerHTMLBinds) {
      this.innerHTMLBinds = new Proxy(data.innerHTMLBinds, { set: this.update.bind(this) });
    }
  }

  // Update specific innerText of bind properties 
  update(target: any, key: string | symbol, value: any): boolean {
    if (this.container) {
      key = String(key);
      let elem = <HTMLElement>this.container.querySelectorAll(`[inner-html-bind="${key}"]`)[0];
      if (elem) {
        elem.innerText = String(value);
        target[key] = value;
      }
    }
    return true;
  }

  // setterTest(key: <keyof typeof this.innerHTMLBinds>)
}