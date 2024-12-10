class HjsCombobox{
    
    constructor(option){    
        this.option = option;
    
        let seqArr = [0]
    
        document.querySelectorAll(".hjs-combobox").forEach(el=>
            seqArr.push(Number(el.getAttribute("seq")))
        )
        
        this.sequence = Math.max(...seqArr)+1;
    
        this.#init();
    }

    #init = () => {
        this.el = document.createElement("div")
        this.codeColumn = this.option?.code??"CODE";
        this.nameColumn = this.option?.codeName??"NAME";
        this.data = this.option?.data;
        this.initMsg = this.option?.initMsg??"";
        this.allFlag = this.option?.allFlag;
        this.event = this.option?.event;
        this.inputEvent = this.option?.inputEvent;
        this.codeId = this.option?.codeId??"";
        this.nameId = this.option?.nameId??"";
        this.multiCombo = this.option?.multiCombo??false;
        this.readonly = this.option?.readonly??true;
        this.alwaysDisplay = this.option?.alwaysDisplay??false;
        this.allCheck = this.option?.allCheck??false;
    
        this.el.classList.add("hjs-combobox");
        this.el.setAttribute("seq",this.sequence)
    
        let nameInput = document.createElement("input");
        nameInput.setAttribute("type","text")
        nameInput.placeholder = this.initMsg;
        if(this.readonly) nameInput.setAttribute("readonly","true");
        nameInput.setAttribute("autocomplete",'new-password')
        nameInput.classList.add("hjs-combobox-name")
    
        if(this.alwaysDisplay === false)
        nameInput.addEventListener('click',e=>{
            this.el.querySelector(".hjs-combobox-check-all-div").removeAttribute("style")
        })
    
        if(!!this.nameId){
            nameInput.setAttribute("id",this.nameId)
            nameInput.setAttribute("name",this.nameId)
        }
    
        if(this.alwaysDisplay === false)
        this.el.addEventListener('mouseleave',e=>{
            setTimeout(()=>{
                let elRect = this.el.getBoundingClientRect()
                if(!(e.clientX>elRect.x && e.clientX < elRect.x+elRect.width
                && e.clientY>elRect.y && e.clientY < elRect.y+elRect.height)){
                    this.el.querySelector(".hjs-combobox-check-all-div").style.display = "none";
                    for(let idx=0;idx<this.optionDiv.children.length;idx++){
                        let childTarget = this.optionDiv.children[idx];
                        childTarget.style.display = "flex"
                    }
                }
            },200)
        })
    
        this.nameInput = nameInput;
    
        if(!this.readonly){
            this.nameInput.addEventListener('input',e=>{
                
                let firstVisibleIdx;
    
                for(let idx=0;idx<this.optionDiv.children.length;idx++){
                    let childTarget = this.optionDiv.children[idx];
                    if(this.#createFuzzyMatcher(this.nameInput.value).test(childTarget.querySelector("label").innerText)){
                        childTarget.style.display = "flex"
                    }else{
                        childTarget.style.display = "none"
                    }
                }
    
                this.el.querySelector(".hjs-combobox-check-all-div").removeAttribute("style");
            })
    
            this.nameInput.addEventListener('focus',e=>{
                this.nameInput.value = "";
            })
    
            this.nameInput.addEventListener('focusout',e=>{
                this.nameInput.value = this.getNameValue(true);
                this.codeInput.value = this.getValue(true);
            })
        }
    
        
    
        if(!!this.inputEvent){
            for(let [key,evt] of Object.entries(this.inputEvent)){
                this.nameInput.addEventListener(key,e=>{
                    evt(e);
                })
            }
        }
    
        let codeInput = document.createElement("input");
        codeInput.setAttribute("type","text")
        codeInput.setAttribute("style","display:none");
        codeInput.classList.add("hjs-combobox-code")
    
        if(!!this.codeId){
            codeInput.setAttribute("id",this.codeId)
            codeInput.setAttribute("name",this.codeId)
        }
    
        this.codeInput = codeInput;
    
        this.el.append(this.nameInput);    
        this.el.append(this.codeInput);  
    
        let checkAllDiv = document.createElement("div");
        checkAllDiv.classList.add("hjs-combobox-check-all-div")
        if(this.alwaysDisplay === false)
        checkAllDiv.setAttribute("style","display:none")
        this.el.append(checkAllDiv)
    
        if(this.allFlag && this.multiCombo) {
            this.el.querySelector(".hjs-combobox-check-all-div").append(this.#createOption("","전체선택",this.event,-1))
        }
    
        this.checkAllDiv = checkAllDiv
    
        let optionDiv = document.createElement("div")
        optionDiv.classList.add("hjs-combobox-check-div")
    
        this.optionDiv = optionDiv;
    
        this.el.querySelector(".hjs-combobox-check-all-div").append(optionDiv)
        
        for(let idx=0;idx<this.data?.length??0;idx++){
            this.el.querySelector(".hjs-combobox-check-all-div").querySelector(".hjs-combobox-check-div").append(this.#createOption(this.data[idx][this.codeColumn],this.data[idx][this.nameColumn],this.event,idx))
        }
        
        if(this.allCheck === true) checkAllDiv.querySelectorAll("input[type='checkbox']").forEach(el=>el.checked=true)
    }
    
    #createOption = (code,name,func,idx) => {
        let option = document.createElement("div");
        option.classList.add("hjs-combobox-option")
        option.setAttribute("seq",idx);
        
        let checkbox = document.createElement("input");
        if(this.multiCombo) checkbox.setAttribute("type","checkbox")
        else checkbox.setAttribute("type","radio")
        checkbox.name = "multiComboCheck_"+this.sequence
        checkbox.id = "multiComboCheck_"+this.sequence+"_"+idx
        checkbox.value = ""+code+"";
        checkbox.classList.add("hjs-combobox-check")
    
        if(idx === -1){
            checkbox.addEventListener('change',e=>{
                this.el.querySelectorAll("input[type='checkbox']").forEach(el=>{
                    if(el.closest(".hjs-combobox-option").style.display !== "none") el.checked = e.target.checked
                })
    
                this.nameInput.value = this.getNameValue(true);
                this.codeInput.value = this.getValue(true);
                
                this.el.querySelectorAll(".hjs-combobox-option").forEach(el=>{
                    if(e.target.checked) el.classList.add("select");
                    else el.classList.remove("select");
                })
            })
        }else{
            checkbox.addEventListener('change',e=>{
                this.nameInput.value = this.getNameValue(true);
                this.codeInput.value = this.getValue(true);
    
                if(this.multiCombo){
                    if(e.target.checked) e.target.closest(".hjs-combobox-option").classList.add("select")
                    else e.target.closest(".hjs-combobox-option").classList.remove("select")
    
                    if(this.allFlag){
                        e.target.closest(".hjs-combobox-check-all-div").querySelector("[seq='-1'] input[type='checkbox']").checked = (e.target.closest(".hjs-combobox-check-div").querySelectorAll(".select").length === e.target.closest(".hjs-combobox-check-div").querySelectorAll(".hjs-combobox-option").length)
                    }                        
                }else{
                    this.el.querySelectorAll(".select").forEach(el=>{
                        el.classList.remove("select")
                    })
            
                    e.target.closest(".hjs-combobox-option").classList.add("select")
                }
    
                this.el.querySelector("[seq='-1'] input[type='checkbox']").checked = this.el.querySelectorAll(".hjs-combobox-check-div input[type='checkbox']:checked,.hjs-combobox-check-div input[type='radio']:checked").length === this.data.length;
            });
        }
    
        
        if(!!func){
            for(let [key,evt] of Object.entries(func)){
                checkbox.addEventListener(key,e=>{
                    evt(e);
                });
            }
        }
        
        let checkboxLabel = document.createElement("label");
        checkboxLabel.setAttribute("for","multiComboCheck_"+this.sequence+"_"+idx);
        checkboxLabel.innerText = name;
        checkboxLabel.classList.add("hjs-combobox-label")
        
        option.append(checkbox,checkboxLabel);
    
        return option
    }
    
    getNameValue = (str=false) => {
        let valArr = new Array();
        
        this.el.querySelectorAll(".hjs-combobox-check-div input[type='checkbox'],.hjs-combobox-check-div input[type='radio']").forEach(el=>{
            if(el.checked){
                valArr.push(el.nextSibling.innerText)
            }
        })
    
        if(str) return valArr.join(",");
        else return valArr;
    }
    
    getValue = (str=false) => {
        let valArr = new Array();
        
        this.el.querySelectorAll(".hjs-combobox-check-div input[type='checkbox'],.hjs-combobox-check-div input[type='radio']").forEach(el=>{
            if(el.checked){
                valArr.push(el.value)
            }
        })
    
        if(str) return valArr.join(",");
        else return valArr;
    }
    
    getUncheckedValue = (str=false) => {
        let valArr = new Array();
        
        this.el.querySelectorAll(".hjs-combobox-check-div input[type='checkbox'],.hjs-combobox-check-div input[type='radio']").forEach(el=>{
            if(!el.checked){
                valArr.push(el.value)
            }
        })
    
        if(str) return valArr.join(",");
        else return valArr;
    }
    
    setValue = (value,nFlag=true) => {
        let valArr;
    
        if(typeof value == "string") valArr = value.split(",")
        else valArr = value;
        
        this.el.querySelectorAll(".hjs-combobox-check-div input[type='checkbox'],.hjs-combobox-check-div input[type='radio']").forEach(el=>{
            el.checked = valArr.includes(el.value)
        })
    
        this.codeInput.value = value;
        if(nFlag) this.setNameInput()
    
        this.el.querySelector("[seq='-1'] input[type='checkbox']").checked = this.el.querySelectorAll(".hjs-combobox-check-div input[type='checkbox']:checked,.hjs-combobox-check-div input[type='radio']:checked").length === this.data.length;
    }
    
    setNameInput = () => {
        this.nameInput.value = this.getNameValue();
    }
    
    selectValue = (value) => {
        for(let idx=0;idx<this.data.length;idx++){
            if(this.data[idx][this.codeColumn] == value){
                if(this.multiCombo){
                    this.el.querySelector(".hjs-combobox-check-div [seq='"+idx+"']").classList.add("select")
                    this.el.querySelector(".hjs-combobox-check-div [seq='"+idx+"'] input[type='checkbox']").checked = true;
                }else{
                    this.el.querySelectorAll(".hjs-combobox-check-div .select").forEach(el=>{
                        el.classList.remove("select");
                        el.querySelector("input[type='radio']").checked = false;
                    })
    
                    this.el.querySelector(".hjs-combobox-check-div [seq='"+idx+"']").classList.add("select");
    
                    this.el.querySelector(".hjs-combobox-check-div [seq='"+idx+"'] input[type='radio']").checked = true;
                }
                
                this.nameInput.value = this.getNameValue(true);
                this.codeInput.value = this.getValue(true);
    
                return;
            }
        }
    }
    
    checkAll = (value,nFlag=true) => {
        this.el.querySelector("[seq='-1'] input[type='checkbox']").checked = true;
        this.data.forEach(value=>this.selectValue(value[this.codeColumn]))
    }
    
    #ch2pattern = (ch) => {
        const offset = 44032; /* '가'의 코드 */
        // 한국어 음절
        if (/[가-힣]/.test(ch)) {
            const chCode = ch.charCodeAt(0) - offset;
            // 종성이 있으면 문자 그대로를 찾는다.
            if (chCode % 28 > 0) {
            return ch;
            }
            const begin = Math.floor(chCode / 28) * 28 + offset;
            const end = begin + 27;
            return `[\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
        }
        // 한글 자음
        if (/[ㄱ-ㅎ]/.test(ch)) {
            const con2syl = {
                'ㄱ': '가'.charCodeAt(0),
                'ㄲ': '까'.charCodeAt(0),
                'ㄴ': '나'.charCodeAt(0),
                'ㄷ': '다'.charCodeAt(0),
                'ㄸ': '따'.charCodeAt(0),
                'ㄹ': '라'.charCodeAt(0),
                'ㅁ': '마'.charCodeAt(0),
                'ㅂ': '바'.charCodeAt(0),
                'ㅃ': '빠'.charCodeAt(0),
                'ㅅ': '사'.charCodeAt(0),
            };
            const begin = con2syl[ch] || ( ( ch.charCodeAt(0) - 12613 /* 'ㅅ'의 코드 */ ) * 588 + con2syl['ㅅ'] );
            const end = begin + 587;
            return `[${ch}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
        }
        // 그 외엔 그대로 내보냄
        // escapeRegExp는 lodash에서 가져옴
        return ch;
    }
    
    #createFuzzyMatcher = (input) => {
        const pattern = input.split('').map(this.#ch2pattern).join('.*?');
        return new RegExp(pattern);
    }
}

