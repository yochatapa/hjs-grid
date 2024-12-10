class HjsContextMenu {          
    #el; #data; #rows; #option;
    constructor(option) {
        if(!!option) {
            this.#option = option;
            if(option.childNum === undefined || option.childNum === null) this.#option.childNum = 0;

            if(typeof option.el === "object") this.#el = option.el;
            else this.#el = document.querySelector(option.el);

            this.#el.classList.add("hjs-context-menu")

            while(this.#el?.firstChild){
                this.#el.removeChild(this.#el?.lastChild);
            }

            this.#data = option.data;
            this.#rows = new Map();
             
            this.#init();
        }
    }     

    /**
     * 내부 함수
     */

    #init = () => {
        for(let idx=0;idx<this.#data.length;idx++){
            let rowGroupEl = document.createElement("div");
            rowGroupEl.classList.add("hjs-context-menu-row-group")

            for(let idx2=0;idx2<this.#data[idx].length;idx2++){
                let newRow = this.#createContextMenu(this.#data[idx],idx2)
                
                rowGroupEl.append(newRow)
            }
            this.#el.append(rowGroupEl)
        }
    }
    
    #createContextMenu = (datas,idx) => {
        let data = datas[idx]
        this.#rows.set(idx,new Map())
        
        let cmRowEl = document.createElement("div");
        cmRowEl.classList.add("hjs-context-menu-row")

        if(data.customRenderer !== undefined && data.customRenderer !== null){
            let customRenderer = data.customRenderer();
            this.#rows.get(idx).set("customRenderer",customRenderer)
            cmRowEl.append(customRenderer);
        }else{
            let cmLabelDiv = document.createElement("div");
            cmLabelDiv.classList.add("hjs-context-menu-label-div")
                
            let cmLabel = document.createElement("label");
            cmLabel.innerText = data.title??""
            cmLabel.classList.add("hjs-context-menu-label");

            cmLabelDiv.append(cmLabel)
            
            if(!!data.events)
            for(let [key,event] of Object.entries(data.events)){
                cmRowEl.addEventListener(key,e=>{
                    e.stopPropagation();
                    event(e);
                })
            }
            
            cmRowEl.append(cmLabelDiv)
            
            if(!!data.childs){
                let cmHasChildsEl = document.createElement("div"); 
                cmHasChildsEl.classList.add("hjs-context-menu-has-child")
                cmRowEl.append(cmHasChildsEl)

                let cmChildEl = document.createElement("div"); 
                cmChildEl.style.display = "none";
                cmChildEl.classList.add("hjs-context-menu-child")
                cmRowEl.append(cmChildEl)
                this.#rows.get(idx).set("childs",new HjsContextMenu({
                    el : cmChildEl,
                    data : data.childs,
                    childNum : ++this.#option.childNum
                }))

                cmRowEl.addEventListener("mouseenter",(e)=>{
                    cmChildEl.style.display = "flex";
                    let deInfo = document.documentElement.getBoundingClientRect()
                    let rowInfo = cmRowEl.getBoundingClientRect()
                    let childInfo = cmChildEl.getBoundingClientRect()
                    
                    if(deInfo.width<childInfo.x+childInfo.width) { 
                        if(rowInfo.x-childInfo.width<0){
                            cmChildEl.style.left = "calc(-100% + " + Math.abs(rowInfo.x-childInfo.width) + "px)"
                        }else
                            cmChildEl.style.left = "-100%"
                    }
                    
                    cmChildEl.style.zIndex = this.#option.childNum
                })

                cmRowEl.addEventListener("mouseleave",(e)=>{
                    cmChildEl.style.display = "none";
                })
            }                    
        }

        this.#rows.get(idx).set("rowEl",cmRowEl)
        
        
        return cmRowEl;
    }

    getRow = (idx) => {
        return this.#rows.get(idx)
    }
}
