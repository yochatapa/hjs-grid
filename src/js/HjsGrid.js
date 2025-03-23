var HjsGridArray = [];

window.addEventListener("resize", e => {
    console.log(e)
    HjsGridArray.forEach(grid=>{
        grid.deleteElWidth();
        grid.deleteElHeight();
        grid.el.get("middle").style.width = "0px";
    })

    setTimeout(()=>{
        HjsGridArray.forEach(grid=>{
            grid.reRenderGrid({
                resize : true
            });
        })
    },4)
})

class HjsGrid {
    #option; #columns; #grid; #utils; #data; #header; #summary; #cell; #row; #columnsOption; #style; #left;
  
    constructor(option) {
        if(!this.#isUN(option)) {
            this.#option = new Map(Object.entries(option));
            
            this.#init();
        }
    }

    /**
     * 내부 함수
     */

    #init = () => {
        this.#setOption();
        this.#setLayout();

        HjsGridArray.push(this)
        
        this.#renderGrid();
    }

    #setOption = () => {
        /**
         * this.el
         */
        if(this.#isUN(this.#option.get("el"))){
            console.error("No target element!");
            return;
        }

        this.el = new Map();
        
        if(typeof this.#option.get("el") === "string"){
            this.el.set("grid", document.querySelector(this.#option.get("el")))
        }else 
        this.el.set("grid", this.#option.get("el"));

        this.el.get("grid").classList.add("hjs-grid");

        this.el.get("grid").addEventListener("contextmenu", e => {
            e.preventDefault();
        })

        this.#setNativeEvent(this.el.get("grid"),"wheel",this.#gridElementWheel,null,{passive:false})

        /**
         * this.#left
         */

         if(!this.#isUN(this.#option.get("left")))
            this.#left = new Map(Object.entries(this.#deepCopy(this.#option.get("left"))));
        else this.#left = new Map();

        /**
         * this.#columns
         */

        if(this.#isUN(this.#option.get("columns"))){
            console.error("No columns info!");
            return;
        }

        this.#columns = this.#deepCopy(this.#option.get("columns"))

        this.#setColumnsOption();

        /**
         * this.#style
         */

         /*if(this.#isUN(this.#option.get("style"))){
            //default style
            this.#style = {
                header : {
                    border : {
                        vertical : {
                            width : 1,
                            style : "solid",
                            color : "black"
                        },
                        horizontal : {
                            width : 2,
                            style : "solid",
                            color : "black"
                        }
                    }
                }
            }
            return;
        }else{
            this.#style = this.#deepCopy(this.#option.get("style"))
        }*/

        

        /**
         * this.#grid
         */

        
        if(!this.#isUN(this.#option.get("grid")))
            this.#grid = new Map(Object.entries(this.#deepCopy(this.#option.get("grid"))));
        else this.#grid = new Map();

        /**
         * this.#cell
         */

        
        if(!this.#isUN(this.#option.get("body").cell))
            this.#cell = new Map(Object.entries(this.#deepCopy(this.#option.get("body").cell)));
        else this.#cell = new Map();

        /**
         * this.#row
         */
        
        if(!this.#isUN(this.#option.get("body").row))
            this.#row = new Map(Object.entries(this.#deepCopy(this.#option.get("body").row)));
        else this.#row = new Map();


        /**
         * this.#utils
         */

        this.#utils = new Map();

        this.#utils.set("lang","ko");

        this.#utils.set("el", new Map());
        
        this.#utils.set("undoNumber",0);
        this.#utils.set("redoArray",new Array())
        this.#utils.set("undoArray",new Array())
        this.#utils.set("maxId",0)
        this.#utils.set("scroll",new Map())
        this.#utils.set("sortInfo",new Map());
        this.#utils.get("sortInfo").set("sortOrder",new Array())
        this.#utils.get("sortInfo").set("sortType",new Map())

        this.#utils.set("filterInfo",new Map());
        this.#utils.get("filterInfo").set("filterOrder",new Array())
        this.#utils.get("filterInfo").set("filterCurrentIndex",-1)
        //this.#utils.set("nodePaddingNum",2)

        this.#utils.get("scroll").set("displayedRow",new Map());
        this.#utils.get("scroll").set("displayedLeftRow",new Map());
        this.#utils.get("scroll").set("displayedColumn",new Map());
        this.#utils.get("scroll").set("displayedLeftColumn",new Map());
        this.#utils.get("scroll").set("passedRowCount",0)   //PASSED_ROW_COUNT
        this.#utils.get("scroll").set("passedColCount",0)   //PASSED_COL_COUNT

        this.#utils.set("verticalThumbInfo",new Map())
        this.#utils.get("verticalThumbInfo").set("clientY",0)
        this.#utils.get("verticalThumbInfo").set("passedRowCount",0)

        this.#utils.set("horizontalThumbInfo",new Map())
        this.#utils.get("horizontalThumbInfo").set("clientX",0)
        this.#utils.get("horizontalThumbInfo").set("passedColCount",0)

        this.#utils.get("scroll").set("touchInfo",new Map())
        this.#utils.get("scroll").get("touchInfo").set("pageX",0)
        this.#utils.get("scroll").get("touchInfo").set("pageY",0)
        this.#utils.get("scroll").get("touchInfo").set("startRowIndex",0)
        this.#utils.get("scroll").get("touchInfo").set("startColIndex",0)
        this.#utils.get("scroll").get("touchInfo").set("startDate",new Date())
        this.#utils.get("scroll").get("touchInfo").set("touchScrollFlag",false)

        this.#utils.set("checkedRow",new Map());

        this.#utils.set("select",new Map());
        this.#utils.get("select").set("bodySelectArray",new Array());
        this.#utils.get("select").set("leftBodySelectArray",new Array());
        this.#utils.get("select").set("leftBodySelectYn",false);

        this.#utils.set("current",new Map());
        this.#utils.get("current").set("firstClick",false);
        this.#utils.get("current").set("leftFirstClick",false);

        this.#utils.set("editor",new Map());
        this.#utils.get("editor").set("setValueFlag",true);
        /**
         * this.#data (this.orgData,this.fullData,this.showData)
         */

        this.#data = new Map();
        this.#data.set("orgData",new Array());
        this.#data.set("fullData",new Array());
        this.#data.set("showData",new Array());         // 실제 보여줄 데이터
        this.#data.set("showOrgData",new Array());  // showData의 데이터처리

        /**
         * this.#header
         */
        if(!this.#isUN(this.#option.get("header"))){
            this.#header = new Map(Object.entries(this.#deepCopy(this.#option.get("header"))));

            if(!this.#header.has("row")){
                this.#header.set("row",1)
            }
        }
        else{
            this.#header = new Map();

            if(!this.#header.has("row")){
                this.#header.set("row",1)
            }
        }

        if(!this.#header.has("height")) this.#header.set("height",42);

        if(this.#header.has("mergeInfo")){
            this.#header.set("orgMergeInfo",this.#deepCopy(this.#header.get("mergeInfo")))
        }

        //this.#header.set("row",)

        /**
         * this.#summary
         */
        if(!this.#isUN(this.#option.get("summary")))
            this.#summary = new Map(Object.entries(this.#deepCopy(this.#option.get("summary"))));
        else this.#summary = new Map();
    }

    #setColumnsOption = () => {
        this.#columnsOption = new Map();
        this.#columnsOption.set("columnName",new Map());
        this.#columnsOption.set("visibleColumnName",new Map());
        this.#columnsOption.set("visibleNextColumnIndex",new Map());
        this.#columnsOption.set("visiblePrevColumnIndex",new Map());
        this.#columnsOption.set("fixedColumnRealIndex",new Map());
        this.#columnsOption.set("bodyColumnRealIndex",new Map());
        this.#columnsOption.set("visibleColIndex",new Map());
        this.#columnsOption.set("visibleRealColIndex",new Map());
        this.#columnsOption.set("leftRealColIndex",new Map());
        
        let widthSum = 0;
        let columnWidth = new Array();
        let columnBeforeSum = new Array();
        let columnAfterSum = new Array();
        let leftWidthSum = 0;
        let leftColumnWidth = new Array();
        let leftColumnBeforeSum = new Array();
        let leftColumnAfterSum = new Array();
        let visibleNextColumnIndex, visiblePrevColumnIndex;
        let visibleCnt = 0;
        let fixedCnt = 0;
        let bodyCnt = 0;
        let lastVisibleColumn = 0;

        for(let colIdx=this.#columns.length-1;colIdx>=0;colIdx--){
            let colInfo = this.#columns[colIdx]
            
            columnAfterSum.push(widthSum)

            if(colInfo.hidden !== true && colInfo.fixed !== true) widthSum += colInfo.width??100;
            else if(colInfo.hidden !== true && colInfo.fixed === true){
                leftWidthSum += colInfo.width??100;
                leftColumnAfterSum.push(leftWidthSum)
            }

            this.#columnsOption.get("visibleNextColumnIndex").set(colIdx,visibleNextColumnIndex);

            if(colInfo.hidden !== true && colInfo.fixed !== true) visibleNextColumnIndex = colIdx;
        }               

        widthSum = 0;
        leftWidthSum = 0;
        let leftIdx = 0;

        for(let colIdx=0;colIdx<this.#columns.length;colIdx++){
            let colInfo = this.#columns[colIdx]
            let colName = colInfo.name??"COLUMN_"+colIdx;

            if(colInfo.fixed === true){
                this.#columnsOption.get("fixedColumnRealIndex").set(fixedCnt,colIdx);
                fixedCnt++;
            }

            if(this.#isUN(colInfo.name)) this.#columns[colIdx].name = "COLUMN_"+colIdx;

            if(colInfo.hidden !== true ) this.#columnsOption.get("visibleColumnName").set(colName,visibleCnt)

            if(colInfo.hidden !== true && colInfo.fixed !== true) this.#columnsOption.get("visibleRealColIndex").set(visibleCnt,colIdx);

            if(colInfo.hidden !== true && colInfo.fixed !== true) this.#columnsOption.get("visibleColIndex").set(colIdx,visibleCnt);

            if(colInfo.hidden !== true && colInfo.fixed !== true) visibleCnt++;

            if(colInfo.hidden !== true) lastVisibleColumn = colIdx;

            if(colInfo.fixed === true){
                this.#columnsOption.get("leftRealColIndex").set(leftIdx,colIdx);
                leftIdx++;
            }

            if(colInfo.hidden !== true && colInfo.fixed !== true){
                this.#columnsOption.get("bodyColumnRealIndex").set(bodyCnt,colIdx);
                bodyCnt++;
            }

            this.#columnsOption.get("columnName").set(colName,colIdx)

            let colWidth = colInfo.width??100;

            if(this.#isUN(colInfo.width)) this.#columns[colIdx].width = 100;

            columnBeforeSum.push(widthSum)

            if(colInfo.hidden !== true  && colInfo.fixed !== true){
                widthSum += colWidth;
            }else if(colInfo.hidden !== true && colInfo.fixed === true){
                leftColumnBeforeSum.push(leftWidthSum)
                leftWidthSum += colWidth;
                leftColumnWidth.push(leftWidthSum)
            }

            columnWidth.push(colWidth)

            this.#columnsOption.get("visiblePrevColumnIndex").set(colIdx,visiblePrevColumnIndex);

            if(colInfo.hidden !== true  && colInfo.fixed !== true) visiblePrevColumnIndex = colIdx;
        }
        
        this.#columnsOption.set("lastVisibleColumn",lastVisibleColumn);
        this.#columnsOption.set("visibleColumnCount",visibleCnt);
        this.#columnsOption.set("columnsTotalWidth",widthSum);

        this.#columnsOption.set("columnWidth",columnWidth);           // 내 컬럼 width
        this.#columnsOption.set("columnBeforeSum",columnBeforeSum);   //나보다 앞에 width 합
        this.#columnsOption.set("columnAfterSum",columnAfterSum);   //나보다 뒤에 width 합

        this.#columnsOption.set("leftColumnWidth",leftColumnWidth);           // 내 컬럼 width
        this.#columnsOption.set("leftColumnBeforeSum",leftColumnBeforeSum);   //나보다 앞에 width 합
        this.#columnsOption.set("leftColumnAfterSum",leftColumnAfterSum);   //나보다 뒤에 width 합
    }

    #setLayout = () => {
        let mainEl = document.createElement("div");
        mainEl.classList.add("hjs-grid-main");
        this.el.set("main",mainEl);

        let containerEl = document.createElement("div");
        containerEl.classList.add("hjs-grid-container");
        
        this.el.set("container",containerEl);

        this.el.get("main").append(containerEl)

        this.el.get("grid").append(mainEl)

        this.#setLeftLayout();
        this.#setMiddleLayout();
        this.#setRightLayout();
        this.#setScrollBarLayout();
    }

    #setScrollBarLayout(){
        this.el.set("scroll",new Map());
        this.el.get("scroll").set("vertical",new Map());
        this.el.get("scroll").set("horizontal",new Map());

        let verticalEl = document.createElement("div");
        verticalEl.classList.add("hjs-grid-vertical-scroll-bar");
        verticalEl.style.display = "none";

        this.el.get("scroll").get("vertical").set("scrollBar",verticalEl);

        let verticalTopButton = document.createElement("div");
        verticalTopButton.classList.add("hjs-grid-vertical-scroll-bar-top-button");

        this.#setNativeEvent(verticalTopButton,"mousedown",this.#verticalTopButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"mouseup",this.#verticalTopButtonMouseUp);
        this.#setNativeEvent(verticalTopButton,"touchstart",this.#verticalTopButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"touchend",this.#verticalTopButtonMouseUp);

        this.el.get("scroll").get("vertical").set("topButton",verticalTopButton);

        verticalEl.append(verticalTopButton);

        let verticalTrack = document.createElement("div");
        verticalTrack.classList.add("hjs-grid-vertical-scroll-bar-track");
        //verticalTrack.style.padding = "4px";

        this.#setNativeEvent(verticalTrack,"mousedown",this.#verticalTrackMouseDown);
        this.#setNativeEvent(document.documentElement,"mouseup",this.#verticalTrackMouseUp);
        this.#setNativeEvent(verticalTrack,"touchstart",this.#verticalTrackMouseDown);
        this.#setNativeEvent(document.documentElement,"touchend",this.#verticalTrackMouseUp);
        this.#setNativeEvent(document.documentElement,"touchcancel",this.#verticalTrackMouseUp);

        this.el.get("scroll").get("vertical").set("track",verticalTrack);

        verticalEl.append(verticalTrack);

        let verticalThumb = document.createElement("div");
        verticalThumb.classList.add("hjs-grid-vertical-scroll-bar-thumb");

        this.el.get("scroll").get("vertical").set("thumb",verticalThumb);

        this.#setNativeEvent(verticalThumb,"mousedown",this.#verticalThumbMouseDown)
        this.#setNativeEvent(verticalThumb,"touchstart",this.#verticalThumbMouseDown)

        verticalTrack.append(verticalThumb);

        let verticalBottomButton = document.createElement("div");
        verticalBottomButton.classList.add("hjs-grid-vertical-scroll-bar-bottom-button");

        this.#setNativeEvent(verticalBottomButton,"mousedown",this.#verticalBottomButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"mouseup",this.#verticalBottomButtonMouseUp);
        this.#setNativeEvent(verticalBottomButton,"touchstart",this.#verticalBottomButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"touchend",this.#verticalBottomButtonMouseUp);

        this.el.get("scroll").get("vertical").set("bottomButton",verticalBottomButton);

        verticalEl.append(verticalBottomButton);

        this.el.get("grid").append(verticalEl);

        let verticalScrollBarPadding = Number(this.el.get("scroll").get("vertical").get("track").style.padding.replace("px",""));
        
        this.el.get("scroll").get("vertical").set("scrollBarPadding",verticalScrollBarPadding);

        /*
            horizontal
        */

        let horizontalEl = document.createElement("div");
        horizontalEl.classList.add("hjs-grid-horizontal-scroll-bar");
        horizontalEl.style.display = "none";

        this.el.get("scroll").get("horizontal").set("scrollBar",horizontalEl);

        let horizontalLeftButton = document.createElement("div");
        horizontalLeftButton.classList.add("hjs-grid-horizontal-scroll-bar-left-button");

        this.el.get("scroll").get("horizontal").set("leftButton",horizontalLeftButton);

        this.#setNativeEvent(horizontalLeftButton,"mousedown",this.#horizontalLeftButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"mouseup",this.#horizontalLeftButtonMouseUp);
        this.#setNativeEvent(horizontalLeftButton,"touchstart",this.#horizontalLeftButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"touchend",this.#horizontalLeftButtonMouseUp);

        horizontalEl.append(horizontalLeftButton);

        let horizontalTrack = document.createElement("div");
        horizontalTrack.classList.add("hjs-grid-horizontal-scroll-bar-track");
        //horizontalTrack.style.padding = "4px";

        this.#setNativeEvent(horizontalTrack,"mousedown",this.#horizontalTrackMouseDown);
        this.#setNativeEvent(document.documentElement,"mouseup",this.#horizontalTrackMouseUp);
        this.#setNativeEvent(horizontalTrack,"touchstart",this.#horizontalTrackMouseDown);
        this.#setNativeEvent(document.documentElement,"touchend",this.#horizontalTrackMouseUp);
        this.#setNativeEvent(document.documentElement,"touchcancel",this.#horizontalTrackMouseUp);

        this.el.get("scroll").get("horizontal").set("track",horizontalTrack);

        horizontalEl.append(horizontalTrack);

        let horizontalThumb = document.createElement("div");
        horizontalThumb.classList.add("hjs-grid-horizontal-scroll-bar-thumb");

        this.el.get("scroll").get("horizontal").set("thumb",horizontalThumb);

        this.#setNativeEvent(horizontalThumb,"mousedown",this.#horizontalThumbMouseDown)
        this.#setNativeEvent(horizontalThumb,"touchstart",this.#horizontalThumbMouseDown)

        horizontalTrack.append(horizontalThumb);

        let horizontalRightButton = document.createElement("div");
        horizontalRightButton.classList.add("hjs-grid-horizontal-scroll-bar-right-button");

        this.#setNativeEvent(horizontalRightButton,"mousedown",this.#horizontalRightButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"mouseup",this.#horizontalRightButtonMouseUp);
        this.#setNativeEvent(horizontalRightButton,"touchstart",this.#horizontalRightButtonMouseDown);
        this.#setNativeEvent(document.documentElement,"touchend",this.#horizontalRightButtonMouseUp);

        this.el.get("scroll").get("horizontal").set("rightButton",horizontalRightButton);

        horizontalEl.append(horizontalRightButton);
        
        this.el.get("main").append(horizontalEl);

        this.#setNativeEvent(document.documentElement,"mousemove",this.#documentElementMouseMove,null,{passive:false})
        this.#setNativeEvent(document.documentElement,"touchmove",this.#documentElementMouseMove,null,{passive:false})

        this.#setNativeEvent(document.documentElement,"mouseup",this.#documentElementMouseUp,null,{passive:false})
        this.#setNativeEvent(document.documentElement,"touchend",this.#documentElementMouseUp,null,{passive:false})

        let horizontalScrollBarPadding = Number(this.el.get("scroll").get("horizontal").get("track").style.padding.replace("px",""));
        
        this.el.get("scroll").get("horizontal").set("scrollBarPadding",horizontalScrollBarPadding);
    }

    #setLeftLayout = () => {
        let leftEl = document.createElement("div");
        leftEl.classList.add("hjs-grid-left");

        this.el.set("left",leftEl);
        
        this.el.get("container").append(leftEl);

        this.#setLeftHeaderLayout();
        this.#setLeftBodyLayout();
        this.#setLeftFooterLayout();
    }

    #setLeftHeaderLayout = () => {
        let headerEl = document.createElement("div");
        headerEl.classList.add("hjs-grid-left-header");

        this.el.set("leftHeader",headerEl);

        /**
         * left body table
         */

         let headerTableEl = document.createElement("table");
         headerTableEl.classList.add("hjs-grid-left-header-table");

        this.el.set("leftHeaderTable",headerTableEl);

        this.el.get("leftHeader").append(headerTableEl);

        let headerTableTbodyEl = document.createElement("tbody");
        headerTableTbodyEl.classList.add("hjs-grid-left-header-table-tbody");

        this.el.set("leftHeaderTableTbody",headerTableTbodyEl);

        this.el.get("leftHeaderTable").append(headerTableTbodyEl);
        
        this.el.get("left").append(headerEl);
    }

    #setLeftBodyLayout = () => {
        /**
         * left body
         */
        
        let bodyEl = document.createElement("div");
        bodyEl.classList.add("hjs-grid-left-body");

        this.#setNativeEvent(bodyEl,"touchstart",this.#gridLeftCellMouseDown,null,{passive:false})
        this.#setNativeEvent(bodyEl,"mousedown",this.#gridLeftCellMouseDown,null,{passive:false})
        this.#setNativeEvent(bodyEl,"touchmove",this.#gridLeftCellMouseMove)
        this.#setNativeEvent(bodyEl,"mousemove",this.#gridLeftCellMouseMove)

        this.el.set("leftBody",bodyEl);
        
        this.el.get("left").append(bodyEl);

        /**
         * left body select
         */
        
        let selectEl = document.createElement("div");
        selectEl.classList.add("hjs-grid-left-body-select");

        this.el.set("leftBodySelect",selectEl);

        this.el.get("leftBody").append(selectEl);

        let selectCurrentEl = document.createElement("div");

        this.el.set("leftBodySelectCurrent",selectCurrentEl);

        this.el.get("leftBody").append(selectCurrentEl);

        let selectTouchEl = document.createElement("div");

        selectTouchEl.style.position = "absolute"

        this.el.set("leftBodySelectTouchEl",selectTouchEl);

        this.el.get("leftBody").append(selectTouchEl);

        this.#setNativeEvent(document.documentElement,"mouseup",this.#gridLeftCellMouseUp,null,{passive:false})
        this.#setNativeEvent(document.documentElement,"touchend",this.#gridLeftCellMouseUp,null,{passive:false})

        /**
         * left body contextmenu
         */

        let cmEl = document.createElement("div");
        cmEl.classList.add("hjs-grid-left-body-context-menu");

        this.el.set("leftBodyContextMenu",cmEl);
        this.el.get("grid").append(cmEl);
        //this.el.get("leftBodySelectCurrent").append(cmEl);

        /**
         * left body table
         */

        let bodyTableEl = document.createElement("table");
        bodyTableEl.classList.add("hjs-grid-left-body-table");

        this.el.set("leftBodyTable",bodyTableEl);

        this.el.get("leftBody").append(bodyTableEl);

        let bodyTableTbodyEl = document.createElement("tbody");
        bodyTableTbodyEl.classList.add("hjs-grid-left-body-table-tbody");

        this.el.set("leftBodyTableTbody",bodyTableTbodyEl);

        this.#setNativeEvent(this.el.get("leftBody"),"touchstart",this.#gridElementTouchStart,["left"],{passive:false})

        this.el.get("leftBodyTable").append(bodyTableTbodyEl);
    }

    #setLeftFooterLayout = () => {
        let footerEl = document.createElement("div");
        footerEl.classList.add("hjs-grid-left-footer");

        this.el.set("leftFooter",footerEl);
        
        this.el.get("left").append(footerEl);
    }
    
    #setMiddleLayout = () => {
        let middleEl = document.createElement("div");
        middleEl.classList.add("hjs-grid-middle");

        this.el.set("middle",middleEl);
        
        this.el.get("container").append(middleEl);

        this.#setMiddleHeaderLayout();
        this.#setMiddleBodyLayout();
        this.#setMiddleFooterLayout();
    }

    #setMiddleHeaderLayout = () => {
        let headerEl = document.createElement("div");
        headerEl.classList.add("hjs-grid-middle-header");

        this.el.set("middleHeader",headerEl);

        /**
         * middle body table
         */

         let headerTableEl = document.createElement("table");
         headerTableEl.classList.add("hjs-grid-middle-header-table");

        this.el.set("middleHeaderTable",headerTableEl);

        this.el.get("middleHeader").append(headerTableEl);

        let headerTableTbodyEl = document.createElement("tbody");
        headerTableTbodyEl.classList.add("hjs-grid-middle-header-table-tbody");

        this.el.set("middleHeaderTableTbody",headerTableTbodyEl);

        this.el.get("middleHeaderTable").append(headerTableTbodyEl);
        
        this.el.get("middle").append(headerEl);
    }

    #setMiddleBodyLayout = () => {
        /**
         * middle body
         */
        
        let bodyEl = document.createElement("div");
        bodyEl.classList.add("hjs-grid-middle-body");

        this.el.set("middleBody",bodyEl);
        
        this.el.get("middle").append(bodyEl);

        this.#setNativeEvent(bodyEl,"touchstart",this.#gridCellMouseDown,null,{passive:false})
        this.#setNativeEvent(bodyEl,"mousedown",this.#gridCellMouseDown,null,{passive:false})
        this.#setNativeEvent(bodyEl,"touchmove",this.#gridCellMouseMove)
        this.#setNativeEvent(bodyEl,"mousemove",this.#gridCellMouseMove)

        /**
         * middle body select
         */
        
        let selectEl = document.createElement("div");
        selectEl.classList.add("hjs-grid-middle-body-select");
 
        this.el.set("middleBodySelect",selectEl);
        
        this.el.get("middleBody").append(selectEl);

        let selectCurrentEl = document.createElement("div");

        this.el.set("middleBodySelectCurrent",selectCurrentEl);
        
        this.el.get("middleBody").append(selectCurrentEl);

        this.#setNativeEvent(document.documentElement,"mouseup",this.#gridCellMouseUp,null,{passive:false})
        this.#setNativeEvent(document.documentElement,"touchend",this.#gridCellMouseUp,null,{passive:false})

        /**
         * middle body contextmenu
         */
        
         let cmEl = document.createElement("div");
         cmEl.classList.add("hjs-grid-middle-body-context-menu");

        this.el.set("middleBodyContextMenu",cmEl);
        this.el.get("grid").append(cmEl);
        //this.el.get("middleBodySelectCurrent").append(cmEl);

        /**
         * middle body table
         */

        let bodyTableEl = document.createElement("table");
        bodyTableEl.classList.add("hjs-grid-middle-body-table");

        this.el.set("middleBodyTable",bodyTableEl);

        this.el.get("middleBody").append(bodyTableEl);

        this.#setNativeEvent(this.el.get("middleBody"),"touchstart",this.#gridElementTouchStart,null,{passive:false})
        
        this.#setNativeEvent(document.documentElement,"touchmove",this.#gridElementTouchMove,null,{passive:false})
        
        this.#setNativeEvent(document.documentElement,"touchend",this.#gridElementTouchEnd,null,{passive:false})

        this.#setNativeEvent(document.documentElement,"touchcancel",this.#gridElementTouchEnd,null,{passive:false})

        let bodyTableTbodyEl = document.createElement("tbody");
        bodyTableTbodyEl.classList.add("hjs-grid-middle-body-table-tbody");

        this.el.set("middleBodyTableTbody",bodyTableTbodyEl);

        this.el.get("middleBodyTable").append(bodyTableTbodyEl);
    }

    #setMiddleFooterLayout = () => {
        let footerEl = document.createElement("div");
        footerEl.classList.add("hjs-grid-middle-footer");

        this.el.set("middleFooter",footerEl);
        
        this.el.get("middle").append(footerEl);
    }

    #setRightLayout = () => {
        let rightEl = document.createElement("div");
        rightEl.classList.add("hjs-grid-right");

        this.el.set("right",rightEl);
        
        this.el.get("container").append(rightEl);
    }

    #reRenderGrid = (option) => {
        if(this.#header.size > 0){
            const HEADER_ROW = this.#header.get("row");

            for(let idx=0;idx<HEADER_ROW;idx++){
                for(let [key,value] of this.#utils.get("scroll").get("displayedHeaderColumn").get(idx)){
                    value.remove();
                    this.#utils.get("scroll").get("displayedHeaderColumn").get(idx).delete(key);
                }
            }

            for(let [key,value] of this.#utils.get("scroll").get("displayedHeaderColumn").get("first")){
                value.remove();
                this.#utils.get("scroll").get("displayedHeaderColumn").get("first").delete(key);
            }
        }

        if(this.#utils.get("scroll").get("elHeight") > 0){
            /**
             *  전체 삭제 후
             */
            
            for(let [key,value] of this.#utils.get("scroll").get("displayedRow")){
                if(this.#utils.get("select").get("target")?.closest("tr") === value) value.style.display = "none";
                else value.remove();
                this.#utils.get("scroll").get("displayedRow").delete(key);
            }
            
            for(let [key,value] of this.#utils.get("scroll").get("displayedColumn")){
                if(key === "first"){
                    for(let [key2,value2] of this.#utils.get("scroll").get("displayedColumn").get("first")){
                        if(this.#utils.get("select").get("target")?.closest("td") === value2) value2.style.display = "none";
                        else value2.remove();
                    }
                }
                this.#utils.get("scroll").get("displayedColumn").delete(key);
            }
        }

        for(let [key,value] of this.#utils.get("scroll").get("displayedLeftRow")){
            if(this.#utils.get("select").get("target")?.closest("tr") === value) value.style.display = "none";
                else value.remove();
            this.#utils.get("scroll").get("displayedLeftRow").delete(key);
        }
        
        for(let [key,value] of this.#utils.get("scroll").get("displayedLeftColumn")){
            if(key === "first"){
                for(let [key2,value2] of this.#utils.get("scroll").get("displayedLeftColumn").get("first")){
                    if(this.#utils.get("select").get("target")?.closest("td") === value2) value2.style.display = "none";
                        else value2.remove();
                }
            }
            this.#utils.get("scroll").get("displayedLeftColumn").delete(key);
        }
        
        this.el.set("checkbox",new Map())

        this.#renderGrid(option);
    }

    #renderGrid = (option) => {        
        this.#removeChildAll(this.el.get("leftHeaderTableTbody"));
        this.#renderLeftHeader();
        //this.el.get("middle").style.width = "calc(100% - "+this.el.get("left").getBoundingClientRect().width+"px)"
        this.#renderMiddle(option); 
        this.#renderLeftSummary();
        this.#renderLeftBody();
        this.#renderRight();   
        if(option?.selectYn !== false){
            this.#renderLeftBodySelect(this.#utils.get("select").get("leftBodySelectArray"));
            this.#renderBodySelect(this.#utils.get("select").get("bodySelectArray"));
        }  
    }

    #renderLeftHeader = () => {
        const HEADER_ROW = this.#header.get("row");

        this.el.get("leftHeaderTableTbody").append(this.#createLeftHeaderRow("first"));
        for(let idx=0;idx<HEADER_ROW;idx++){
            this.el.get("leftHeaderTableTbody").append(this.#createLeftHeaderRow(idx));
        }
    }

    #createLeftHeaderRow = (rowIdx) => {
        let checkboxFlag = !this.#isUN(this.#left.get("checkbox"));
        let rowNumberFlag = !this.#isUN(this.#left.get("rowNumber"));
        let rowStatusFlag = !this.#isUN(this.#left.get("rowStatus"));

        let orderArray = this.#isUN(this.#left.get("order"))?["checkbox","rowNumber","rowStatus"]:this.#left.get("order");

        let trEl = document.createElement("tr")
        trEl.classList.add("hjs-grid-left-header-table-tbody-tr");

        if(rowIdx === "first") trEl.style.height = "0px";
        else trEl.style.height = this.#header.get("height") + "px";

        trEl.append(this.#createLeftHeaderCell(rowIdx,"first"))

        if(rowIdx === 0 || rowIdx === "first"){
            for(let idx=0;idx<orderArray.length;idx++){
                if(orderArray[idx] === "checkbox" && checkboxFlag === true) trEl.append(this.#createLeftHeaderCheckbox(rowIdx));
                if(orderArray[idx] === "rowNumber" && rowNumberFlag === true) trEl.append(this.#createLeftHeaderRowNumber(rowIdx));
                if(orderArray[idx] === "rowStatus" && rowStatusFlag === true) trEl.append(this.#createLeftHeaderRowStatus(rowIdx));
            }

            let fixedColumns = this.#getFixedColumns()
            for(let idx=0;idx<fixedColumns.length;idx++){
                if(fixedColumns[idx].hidden === true) continue;
                trEl.append(this.#createLeftHeaderCell(rowIdx,idx))
            }
        }                

        return trEl
    }

    #createLeftHeaderCell = (rowIdx,colIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-header-table-tbody-tr-td");

        if(rowIdx === "first"){
            tdEl.style.height = "0px"
        }else{
            tdEl.style.height = this.#header.get("height") + "px";
            tdEl.setAttribute("rowspan",this.#header.get("row"))
        }
        
        if(colIdx === "first"){
            tdEl.style.width = "0px"
        }else{
            let fixedColumns = this.#getFixedColumns()
            let colInfo = fixedColumns[colIdx];
            tdEl.style.width = colInfo.width + "px"
            tdEl.style.minWidth = colInfo.width + "px"
            tdEl.style.maxWidth = colInfo.width + "px"

            if(rowIdx !== "first"){
                let realColIdx = this.#getRealColumnIndexByFixedColumnIndex(colIdx);

                let divEl = document.createElement("div");
                divEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div");

                let labelEl = document.createElement("label")
                labelEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div-label");

                let verticalAlign = this.#columns[realColIdx]?.align?.header?.vertical;
                let horizontalAlign = this.#columns[realColIdx]?.align?.header?.horizontal;
                
                if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
                else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
                else divEl.style.alignItems = "center";

                if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
                else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
                else divEl.style.justifyContent = "center";

                labelEl.innerText = colInfo.title??colInfo.name

                divEl.append(labelEl);

                let sortFilter = document.createElement("div")
                
                if(colInfo.sortable === true){         
                    sortFilter.classList.add("hjs-grid-sort-filter-div");

                    let sortDiv = document.createElement("span");
                    sortDiv.classList.add("hjs-grid-sort-container")
                
                    let sortButtonDiv = document.createElement("span");
                    sortButtonDiv.classList.add("hjs-grid-sort-div")

                    let sortType = this.getSortType(realColIdx);
                    let sortOrder = this.#utils.get("sortInfo").get("sortOrder");

                    let sortAscButton = document.createElement("span");
                    sortAscButton.classList.add("hjs-grid-sort-button")
                    sortAscButton.classList.add("asc")
                    if(sortType === "ASC") sortAscButton.classList.add("active")

                    sortButtonDiv.append(sortAscButton);                        

                    let sortDescButton = document.createElement("span");
                    sortDescButton.classList.add("hjs-grid-sort-button")
                    sortDescButton.classList.add("desc")
                    if(sortType === "DESC") sortDescButton.classList.add("active")

                    sortButtonDiv.append(sortDescButton);

                    sortDiv.append(sortButtonDiv)

                    let sortNumberLabel = document.createElement("span");
                    sortNumberLabel.classList.add("hjs-grid-sort-number")
                    let indexOf = sortOrder.indexOf(this.getColumnNameByIndex(realColIdx));

                    if(indexOf !== -1) sortNumberLabel.innerText = (indexOf+1)

                    sortDiv.append(sortNumberLabel)

                    sortFilter.append(sortDiv)

                    if(rowIdx !== "first"){
                        //nameLabel.innerText = this.#isUN(title)?(this.#columns[colIdx].title??""):(title??"");
                        divEl.style.maxHeight = this.#header.get("height") - 4  + "px";
                    }

                    divEl.classList.add("hjs-grid-pointer");
                    labelEl.classList.add("hjs-grid-pointer");
                    
                    this.#setNativeEvent(labelEl,"mousedown",this.#sortEvent,[realColIdx])
                    this.#setNativeEvent(sortDiv,"mousedown",this.#sortEvent,[realColIdx])
                    this.#setNativeEvent(sortDiv,"touchend",this.#sortEvent,[realColIdx])
                }

                if(!this.#isUN(colInfo.filter) &&(colInfo.filter === true || typeof colInfo.filter === "object")){
                    let filterDiv = document.createElement("span");
                    filterDiv.classList.add("hjs-grid-filter-button")

                    if(this.#utils.get("filterInfo").get("filterOrder").filter(item=>item.column === this.#columns[realColIdx].name).length>0) filterDiv.classList.add("active")

                    sortFilter.append(filterDiv)

                    filterDiv.classList.add("hjs-grid-pointer");

                    this.#setNativeEvent(filterDiv,"mousedown",this.#filterEvent,[realColIdx])
                    this.#setNativeEvent(filterDiv,"touchend",this.#filterEvent,[realColIdx])
                }

                divEl.append(sortFilter)

                tdEl.append(divEl)
            }
            
        }
        return tdEl;
    }

    #createLeftHeaderCheckbox = (rowIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-header-table-tbody-tr-td");
        tdEl.classList.add("hjs-grid-left-header-checkbox-all");

        tdEl.style.width = (this.#left.get("checkbox").width??42) + "px";
        tdEl.style.minWidth = (this.#left.get("checkbox").width??42) + "px";
        tdEl.style.maxWidth = (this.#left.get("checkbox").width??42) + "px";

        if(rowIdx === "first"){
            tdEl.style.height = "0px"
        }else{
            tdEl.style.height = this.#header.get("height") + "px";
            tdEl.style.maxHeight = this.#header.get("height") + "px";
            tdEl.setAttribute("rowspan",this.#header.get("row"))
        }                

        if(this.#left.get("checkbox").headerCheckbox !== false && rowIdx === 0){
            let divEl = document.createElement("div");
            divEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div");

            let chkEl = document.createElement("input")
            chkEl.type = "checkbox";
            chkEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div-checkbox");
            
            this.el.set("checkboxAll",chkEl)
            
            this.el.get("checkboxAll").checked = (this.#utils.get("checkedRow").keys().toArray().length === this.#data.get("showData").length) 
            
            this.#setNativeEvent(chkEl,"click",this.#leftCheckboxClickAll)
            
            divEl.append(chkEl);

            let verticalAlign = this.#left.get("checkbox")?.align?.header?.vertical;
            let horizontalAlign = this.#left.get("checkbox")?.align?.header?.horizontal;
            
            if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
            else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
            else divEl.style.alignItems = "center";

            if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
            else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
            else divEl.style.justifyContent = "center";

            if(rowIdx !== "first"){
                //nameLabel.innerText = this.#isUN(title)?(this.#columns[colIdx].title??""):(title??"");
                divEl.style.maxHeight = this.#header.get("height") - 4  + "px";
            }
        
            
            if(!this.#isUN(this.#left.get("checkbox").title)){
                let labelEl = document.createElement("label");
                labelEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div-label");
        
                labelEl.innerText = this.#left.get("checkbox").title??""
                
                divEl.append(labelEl);
            }
                
            

            tdEl.append(divEl)
        }                
        return tdEl;
    }

    #createLeftHeaderRowNumber = (rowIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-header-table-tbody-tr-td");
        tdEl.classList.add("hjs-grid-left-header-rownum");

        tdEl.style.width = (this.#left.get("rowNumber").width??50) + "px";
        tdEl.style.minWidth = (this.#left.get("rowNumber").width??50) + "px";
        tdEl.style.maxWidth = (this.#left.get("rowNumber").width??50) + "px";

        if(rowIdx === "first"){

            tdEl.style.height = "0px"
        }else{
            tdEl.style.height = this.#header.get("height") + "px";
            tdEl.style.maxHeight = this.#header.get("height") + "px";
            tdEl.setAttribute("rowspan",this.#header.get("row"))
        }   
        
        if(rowIdx === "first") return tdEl;
        
        let divEl = document.createElement("div");
        divEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div");

        let verticalAlign = this.#left.get("rowNumber")?.align?.header?.vertical;
        let horizontalAlign = this.#left.get("rowNumber")?.align?.header?.horizontal;
        
        if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
        else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
        else divEl.style.alignItems = "center";

        if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
        else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
        else divEl.style.justifyContent = "center";

        if(rowIdx !== "first"){
            //nameLabel.innerText = this.#isUN(title)?(this.#columns[colIdx].title??""):(title??"");
            divEl.style.maxHeight = this.#header.get("height") - 4  + "px";
        }
        
        let labelEl = document.createElement("label");
        labelEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div-label");
        
        labelEl.innerText = this.#left.get("rowNumber").title??this.#getMessage("hd001")
        divEl.append(labelEl)
        
        tdEl.append(divEl)
        
        return tdEl;
    }

    #createLeftHeaderRowStatus = (rowIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-header-table-tbody-tr-td");
        tdEl.classList.add("hjs-grid-left-header-row-status");

        tdEl.style.width = (this.#left.get("rowStatus").width??50) + "px";
        tdEl.style.minWidth = (this.#left.get("rowStatus").width??50) + "px";
        tdEl.style.maxWidth = (this.#left.get("rowStatus").width??50) + "px";

        if(rowIdx === "first"){

            tdEl.style.height = "0px"
        }else{
            tdEl.style.height = this.#header.get("height") + "px";
            tdEl.style.maxHeight = this.#header.get("height") + "px";
            tdEl.setAttribute("rowspan",this.#header.get("row"))
        }   
        
        if(rowIdx === "first") return tdEl;
        
        let divEl = document.createElement("div");
        divEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div");

        let verticalAlign = this.#left.get("rowStatus")?.align?.header?.vertical;
        let horizontalAlign = this.#left.get("rowStatus")?.align?.header?.horizontal;
        
        if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
        else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
        else divEl.style.alignItems = "center";

        if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
        else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
        else divEl.style.justifyContent = "center";

        if(rowIdx !== "first"){
            //nameLabel.innerText = this.#isUN(title)?(this.#columns[colIdx].title??""):(title??"");
            divEl.style.maxHeight = this.#header.get("height") - 4  + "px";
        }
        
        let labelEl = document.createElement("label");
        labelEl.classList.add("hjs-grid-left-header-table-tbody-tr-td-div-label");
        
        labelEl.innerText = this.#left.get("rowStatus").title??this.#getMessage("hd002")
        
        divEl.append(labelEl)
        
        tdEl.append(divEl)
        
        return tdEl;
    }

    #renderLeftBody = () => {
        let START_INDEX = this.#utils.get("scroll").get("passedRowCount")
        const END_INDEX = Math.min(this.#utils.get("scroll").get("passedRowCount") + this.#utils.get("scroll").get("visibleRowCount"),this.#data.get("showData").length)
        const LAST_FLAG = (END_INDEX === this.#data.get("showData").length,START_INDEX === this.#utils.get("scroll").get("scrollRowCount"))
        if(LAST_FLAG) START_INDEX = Math.max(START_INDEX-1,0);
        
        if(!this.el.has("checkbox")) this.el.set("checkbox",new Map())
        
        for(let idx=START_INDEX;idx<END_INDEX;idx++){
            if(!this.#utils.get("scroll").get("displayedLeftRow").has(idx)){
                
                const NEW_ROW = this.#createLeftRow(idx)
                
                if(this.#utils.get("scroll").get("displayedLeftRow").size === 0){
                    this.el.get("leftBodyTableTbody").insertAdjacentElement("afterbegin",NEW_ROW);
                }else{
                    const KEY_ARRAY = this.#utils.get("scroll").get("displayedLeftRow").keys().toArray();
                    const MIN_KEY = Math.min(...KEY_ARRAY);
                    const MAX_KEY = Math.max(...KEY_ARRAY);
                    
                    if(idx<=MIN_KEY){
                        this.el.get("leftBodyTableTbody").insertAdjacentElement("afterbegin",NEW_ROW);
                    }else if(idx>MAX_KEY){
                        this.el.get("leftBodyTableTbody").insertAdjacentElement("beforeend",NEW_ROW);
                    }else{
                        const SORT_KEY_ARRAY = KEY_ARRAY.sort((a, b) => a - b);
                        
                        let targetIdx;

                        for(let idx2=0;idx2<SORT_KEY_ARRAY.length;idx2++){
                            if(SORT_KEY_ARRAY[idx2] >= idx) break;
                            targetIdx = SORT_KEY_ARRAY[idx2];
                        }
                        
                        if(this.#isUN(targetIdx)){
                            this.el.get("leftBodyTableTbody").insertAdjacentElement("afterbegin",NEW_ROW);
                        }else
                        this.#utils.get("scroll").get("displayedLeftRow").get(targetIdx).insertAdjacentElement("afterend",NEW_ROW)
                    }
                }
            }else{
                this.#renderLeftRow(idx);
            }
        } 

        for(let [key,value] of this.#utils.get("scroll").get("displayedLeftRow")){
            if(key < START_INDEX || key >= END_INDEX){
                if(this.#utils.get("scroll").get("touchInfo")?.get("target")?.closest("tr") === value && this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true) value.style.display = "none";
                else if(this.#utils.get("select").get("target")?.closest("tr") === value && this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true) value.style.display = "none";
                else value.remove();
                this.#utils.get("scroll").get("displayedLeftRow").delete(key);
                this.#utils.get("scroll").get("displayedLeftColumn").delete(key);
            }
        }

        if(LAST_FLAG) this.el.get("leftBody").scrollTop = this.#utils.get("scroll").get("elHeight")
        else this.el.get("leftBody").scrollTop = 0;      
    }

    #createLeftRow = (rowIdx) => {
        let trEl = document.createElement("tr");
        trEl.classList.add("hjs-grid-left-body-table-tbody-tr")

        if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "I") trEl.classList.add("hjs-grid-insert-row");
        if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "U") trEl.classList.add("hjs-grid-update-row");
        if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "D") trEl.classList.add("hjs-grid-delete-row");

        if(this.#utils.get("checkedRow").keys().toArray().includes(this.#getIdByShowDataIndex(rowIdx))) trEl.classList.add("hjs-grid-checked-row");

        this.#utils.get("scroll").get("displayedLeftRow").set(rowIdx,trEl);
        this.#utils.get("scroll").get("displayedLeftColumn").set(rowIdx,new Map());

        this.#renderLeftRow(rowIdx);

        return trEl
    }

    #renderLeftRow = (rowIdx) => {
        let checkboxFlag = !this.#isUN(this.#left.get("checkbox"));
        let rowNumberFlag = !this.#isUN(this.#left.get("rowNumber"));
        let rowStatusFlag = !this.#isUN(this.#left.get("rowStatus"));

        let orderArray = this.#isUN(this.#left.get("order"))?["checkbox","rowNumber","rowStatus"]:this.#left.get("order");

        let trEl = this.#utils.get("scroll").get("displayedLeftRow").get(rowIdx)

        const HEIGHT = this.#cell.get("height")

        trEl.style.height = HEIGHT + "px";

        for(let idx=0;idx<orderArray.length;idx++){
            if(orderArray[idx] === "checkbox" && checkboxFlag === true && !this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).has("checkbox")){
                let chkEl = this.#createLeftCheckbox(rowIdx)
                this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).set("checkbox",chkEl);
                trEl.append(chkEl);
            }
            if(orderArray[idx] === "rowNumber" && rowNumberFlag === true  && !this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).has("rowNumber")){
                let rnEl = this.#createLeftRowNumber(rowIdx)
                this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).set("rowNumber",rnEl);
                trEl.append(rnEl);
            }
            if(orderArray[idx] === "rowStatus" && rowStatusFlag === true  && !this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).has("rowStatus")){
                let rnEl = this.#createLeftRowStatus(rowIdx)
                this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).set("rowStatus",rnEl);
                trEl.append(rnEl);
            }
        }

        let fixedColumns = this.#getFixedColumns()
        for(let idx=0;idx<fixedColumns.length;idx++){
            if(fixedColumns[idx].hidden === true) continue;
            if(!this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).has(idx)){
                let cellEl = this.#createLeftCell(rowIdx,idx)
                this.#utils.get("scroll").get("displayedLeftColumn").get(rowIdx).set(idx,cellEl);
                trEl.append(cellEl)
            }
        }
    }

    #createLeftCell = (rowIdx,colIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-body-table-tbody-tr-td");

        if(rowIdx % 2 ===0) tdEl.classList.add("even-cell")
        else tdEl.classList.add("odd-cell")
        
        if(colIdx === "first"){
            tdEl.style.width = "0px"
        }else{
            let fixedColumns = this.#getFixedColumns()
            let colInfo = fixedColumns[colIdx];
            tdEl.style.width = colInfo.width + "px"
            tdEl.style.minWidth = colInfo.width + "px"
            tdEl.style.maxWidth = colInfo.width + "px"

            let HEIGHT = this.#cell.get("height");
            tdEl.style.maxHeight = HEIGHT + "px";
            tdEl.style.height = HEIGHT + "px";

            if(rowIdx !== "first"){
                let divEl = document.createElement("div");
                divEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div");

                divEl.style.maxHeight = (HEIGHT-4) + "px";

                let realColIdx = this.#getRealColumnIndexByFixedColumnIndex(colIdx);
                let labelEl = document.createElement("label")
                labelEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div-label");

                let verticalAlign = this.#columns[realColIdx]?.align?.body?.vertical;
                let horizontalAlign = this.#columns[realColIdx]?.align?.body?.horizontal;
                
                if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
                else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
                else divEl.style.alignItems = "center";

                if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
                else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
                else divEl.style.justifyContent = "center";

                let colName = colInfo.name
                labelEl.innerText = this.#getFormulaValue(rowIdx,colName);
                    
                divEl.append(labelEl);

                tdEl.append(divEl)
            }
            
        }
        return tdEl;
    }

    #createLeftCheckbox = (rowIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-body-table-tbody-tr-td");
        tdEl.classList.add("hjs-grid-left-body-checkbox-all");
        if(rowIdx % 2 ===0) tdEl.classList.add("even-cell")
        else tdEl.classList.add("odd-cell")

        
        
        tdEl.style.width = (this.#left.get("checkbox").width??42) + "px";
        tdEl.style.minWidth = (this.#left.get("checkbox").width??42) + "px";
        tdEl.style.maxWidth = (this.#left.get("checkbox").width??42) + "px";

        let HEIGHT = this.#cell.get("height");
        tdEl.style.maxHeight = HEIGHT + "px";
        tdEl.style.height = HEIGHT + "px";

        if(this.#left.get("checkbox").headerCheckbox !== false){
            let divEl = document.createElement("div");
            divEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div");

            let verticalAlign = this.#left.get("checkbox")?.align?.body?.vertical;
            let horizontalAlign = this.#left.get("checkbox")?.align?.body?.horizontal;
            
            if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
            else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
            else divEl.style.alignItems = "center";

            if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
            else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
            else divEl.style.justifyContent = "center";

            divEl.style.maxHeight = (HEIGHT-4) + "px";

            let chkEl = document.createElement("input")
            chkEl.type = "checkbox";
            
            this.el.get("checkbox").set(rowIdx,chkEl)

            if(this.#utils.get("checkedRow").keys().toArray().includes(this.#getIdByShowDataIndex(rowIdx))) chkEl.checked = true;

            this.#setNativeEvent(chkEl,"click",this.#leftCheckboxClick,[rowIdx]);

            chkEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div-checkbox");

            divEl.append(chkEl);

            tdEl.append(divEl)
        }                
        return tdEl;
    }

    #createLeftRowNumber = (rowIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-body-table-tbody-tr-td");
        tdEl.classList.add("hjs-grid-left-body-rownum");
        if(rowIdx % 2 ===0) tdEl.classList.add("even-cell")
        else tdEl.classList.add("odd-cell")

        tdEl.style.width = (this.#left.get("rowNumber").width??50) + "px";
        tdEl.style.minWidth = (this.#left.get("rowNumber").width??50) + "px";
        tdEl.style.maxWidth = (this.#left.get("rowNumber").width??50) + "px";

        let HEIGHT = this.#cell.get("height");
        tdEl.style.maxHeight = HEIGHT + "px";
        tdEl.style.height = HEIGHT + "px";
        
        if(rowIdx === "first") return tdEl;
        
        let divEl = document.createElement("div");
        divEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div");

        let verticalAlign = this.#left.get("rowNumber")?.align?.body?.vertical;
        let horizontalAlign = this.#left.get("rowNumber")?.align?.body?.horizontal;
        
        if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
        else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
        else divEl.style.alignItems = "center";

        if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
        else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
        else divEl.style.justifyContent = "center";

        divEl.style.maxHeight = (HEIGHT-4) + "px";
        
        let labelEl = document.createElement("label");
        labelEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div-label");

        let orderType = this.#left.get("rowNumber").rowNumberOrder??"ASC";

        let showLabel = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx)) + 1
        
        if(orderType === "DESC") showLabel = this.#data.get("showOrgData").length - showLabel + 1;
        
        labelEl.innerText = showLabel;
        
        divEl.append(labelEl)
        
        tdEl.append(divEl)
        
        return tdEl;
    }

    #createLeftRowStatus = (rowIdx) => {
        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-left-body-table-tbody-tr-td");
        tdEl.classList.add("hjs-grid-left-body-rownum");
        if(rowIdx % 2 ===0) tdEl.classList.add("even-cell")
        else tdEl.classList.add("odd-cell")

        tdEl.style.width = (this.#left.get("rowStatus").width??50) + "px";
        tdEl.style.minWidth = (this.#left.get("rowStatus").width??50) + "px";
        tdEl.style.maxWidth = (this.#left.get("rowStatus").width??50) + "px";

        let HEIGHT = this.#cell.get("height");
        tdEl.style.maxHeight = HEIGHT + "px";
        tdEl.style.height = HEIGHT + "px";
        
        if(rowIdx === "first") return tdEl;
        
        let divEl = document.createElement("div");
        divEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div");

        let verticalAlign = this.#left.get("rowStatus")?.align?.body?.vertical;
        let horizontalAlign = this.#left.get("rowStatus")?.align?.body?.horizontal;
        
        if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
        else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
        else divEl.style.alignItems = "center";

        if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
        else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
        else divEl.style.justifyContent = "center";

        divEl.style.maxHeight = (HEIGHT-4) + "px";
        
        let labelEl = document.createElement("label");
        labelEl.classList.add("hjs-grid-left-body-table-tbody-tr-td-div-label");

        let iudflag = this.#data.get("showData")?.[rowIdx]?.["IUDFLAG"]??"";

        if(iudflag === "I"){
            if(!this.#isUN(this.#left.get("rowStatus")?.insert?.label)) iudflag = this.#left.get("rowStatus")?.insert?.label
        }else if(iudflag === "U"){
            if(!this.#isUN(this.#left.get("rowStatus")?.update?.label)) iudflag = this.#left.get("rowStatus")?.update?.label
        }else if(iudflag === "D"){
            if(!this.#isUN(this.#left.get("rowStatus")?.delete?.label)) iudflag = this.#left.get("rowStatus")?.delete?.label
        }
        
        labelEl.innerText = iudflag
        
        divEl.append(labelEl)
        
        tdEl.append(divEl)
        
        return tdEl;
    }

    #renderLeftSummary = () => {
        
    }

    #renderMiddle = (option) => {
        if(this.#columnsOption.get("columnsTotalWidth")>this.el.get("middleBody").getBoundingClientRect().width) this.el.get("scroll").get("horizontal").get("scrollBar").style.display = "flex";
        else this.el.get("scroll").get("horizontal").get("scrollBar").style.display = "none";

        const ROW_HEIGHT = this.#cell.get("height");
        const DATA_LENGTH = this.#data.get("showData").length;

        const WIDTH_FLAG = this.#isUN(this.#utils.get("scroll").get("elWidth")) || option?.resize === true;
        const HEIGHT_FLAG = this.#isUN(this.#utils.get("scroll").get("elHeight")) || option?.resize === true;
        
        if(ROW_HEIGHT*DATA_LENGTH > this.el.get("middleBody").getBoundingClientRect().height) this.el.get("scroll").get("vertical").get("scrollBar").style.display = "flex";
        else this.el.get("scroll").get("vertical").get("scrollBar").style.display = "none";
        
        if(WIDTH_FLAG){
            this.el.get("middle").style.width = this.el.get("middleBody").getBoundingClientRect().width + "px";
            this.#utils.get("scroll").set("elWidth",this.el.get("middleBody").getBoundingClientRect().width)
        }

        this.#renderHorizontalScrollBar();

        if(this.#header.size > 0){
            this.#removeChildAll(this.el.get("middleHeaderTableTbody"));
            this.#utils.get("scroll").set("displayedHeaderRow",new Map());
            this.#utils.get("scroll").set("displayedHeaderColumn",new Map())

            const HEADER_ROW = this.#header.get("row");

            this.el.get("middleHeaderTableTbody").append(this.#createHeaderRow("first"))
            
            for(let idx=0;idx<HEADER_ROW;idx++){
                const NEW_HEADER_ROW = this.#createHeaderRow(idx);
                this.el.get("middleHeaderTableTbody").append(NEW_HEADER_ROW)
            }
            this.#renderHeader();
        }
        
        if(this.#summary.size > 0){
            this.#renderSummary();
        }

        if(HEIGHT_FLAG) if(this.el.get("middleBody").getBoundingClientRect().height > this.#cell.get("height")) this.#utils.get("scroll").set("elHeight",this.el.get("middleBody").getBoundingClientRect().height)

        this.#renderVerticalScrollBar();

        if(this.#utils.get("scroll").get("elHeight") > 0) this.#renderBody();

        if(WIDTH_FLAG) this.#utils.get("scroll").set("elWidth",this.el.get("middleBody").getBoundingClientRect().width)
        if(HEIGHT_FLAG) if(this.el.get("middleBody").getBoundingClientRect().height > this.#cell.get("height")) this.#utils.get("scroll").set("elHeight",this.el.get("middleBody").getBoundingClientRect().height)
    }

    #renderRight = () => {

    }

    #renderHeader = () => {
        const HEADER_ROW = this.#header.get("row");

        this.#renderHeaderRow("first");
        for(let idx=0;idx<HEADER_ROW;idx++){
            this.#renderHeaderRow(idx);
        }
    }

    #renderVerticalScrollBar = () => {
        const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
        const CELL_HEIGHT = this.#cell.get("height");
        const ROW_COUNT = this.#data.get("showData").length;

        //this.el.get("scroll").get("vertical").get("scrollBar").style.paddingTop = (this.#header.get("row")??0) * (this.#header.get("height")??0) + "px"
        
        const VISIBLE_ROW_COUNT = Math.min(Math.ceil(EL_HEIGHT/CELL_HEIGHT),ROW_COUNT);

        this.#utils.get("scroll").set("visibleRowCount",VISIBLE_ROW_COUNT)

        const SCROLL_ROW_COUNT = ROW_COUNT - VISIBLE_ROW_COUNT + 1;

        this.#utils.get("scroll").set("scrollRowCount",SCROLL_ROW_COUNT)

        const SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding");
        const V_TRACK_HEIGHT = this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().height;

        // 너무 작으면 grab 할 수 없어서 최소 픽셀 10
        const V_THUMB_HEIGHT = Math.max(EL_HEIGHT / (ROW_COUNT * CELL_HEIGHT) * (V_TRACK_HEIGHT - (SCROLL_BAR_PADDING * 2)),10);
        const V_WHITE_SPACE = (V_TRACK_HEIGHT - (SCROLL_BAR_PADDING * 2)) - V_THUMB_HEIGHT; 
        const V_ONE_SCROLL = V_WHITE_SPACE / SCROLL_ROW_COUNT; 

        const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")

        const SCROLL_TOP = V_SCROLL_BAR_PADDING + this.#utils.get("scroll").get("passedRowCount") * V_ONE_SCROLL

        this.#utils.get("scroll").set("vThumbHeight",V_THUMB_HEIGHT)
        this.#utils.get("scroll").set("vOneScroll",V_ONE_SCROLL)

        if(this.#utils.get("scroll").get("passedRowCount") === 0) this.el.get("scroll").get("vertical").get("topButton").classList.remove("active")
        else this.el.get("scroll").get("vertical").get("topButton").classList.add("active")

        if(this.#utils.get("scroll").get("passedRowCount") === SCROLL_ROW_COUNT) this.el.get("scroll").get("vertical").get("bottomButton").classList.remove("active")
        else this.el.get("scroll").get("vertical").get("bottomButton").classList.add("active")

        this.el.get("scroll").get("vertical").get("thumb").style.top = SCROLL_TOP + "px"
        this.el.get("scroll").get("vertical").get("thumb").style.height = V_THUMB_HEIGHT + "px";
    }

    #renderHorizontalScrollBar = () => {
        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        const COL_COUNT = this.#columnsOption.get("visibleColumnCount");
        const TOTAL_COL_WIDTH = this.#columnsOption.get("columnsTotalWidth");

        const SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")
        const H_TRACK_WIDTH = this.el.get("scroll").get("horizontal").get("track").getBoundingClientRect().width;
        
        const VISIBLE_COL_COUNT = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[this.#utils.get("scroll").get("passedColCount")] + EL_WIDTH}).length - this.#utils.get("scroll").get("passedColCount")

        this.#utils.get("scroll").set("visibleColCount",VISIBLE_COL_COUNT)

        let cas = this.#columnsOption.get("columnAfterSum").filter(value=>{return value < EL_WIDTH})

        const SCROLL_COL_COUNT = COL_COUNT - cas.filter((el, index) => cas.indexOf(el) === index).length + 1;

        this.#utils.get("scroll").set("scrollColCount",SCROLL_COL_COUNT)

        // 너무 작으면 grab 할 수 없어서 최소 픽셀 10
        const H_THUMB_WIDTH = Math.max(EL_WIDTH / TOTAL_COL_WIDTH * (H_TRACK_WIDTH - (SCROLL_BAR_PADDING * 2)),10);
        const H_WHITE_SPACE = (H_TRACK_WIDTH - (SCROLL_BAR_PADDING * 2)) - H_THUMB_WIDTH; 
        const H_ONE_SCROLL = H_WHITE_SPACE / SCROLL_COL_COUNT; 
        
        const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")

        this.#utils.get("scroll").set("hThumbWidth",H_THUMB_WIDTH)
        this.#utils.get("scroll").set("hOneScroll",H_ONE_SCROLL)

        const SCROLL_LEFT = H_SCROLL_BAR_PADDING + this.#utils.get("scroll").get("passedColCount") * H_ONE_SCROLL

        if(this.#utils.get("scroll").get("passedColCount") === 0) this.el.get("scroll").get("horizontal").get("leftButton").classList.remove("active")
        else this.el.get("scroll").get("horizontal").get("leftButton").classList.add("active")

        if(this.#utils.get("scroll").get("passedColCount") === SCROLL_COL_COUNT) this.el.get("scroll").get("horizontal").get("rightButton").classList.remove("active")
        else this.el.get("scroll").get("horizontal").get("rightButton").classList.add("active")

        this.el.get("scroll").get("horizontal").get("thumb").style.left = SCROLL_LEFT + "px";
        this.el.get("scroll").get("horizontal").get("thumb").style.width = H_THUMB_WIDTH + "px";
    }

    #renderBody = () => {                
        let START_INDEX = this.#utils.get("scroll").get("passedRowCount") 
        const END_INDEX = Math.min(this.#utils.get("scroll").get("passedRowCount") + this.#utils.get("scroll").get("visibleRowCount"),this.#data.get("showData").length)
        const LAST_FLAG = (END_INDEX === this.#data.get("showData").length && START_INDEX === this.#utils.get("scroll").get("scrollRowCount"))
        if(LAST_FLAG) START_INDEX = Math.max(START_INDEX-1,0);
        
        for(let idx=START_INDEX;idx<END_INDEX;idx++){
            if(!this.#utils.get("scroll").get("displayedRow").has(idx)){
                
                const NEW_ROW = this.#createRow(idx)
                
                if(this.#utils.get("scroll").get("displayedRow").size === 0){
                    this.el.get("middleBodyTableTbody").insertAdjacentElement("afterbegin",NEW_ROW);
                }else{
                    const KEY_ARRAY = this.#utils.get("scroll").get("displayedRow").keys().toArray();
                    const MIN_KEY = Math.min(...KEY_ARRAY);
                    const MAX_KEY = Math.max(...KEY_ARRAY);
                    
                    if(idx<=MIN_KEY){
                        this.el.get("middleBodyTableTbody").insertAdjacentElement("afterbegin",NEW_ROW);
                    }else if(idx>MAX_KEY){
                        this.el.get("middleBodyTableTbody").insertAdjacentElement("beforeend",NEW_ROW);
                    }else{
                        const SORT_KEY_ARRAY = KEY_ARRAY.sort((a, b) => a - b);
                        
                        let targetIdx;

                        for(let idx2=0;idx2<SORT_KEY_ARRAY.length;idx2++){
                            if(SORT_KEY_ARRAY[idx2] >= idx) break;
                            targetIdx = SORT_KEY_ARRAY[idx2];
                        }
                        
                        if(this.#isUN(targetIdx)){
                            this.el.get("middleBodyTableTbody").insertAdjacentElement("afterbegin",NEW_ROW);
                        }else
                        this.#utils.get("scroll").get("displayedRow").get(targetIdx).insertAdjacentElement("afterend",NEW_ROW)
                    }
                }
            }else{
                this.#renderRow(idx);
            }
        } 

        for(let [key,value] of this.#utils.get("scroll").get("displayedRow")){
            if(key < START_INDEX || key >= END_INDEX){
                if(this.#utils.get("scroll").get("touchInfo")?.get("target")?.closest("tr") === value && this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true) value.style.display = "none";
                else if(this.#utils.get("select").get("target")?.closest("tr") === value && this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true) value.style.display = "none";
                else value.remove();
                this.#utils.get("scroll").get("displayedRow").delete(key);
                this.#utils.get("scroll").get("displayedColumn").delete(key);
            }
        }

        if(LAST_FLAG) this.el.get("middleBody").scrollTop = this.#utils.get("scroll").get("elHeight")
        else this.el.get("middleBody").scrollTop = 0;
    }

    #renderSummary = () => {
        
    }            

    #createHeaderRow = rowIdx => {
        let trEl = document.createElement("tr");
        trEl.classList.add("hjs-grid-middle-header-table-tbody-tr")

        
        let firstTd = document.createElement("td");
        if(rowIdx === "first") firstTd.style.height = "0px";
        else firstTd.style.height = this.#header.get("height") + "px";
        trEl.append(firstTd); 

        if(rowIdx === "first") trEl.style.height = "0px";
        else trEl.style.height = this.#header.get("height") + "px";

        this.#utils.get("scroll").get("displayedHeaderRow").set(rowIdx,trEl);
        this.#utils.get("scroll").get("displayedHeaderColumn").set(rowIdx,new Map());
        this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).set("first",firstTd);

        this.#renderHeaderRow(rowIdx);

        return trEl
    }

    #renderHeaderRow = rowIdx => {    
        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_INDEX, END_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        /*const COL_TOTAL_COUNT = this.#columnsOption.get("lastVisibleColumn");

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  

        START_INDEX = this.#utils.get("scroll").get("passedColCount");
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0);
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);*/

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  

        START_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0);
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);

        //console.log("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ")
        //console.log(START_INDEX,END_INDEX)

        const ORG_START_INDEX = START_INDEX;
        const ORG_END_INDEX = END_INDEX;

        if(!this.#isUN(this.#header.get("mergeInfo"))){
            let tempStartIdx = START_INDEX;
            let tempEndIdx = END_INDEX;

            for(let colIdx=tempStartIdx;colIdx<=tempEndIdx;colIdx++){
                for(let ridx=0;ridx<this.#header.get("row");ridx++){
                    let multipleInfo = this.#getMultipleHeaderCellInfo(ridx,colIdx);
                    if(!this.#isUN(multipleInfo)){ 
                        START_INDEX = Math.min(START_INDEX,(multipleInfo.START_COL_INDEX??START_INDEX))
                        END_INDEX = Math.max(END_INDEX,(multipleInfo.END_COL_INDEX??END_INDEX))
                    }
                }
            }

            START_WIDTH = 0;
            SHOW_WIDTH = 0;
            TOTAL_WIDTH = 0;

            START_WIDTH = beforeSum[START_INDEX];
            TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
            SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];
        }
        
        /*let LAST_FLAG = (END_INDEX === this.#columnsOption.get("lastVisibleColumn") && START_INDEX === this.#utils.get("scroll").get("scrollColCount"))

        if(LAST_FLAG) START_INDEX = Math.max(START_INDEX-1,0)*/

        let LAST_FLAG = (END_INDEX === COL_TOTAL_COUNT && this.#columnsOption.get("visibleColIndex").get(START_INDEX) === this.#utils.get("scroll").get("scrollColCount"))

        if(LAST_FLAG) START_INDEX = this.#columnsOption.get("visiblePrevColumnIndex").get(START_INDEX)??0

        //console.log(START_INDEX,END_INDEX,ORG_END_INDEX)
        
        for(let colIdx=START_INDEX;colIdx<END_INDEX;colIdx++){
            if(this.#columns[colIdx].hidden === true || this.#columns[colIdx].fixed === true) continue;
            
            if(!this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).get(colIdx)){
                let rowspan, colspan, title;
                
                let multipleInfo = this.#getMultipleHeaderCellInfo(rowIdx,colIdx);
                
                if(!this.#isUN(multipleInfo)){
                    let tempColIdx = (this.#columns[multipleInfo.START_COL_INDEX].hidden === true || this.#columns[multipleInfo.START_COL_INDEX].fixed === true)?this.#columnsOption.get("visibleNextColumnIndex").get(multipleInfo.START_COL_INDEX):multipleInfo.START_COL_INDEX
                    if(rowIdx >= multipleInfo.START_ROW_INDEX && rowIdx <= multipleInfo.END_ROW_INDEX
                        && colIdx >= multipleInfo.START_COL_INDEX && colIdx <= multipleInfo.END_COL_INDEX
                        && !this.#isUN(this.#utils.get("scroll").get("displayedHeaderColumn")?.get(multipleInfo.START_ROW_INDEX)?.get(tempColIdx))) 
                        continue;

                    rowspan = Math.min(multipleInfo.END_ROW_INDEX - multipleInfo.START_ROW_INDEX + 1,this.#header.get("row"));
                    colspan = Math.min(END_INDEX-START_INDEX+1, this.#columns.filter((value,key) => key >= multipleInfo.START_COL_INDEX && key<=multipleInfo.END_COL_INDEX && value.hidden !== true && value.fixed !== true).length)
                    title = multipleInfo.TITLE
                }else{
                    let cnt = 0;
                    for(let idx=rowIdx+1;idx<this.#header.get("row");idx++){
                        let multiInfo2 = this.#getMultipleHeaderCellInfo(idx,colIdx)
                        if(this.#isUN(multiInfo2)){
                            cnt++;
                        }else break;
                    }
                    
                    if(cnt>0){
                        //alert(this.getColumnNameByIndex(colIdx)+"/"+cnt)
                        let tempMergeInfo = this.#header.get("mergeInfo");
                        if(this.#isUN(tempMergeInfo)) tempMergeInfo = new Array();
                        tempMergeInfo.push({
                            startColumn : this.getColumnNameByIndex(colIdx),
                            endColumn   : this.getColumnNameByIndex(colIdx),
                            startRow    : rowIdx,
                            rowspan     : cnt + 1,
                            title       : this.#columns[colIdx].title
                        })
                        this.#header.set("mergeInfo",tempMergeInfo)
                        rowspan = cnt+1
                    }
                }
                
                //console.log(START_INDEX,END_INDEX,"/",rowIdx,colIdx)
                const NEW_CELL = this.#createHeaderCell(rowIdx,colIdx,rowspan,colspan,title);

                if(this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).size === 1){
                    this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).get("first").insertAdjacentElement("afterend",NEW_CELL);
                }else{
                    const KEY_ARRAY = this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).keys().toArray().filter(value => {return value !== "first"});
                    const MIN_KEY = Math.min(...KEY_ARRAY);
                    const MAX_KEY = Math.max(...KEY_ARRAY);
                    
                    if(colIdx<=MIN_KEY){
                        this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).get("first").insertAdjacentElement("afterend",NEW_CELL);
                    }else if(colIdx>MAX_KEY){
                        this.#utils.get("scroll").get("displayedHeaderRow").get(rowIdx).insertAdjacentElement("beforeend",NEW_CELL);
                    }else{
                        const SORT_KEY_ARRAY = KEY_ARRAY.sort((a, b) => a - b);
                        
                        let targetIdx;

                        for(let idx2=0;idx2<SORT_KEY_ARRAY.length;idx2++){
                            if(SORT_KEY_ARRAY[idx2] >= colIdx) break;
                            targetIdx = SORT_KEY_ARRAY[idx2];
                        }
                        
                        if(this.#isUN(targetIdx)){
                            this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).get("first").insertAdjacentElement("afterend",NEW_CELL);
                        }else{
                            this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).get(targetIdx).insertAdjacentElement("afterend",NEW_CELL)    
                        }
                    }
                }

                this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).set(colIdx,NEW_CELL);
            }
        }
        
        for(let [key,value] of this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx)){
            if(key < START_INDEX || key > END_INDEX){
                if(!this.#isUN(value)) value.remove();
                this.#utils.get("scroll").get("displayedHeaderColumn").get(rowIdx).delete(key);
            }
        }

        this.el.get("middleHeader").scrollLeft = this.#columnsOption.get("columnBeforeSum")[ORG_START_INDEX] - this.#columnsOption.get("columnBeforeSum")[START_INDEX]

        if(LAST_FLAG){
            this.el.get("middleHeader").scrollLeft = EL_WIDTH
        }

        this.#utils.get("scroll").set("scrollLeftHeader",this.el.get("middleHeader").scrollLeft);
    }

    #createRow = rowIdx => {
        let trEl = document.createElement("tr");
        trEl.classList.add("hjs-grid-middle-body-table-tbody-tr");

        const HEIGHT = this.#cell.get("height")

        trEl.style.height = HEIGHT + "px";
        trEl.style.minHeight = HEIGHT + "px";

        if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "I") trEl.classList.add("hjs-grid-insert-row");
        if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "U") trEl.classList.add("hjs-grid-update-row");
        if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "D") trEl.classList.add("hjs-grid-delete-row");
        if(this.#utils.get("checkedRow").keys().toArray().includes(this.#getIdByShowDataIndex(rowIdx))) trEl.classList.add("hjs-grid-checked-row");

        this.#utils.get("scroll").get("displayedRow").set(rowIdx,trEl);
        this.#utils.get("scroll").get("displayedColumn").set(rowIdx,new Map());

        this.#renderRow(rowIdx);

        return trEl
    }

    #renderRow = (rowIdx) => {
        const displayedColumnIdx = this.#utils.get("scroll").get("displayedColumn").get(rowIdx);
        const ROW_ELEMENT = rowIdx === "first"?this.el.get("middleBodyTableTbodyFirstRow"):this.#utils.get("scroll").get("displayedRow").get(rowIdx)

        const SCROLL_LEFT = this.el.get("middleBody").scrollLeft??0;

        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_INDEX, END_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  

        START_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0)??0;
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);

        let LAST_FLAG = (END_INDEX === COL_TOTAL_COUNT && this.#columnsOption.get("visibleColIndex").get(START_INDEX) === this.#utils.get("scroll").get("scrollColCount"))
        
        if(LAST_FLAG) START_INDEX = this.#columnsOption.get("visiblePrevColumnIndex").get(START_INDEX)??0
        
        for(let colIdx=START_INDEX;colIdx<END_INDEX;colIdx++){
            if(this.#columns[colIdx].hidden === true  || this.#columns[colIdx].fixed === true) continue;
            const NEW_CELL = this.#createCell(rowIdx,colIdx);
            if(!displayedColumnIdx.get(colIdx)){
                if(!this.#isUN(NEW_CELL)){
                    if(displayedColumnIdx.size === 0){
                        this.#utils.get("scroll").get("displayedRow").get(rowIdx).insertAdjacentElement("afterbegin",NEW_CELL);
                    }else{
                        const KEY_ARRAY = displayedColumnIdx.keys().toArray().filter(value => {return value !== "virtualLeft" && value !== "virtualRight"});
                        const MIN_KEY = Math.min(...KEY_ARRAY);
                        const MAX_KEY = Math.max(...KEY_ARRAY);
                        
                        if(colIdx<=MIN_KEY){
                            this.#utils.get("scroll").get("displayedRow").get(rowIdx).insertAdjacentElement("afterbegin",NEW_CELL);
                        }else if(colIdx>MAX_KEY){
                            this.#utils.get("scroll").get("displayedRow").get(rowIdx).insertAdjacentElement("beforeend",NEW_CELL);
                        }else{
                            const SORT_KEY_ARRAY = KEY_ARRAY.sort((a, b) => a - b);
                            
                            let targetIdx;
    
                            for(let idx2=0;idx2<SORT_KEY_ARRAY.length;idx2++){
                                if(SORT_KEY_ARRAY[idx2] >= colIdx) break;
                                targetIdx = SORT_KEY_ARRAY[idx2];
                            }
                            
                            if(this.#isUN(targetIdx)){
                                displayedColumnIdx.get("virtualLeft").insertAdjacentElement("afterend",NEW_CELL);
                            }else{
                                displayedColumnIdx.get(targetIdx).insertAdjacentElement("afterend",NEW_CELL)    
                            }
                        }
                    }
                    displayedColumnIdx.set(colIdx,NEW_CELL);
                }
            }else if(displayedColumnIdx.get(colIdx) && this.#isUN(NEW_CELL)){
                displayedColumnIdx.get(colIdx).remove();
                displayedColumnIdx.delete(colIdx)
            }
        }
        
        for(let [key,value] of displayedColumnIdx){
            if(key < START_INDEX || key > END_INDEX - 1){
                if(this.#utils.get("scroll").get("touchInfo")?.get("target")?.closest("td") === value && this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true) value.style.display = "none";
                else if(this.#utils.get("select").get("target")?.closest("td") === value && this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true) value.style.display = "none";
                else value.remove();
                displayedColumnIdx.delete(key);
            }
        }               

        if(LAST_FLAG){
            this.el.get("middleBody").scrollLeft = EL_WIDTH;
            this.#utils.get("scroll").set("scrollLeft",EL_WIDTH);
        }else{
            this.el.get("middleBody").scrollLeft = 0;
            this.#utils.get("scroll").set("scrollLeft",0);
        }

        
    }

    #createCell = (rowIdx,colIdx) => {
        let columnInfo = this.#columns[colIdx];

        let colName = this.getColumnNameByIndex(colIdx)
        let rowspanInfo = this.#getrowspanInfo(rowIdx,colIdx)
        let rowspanNum = rowspanInfo[1];
        let rowspanYn = false
        
        if(!this.#isUN(this.#columns[colIdx]?.rowspan)){
            if(this.#columns[colIdx]?.rowspan){
                let deleteYn = false;
                const END_INDEX = Math.min(this.#utils.get("scroll").get("passedRowCount") + this.#utils.get("scroll").get("visibleRowCount"),this.#data.get("showData").length);
                let START_INDEX = ((END_INDEX === this.#data.get("showData").length)?this.#data.get("showData").length-this.#utils.get("scroll").get("visibleRowCount"):this.#utils.get("scroll").get("passedRowCount"));

                if(rowIdx>0 && this.#data.get("showData")[rowIdx][colName] === this.#data.get("showData")[rowIdx-1][colName]) deleteYn = true;
                if(rowIdx === START_INDEX) deleteYn = false;
                
                if(!deleteYn){
                    if(rowspanInfo[0] === rowIdx && rowspanNum > 1) rowspanYn = true;
                }else return;
            }
        }

        const HEIGHT = this.#cell.get("height")

        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-middle-body-table-tbody-tr-td")
        tdEl.style.minWidth = columnInfo.width + "px";
        tdEl.style.maxWidth = columnInfo.width + "px";
        
        if(rowspanYn) tdEl.setAttribute("rowspan",rowspanNum);

        if(rowIdx%2 === 0) tdEl.classList.add("even-cell")
        else tdEl.classList.add("odd-cell")
        
        let divEl = document.createElement("div");
        divEl.classList.add("hjs-grid-middle-body-table-tbody-tr-td-div")

        let nameLabel = document.createElement("label");
        nameLabel.classList.add("hjs-grid-middle-body-table-tbody-tr-td-div-label")

        let verticalAlign = this.#columns[colIdx]?.align?.body?.vertical;
        let horizontalAlign = this.#columns[colIdx]?.align?.body?.horizontal;
        
        if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
        else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
        else divEl.style.alignItems = "center";

        if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
        else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
        else divEl.style.justifyContent = "center";

        tdEl.style.height = HEIGHT + "px";
        tdEl.style.maxHeight = HEIGHT + "px";

        

        
        
        nameLabel.innerText = this.#getFormulaValue(rowIdx,colName)

        divEl.style.maxHeight = HEIGHT-4 + "px";

        divEl.append(nameLabel)

        tdEl.append(divEl)

        return tdEl
    }

    #createHeaderCell = (rowIdx,colIdx,rowspan,colspan,title) => {
        let columnInfo = this.#columns[colIdx];

        const HEIGHT = this.#header.get("height")

        let tdEl = document.createElement("td");
        tdEl.classList.add("hjs-grid-middle-header-table-tbody-tr-td")

        if(rowIdx === "first") tdEl.style.height = "0px";
        else{
            tdEl.style.height = (HEIGHT * (rowspan??1)) + "px";
            tdEl.style.maxHeight = (HEIGHT * (rowspan??1)) + "px";
        }
        tdEl.style.minWidth = columnInfo.width  + "px";
        tdEl.style.maxWidth = columnInfo.width  + "px";

        let divEl = document.createElement("div");
        divEl.classList.add("hjs-grid-middle-header-table-tbody-tr-td-div")

        let nameLabel = document.createElement("label");
        nameLabel.classList.add("hjs-grid-middle-header-table-tbody-tr-td-div-label")

        let verticalAlign = this.#columns[colIdx]?.align?.header?.vertical;
        let horizontalAlign = this.#columns[colIdx]?.align?.header?.horizontal;
        
        if(verticalAlign === "top") divEl.style.alignItems = "flex-start";
        else if(verticalAlign === "bottom") divEl.style.alignItems = "flex-end";
        else divEl.style.alignItems = "center";

        if(horizontalAlign === "left") divEl.style.justifyContent = "flex-start";
        else if(horizontalAlign === "right") divEl.style.justifyContent = "flex-end";
        else divEl.style.justifyContent = "center";

        if(rowIdx !== "first"){
            nameLabel.innerText = this.#isUN(title)?(this.#columns[colIdx].title??""):(title??"");
            divEl.style.maxHeight = (HEIGHT * (rowspan??1))-4  + "px";
        }

        divEl.append(nameLabel)

        if(!this.#isUN(rowspan)) tdEl.setAttribute("rowspan",rowspan)
        if(!this.#isUN(colspan)) tdEl.setAttribute("colspan",colspan)

        let sortFilter = document.createElement("div")
                
        if((columnInfo.sortable === true && rowIdx !== "first") || (!this.#isUN(columnInfo.filter) &&(columnInfo.filter === true || typeof columnInfo.filter === "object") && rowIdx !== "first")
            && ((this.#isUN(multipleInfo) && (rowIdx+1) === (this.#header.get("row")??1))
            || (
                multipleInfo?.START_COL_INDEX === colIdx
                && multipleInfo?.END_COL_INDEX === colIdx
                && (multipleInfo?.END_ROW_INDEX + 1) === (this.#header.get("row")??1)
            ))){         
                sortFilter.classList.add("hjs-grid-sort-filter-div");
            }

        if(columnInfo.sortable === true && rowIdx !== "first"){
            let multipleInfo = this.#getMultipleHeaderCellInfo(rowIdx,colIdx);
            
            if((this.#isUN(multipleInfo) && (rowIdx+1) === (this.#header.get("row")??1))
            || (
                multipleInfo?.START_COL_INDEX === colIdx
                && multipleInfo?.END_COL_INDEX === colIdx
                && (multipleInfo?.END_ROW_INDEX + 1) === (this.#header.get("row")??1)
                )
            ){
                let sortDiv = document.createElement("span");
                sortDiv.classList.add("hjs-grid-sort-container")
            
                let sortButtonDiv = document.createElement("span");
                sortButtonDiv.classList.add("hjs-grid-sort-div")

                let sortType = this.getSortType(colIdx);
                let sortOrder = this.#utils.get("sortInfo").get("sortOrder");

                let sortAscButton = document.createElement("span");
                sortAscButton.classList.add("hjs-grid-sort-button")
                sortAscButton.classList.add("asc")
                if(sortType === "ASC") sortAscButton.classList.add("active")

                sortButtonDiv.append(sortAscButton);                        

                let sortDescButton = document.createElement("span");
                sortDescButton.classList.add("hjs-grid-sort-button")
                sortDescButton.classList.add("desc")
                if(sortType === "DESC") sortDescButton.classList.add("active")

                sortButtonDiv.append(sortDescButton);

                sortDiv.append(sortButtonDiv)

                let sortNumberLabel = document.createElement("span");
                sortNumberLabel.classList.add("hjs-grid-sort-number")
                let indexOf = sortOrder.indexOf(this.getColumnNameByIndex(colIdx));

                if(indexOf !== -1) sortNumberLabel.innerText = (indexOf+1)

                sortDiv.append(sortNumberLabel);

                sortFilter.append(sortDiv)

                divEl.classList.add("hjs-grid-pointer");
                nameLabel.classList.add("hjs-grid-pointer");

                this.#setNativeEvent(nameLabel,"mousedown",this.#sortEvent,[colIdx])
                //this.#setNativeEvent(nameLabel,"touchstart",this.#sortEvent,[colIdx])
                this.#setNativeEvent(sortDiv,"mousedown",this.#sortEvent,[colIdx])
                this.#setNativeEvent(sortDiv,"touchstart",this.#sortEvent,[colIdx])
            }
        }

        if(!this.#isUN(columnInfo.filter) &&(columnInfo.filter === true || typeof columnInfo.filter === "object") && rowIdx !== "first"){
            let multipleInfo = this.#getMultipleHeaderCellInfo(rowIdx,colIdx);
            
            if((this.#isUN(multipleInfo) && (rowIdx+1) === (this.#header.get("row")??1))
            || (
                multipleInfo?.START_COL_INDEX === colIdx
                && multipleInfo?.END_COL_INDEX === colIdx
                && (multipleInfo?.END_ROW_INDEX + 1) === (this.#header.get("row")??1)
                )
            ){
                let filterDiv = document.createElement("span");
                filterDiv.classList.add("hjs-grid-filter-button")

                if(this.#utils.get("filterInfo").get("filterOrder").filter(item=>item.column === this.#columns[colIdx].name).length>0) filterDiv.classList.add("active")

                sortFilter.append(filterDiv)

                filterDiv.classList.add("hjs-grid-pointer");

                this.#setNativeEvent(filterDiv,"mousedown",this.#filterEvent,[colIdx])
                this.#setNativeEvent(filterDiv,"touchstart",this.#filterEvent,[colIdx])
            }
        }

        if((columnInfo.sortable === true && rowIdx !== "first") || (!this.#isUN(columnInfo.filter) &&(columnInfo.filter === true || typeof columnInfo.filter === "object") && rowIdx !== "first")
        && ((this.#isUN(multipleInfo) && (rowIdx+1) === (this.#header.get("row")??1))
        || (
            multipleInfo?.START_COL_INDEX === colIdx
            && multipleInfo?.END_COL_INDEX === colIdx
            && (multipleInfo?.END_ROW_INDEX + 1) === (this.#header.get("row")??1)
        ))){         
            divEl.append(sortFilter)
        }
        

        tdEl.append(divEl)

        return tdEl
    }

    #showHideColumn = (colName,hidden,undoYn=true, undoNumber) => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }

        if(this.#isUN(this.#columns[colIdx])){
            console.error("Wrong column name/index");
            return;
        }
        
        let sameHiddenYn = (this.#columns[colIdx].hidden??false) === hidden
        
        this.#columns[colIdx].hidden = hidden;
        
        this.#setColumnsOption();

        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")
        let saFlag = false;
        
        for(let idx=sa.length-1;idx>=0;idx--){
            let curFlag = false;
            if(curInfo.rowIdx>=sa[idx].startRowIndex && curInfo.rowIdx<=sa[idx].endRowIndex
            && curInfo.colIdx>=sa[idx].startColIndex && curInfo.colIdx<=sa[idx].endColIndex) curFlag = true;

            let sOrgCol = sa[idx].startColIndex;
            let eOrgCol = sa[idx].endColIndex;
            
            if(hidden && sa[idx].startColIndex === colIdx) sa[idx].startColIndex = (this.#columnsOption.get("visibleNextColumnIndex").get(sa[idx].startColIndex)??0)-1;

            if(hidden && sa[idx].endColIndex === colIdx) sa[idx].endColIndex = (this.#columnsOption.get("visiblePrevColumnIndex").get(sa[idx].endColIndex)??-1);
            
            if(hidden && (sa[idx].startColIndex < 0 && sa[idx].endColIndex < 0 || (sOrgCol === eOrgCol && sOrgCol === colIdx))){
                sa.splice(idx,1)
                if(curFlag) saFlag = true
            }
        }

        const NEXT_COL_IDX = this.#columnsOption.get("visibleNextColumnIndex").get(colIdx);
        const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
        
        for(let idx=sa.length-1;idx>=0;idx--){
            sa[idx].startColIndex = Math.max(Math.min(sa[idx].startColIndex,MAX_VISIBLE_COL),0);
            sa[idx].endColIndex = Math.max(Math.min(sa[idx].endColIndex,MAX_VISIBLE_COL),0);
            if(!hidden){
                sa[idx].startRowIndex = 0;
                sa[idx].endRowIndex = this.#data.get("showData").length - 1;
            }
        }
        
        this.#utils.get("select").set("bodySelectArray",sa);
        
        if(curInfo?.colIdx === colIdx){
            curInfo.colIdx = this.#isUN(NEXT_COL_IDX)?MAX_VISIBLE_COL:(NEXT_COL_IDX);
            //console.log(saFlag,curInfo.colIdx,NEXT_COL_IDX)
            if(saFlag || this.#isUN(curInfo.colIdx)) this.#utils.get("select").set("bodySelectCurrentInfo",null)
            else{ 
                curInfo.colIdx = Math.max(Math.min(curInfo.colIdx,MAX_VISIBLE_COL),0);
                this.#utils.get("select").set("bodySelectCurrentInfo",curInfo)
            }
        }
        console.log(sameHiddenYn)
        //undo 추가
        if(undoYn && !sameHiddenYn){
            this.#utils.set("redoArray",new Array())

            if(this.#isUN(undoNumber)){
                undoNumber = this.#utils.get("undoNumber")+1;
                this.#utils.set("undoNumber",undoNumber)
            }

            const undoSelectArray = [{
                deleteYn : false,
                startRowIndex : 0,
                endRowIndex : this.#data.get("showData").length-1,
                startColIndex : colIdx,
                endColIndex : colIdx,
            }]

            const undoCurInfo = {
                rowIdx : 0,
                colIdx : colIdx
            }

            this.#utils.get("undoArray").push({
                "type"          : hidden?"hideColumn":"showColumn",
                "colName"       : colName,
                "colIdx"        : colIdx,
                "data"          : data,
                "undoNumber"    : undoNumber,
                "hidden"        : hidden,
                "selectArray"   : undoSelectArray,
                "curInfo"       : undoCurInfo,
            })
        }

        this.#reRenderGrid();
    }

    #calcShowData = ()=>{
        this.#utils.get("select").set("leftBodySelectArray",new Array());
        this.#utils.get("select").set("bodySelectArray",new Array());

        let showOrgData = this.#deepCopyData(this.#data.get("showOrgData"));
        showOrgData = this.#sortGrid(showOrgData);
        showOrgData = this.#filterGrid(showOrgData);

        this.#data.set("showData",showOrgData);
    }

    #sortGrid = showOrgData => {
        let sortOrder = this.#utils.get("sortInfo").get("sortOrder");

        for(let idx=sortOrder.length-1;idx>=0;idx--){
            let colName = sortOrder[idx]
            let sortType = this.#utils.get("sortInfo").get("sortType").get(colName);

            let colType = this.getColumnType(this.getColumnIndexByName(colName));
            
            if(sortType === "ASC")
                showOrgData = showOrgData.toSorted((a,b) => {
                    let before,after;
                    if(colType === "number"){
                        if(typeof a[colName] === "number" && typeof b[colName] === "number"){
                            before = Number(a[colName]??"");
                            after = Number(b[colName]??"");
                        }else{
                            before = (a[colName]??"").toString();
                            after = (b[colName]??"").toString();
                        }
                    }
                    else{
                        before = (a[colName]??"").toString();
                        after = (b[colName]??"").toString();
                    }
                    
                    if (before < after) return -1;
                    if (before > after) return 1;
                    return 0;
                }); 
            else
                showOrgData = showOrgData.toSorted((a,b) => {
                    let before,after;
                    if(colType === "number"){
                        before = Number(a[colName]??"");
                        after = Number(b[colName]??"");
                    }
                    else{
                        before = (a[colName]??"").toString();
                        after = (b[colName]??"").toString();
                    }

                    if (before > after) return -1;
                    if (before < after) return 1;
                    return 0;
                })
        }

        return showOrgData;
    }

    #filterGrid = (showOrgData,filterIdx) => {
        let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
        let tempArray = new Array();
        
        for(let showOrgRow of showOrgData){
            if(showOrgRow.IUDFLAG === "D") continue;
            let showFlag = true
            for(let idx=0;idx<filterOrder.length;idx++){
                let colName = filterOrder[idx].column
                if(filterIdx === idx) break;
                showFlag = showFlag && (filterOrder[idx].filter.indexOf(showOrgRow[colName].toString()) === -1);
            }
            
            if(showFlag) tempArray.push(showOrgRow)
        }

        return tempArray
    }

    #calcLeftBodySelect = (setYn=false) => {
        let selectArray = this.#utils.get("select").get("leftBodySelectArray");
        let selectInfo = this.#utils.get("select").get("leftBodySelectInfo");
        let newSelectArray = new Array();

        const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
        const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
    
        if(this.#isUN(selectInfo) && selectArray.length>0){
            selectInfo = selectArray[0];
            selectInfo["deleteYn"] = false;
        }
    
        for(let idx=0;idx<selectArray.length;idx++){
            let sa = selectArray[idx];
            
            if(sa.startRowIndex > selectInfo.endRowIndex
                || sa.endRowIndex < selectInfo.startRowIndex
            ){
                newSelectArray.push(sa)
            }else{
                /*선택한 박스의 시작 row가 기존 박스의 시작 row 보다 위에 있을 때*/
                /*선택한 박스의 끝 row가 기존 박스의 끝 row보다 위에 있을 때*/
                
                if(sa.startRowIndex >= selectInfo.startRowIndex && sa.startRowIndex <= selectInfo.endRowIndex 
                && sa.endRowIndex >= selectInfo.endRowIndex){
                    newSelectArray.push({
                        deleteYn : false,
                        startRowIndex : selectInfo.endRowIndex+1,
                        endRowIndex : sa.endRowIndex,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    })
                }else if(sa.startRowIndex <= selectInfo.startRowIndex && sa.startRowIndex <= selectInfo.endRowIndex 
                    && sa.endRowIndex >= selectInfo.startRowIndex && sa.endRowIndex >= selectInfo.endRowIndex){
                    newSelectArray.push({
                        deleteYn : false,
                        startRowIndex : sa.startRowIndex,
                        endRowIndex : selectInfo.startRowIndex-1,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    })

                    newSelectArray.push({
                        deleteYn : false,
                        startRowIndex : selectInfo.endRowIndex+1,
                        endRowIndex : sa.endRowIndex,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    })
                }else if(sa.startRowIndex <= selectInfo.startRowIndex && sa.startRowIndex <= selectInfo.endRowIndex 
                    && sa.endRowIndex >= selectInfo.startRowIndex && sa.endRowIndex <= selectInfo.endRowIndex){
                    newSelectArray.push({
                        deleteYn : false,
                        startRowIndex : sa.startRowIndex,
                        endRowIndex : selectInfo.startRowIndex-1,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    })
                }
            }
        }
        
        if(selectInfo?.deleteYn === false) newSelectArray.push(selectInfo)
    
        this.#renderLeftBodySelect(newSelectArray);
        this.#renderBodySelect(newSelectArray)
    
        if(setYn === true){
            this.#utils.get("select").set("leftBodySelectArray",newSelectArray);
            this.#utils.get("select").set("bodySelectArray",newSelectArray);                  
        }
    }

    #calcBodySelect = (setYn=false) => {
        let selectArray = this.#utils.get("select").get("bodySelectArray");
        let selectInfo = this.#utils.get("select").get("bodySelectInfo");
        
        let newSelectArray = this.#deepCopy(selectArray);

        if(this.#isUN(selectInfo) && selectArray.length>0){
            selectInfo = selectArray[0];
            selectInfo["deleteYn"] = false;
        }

        const selectInfoArray = new Array();
        selectInfoArray.push(selectInfo)

        const rowspanSet = new Set();

        for(let colIdx=selectInfo.startColIndex;colIdx<=selectInfo.endRowIndex;colIdx++){
            let rowspanYn = this.#columns[colIdx].rowspan === true
            
            if(rowspanYn){
                for(let rowIdx=selectInfo.startRowIndex;rowIdx<=selectInfo.endRowIndex;rowIdx++){
                    let rowspanInfo = this.#getrowspanInfo(rowIdx,colIdx);

                    let rowspanInfoStr = `${rowspanInfo[0]}|${Math.max(rowspanInfo[0] + rowspanInfo[1] - 1,rowspanInfo[0])}|${colIdx}`
                    console.log(rowspanSet)
                    if(rowspanInfo[1] > 1 && !rowspanSet.has(rowspanInfoStr)){
                        if(rowspanInfo[0] < selectInfo.startRowIndex){
                            selectInfoArray.push({
                                deleteYn : selectInfo?.deleteYn
                                , startRowIndex : rowspanInfo[0]
                                , endRowIndex : Math.max(rowspanInfo[0],selectInfo.startRowIndex-1)
                                , startColIndex : colIdx
                                , endColIndex : colIdx
                            })
                        }
                        if(rowspanInfo[0]+rowspanInfo[1]-1 > selectInfo.endRowIndex){
                            selectInfoArray.push({
                                deleteYn : selectInfo?.deleteYn
                                , startRowIndex : Math.min(rowspanInfo[0]+rowspanInfo[1]-1, selectInfo.endRowIndex+1)
                                , endRowIndex : rowspanInfo[0]+rowspanInfo[1]-1
                                , startColIndex : colIdx
                                , endColIndex : colIdx
                            })
                        }
                        console.log("--------------------------------------",rowspanInfo)
                        
                        rowspanSet.add(rowspanInfoStr)
                    }
                    
                }
            }
        }
        console.log(selectInfo?.deleteYn)
        for(let sIdx=0;sIdx<selectInfoArray.length;sIdx++){
            let sInfo = selectInfoArray[sIdx];
            let orgSelectArray = this.#deepCopy(newSelectArray);
            for(let idx=0;idx<orgSelectArray.length;idx++){
                let sa = orgSelectArray[idx];
    
                if(sa.startRowIndex > sInfo.endRowIndex
                    || sa.endRowIndex < sInfo.startRowIndex
                    || sa.startColIndex > sInfo.endColIndex
                    || sa.endColIndex < sInfo.startColIndex
                ){
                    newSelectArray.push(sa)
                }else{
                    /*선택한 박스의 시작 row가 기존 박스의 시작 row 보다 위에 있을 때*/
                    /*선택한 박스의 끝 row가 기존 박스의 끝 row보다 위에 있을 때*/
                    if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex >= sInfo.endRowIndex
                    && sa.startColIndex >= sInfo.startColIndex && sa.startColIndex <= sInfo.endColIndex 
                    && sa.endColIndex >= sInfo.endColIndex){
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
    
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex >= sInfo.endRowIndex
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.endColIndex){
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex >= sInfo.endRowIndex
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex >= sInfo.endRowIndex
                    && sa.startColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }
                    /*선택한 박스의 시작 row가 기존 박스의 시작 row 보다 위에 있을 때*/
                    /*선택한 박스의 끝 row가 기존 박스의 끝 row보다 밑에 있을 때*/
                    else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex > sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex >= sInfo.startColIndex && sa.startColIndex <= sInfo.endColIndex 
                    && sa.endColIndex >= sInfo.endColIndex){
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex > sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.endColIndex){
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex > sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                    }else if(sa.startRowIndex >= sInfo.startRowIndex && sa.startRowIndex <= sInfo.endRowIndex 
                    && sa.endRowIndex >= sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                    }
                    /*선택한 박스의 시작 row가 기존 박스의 시작 row와 끝 row 사이에 있을 때*/
                    /*선택한 박스의 끝 row가 기존 박스의 끝 row보다 위에 있을 때*/
                    else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.endRowIndex 
                    && sa.startColIndex >= sInfo.startColIndex && sa.startColIndex <= sInfo.endColIndex 
                    && sa.endColIndex >= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.endRowIndex 
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.endRowIndex 
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sInfo.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.endRowIndex 
                    && sa.startColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.endRowIndex+1,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }
                    /*선택한 박스의 시작 row가 기존 박스의 시작 row와 끝 row 사이에 있을 때*/
                    /*선택한 박스의 끝 row가 기존 박스의 끝 row보다 밑에 있을 때*/
                    else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex >= sInfo.startColIndex && sa.startColIndex <= sInfo.endColIndex 
                    && sa.endColIndex >= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex  
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                        if(!this.#isUN(this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : this.#columnsOption.get("visibleNextColumnIndex").get(sInfo.endColIndex),
                            endColIndex : sa.endColIndex
                        })
                    }else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex <= sInfo.startColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                        if(!this.#isUN(this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)))
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sInfo.startRowIndex,
                            endRowIndex : sa.endRowIndex,
                            startColIndex : sa.startColIndex,
                            endColIndex : this.#columnsOption.get("visiblePrevColumnIndex").get(sInfo.startColIndex)
                        })
                    }else if(sa.startRowIndex <= sInfo.startRowIndex
                    && sa.endRowIndex >= sInfo.startRowIndex && sa.endRowIndex <= sInfo.endRowIndex 
                    && sa.startColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex
                    && sa.endColIndex >= sInfo.startColIndex && sa.endColIndex <= sInfo.endColIndex){
                        newSelectArray.push({
                            deleteYn : false,
                            startRowIndex : sa.startRowIndex,
                            endRowIndex : sInfo.startRowIndex-1,
                            startColIndex : sa.startColIndex,
                            endColIndex : sa.endColIndex
                        })
                    }
                }
            }
        }
        
        if(selectInfo?.deleteYn === false){
            for(let sIdx=0;sIdx<selectInfoArray.length;sIdx++){
                newSelectArray.push(selectInfoArray[sIdx]);
            }
        }

        //console.log(newSelectArray,selectArray,this.#utils.get("select").get("bodySelectInfo"))
        
        this.#renderBodySelect(newSelectArray);

        if(setYn === true) this.#utils.get("select").set("bodySelectArray",this.#deepCopy(newSelectArray));                
    }

    #renderLeftBodySelect = (newSelectArray) => {
        this.#removeChildAll(this.el.get("leftBodySelect"))
    
        let visibleArray = new Array();
    
        let START_ROW_INDEX = this.#utils.get("scroll").get("passedRowCount") 
        const END_ROW_INDEX = Math.min(this.#utils.get("scroll").get("passedRowCount") + this.#utils.get("scroll").get("visibleRowCount"),this.#data.get("showData").length)
        const LAST_ROW_FLAG = (END_ROW_INDEX === this.#data.get("showData").length && START_ROW_INDEX === this.#utils.get("scroll").get("scrollRowCount"))
    
        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_COL_INDEX, END_COL_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;
    
        const COL_TOTAL_COUNT = this.#columns.length;
    
        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  
    
        START_COL_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_COL_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_COL_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_COL_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_COL_INDEX]+columnWidth[END_COL_INDEX]-beforeSum[START_COL_INDEX];
    
        START_COL_INDEX = Math.max(Math.min(START_COL_INDEX,COL_TOTAL_COUNT),0)??0;
        END_COL_INDEX = Math.max(Math.min(END_COL_INDEX,COL_TOTAL_COUNT),0);
    
        let LAST_COL_FLAG = (END_COL_INDEX === COL_TOTAL_COUNT && this.#columnsOption.get("visibleColIndex").get(START_COL_INDEX) === this.#utils.get("scroll").get("scrollColCount"))
    
        for(let idx=newSelectArray.length-1;idx>=0;idx--){
            let sInfo = newSelectArray[idx];
    
            let divEl = document.createElement("div");
            divEl.classList.add("hjs-grid-selected-cell-background")
    
            divEl.style.position = "absolute";
            let top = (sInfo.startRowIndex - ((!LAST_ROW_FLAG)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1))*this.#cell.get("height")
            let height = ((sInfo.endRowIndex - sInfo.startRowIndex + 1)*this.#cell.get("height"))
            let showTop = top<0?0:top;
            let showHeight = top<0?height+top:height;
    
            divEl.style.top = showTop + "px"
            divEl.style.height = showHeight + "px"
            
            let realColIdx = (!LAST_COL_FLAG)?this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")):this.#columnsOption.get("visiblePrevColumnIndex").get(this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")));
            let left = (this.#columnsOption.get("columnBeforeSum")[sInfo.startColIndex] - this.#columnsOption.get("columnBeforeSum")[realColIdx]);
            let width = (this.#columnsOption.get("columnBeforeSum")[sInfo.endColIndex]-this.#columnsOption.get("columnBeforeSum")[sInfo.startColIndex] + this.#columns[sInfo.endColIndex]?.width??0);
            
            let showLeft = left<0?0:left;
            let showWidth = left<0?width+left:width;
            divEl.style.left = showLeft + "px";
            divEl.style.width = "100%";
    
            if(height !== 0 && width !== 0){
                this.el.get("leftBodySelect").append(divEl)
                visibleArray.push({
                    divEl : divEl,
                    top : top,
                    height : height,
                    showTop : showTop,
                    showHeight : showHeight,
                    left : left,
                    width : width,
                    showLeft : showLeft,
                    showWidth : showWidth,
                    index : idx,
                })
            }
            else newSelectArray.splice(idx,1)                   
        }
        
        if(visibleArray.length === 1){
            if(visibleArray[0].showTop+visibleArray[0].showHeight>0 && visibleArray[0].showLeft+visibleArray[0].showWidth>0){
                visibleArray[0].divEl.classList.add("hjs-grid-selected-cell-border")
            }                    
        }

        let curInfo = this.#utils.get("select").get("leftBodySelectCurrentInfo");
        if(!this.#isUN(curInfo)){
            let curTop = (curInfo.rowIdx - ((!LAST_ROW_FLAG)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1))*this.#cell.get("height");

            this.el.get("leftBodySelectTouchEl").style.top = curTop + "px"
            this.el.get("leftBodySelectTouchEl").style.height = this.#cell.get("height") + "px"
            this.el.get("leftBodySelectTouchEl").style.width = "100%"
        }
        
    }

    #renderBodySelect = (newSelectArray) => {
        this.#removeChildAll(this.el.get("middleBodySelect"))

        let visibleArray = new Array();

        let START_ROW_INDEX = this.#utils.get("scroll").get("passedRowCount") 
        const END_ROW_INDEX = Math.min(this.#utils.get("scroll").get("passedRowCount") + this.#utils.get("scroll").get("visibleRowCount"),this.#data.get("showData").length)
        const LAST_ROW_FLAG = (END_ROW_INDEX === this.#data.get("showData").length && START_ROW_INDEX === this.#utils.get("scroll").get("scrollRowCount"))

        const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_COL_INDEX, END_COL_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  

        START_COL_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_COL_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_COL_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_COL_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_COL_INDEX]+columnWidth[END_COL_INDEX]-beforeSum[START_COL_INDEX];

        START_COL_INDEX = Math.max(Math.min(START_COL_INDEX,COL_TOTAL_COUNT),0)??0;
        END_COL_INDEX = Math.max(Math.min(END_COL_INDEX,COL_TOTAL_COUNT),0);

        let LAST_COL_FLAG = (END_COL_INDEX === COL_TOTAL_COUNT && this.#columnsOption.get("visibleColIndex").get(START_COL_INDEX) === this.#utils.get("scroll").get("scrollColCount"))

        for(let idx=newSelectArray.length-1;idx>=0;idx--){
            let sInfo = newSelectArray[idx];

            let divEl = document.createElement("div");
            divEl.classList.add("hjs-grid-selected-cell-background")

            divEl.style.position = "absolute";
            let top = (sInfo.startRowIndex - ((!LAST_ROW_FLAG)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1))*this.#cell.get("height");
            let height = ((sInfo.endRowIndex - sInfo.startRowIndex + 1)*this.#cell.get("height"))
            let showTop = top<0?0:top;
            let showHeight = top<0?height+top:height;

            divEl.style.top = showTop + "px"
            divEl.style.height = showHeight + "px"
            
            let realColIdx = (!LAST_COL_FLAG)?this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")):this.#columnsOption.get("visiblePrevColumnIndex").get(this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")));
            let left = (this.#columnsOption.get("columnBeforeSum")[sInfo.startColIndex] - this.#columnsOption.get("columnBeforeSum")[realColIdx]);
            let width = (this.#columnsOption.get("columnBeforeSum")[sInfo.endColIndex]-this.#columnsOption.get("columnBeforeSum")[sInfo.startColIndex] + this.#columns[sInfo.endColIndex]?.width??0);
            
            let showLeft = left<0?0:left;
            let showWidth = left<0?width+left:width;
            divEl.style.left = showLeft + "px";
            divEl.style.width = showWidth + "px";

            if(height !== 0 && width !== 0){
                this.el.get("middleBodySelect").append(divEl)
                visibleArray.push({
                    divEl : divEl,
                    top : top,
                    height : height,
                    showTop : showTop,
                    showHeight : showHeight,
                    left : left,
                    width : width,
                    showLeft : showLeft,
                    showWidth : showWidth,
                    index : idx,
                })
            }
            else newSelectArray.splice(idx,1)                   
        }
        
        if(visibleArray.length === 1){
            if(visibleArray[0].showTop+visibleArray[0].showHeight>0 && visibleArray[0].showLeft+visibleArray[0].showWidth>0){
                visibleArray[0].divEl.classList.add("hjs-grid-selected-cell-border")
                let selectHandle = document.createElement("div");
                selectHandle.classList.add("hjs-grid-selected-handle")
                selectHandle.style.position = "absolute";
                selectHandle.style.top = (visibleArray[0].showTop+visibleArray[0].showHeight-3) + "px"
                selectHandle.style.left = (visibleArray[0].showLeft+visibleArray[0].showWidth-3) + "px"

                selectHandle.style.height = "6px"
                selectHandle.style.width = "6px"

                visibleArray[0].divEl.insertAdjacentElement("afterend",selectHandle)
            }                    
        }

        let [minRowIdx,minColIdx] = this.#getPossibleCurrentInfo(newSelectArray);

        if(!this.#isUN(minRowIdx) && !this.#isUN(minColIdx))
        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : minRowIdx,
            colIdx : minColIdx
        })
        

        if(newSelectArray.length > 0){
            let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
            let curElInfo = this.#utils.get("select").get("bodySelectCurrentElInfo")

            if(!this.#isUN(curInfo)){
                let curDivEl = this.el.get("middleBodySelectCurrent")
                curDivEl.classList.add("hjs-grid-selected-current-cell");
                curDivEl.style.position = "absolute";

                let rowspanYn = this.#columns[curInfo.colIdx].rowspan === true
                let rowspanInfo = this.#getrowspanInfo(curInfo.rowIdx,curInfo.colIdx);
                let top = ((curInfo.rowIdx - ((!LAST_ROW_FLAG)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1)) + (rowspanYn?rowspanInfo[0]-curInfo.rowIdx:0))*this.#cell.get("height");
                let height = rowspanYn?this.#cell.get("height") * rowspanInfo[1]:this.#cell.get("height");
                
                if((top+height<=EL_HEIGHT && !rowspanYn) || (rowspanYn)){
                    curDivEl.style.top = top + "px"
                    curDivEl.style.height = height + "px"
                    
                    let realColIdx = (!LAST_COL_FLAG)?this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")):this.#columnsOption.get("visiblePrevColumnIndex").get(this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")));
                    let left = (this.#columnsOption.get("columnBeforeSum")[curInfo.colIdx] - this.#columnsOption.get("columnBeforeSum")[realColIdx])
                    
                    let width = this.#columns[curInfo.colIdx].width
                    
                    // left+width <= EL_WIDTH
                    if(true){
                        curDivEl.style.left = left + "px";
                        curDivEl.style.width = width + "px";
                        curDivEl.style.opacity = "1";

                        if(!this.#isUN(this.el.get("middleBodySelectCurrentEditor")) && this.el.get("middleBodySelectCurrentEditor")?.style?.opacity === "0"){
                            this.el.get("middleBodySelectCurrentEditor").style.top = top + "px"
                            this.el.get("middleBodySelectCurrentEditor").style.height = height + "px"
                            this.el.get("middleBodySelectCurrentEditor").style.left = left + "px"
                            this.el.get("middleBodySelectCurrentEditor").style.width = width + "px"
                        }
                        let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(curInfo.rowIdx))
                        let curValue = this.getCellValue(showOrgRowIdx,curInfo.colIdx)
                        
                        if(curInfo.rowIdx !== curElInfo?.rowIdx || curInfo.colIdx !== curElInfo?.colIdx){
                            this.#createEditor(curInfo.rowIdx,curInfo.colIdx); 
                        }else if(curInfo.rowIdx === curElInfo?.rowIdx && curInfo.colIdx === curElInfo?.colIdx && curValue?.toString() !== this.el.get("middleBodySelectCurrentEditor")?.value?.toString()){
                            this.el.get("middleBodySelectCurrentEditor").value = curValue;
                        }
                    }else{
                        curDivEl.style.opacity = "0";
                    }
                }else{
                    curDivEl.style.opacity = "0";
                }
            }
        }else{
            this.el.get("middleBodySelectCurrent").classList.remove("hjs-grid-selected-current-cell");
        }
    }

    #createEditor = (rowIdx,colIdx,leftYn=false,leftWidthSum) => {
        let leftIdx = colIdx;
        if(leftYn) colIdx = this.#columnsOption.get("leftRealColIndex").get(colIdx);
        let colType = this.getColumnType(colIdx);
        let editorEl;
        let showOrgRow = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx));
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");

        if(colType === "number"){
            editorEl = document.createElement("input");
            editorEl.type = "number"
            editorEl.value = this.getCellValue(showOrgRow,colIdx);
            editorEl.classList.add("hjs-grid-number-editor")
        }else if(colType === "date"){
            editorEl = document.createElement("input");
            editorEl.type = "date"
            editorEl.setAttribute("max","9999-12-31")
            editorEl.value = this.getCellValue(showOrgRow,colIdx);
            editorEl.classList.add("hjs-grid-date-editor")
        }else if(colType === "datetime"){
            editorEl = document.createElement("input");
            editorEl.type = "datetime-local"
            editorEl.setAttribute("max","9999-12-31 23:59")
            editorEl.value = this.getCellValue(showOrgRow,colIdx);
            editorEl.classList.add("hjs-grid-datetime-editor")
        }else if(colType === "time"){
            editorEl = document.createElement("input");
            editorEl.type = "time"
            editorEl.value = this.getCellValue(showOrgRow,colIdx);
            editorEl.classList.add("hjs-grid-time-editor")
        }else{
            editorEl = document.createElement("textarea");
            editorEl.value = this.getCellValue(showOrgRow,colIdx);
            editorEl.classList.add("hjs-grid-text-editor")
        }

        editorEl.classList.add("hjs-grid-editor")

        editorEl.style.opacity = "0"
        
        let rowId = this.#getIdByShowOrgDataIndex(showOrgRow)
        let colNm = this.#getColumnNameAndIndex(colIdx)[0]

        editorEl.style.position = "absolute"

        if(!leftYn){
            this.#setNativeEvent(editorEl,"focusout",this.#editorFocusOut,[rowId,colNm,editorEl])
            this.#setNativeEvent(editorEl,"keydown",this.#editorKeyDown,[rowId,colNm,editorEl])
            this.#setNativeEvent(editorEl,"keyup",this.#editorKeyUp,[rowId,colNm,editorEl])

            editorEl.setAttribute("inputmode","none");
            
            let top = (curInfo.rowIdx - ((this.el.get("middleBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1))*this.#cell.get("height");
            //let height = Math.max(this.#cell.get("height"),50)
            let height = this.#cell.get("height")

            const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
            
            //editorEl.style.top = top + Math.min(EL_HEIGHT - (top + height),0) + "px"
            //editorEl.style.height = height + "px"
            editorEl.style.top = top + "px"
            editorEl.style.height = height + "px"

            let realColIdx = (this.el.get("middleBody").scrollLeft === 0)?this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")):this.#columnsOption.get("visiblePrevColumnIndex").get(this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")));
            let left = (this.#columnsOption.get("columnBeforeSum")[curInfo.colIdx] - this.#columnsOption.get("columnBeforeSum")[realColIdx])
            //let width = Math.max(this.#columns[colIdx].width,100)
            let width = this.#columns[colIdx].width

            const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
            //editorEl.style.left = left + Math.min(EL_WIDTH - (left + width),0) + "px";
            //editorEl.style.width = width + "px";    
            editorEl.style.left = left + "px";
            editorEl.style.width = width + "px";    

            this.#utils.get("select").set("bodySelectCurrentElInfo",{
                rowIdx : rowIdx,
                colIdx : colIdx
            })
            
            if(!this.#isUN(this.el.get("middleBodySelectCurrentEditor"))){
                this.el.get("middleBodySelectCurrentEditor").remove();
            }
            this.el.set("middleBodySelectCurrentEditor",editorEl);
    
            this.el.get("middleBodySelectCurrent").insertAdjacentElement("afterend",editorEl)

            editorEl.focus();
        }else{
            this.#setNativeEvent(editorEl,"focusout",this.#leftEditorFocusOut,[rowId,colNm,editorEl])
            this.#setNativeEvent(editorEl,"keydown",this.#leftEditorKeyDown,[rowId,colNm,editorEl])

            let top = (curInfo.rowIdx - ((this.el.get("middleBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1))*this.#cell.get("height");
            //let height = Math.max(this.#cell.get("height"),50)
            let height = this.#cell.get("height")

            const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
            
            //editorEl.style.top = top + Math.min(EL_HEIGHT - (top + height),0) + "px"
            //editorEl.style.height = height + "px"
            editorEl.style.top = top + "px"
            editorEl.style.height = height + "px"

            let left = leftWidthSum + this.#columnsOption.get("leftColumnBeforeSum")[leftIdx]
            //let width = Math.max(this.#columns[colIdx].width,100)
            let width = this.#columns[colIdx].width
            
            //editorEl.style.left = left + Math.min(EL_WIDTH - (left + width),0) + "px";
            //editorEl.style.width = width + "px";    
            editorEl.style.left = left + "px";
            editorEl.style.width = width + "px";    

            this.#utils.get("select").set("bodySelectCurrentElInfo",{
                rowIdx : rowIdx,
                colIdx : colIdx
            })
            
            if(!this.#isUN(this.el.get("leftBodySelectCurrentEditor"))){
                this.el.get("leftBodySelectCurrentEditor").remove();
            }
            this.el.set("leftBodySelectCurrentEditor",editorEl);

            editorEl.style.opacity = "1"
    
            this.el.get("leftBodySelectTouchEl").insertAdjacentElement("afterend",editorEl)

            setTimeout(()=>{
                editorEl.focus();
            },50)
        }        
    }

    #setNativeEvent = (el,eventName,func,param,option,beforeFunc)=>{
        if(this.#isUN(param)) param = new Array();
        const eventFunc =  (e)=>{
            if(!this.#isUN(beforeFunc)) beforeFunc(e,...param)
            func(e,...param);
        }

        let removeEvent = ()=>{
            el.removeEventListener(eventName, eventFunc);
        }

        el.addEventListener(eventName,eventFunc,option);

        return removeEvent;
    }

    #getIdByFullDataIndex = rowIdx => {
        let data = this.#data.get("fullData");
        return data[rowIdx]?.["_id"]
    }
    
    #getIdByShowDataIndex = rowIdx => {
        let data = this.#data.get("showData");
        return data[rowIdx]?.["_id"]
    }
    
    #getIdByShowOrgDataIndex = rowIdx => {
        let data = this.#data.get("showOrgData");
        return data[rowIdx]?.["_id"]
    }
    
    #getFullDataIndexById = id => {
        let data = this.#data.get("fullData");
        for(let idx=0;idx<data.length;idx++){
            if(data[idx]._id === id) return idx;
        }
    }

    #getOrgDataIndexById = id => {
        let data = this.#data.get("orgData");
        for(let idx=0;idx<data.length;idx++){
            if(data[idx]._id === id) return idx;
        }
    }
    
    #getShowDataIndexById = id => {
        let data = this.#data.get("showData");
        for(let idx=0;idx<data.length;idx++){
            if(data[idx]._id === id) return idx;
        }
    }
    
    #getShowOrgDataIndexById = id => {
        let data = this.#data.get("showOrgData");
        for(let idx=0;idx<data.length;idx++){
            if(data[idx]._id === id) return idx;
        }
    }

    #getColumnNameAndIndex = colName => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }
        if(this.#isUN(this.#columns[colIdx])){
            //console.error("Wrong column name/index");
            return;
        }

        return [colName,colIdx]
    }
    
    #getNextVisibleColumnIndex = (colIdx,skipNum = 1) => {
        return this.#columnsOption.get("visibleNextColumnIndex")[colIdx+skipNum]
    }
    
    #getMultipleHeaderCellInfo = (rowIdx,colIdx) => {
        const MERGE_INFOS = this.#header.get("mergeInfo")
        
        if(this.#isUN(MERGE_INFOS)) return;
        
        for(let idx=0;idx<MERGE_INFOS.length;idx++){
            const MERGE_INFO = MERGE_INFOS[idx]
            const START_COL_INDEX = this.getColumnIndexByName(MERGE_INFO.startColumn)
        
            if(this.#isUN(START_COL_INDEX)) continue;

            const END_COL_INDEX = this.getColumnIndexByName(MERGE_INFO.endColumn)
            
            const START_ROW_INDEX = MERGE_INFO.startRow
            const END_ROW_INDEX = START_ROW_INDEX + (MERGE_INFO.rowspan??1) - 1
            
            if(rowIdx >= START_ROW_INDEX && rowIdx <= END_ROW_INDEX 
            && colIdx >= START_COL_INDEX && colIdx <= END_COL_INDEX){
                return {
                    START_ROW_INDEX : START_ROW_INDEX,
                    END_ROW_INDEX   : END_ROW_INDEX,
                    START_COL_INDEX : START_COL_INDEX,
                    END_COL_INDEX   : END_COL_INDEX,
                    MERGE_INFO      : MERGE_INFO,
                    MERGE_INDEX     : idx,
                    TITLE           : MERGE_INFO.title,
                }
            }
        }
        
        return;
    }

    #deleteColumnMergeInfos = (colName,mineYn = false) => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }

        let mergeInfos = this.#header.get("orgMergeInfo");
        
        this.#header.set("mergeInfo",mergeInfos);

        for(let rowIdx=0;rowIdx<this.#header.get("row");rowIdx++){
            for(let idx=mergeInfos.length-1;idx>=0;idx--){
                let mergeInfo = this.#getMultipleHeaderCellInfo(rowIdx,colIdx)
                if(!this.#isUN(mergeInfo)){
                    if(mineYn === true){
                        if(mergeInfo.START_COL_INDEX === colIdx && mergeInfo.END_COL_INDEX === colIdx){
                            mergeInfos.splice(mergeInfo.MERGE_INDEX,1)
                        }
                    }else{
                        if(mergeInfo.START_COL_INDEX === colIdx || mergeInfo.END_COL_INDEX === colIdx){
                            mergeInfos.splice(mergeInfo.MERGE_INDEX,1)
                            for(let idx2=mergeInfo.START_COL_INDEX;idx2<=mergeInfo.END_COL_INDEX;idx2++){
                                this.#deleteColumnMergeInfos(this.getColumnNameByIndex(idx2),true)
                            }
                        }
                    }
                }
            }
        }

        this.#header.set("mergeInfo",mergeInfos);
    }

    #getFixedColumns = () => {
        return this.#columns.filter(value=>value.fixed === true)
    }

    #getRealColumnIndexByFixedColumnIndex = (colIdx) => {
        return this.#columnsOption.get("fixedColumnRealIndex").get(colIdx)
    }

    #getRealColumnIndexByBodyColumnIndex = (colIdx) => {
        return this.#columnsOption.get("bodyColumnRealIndex").get(colIdx)
    }

    #getMessage = code => {
        return this.#lang[this.#utils.get("lang")][code];
    }

    #getLeftSelectDeleteYn = (rowIdx,colIdx) => {
        let selectArray = this.#utils.get("select").get("leftBodySelectArray");

        for(let idx=0;idx<selectArray.length;idx++){
            let sa = selectArray[idx];
            
            if(
                sa.startRowIndex <= rowIdx && sa.endRowIndex >= rowIdx
            ){
                return true
            }
        }

        return false;
    }

    #getSelectDeleteYn = (rowIdx,colIdx) => {
        let selectArray = this.#utils.get("select").get("bodySelectArray");

        for(let idx=0;idx<selectArray.length;idx++){
            let sa = selectArray[idx];
            if(
                sa.startRowIndex <= rowIdx && sa.endRowIndex >= rowIdx
                && sa.startColIndex <= colIdx && sa.endColIndex >= colIdx
            ){
                return true
            }
        }

        return false;
    }

    #getPossibleCurrentInfo = (newSelectArray) => {
        let currFlag = false;
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");

        if(this.#isUN(curInfo)) return new Array();

        for(let idx=0;idx<newSelectArray.length;idx++){
            let sa = newSelectArray[idx];
            
            if(curInfo.rowIdx>=sa.startRowIndex && curInfo.rowIdx<=sa.endRowIndex
            && curInfo.colIdx>=sa.startColIndex && curInfo.colIdx<=sa.endColIndex){
                currFlag = true;
                break;
            }
        }
        
        if(currFlag === false && newSelectArray.length>0){
            let minRowIdx,minColIdx;
            newSelectArray.forEach(item=>{
                if(this.#isUN(minRowIdx)){
                    minRowIdx = item.startRowIndex;
                    minColIdx = item.startColIndex;
                }

                if(minRowIdx>item.startRowIndex){
                    minRowIdx = item.startRowIndex;
                    minColIdx = item.startColIndex;
                }
            })
            
            return [minRowIdx,minColIdx]
        }

        return [curInfo?.rowIdx,curInfo?.colIdx]
    }

    #getLeftCurrentSelectedArea = () => {
        let curInfo = this.#utils.get("select").get("leftBodySelectCurrentInfo");
        let selectArray = this.#utils.get("select").get("leftBodySelectArray");

        for(let idx=0;idx<selectArray.length;idx++){
            let sa = selectArray[idx];

            if(curInfo.rowIdx>=sa.startRowIndex && curInfo.rowIdx<=sa.endRowIndex){
                sa["index"] = idx;
                return sa;
            }
        }

        return;
    }

    #getCurrentSelectedArea = () => {
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let selectArray = this.#utils.get("select").get("bodySelectArray")

        for(let idx=0;idx<selectArray.length;idx++){
            let sa = selectArray[idx];

            if(curInfo.rowIdx>=sa.startRowIndex && curInfo.rowIdx<=sa.endRowIndex
            && curInfo.colIdx>=sa.startColIndex && curInfo.colIdx<=sa.endColIndex){
                sa["index"] = idx;
                return sa;
            }
        }

        return;
    }

    #getrowspanInfo = (rowIdx, colName) => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }

        let rowspanNum = 0;

        let startIndex = rowIdx;

        for(let idx=rowIdx-1;idx>=0;idx--){
            if(this.#data.get("showData")[rowIdx][colName] !== this.#data.get("showData")[idx][colName]) break;
            startIndex--;
        }
        
        for(let idx=startIndex;idx<this.#data.get("showData").length;idx++){
            if(this.#data.get("showData")[rowIdx][colName] !== this.#data.get("showData")[idx][colName]) break;
            rowspanNum++;
        }

        return [startIndex,rowspanNum];
    }

    #getFormulaValue = (rowIdx, colName) => {
        let rowId = this.#getIdByShowDataIndex(rowIdx)
        let showOrgRowIdx = this.#getShowOrgDataIndexById(rowId);

        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }

        let value = this.getCellValue(showOrgRowIdx,colIdx);

        if(typeof value === "string" && value?.[0] === "="){
            value = this.#execFormula(value, rowId, colName);
        }

        if(!this.#isUN(this.#columns[colIdx].formula)){
            if(typeof this.#columns[colIdx].formula === "function") return this.#columns[colIdx].formula(value);
            else if(typeof this.#columns[colIdx].formula === "string" && this.#columns[colIdx].formula?.[0] === "=") return this.#execFormula(this.#columns[colIdx].formula, rowId, colName, value)
        }

        return value
    }

    #execFormula = (formula, rowId, colName, value) => {
        if(formula.toString().substring(0,1)!=="=") return formula;
        try {
            return new Function('grid',"return "+this.#getFormulaString(formula, rowId, colName, value))(this);
        } catch (e) {
            console.error(e)
            return "#ERROR"
        }
    }

    #getFormulaString = (formula, rowId, colName, value) => {
        let strFlag = false;
        let fArray = new Array();
        let fStr = "";

        const functionList = ["ROWVALUE","VALUE","CONCAT","SUM","IF",/*"SUMA","EXPR","SUMIF","COUNTIF",*/]
       
        for(let idx=1;idx<formula.length;idx++){
            if(["'",'"',"`"].includes(formula[idx])){
                fArray.push({
                    strFlag : strFlag,
                    string  : fStr,
                    extraString : formula[idx],
                });
                strFlag = !strFlag;
                fStr = "";
            }else if(["(",")",",","+","-","*","/","<",">","="].includes(formula[idx])){
                fArray.push({
                    strFlag : strFlag,
                    string  : fStr,
                    extraString : formula[idx],
                });
                fStr = "";
            }else if(!strFlag){
                if(formula[idx]!==" "){
                    fStr += formula[idx]
                }
            }else{
                fStr += formula[idx]
            }
        }

        if(fStr!=="") fArray.push({
            strFlag : strFlag,
            string  : fStr,
        });

        let fString = ""

        for(let idx=0;idx<fArray.length;idx++){
            let fTarget = fArray[idx];
            let cFlag = false;

            if(functionList.includes(fTarget.string.trim().toUpperCase())){
                fString += "grid.";
            }else{
                cFlag = this.#columnsOption.get("columnName").has(fTarget.string.trim())
            }

            if(cFlag){
                if(!fTarget.strFlag){
                    if(this.#isUN(value) && colName !== fTarget.string) fString += "grid.ROWVALUE(" + rowId + ",`" + colName + "`,`";
                    else fString += `"${value}"`
                }
            }

            if(functionList.includes(fTarget.string.trim().toUpperCase())){
                fString += fTarget.string.toString().toUpperCase();
            }else if(!(cFlag && !fTarget.strFlag && (!this.#isUN(value) || colName === fTarget.string)))
                fString += fTarget.string;

            if(cFlag){
                if(!fTarget.strFlag){
                    if(this.#isUN(value) && colName !== fTarget.string) fString += "`)"
                }
            }
            
            if(fTarget.extraString !== undefined && fTarget.extraString !== null){
                fString += fTarget.extraString;
                if(functionList.includes(fTarget.string.trim().toUpperCase())){
                    fString += rowId + ",`" + colName + "`,"
                }
            }
        }
        //console.log(fString)
        return fString;
    }

    CONCAT(rowId,colName,...str){
        if(str.includes("#ERROR")) return "#ERROR";
        if(str.includes("#NaN")) return "#NaN";
        return str.join("")
    }

    /**
     * 컬럼명만 입력했을 때, 값을 가져오기 위해 만든 것
     */
    ROWVALUE(rowId,colName,...option){
        if(option.includes("#ERROR")) return "#ERROR";
        if(option.includes("#NaN")) return "#NaN";
        if(option.length !== 1) return "#ERROR"
        let showOrgRowIdx = this.#getShowOrgDataIndexById(rowId);
        return this.getCellValue(showOrgRowIdx,option[0]);
    }

    VALUE(rowId,colName,...option){
        if(option.includes("#ERROR")) return "#ERROR";
        if(option.includes("#NaN")) return "#NaN";
        if(option.length !== 2) return "#ERROR"
        return this.getCellValue(option[0],option[1]);
    }

    SUM(rowId,colName,...option){
        // ex) =SUM('COL_1','COL_2','COL_3')

        if(option.includes("#ERROR")) return "#ERROR";
        if(option.includes("#NaN")) return "#NaN";
        let showOrgRowIdx = this.#getShowOrgDataIndexById(rowId);
        let sum = 0;

        for(let idx=0;idx<option.length;idx++){
            if(isNaN(Number(option[idx]))) return "#NaN"
            
            sum += Number(option[idx]);
        }

        return sum
    }

    IF(rowId,colName,...option){
        if(option.includes("#ERROR")) return "#ERROR";
        if(option.includes("#NaN")) return "#NaN";
        if(option.length !== 3) return "#ERROR"

        let condition;

        let trueValue;

        try {
            trueValue = option[1];
        } catch (error) {
            trueValue = his.#execFormula("=" + option[1],rowId,colName);
        }

        let falseValue;

        try {
            falseValue = option[2];
        } catch (error) {
            falseValue = his.#execFormula("=" + option[2],rowId,colName);
        }

        try {
            condition = option[0];
            if(typeof condition === "boolean") return (condition?trueValue:falseValue);
        } catch (error) {
            
        }

        return (this.#execFormula("="+condition,rowId,colName)?trueValue:falseValue);
    }

    #setCellValue = (rowIdx,colName,value, renderYn=true, undoYn=true, undoNumber, redoClearYn=true, undoSelectArray, undoCurInfo) => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }
        
        let showDataRow = this.#getShowDataIndexById(this.#getIdByShowOrgDataIndex(rowIdx));
        let fullDataRow = this.#getFullDataIndexById(this.#getIdByShowOrgDataIndex(rowIdx));
        let orgDataRow = this.#getOrgDataIndexById(this.#getIdByShowOrgDataIndex(rowIdx));

        let showOrgData = this.#data.get("showOrgData")

        let beforeValue = showOrgData[rowIdx][colName];

        let orgSameYn = true;

        let showData = this.#data.get("showData")
        let fullData = this.#data.get("fullData")
        let orgData = this.#data.get("orgData")
        
        if(!this.#isUN(orgData[orgDataRow])){
            if(showOrgData?.[rowIdx]?.["IUDFLAG"] === "I" || showOrgData?.[rowIdx]?.["IUDFLAG"] === "D") orgSameYn = false;
            else{
                for(let [fKey,fValue] of Object.entries(orgData[orgDataRow])){
                    if(typeof fValue === "number" && !isNaN(value) && !this.#isUN(value) && value !== "" && value !== true && value !== false) value = Number(value)
                    if((fKey===colName && fValue !== value) || (fKey!==colName && fValue !== showOrgData?.[rowIdx]?.[fKey])){
                        orgSameYn = false;
                        break;
                    }
                }
            }
        }
        
        if(!this.#isUN(showOrgData?.[rowIdx]?.[colName])){
            if(typeof showOrgData[rowIdx][colName] === "number" && !isNaN(value) && !this.#isUN(value) && value !== "" && value !== true && value !== false) value = Number(value)
            let showOrgIUDFLAG = showOrgData?.[rowIdx]?.["IUDFLAG"] ;
            if(showOrgIUDFLAG !== "I" && showOrgIUDFLAG !== "D" && showOrgData[rowIdx][colName] !== value) showOrgData[rowIdx]["IUDFLAG"] = orgSameYn?"":"U"
            showOrgData[rowIdx][colName] = value;
            this.#data.set("showOrgData",showOrgData)
        }
        
        if(!this.#isUN(showData?.[showDataRow]?.[colName])){
            if(typeof showData[showDataRow][colName] === "number" && !isNaN(value) && !this.#isUN(value) && value !== "" && value !== true && value !== false) value = Number(value)
            if(showData?.[rowIdx]?.["IUDFLAG"] !== "I" && showData?.[showDataRow]?.["IUDFLAG"] !== "D" && showData[showDataRow][colName] !== value) showData[showDataRow]["IUDFLAG"] = orgSameYn?"":"U"
            showData[showDataRow][colName] = value;
            this.#data.set("showData",showData)
        }
        
        if(!this.#isUN(fullData?.[fullDataRow]?.[colName])){
            if(typeof fullData[fullDataRow][colName] === "number" && !isNaN(value) && !this.#isUN(value) && value !== "" && value !== true && value !== false) value = Number(value)
            if(fullData?.[rowIdx]?.["IUDFLAG"] !== "I" && fullData?.[fullDataRow]?.["IUDFLAG"] !== "D" && fullData[fullDataRow][colName] !== value) fullData[fullDataRow]["IUDFLAG"] = orgSameYn?"":"U"
            fullData[fullDataRow][colName] = value;
            this.#data.set("fullData",fullData)
        }

        if(undoYn && beforeValue.toString() !== value.toString()){
            if(this.#isUN(undoNumber)){
                undoNumber = this.#utils.get("undoNumber")+1;
                this.#utils.set("undoNumber",undoNumber)
            }

            let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
            let selectArray = this.#utils.get("select").get("bodySelectArray");

            if(this.#isUN(undoSelectArray)) undoSelectArray = [{
                    deleteYn : false,
                    startRowIndex : rowIdx,
                    endRowIndex : rowIdx,
                    startColIndex : colIdx,
                    endColIndex : colIdx,
                }]

            if(this.#isUN(undoCurInfo)) undoCurInfo = {
                    rowIdx : rowIdx,
                    colIdx : colIdx
                }

            this.#utils.get("undoArray").push({
                "type"          : "data",
                "rowIdx"        : rowIdx,
                "colNm"         : colName,
                "bValue"        : beforeValue,
                "aValue"        : value,
                "undoNumber"    : undoNumber,
                "selectArray"   : undoSelectArray,
                "curInfo"       : undoCurInfo
            })

            if(redoClearYn){
                this.#utils.set("redoArray",new Array())
            }
        }

        if(renderYn === true){
            this.#reRenderGrid({
                selectYn : false
            });
        }
    }

    #removeRow = (rowIdx,renderYn=true,undoYn=true, undoNumber) => {
        if(this.#isUN(rowIdx)){
            console.error("No input first parameter");
            return;
        }

        rowIdx = Number(rowIdx)
        if(isNaN(rowIdx)){
            console.error("First parameter is wrong. (Input number format)");
            return;
        }
        
        if(rowIdx < 0){
            console.error("First parameter is wrong. (Wrong range number)");
            return;
        }
        
        if(rowIdx >= this.#data.get("showData").length){
            console.error("First parameter is wrong. (Wrong range number)");
            return;
        }
        
        /**
         *  데이터 삭제 처리
         */

        let showOrgData = this.#data.get("showOrgData")
        let showData = this.#data.get("showData")
        let fullData = this.#data.get("fullData")
        
        const REMOVE_ID = showOrgData[rowIdx]._id
        
        const SHOW_DATA_INDEX = this.#getShowDataIndexById(REMOVE_ID)
        const FULL_DATA_INDEX = this.#getFullDataIndexById(REMOVE_ID)
        const SHOW_ORG_DATA_INDEX = this.#getShowOrgDataIndexById(REMOVE_ID)

        let rowData = this.#deepCopy(showOrgData[SHOW_ORG_DATA_INDEX]);
        let rowIUDFLAG = rowData?.IUDFLAG??"";
        
        if(renderYn === true) {
            showOrgData.splice(SHOW_ORG_DATA_INDEX,1);
            showData.splice(SHOW_DATA_INDEX,1);
        }else{
            if(showOrgData[SHOW_ORG_DATA_INDEX]["IUDFLAG"] ==="I") {
                showOrgData.splice(SHOW_ORG_DATA_INDEX,1);
                showData.splice(SHOW_DATA_INDEX,1);
            }else{
                showOrgData[SHOW_ORG_DATA_INDEX]["IUDFLAG"] = "D"
                showData[SHOW_DATA_INDEX]["IUDFLAG"] = "D"
            }
        }

        fullData[FULL_DATA_INDEX]["IUDFLAG"] = "D"

        let passedRowCount = this.#utils.get("scroll").get("passedRowCount");
        
        if(renderYn == true && rowIdx<=passedRowCount + Math.min(this.#utils.get("scroll").get("passedRowCount") + Math.min(Math.ceil(this.#utils.get("scroll").get("elHeight")/this.#cell.get("height")),this.#cell.get("height")),this.#data.get("showData").length))
            this.#utils.get("scroll").set("passedRowCount",Math.max(passedRowCount-1,0));

        // select 초기화
        let sa = this.#utils.get("select").get("bodySelectArray");
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
        let saFlag = false;
        
        for(let idx=sa.length-1;idx>=0;idx--){
            let curFlag = false
            if(curInfo.rowIdx>=sa[idx].startRowIndex && curInfo.rowIdx<=sa[idx].endRowIndex
            && curInfo.colIdx>=sa[idx].startColIndex && curInfo.colIdx<=sa[idx].endColIndex) curFlag = true;
            
            if(sa[idx].startRowIndex >= SHOW_DATA_INDEX) sa[idx].startRowIndex--;
            if(sa[idx].endRowIndex >= SHOW_DATA_INDEX) sa[idx].endRowIndex--;
            
            if(sa[idx].startRowIndex < 0 && sa[idx].endRowIndex < 0 || (sa[idx].startRowIndex === sa[idx].endRowIndex && sa[idx].startRowIndex + 1 === SHOW_DATA_INDEX)){
                sa.splice(idx,1)
                if(curFlag) saFlag = true
            }else{
                sa[idx].startRowIndex = Math.max(Math.min(sa[idx].startRowIndex,this.#data.get("showData").length),0);
                sa[idx].endRowIndex = Math.max(Math.min(sa[idx].endRowIndex,this.#data.get("showData").length),0);
            }
        }
        
        this.#utils.get("select").set("bodySelectArray",sa);
        
        if(curInfo?.rowIdx >= SHOW_DATA_INDEX){
            curInfo.rowIdx--;
            if(this.#data.get("showData").length === 0 || (saFlag && curInfo.rowIdx<0)) this.#utils.get("select").set("bodySelectCurrentInfo",null)
            else{ 
                curInfo.rowIdx = Math.max(Math.min(curInfo.rowIdx,this.#data.get("showData").length),0);
                this.#utils.get("select").set("bodySelectCurrentInfo",curInfo)
            }
        }

        //undo 추가
        if(undoYn){
            this.#utils.set("redoArray",new Array())

            if(this.#isUN(undoNumber)){
                undoNumber = this.#utils.get("undoNumber")+1;
                this.#utils.set("undoNumber",undoNumber)
            }

            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());

            this.#utils.get("undoArray").push({
                "type"          : "removeRow",
                "rowIdx"        : rowIdx,
                "data"          : rowData,
                "renderYn"      : renderYn,
                "IUDFLAG"       : rowIUDFLAG,
                "undoNumber"    : undoNumber,
                "selectArray"   : [{
                    deleteYn : false,
                    startRowIndex : rowIdx,
                    endRowIndex : rowIdx,
                    startColIndex : MIN_VISIBLE_COL,
                    endColIndex : MAX_VISIBLE_COL
                }],
                "curInfo"       : {
                    rowIdx : rowIdx,
                    colIdx : MIN_VISIBLE_COL
                },
            })
        }
        
        this.#reRenderGrid();
    }

    #insertRow = (rowIdx,beforeYn = true, data, undoYn=true, undoNumber) => {
        if(this.#isUN(rowIdx)){
            console.error("No input first parameter");
            return;
        }

        rowIdx = Number(rowIdx)
        if(isNaN(rowIdx)){
            console.error("First parameter is wrong. (Input number format)");
            return;
        }
        
        if(rowIdx < 0){
            console.error("First parameter is wrong. (Wrong range number)");
            return;
        }
        
        if(rowIdx >= this.#data.get("showData").length){
            console.error("First parameter is wrong. (Wrong range number)");
            return;
        }

        let insertData = data;

        const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
        const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

        if(this.#isUN(data)){
            insertData = {};

            for(let idx=0;idx<this.#columns.length;idx++){
                const COL_INFO = this.#columns[idx];
                insertData[COL_INFO.name] = "";
            }

            insertData["IUDFLAG"] = "I";
        }

        let maxId = this.#utils.get("maxId");
        insertData["_id"] = maxId
        this.#utils.set("maxId",++maxId)

        let showOrgData = this.#data.get("showOrgData");
        let showData = this.#data.get("showData");
        let fullData = this.#data.get("fullData");
        
        const REMOVE_ID = showOrgData[rowIdx]._id
        
        const FULL_DATA_INDEX = this.#getFullDataIndexById(REMOVE_ID)
        const SHOW_ORG_DATA_INDEX = this.#getShowOrgDataIndexById(REMOVE_ID)

        showOrgData.splice(beforeYn===true?SHOW_ORG_DATA_INDEX:SHOW_ORG_DATA_INDEX+1,0,insertData);
        fullData.splice(beforeYn===true?FULL_DATA_INDEX:FULL_DATA_INDEX+1,0,insertData);

        this.#calcShowData();
        
        const COL_ID = showOrgData[(beforeYn===true?rowIdx:rowIdx+1)]._id
        
        const SHOW_DATA_INDEX = this.#getShowDataIndexById(COL_ID)
        
        this.#utils.get("select").set("bodySelectArray",[{
            startRowIndex : SHOW_DATA_INDEX,
            endRowIndex : SHOW_DATA_INDEX,
            startColIndex : MIN_VISIBLE_COL,
            endColIndex : MAX_VISIBLE_COL,
        }]);

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : SHOW_DATA_INDEX,
            colIdx : MIN_VISIBLE_COL
        })

        //undo 추가
        if(undoYn){
            this.#utils.set("redoArray",new Array())

            if(this.#isUN(undoNumber)){
                undoNumber = this.#utils.get("undoNumber")+1;
                this.#utils.set("undoNumber",undoNumber)
            }

            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());

            this.#utils.get("undoArray").push({
                "type"          : "insertRow",
                "rowIdx"        : rowIdx,
                "beforeYn"      : beforeYn,
                "data"          : data,
                "undoNumber"    : undoNumber,
                "selectArray"   : [{
                    deleteYn : false,
                    startRowIndex : SHOW_DATA_INDEX,
                    endRowIndex : SHOW_DATA_INDEX,
                    startColIndex : MIN_VISIBLE_COL,
                    endColIndex : MAX_VISIBLE_COL
                }],
                "curInfo"       : {
                    rowIdx : SHOW_DATA_INDEX,
                    colIdx : MIN_VISIBLE_COL
                },
            })
        }

        this.#reRenderGrid();
    }

    #removeColumn = (colName, undoYn=true, undoNumber) => {
        let colNI = this.#getColumnNameAndIndex(colName);

        if(this.#isUN(colNI)){
            return;
        }
        
        colName = colNI[0];
        let colIdx = colNI[1];

        let fullData = this.#data.get("fullData")
        let data = {};
        let option = this.#deepCopy(this.#columns[colIdx]);

        for(let idx=0;idx<fullData.length;idx++){
            let rowId = this.#getIdByFullDataIndex(idx);
            data[idx] = fullData[idx][colName];
        }

        this.#deleteColumnMergeInfos(colName)

        let sa = this.#utils.get("select").get("bodySelectArray");
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
        let saFlag = false;

        const NEXT_COL_IDX = this.#columnsOption.get("visibleNextColumnIndex").get(colIdx);
        
        for(let idx=sa.length-1;idx>=0;idx--){
            let curFlag = false
            if(curInfo?.rowIdx>=sa[idx].startRowIndex && curInfo?.rowIdx<=sa[idx].endRowIndex
            && curInfo?.colIdx>=sa[idx].startColIndex && curInfo?.colIdx<=sa[idx].endColIndex) curFlag = true;

            let sOrgCol = sa[idx].startColIndex;
            let eOrgCol = sa[idx].endColIndex;
            
            if(sa[idx].startColIndex > colIdx) sa[idx].startColIndex = sa[idx].startColIndex - 1;
            else if(sa[idx].startColIndex === colIdx) sa[idx].startColIndex = (this.#columnsOption.get("visibleNextColumnIndex").get(sa[idx].startColIndex)??0)-1;

            if(sa[idx].endColIndex > colIdx) sa[idx].endColIndex = sa[idx].endColIndex - 1;
            else if(sa[idx].endColIndex === colIdx) sa[idx].endColIndex = (this.#columnsOption.get("visiblePrevColumnIndex").get(sa[idx].endColIndex)??-1);
            
            if(sa[idx].startColIndex < 0 && sa[idx].endColIndex < 0 || (sOrgCol === eOrgCol && sOrgCol === colIdx)){
                sa.splice(idx,1)
                if(curFlag) saFlag = true
            }
        }

        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");

        let START_COL_INDEX, END_COL_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  

        START_COL_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_COL_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_COL_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_COL_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_COL_INDEX]+columnWidth[END_COL_INDEX]-beforeSum[START_COL_INDEX];

        START_COL_INDEX = Math.max(Math.min(START_COL_INDEX,COL_TOTAL_COUNT),0)??0;
        END_COL_INDEX = Math.max(Math.min(END_COL_INDEX,COL_TOTAL_COUNT),0);

        let LAST_COL_FLAG = (END_COL_INDEX === COL_TOTAL_COUNT && this.#columnsOption.get("visibleColIndex").get(START_COL_INDEX) === this.#utils.get("scroll").get("scrollColCount"))

        let passedColCount = this.#utils.get("scroll").get("passedColCount"); 

        if(LAST_COL_FLAG) this.#utils.get("scroll").set("passedColCount",Math.max(passedColCount-1,0));

        this.#columns.splice(colIdx,1);    
        
        this.#setColumnsOption();

        // select 초기화
        
        const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

        for(let idx=sa.length-1;idx>=0;idx--){
            sa[idx].startColIndex = Math.max(Math.min(sa[idx].startColIndex,MAX_VISIBLE_COL),0);
            sa[idx].endColIndex = Math.max(Math.min(sa[idx].endColIndex,MAX_VISIBLE_COL),0);
        }
        
        this.#utils.get("select").set("bodySelectArray",sa);

        if(!this.#isUN(curInfo)){
            if(curInfo.colIdx > colIdx){
                curInfo.colIdx = curInfo.colIdx - 1;
                if(saFlag || this.#isUN(curInfo.colIdx)) this.#utils.get("select").set("bodySelectCurrentInfo",null)
                else{ 
                    curInfo.colIdx = Math.max(Math.min(curInfo.colIdx,MAX_VISIBLE_COL),0);
                    this.#utils.get("select").set("bodySelectCurrentInfo",curInfo)
                }
            }else if(curInfo.colIdx === colIdx){
                curInfo.colIdx = this.#isUN(NEXT_COL_IDX)?MAX_VISIBLE_COL:(NEXT_COL_IDX - 1);


                
                //console.log(saFlag,curInfo.colIdx,NEXT_COL_IDX)
                if(saFlag || this.#isUN(curInfo.colIdx)) this.#utils.get("select").set("bodySelectCurrentInfo",null)
                else{ 
                    curInfo.colIdx = Math.max(Math.min(curInfo.colIdx,MAX_VISIBLE_COL),0);
                    this.#utils.get("select").set("bodySelectCurrentInfo",curInfo)
                }
            }
        }
        
        

        //this.#utils.get("select").set("bodySelectArray",new Array());
        //this.#utils.get("select").set("bodySelectCurrentInfo",null)

        //undo 추가
        if(undoYn){
            this.#utils.set("redoArray",new Array())

            if(this.#isUN(undoNumber)){
                undoNumber = this.#utils.get("undoNumber")+1;
                this.#utils.set("undoNumber",undoNumber)
            }

            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());

            this.#utils.get("undoArray").push({
                "type"          : "removeColumn",
                "colName"       : colName,
                "colIdx"        : colIdx,
                "data"          : data,
                "option"        : option,
                "undoNumber"    : undoNumber,
                "selectArray"   : [{
                    deleteYn : false,
                    startRowIndex : 0,
                    endRowIndex : this.#data.get("showOrgData").length,
                    startColIndex : colIdx,
                    endColIndex : colIdx
                }],
                "curInfo"       : {
                    rowIdx : 0,
                    colIdx : colIdx
                },
            })
        }
        
        this.#reRenderGrid();
    }

    #insertColumn = (colName,colInfo,beforeYn=true, data, undoYn=true, undoNumber) => {
        if(this.#isUN(colInfo.name)){
            console.error("No column name!");
            return;
        }

        if(this.#isUN(colInfo.title)){
            colInfo.title = ""
        }

        if(this.#isUN(colInfo.width)){
            colInfo.width = 100
        }

        if(this.#columns.filter(row=>{return row.name === colInfo.name}).length>0){
            console.error("Duplicate column name!");
            return;
        }
        
        let colIdx;

        if(this.#columns.length===0){
            this.#columns.splice(colIdx,0,colInfo);
        }else{
            let colNI = this.#getColumnNameAndIndex(colName);
            if(this.#isUN(colNI)){
                return;
            }

            colName = colNI[0];
            colIdx = colNI[1];

            if(this.#columns[colIdx].fixed === true) colInfo.fixed = true;

            this.#columns.splice(beforeYn===true?colIdx:colIdx+1,0,colInfo)
        }

        this.#setColumnsOption();
        
        let showOrgData = this.#data.get("showOrgData");
        for(let idx=0;idx<showOrgData.length;idx++){
            let rowId = this.#getIdByShowOrgDataIndex(idx);
            showOrgData[idx][colInfo.name] = (this.#isUN(data)?"":data[rowId]);
        }

        let fullData = this.#data.get("fullData");
        for(let idx=0;idx<fullData.length;idx++){
            let rowId = this.#getIdByFullDataIndex(idx);
            fullData[idx][colInfo.name] = (this.#isUN(data)?"":data[rowId]);
        }
        
        this.#calcShowData();

        //select 처리
        
        const newColIdx = (beforeYn===true?(colIdx??0):(colIdx??0)+1)
        
        let passedRowCount = this.#utils.get("scroll").get("passedRowCount"); 
        
        this.#utils.get("select").set("bodySelectArray",[{
            startRowIndex : 0,
            endRowIndex : this.#data.get("showData").length-1,
            startColIndex : newColIdx,
            endColIndex : newColIdx,
        }]);
        
        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : passedRowCount,
            colIdx : newColIdx
        })

        //undo 추가
        if(undoYn){
            this.#utils.set("redoArray",new Array())

            if(this.#isUN(undoNumber)){
                undoNumber = this.#utils.get("undoNumber")+1;
                this.#utils.set("undoNumber",undoNumber)
            }

            this.#utils.get("undoArray").push({
                "type"          : "insertColumn",
                "colName"       : colName,
                "colIdx"        : colIdx,
                "beforeYn"      : beforeYn,
                "newColName"    : colInfo.name,
                "newColIdx"     : newColIdx,
                "data"          : data,
                "option"        : colInfo,
                "undoNumber"    : undoNumber,
                "selectArray"   : [{
                    deleteYn : false,
                    startRowIndex : 0,
                    endRowIndex : this.#data.get("showOrgData").length,
                    startColIndex : newColIdx,
                    endColIndex : newColIdx
                }],
                "curInfo"       : {
                    rowIdx : 0,
                    colIdx : newColIdx
                },
            })
        }

        this.#reRenderGrid();

        //this.goToColumn(newColIdx);
    }


    /**
     * Event
     */

     #horizontalThumbMouseDown = e => {
        if (event.cancelable) e.preventDefault();
        e.stopPropagation();
        this.#utils.set("horizontalThumbMoveFlag",true);
        this.el.get("scroll").get("horizontal").get("thumb").classList.add("active")
        
        this.#utils.get("horizontalThumbInfo").set("clientX",(e.type === "mousedown" ? e.clientX : e.touches[0].clientX));
        this.#utils.get("horizontalThumbInfo").set("passedColCount",this.#utils.get("scroll").get("passedColCount"));
    }

    #verticalThumbMouseDown = e => {
        if (event.cancelable) e.preventDefault();
        e.stopPropagation();
        this.#utils.set("verticalThumbMoveFlag",true);
        this.el.get("scroll").get("vertical").get("thumb").classList.add("active")
        
        this.#utils.get("verticalThumbInfo").set("clientY",(e.type === "mousedown" ? e.clientY : e.touches[0].clientY));
        this.#utils.get("verticalThumbInfo").set("passedRowCount",this.#utils.get("scroll").get("passedRowCount"));

        document.documentElement.classList.add("hjs-grid-overflowscroll-behavior-contain")
    }

    #documentElementMouseMove = e => {
        if(this.#utils.get("verticalThumbMoveFlag") === true){ 
            e.preventDefault();

            this.#removeChildAll(this.el.get("middleBodyContextMenu"))
            this.el.get("middleBodyContextMenu").style.opacity = "0"
            
            let clientY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;
            let diffY = clientY - this.#utils.get("verticalThumbInfo").get("clientY");

            const V_ONE_SCROLL = this.#utils.get("scroll").get("vOneScroll");

            const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");

            const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")

            const diffScrollY = Math.max(Math.min(Math.abs(Math.floor(diffY/V_ONE_SCROLL)),SCROLL_ROW_COUNT),0);

            let PASSED_ROW_COUNT = this.#utils.get("verticalThumbInfo").get("passedRowCount") + ((diffY>0)?diffScrollY:(diffScrollY*-1))
            PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT,SCROLL_ROW_COUNT),0);

            this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT)  

            let scrollY = V_SCROLL_BAR_PADDING + PASSED_ROW_COUNT * V_ONE_SCROLL

            this.el.get("scroll").get("vertical").get("thumb").style.top = scrollY + "px"
        }

        if(this.#utils.get("horizontalThumbMoveFlag") === true){ 
            e.preventDefault();
            this.#removeChildAll(this.el.get("middleBodyContextMenu"))
            this.el.get("middleBodyContextMenu").style.opacity = "0"
            
            let clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
            
            let diffX = clientX - this.#utils.get("horizontalThumbInfo").get("clientX");

            const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");

            const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");

            const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")

            const diffScrollX = Math.max(Math.min(Math.abs(Math.floor(diffX/H_ONE_SCROLL)),SCROLL_COL_COUNT),0);

            let PASSED_COL_COUNT = this.#utils.get("horizontalThumbInfo").get("passedColCount") + ((diffX>0)?diffScrollX:(diffScrollX*-1))
            PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT,SCROLL_COL_COUNT),0);

            this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT)  

            let scrollX = H_SCROLL_BAR_PADDING + PASSED_COL_COUNT * H_ONE_SCROLL

            //console.log(diffX,H_ONE_SCROLL,PASSED_COL_COUNT)

            this.el.get("scroll").get("horizontal").get("thumb").style.left = scrollX + "px"
        }

        if(this.#utils.get("verticalThumbMoveFlag") === true
            || this.#utils.get("horizontalThumbMoveFlag") === true) this.#renderGrid();
    }

    #documentElementMouseUp = e => {
        if(this.#utils.get("verticalThumbMoveFlag") === true){
            
            this.el.get("scroll").get("vertical").get("thumb").classList.remove("active")
            document.documentElement.classList.remove("hjs-grid-overflowscroll-behavior-contain")
        }
        
        this.#utils.set("verticalThumbMoveFlag",false)

        if(this.#utils.get("horizontalThumbMoveFlag") === true){
            
            this.el.get("scroll").get("horizontal").get("thumb").classList.remove("active")
            document.documentElement.classList.remove("hjs-grid-overflowscroll-behavior-contain")
        }

        this.#utils.set("horizontalThumbMoveFlag",false)
        
        /*clearInterval(intervalId);
        clearInterval(intervalId2);*/
    }

    #gridElementWheel = e => {
        if(!this.#isUN(e.target.closest(".hjs-grid-filter-popup"))) return;
        if(e.target.classList.contains("hjs-grid-editor")) return;

        this.#removeChildAll(this.el.get("middleBodyContextMenu"))
        this.el.get("middleBodyContextMenu").style.opacity = "0"
        
        const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")
        const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")
        const V_THUMB_HEIGHT = this.#utils.get("scroll").get("vThumbHeight");
        const V_TRACK_HEIGHT = this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().height;
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
        const V_ONE_SCROLL = this.#utils.get("scroll").get("vOneScroll");

        const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
        const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");                

        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount")
        let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount")

        // 맨 상위, 맨 하위가 아니면 스크롤 막음
        if(!((e.deltaY < 0 && PASSED_ROW_COUNT === 0) || (e.deltaY > 0 && PASSED_ROW_COUNT === SCROLL_ROW_COUNT))) e.preventDefault();

        if(e.deltaY !== 0){
            if(e.deltaY > 0){
                PASSED_ROW_COUNT += 1
            }
            else{
                PASSED_ROW_COUNT -= 1
            }
            PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT,SCROLL_ROW_COUNT),0)

            this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT)

            let scrollY = V_SCROLL_BAR_PADDING + PASSED_ROW_COUNT * V_ONE_SCROLL

            this.el.get("scroll").get("vertical").get("thumb").style.top = scrollY + "px"
        }
        
        if(e.deltaX !== 0){
            if(e.deltaX > 0){
                PASSED_COL_COUNT += Math.round((e.deltaX)/100)
            }
            else{
                PASSED_COL_COUNT += Math.round((e.deltaX)/100)
            }
            PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT,SCROLL_COL_COUNT),0)
            
            this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT)

            let scrollX = H_SCROLL_BAR_PADDING + PASSED_COL_COUNT * H_ONE_SCROLL

            this.el.get("scroll").get("horizontal").get("thumb").style.left = scrollX + "px"
        }

        if(e.deltaX !== 0 || e.deltaY !== 0){
            this.#renderGrid()
        }

        if(this.#utils.get("select").get("leftBodySelectFlag") === true){
            this.#gridLeftCellMouseMove(e)
        }

        if(this.#utils.get("select").get("bodySelectFlag") === true){
            this.#gridCellMouseMove(e)
        }
    }

    #gridLeftCellMouseDown = (e) => {
        if(e.target.classList.contains("hjs-grid-selected-handle")) return;
        const RIGHT_FLAG = (e.button === 2)||(e.which === 3);
        
        if(!(e.target.classList.contains("hjs-grid-editor") && e.target.style.opacity !== "0")){
            e.preventDefault(); 
            this.#utils.get("select").set("leftBodySelectYn",true);
            this.el.get("leftBody").scrollLeft = this.#utils.get("scroll").get("scrollLeft")

            let doubleClickYn = false;

            if(this.#utils.get("current").get("leftFirstClick") === false && !RIGHT_FLAG){
                this.#utils.get("current").set("leftFirstClick",true)
                this.#utils.get("current").set("leftFirstClickTarget",e.target)
                if(!this.#isUN(this.el.get("leftBodySelectCurrentEditor"))){
                    this.el.get("leftBodySelectCurrentEditor").style.opacity = "0";
                }
                setTimeout(()=>{
                    this.#utils.get("current").set("leftFirstClick",false);
                },200)
            }else if(this.#utils.get("current").get("leftFirstClick") === true && !RIGHT_FLAG){
                doubleClickYn = true
            }
            
            this.#utils.get("select").set("target",e.target);
            let bodyEl = this.el.get("leftBody");
            let clientX = Math.round((e.type==="touchstart"?e.touches[0].clientX:e.clientX)-bodyEl.getBoundingClientRect().x+1);
            let clientY = Math.round((e.type==="touchstart"?e.touches[0].clientY:e.clientY)-bodyEl.getBoundingClientRect().y);
            let radiusX = e.type==="touchstart"?e.touches[0].radiusX:0
            let radiusY = e.type==="touchstart"?e.touches[0].radiusY:0
    
            let rowIdx = ((this.el.get("leftBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1) + Math.floor((clientY+this.el.get("leftBody").scrollTop)/this.#cell.get("height"));
            rowIdx=Math.min(rowIdx,this.#data.get("showData").length-1)
    
            let passedX;
            if(this.el.get("leftBody").scrollLeft === 0) passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"))]
            else passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")-1)]
    
            let colIdx;
            let checkboxWidth = (this.#isUN(this.#option.get("left")?.checkbox))?0:this.#option.get("left").checkbox?.width??42;
            let rowNumberWidth = (this.#isUN(this.#option.get("left")?.rowNumber))?0:this.#option.get("left").rowNumber?.width??50;
            let rowStatusWidth = (this.#isUN(this.#option.get("left")?.rowStatus))?0:this.#option.get("left").rowStatus?.width??50;
    
            let checkboxFlag = !this.#isUN(this.#left.get("checkbox"));
            let rowNumberFlag = !this.#isUN(this.#left.get("rowNumber"));
            let rowStatusFlag = !this.#isUN(this.#left.get("rowStatus"));
    
            let orderArray = this.#isUN(this.#left.get("order"))?["checkbox","rowNumber","rowStatus"]:this.#left.get("order");
    
            let leftWidthSum = 0;
            let leftNum = 0;
            
            for(let idx=0;idx<orderArray.length;idx++){
                let order = orderArray[idx];
    
                if(order === "checkbox" && checkboxFlag){
                    leftWidthSum += checkboxWidth
                    leftNum++;
                }else if(order === "rowNumber" && rowNumberFlag){
                    leftWidthSum += rowNumberWidth
                    leftNum++;
                }else if(order === "rowStatus" && rowStatusFlag){
                    leftWidthSum += rowStatusWidth
                    leftNum++;
                }
                
                if(clientX-1<leftWidthSum){
                    colIdx = 0-leftNum;
                    break;
                }
            }
            
            if(this.#isUN(colIdx)){
                colIdx = this.#columnsOption.get("leftColumnBeforeSum").filter(item=>item<clientX-leftWidthSum+this.el.get("middleBody").scrollLeft).length-1;
            }

            if(doubleClickYn){
                if(colIdx>=0) this.#createEditor(rowIdx,colIdx,true,leftWidthSum);
            }

            if(colIdx<0){
                if(orderArray[(colIdx*-1)-1] === "checkbox" && checkboxFlag){
                    // left checkbox
                    let clickX = bodyEl.getBoundingClientRect().x+clientX;
                    let clickY = bodyEl.getBoundingClientRect().y+clientY;

                    let checkInfo = this.el.get("checkbox").get(rowIdx).getBoundingClientRect();
                    let checkX = checkInfo.left;
                    let checkY = checkInfo.top;
                    let checkWidth = checkInfo.width;
                    let checkHeight = checkInfo.height;
                    console.log(e.touches[0])
                    if(checkX-radiusX<=clickX && clickX <= checkX+radiusX+checkWidth && checkY-radiusY <= clickY && clickY <= checkY + + radiusY + checkHeight){
                        let checked = this.el.get("checkbox").get(rowIdx).checked;
                        this.el.get("checkbox").get(rowIdx).checked = !checked
                        if(checked) this.#utils.get("checkedRow").delete(this.#getIdByShowDataIndex(rowIdx));
                        else this.#utils.get("checkedRow").set(this.#getIdByShowDataIndex(rowIdx),true);
                        
                        this.el.get("checkboxAll").checked = (this.#utils.get("checkedRow").keys().toArray().length === this.#data.get("showData").length) 
                        
                        this.#reRenderGrid();
                    }
                }
            }

            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

            this.#utils.get("select").set("leftBodySelectFlag",true)
            this.#utils.get("select").set("leftBodySelectCtrlFlag",e.ctrlKey);
    
            let deleteYn = (!e.ctrlKey)?false:this.#getLeftSelectDeleteYn(rowIdx,colIdx);
            
            if(!RIGHT_FLAG){
                if(e.type==="mousedown" && !e.ctrlKey){
                    if(e.type==="mousedown" && e.shiftKey){
                        let curInfo = this.#utils.get("select").get("leftBodySelectCurrentInfo");
                        let sa = this.#getLeftCurrentSelectedArea();
                        let selectArray = this.#utils.get("select").get("leftBodySelectArray");
    
                        if(!this.#isUN(sa)){
                            selectArray[sa.index].startRowIndex = Math.min(curInfo.rowIdx,rowIdx)
                            selectArray[sa.index].endRowIndex = Math.max(curInfo.rowIdx,rowIdx)
                            selectArray[sa.index].startColIndex = MIN_VISIBLE_COL
                            selectArray[sa.index].endColIndex = MAX_VISIBLE_COL
    
                            this.#utils.get("select").set("leftBodySelectArray",selectArray);
                        }                               
                    }else this.#utils.get("select").set("leftBodySelectArray",new Array());
                }else{
                    if(e.type==="touchstart"){
                        let curInfo = this.#utils.get("select").get("leftBodySelectCurrentInfo");
                        
                        let selectArray = this.#utils.get("select").get("leftBodySelectArray");
                        let sa = false;

                        for(let idx=0;idx<selectArray.length;idx++){
                            if(selectArray[idx].startRowIndex<=rowIdx && rowIdx<=selectArray[idx].endRowIndex) sa = true;
                            break;
                        }

                        this.#utils.get("select").set("leftBodySelectArray",[{
                            deleteYn : deleteYn,
                            startRowIndex : rowIdx,
                            endRowIndex : rowIdx,
                            startColIndex : MIN_VISIBLE_COL,
                            endColIndex : MAX_VISIBLE_COL
                        }]);
                        
                        if(!sa) this.#utils.get("select").set("leftBodySelectFlag",false)
                        else this.#utils.get("select").set("leftBodySelectArray",new Array());
                    }
                }
            }
    
            if(deleteYn === false){
                if(!e.shiftKey){
                    this.#utils.get("select").set("leftBodySelectCurrentInfo",{
                        rowIdx : rowIdx,
                        colIdx : colIdx,
                    });

                    this.#utils.get("select").set("bodySelectCurrentInfo",{
                        rowIdx : rowIdx,
                        colIdx : MIN_VISIBLE_COL,
                    });
                }
            }
    
            let rightClear = false;
            let sa = this.#getLeftCurrentSelectedArea();
            let selectArray = this.#utils.get("select").get("leftBodySelectArray")
    
            this.el.get("middleBodyContextMenu").style.opacity = "0"

            if(RIGHT_FLAG && colIdx >= 0){
                // right click
                if(this.#isUN(sa)){
                    this.#utils.get("select").set("leftBodySelectArray",new Array());
                }else rightClear = true;
                this.el.get("leftBodyContextMenu").style.opacity = "1"
            }else{
                this.#removeChildAll(this.el.get("leftBodyContextMenu"))
                this.el.get("leftBodyContextMenu").style.opacity = "0"
            }
    
            if(!e.shiftKey){
                if(!rightClear){
                    this.#utils.get("select").set("leftBodySelectInfo",{
                        deleteYn : deleteYn,
                        startRowIndex : rowIdx,
                        endRowIndex : rowIdx,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    });
                }else{
                    this.#utils.get("select").set("leftBodySelectInfo",null);
                }
            }
            
    
            if(!e.shiftKey && !rightClear) this.#utils.get("select").set("leftBodySelectStartInfo",{
                rowIdx : rowIdx,
                colIdx : colIdx,
            });
    
            // if(RIGHT_FLAG && colIdx >= 0){
            //     // right click
            //     e.preventDefault();
            //     const CONTEXT_MENU_TARGET = this.el.get("leftBodyContextMenu");
    
            //     let cmMenuArray = new Array();
    
            //     let ccpArray = new Array();
            //     // cut
            //     ccpArray.push({
            //         title : this.#getMessage("rc001"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 if(this.#ctrlCKeyFunction("002")!==false) this.#deleteKeyFunction(rowIdx,colIdx);
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     // copy
            //     ccpArray.push({
            //         title :this.#getMessage("rc002"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 this.#ctrlCKeyFunction("001")
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     // paste
            //     ccpArray.push({
            //         title : this.#getMessage("rc003"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 console.log(this.#pasteText());
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     cmMenuArray.push(ccpArray);
    
            //     let urArray = new Array();
            //     // undo
            //     urArray.push({
            //         title : this.#getMessage("rc011"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 this.#ctrlZKeyFunction(e);
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     // redo
            //     urArray.push({
            //         title : this.#getMessage("rc012"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 this.#ctrlYKeyFunction(e);
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     cmMenuArray.push(urArray);
    
            //     let selArray = new Array();
            //     // select all
            //     selArray.push({
            //         title : this.#getMessage("rc004"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 this.#ctrlAKeyFunction(e);
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     // delete all
            //     selArray.push({
            //         title : this.#getMessage("rc005"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 this.#deleteKeyFunction(rowIdx,colIdx);
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     cmMenuArray.push(selArray);
    
            //     let rowArray = new Array();
            //     // 행 삽입
    
            //     rowArray.push({
            //         title :this.#getMessage("rc006"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //             }
            //         },
            //         childs : [
            //             [
            //                 {
            //                     title : this.#getMessage("rc006-1"),
            //                     events : {
            //                         mousedown : (e) => {
            //                             e.preventDefault();
            //                             if(this.#isUN(sa)){
            //                                 let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
            //                                 this.#insertRow(showOrgCurRowIdx,true)
            //                             }else if(selectArray.length > 1) return alert(this.#getMessage("rc006-3"));
            //                             else{
            //                                 let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(sa.startRowIndex));
                                            
            //                                 let undoNumber = this.#utils.get("undoNumber")+1;
            //                                 this.#utils.set("undoNumber",undoNumber)
    
            //                                 for(let idx=sa.startRowIndex;idx<=sa.endRowIndex;idx++){
            //                                     this.#insertRow(showOrgCurRowIdx,true,null,true,undoNumber)
            //                                 }
    
            //                                 const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            //                                 const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
    
            //                                 this.#utils.get("undoArray").push({
            //                                     "type"          : "selectRedo",
            //                                     "undoNumber"    : undoNumber,
            //                                     "selectArray"   : [{
            //                                         deleteYn : false,
            //                                         startRowIndex : sa.startRowIndex,
            //                                         endRowIndex : sa.endRowIndex,
            //                                         startColIndex : MIN_VISIBLE_COL,
            //                                         endColIndex : MAX_VISIBLE_COL
            //                                     }],
            //                                     "curInfo"       : {
            //                                         rowIdx : selectArray?.[0]?.startRowIndex,
            //                                         colIdx : MIN_VISIBLE_COL
            //                                     }
            //                                 })
            //                             }
                                        
            //                             this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                             CONTEXT_MENU_TARGET.style.opacity = "0"
            //                         }
            //                     }
            //                 },
            //                 {
            //                     title : this.#getMessage("rc006-2"),
            //                     events : {
            //                         mousedown : (e) => {
            //                             e.preventDefault();
            //                             if(this.#isUN(sa)){
            //                                 let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
            //                                 this.#insertRow(showOrgCurRowIdx,false)
            //                             }else if(selectArray.length > 1) return alert(this.#getMessage("rc006-3"));
            //                             else{
            //                                 let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(sa.endRowIndex))
    
            //                                 let undoNumber = this.#utils.get("undoNumber")+1;
            //                                 this.#utils.set("undoNumber",undoNumber)
    
            //                                 let insertCnt = 0;
    
            //                                 for(let idx=sa.startRowIndex;idx<=sa.endRowIndex;idx++){
            //                                     this.#insertRow(showOrgCurRowIdx,false,null,true,undoNumber)
            //                                     insertCnt++;
            //                                 }
    
            //                                 const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            //                                 const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
    
            //                                 this.#utils.get("undoArray").push({
            //                                     "type"          : "selectRedo",
            //                                     "undoNumber"    : undoNumber,
            //                                     "selectArray"   : [{
            //                                         deleteYn : false,
            //                                         startRowIndex : sa.startRowIndex+insertCnt,
            //                                         endRowIndex : sa.endRowIndex+insertCnt,
            //                                         startColIndex : MIN_VISIBLE_COL,
            //                                         endColIndex : MAX_VISIBLE_COL
            //                                     }],
            //                                     "curInfo"       : {
            //                                         rowIdx : selectArray?.[0]?.startRowIndex,
            //                                         colIdx : MIN_VISIBLE_COL
            //                                     }
            //                                 })
            //                             }
            //                             this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                             CONTEXT_MENU_TARGET.style.opacity = "0"
            //                         }
            //                     }
            //                 }
            //             ]
            //         ]
            //     })
    
            //     // 행 삭제
            //     rowArray.push({
            //         title : this.#getMessage("rc007"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
            //                 if(this.#isUN(sa)){
            //                     let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
            //                     this.#removeRow(showOrgCurRowIdx)
            //                 }else{
            //                     let removeRowArray = {};
    
            //                     let undoNumber = this.#utils.get("undoNumber")+1;
            //                     this.#utils.set("undoNumber",undoNumber)
    
            //                     let curSelectArray = this.#deepCopy(selectArray)
    
            //                     const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            //                     const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
    
            //                     for(let i=0;i<selectArray.length;i++){
            //                         let sea = selectArray[i];
            //                         let endRowIndex = sea.endRowIndex;
            //                         let startRowIndex = sea.startRowIndex
            //                         for(let idx=endRowIndex;idx>=startRowIndex;idx--){
            //                             let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(idx))
            //                             this.#removeRow(showOrgCurRowIdx,true,true,undoNumber)
            //                         }
    
            //                         curSelectArray[i].startColIndex = MIN_VISIBLE_COL;
            //                         curSelectArray[i].endColIndex = MAX_VISIBLE_COL;
            //                     }
    
            //                     this.#utils.get("undoArray").push({
            //                         "type"          : "selectUndo",
            //                         "undoNumber"    : undoNumber,
            //                         "selectArray"   : curSelectArray,
            //                         "curInfo"       : {
            //                             rowIdx : selectArray?.[0]?.startRowIndex,
            //                             colIdx : selectArray?.[0]?.startColIndex
            //                         }
            //                     })
            //                 }
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     cmMenuArray.push(rowArray);
    
            //     let colArray = new Array();
            //     //열 삽입
                
            //     if(this.#isUN(sa) || (!this.#isUN(sa) && sa?.startColIndex === sa?.endColIndex && sa?.startColIndex === colIdx && selectArray.length === 1)){
            //         colArray.push({
            //             title : this.#getMessage("rc013"),
            //             childs : [
            //                 [
            //                     {
            //                         title : this.#getMessage("rc013-1"),
            //                         childs : [
            //                             [
            //                                 {
            //                                     customRenderer : () => { 
            //                                         let colNm = this.#getColumnNameAndIndex(colIdx)[0]
            //                                         return this.#createInsertColumnOption(colNm,false);
            //                                     }
            //                                 }
            //                             ]
            //                         ]
            //                     },
            //                     {
            //                         title : this.#getMessage("rc013-2"),
            //                         childs : [
            //                             [
            //                                 {
            //                                     customRenderer : () => { 
            //                                         let colNm = this.#getColumnNameAndIndex(colIdx)[0]
            //                                         return this.#createInsertColumnOption(colNm,true);
            //                                     }
            //                                 }
            //                             ]
            //                         ]
            //                     }
            //                 ]
            //             ]
            //         })
            //     }
                
    
            //     //열 삭제
            //     colArray.push({
            //         title : this.#getMessage("rc008"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();
    
            //                 if(this.#isUN(sa)){
            //                     let colNm = this.#getColumnNameAndIndex(colIdx)[0]
            //                     this.removeColumn(colNm)
            //                 }else{
            //                     let undoNumber = this.#utils.get("undoNumber")+1;
            //                     this.#utils.set("undoNumber",undoNumber)
    
            //                     let curSelectArray = this.#deepCopy(selectArray)
                                
            //                     for(let i=0;i<selectArray.length;i++){
            //                         let sea = selectArray[i];
            //                         for(let idx=sea.endColIndex;idx>=sea.startColIndex;idx--){
            //                             if(this.#columns[idx].hidden === true || this.#columns[idx].fixed === true) continue;
            //                             this.#removeColumn(idx,true,undoNumber)
            //                         }
    
            //                         curSelectArray[i].startRowIndex = 0;
            //                         curSelectArray[i].endRowIndex = this.#data.get("showOrgData").length-1;
            //                     }
    
            //                     this.#utils.get("undoArray").push({
            //                         "type"          : "selectUndo",
            //                         "undoNumber"    : undoNumber,
            //                         "selectArray"   : curSelectArray,
            //                         "curInfo"       : {
            //                             rowIdx : 0,
            //                             colIdx : selectArray?.[0]?.startColIndex
            //                         }
            //                     })
            //                 }
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     // 열 숨기기
            //     colArray.push({
            //         title : this.#getMessage("rc009"),
            //         events : {
            //             mousedown : (e) => {
            //                 e.preventDefault();   
    
            //                 if(this.#isUN(sa)){
            //                     let colNm = this.#getColumnNameAndIndex(colIdx)[0]
            //                     this.hideColumn(colNm)
            //                 }else{
            //                     let undoNumber = this.#utils.get("undoNumber")+1;
            //                     this.#utils.set("undoNumber",undoNumber)
    
            //                     let curSelectArray = this.#deepCopy(selectArray)
    
            //                     for(let i=0;i<selectArray.length;i++){
            //                         let sea = selectArray[i];
            //                         for(let idx=sea.endColIndex;idx>=sea.startColIndex;idx--){
            //                             if(this.#columns[idx].hidden === true || this.#columns[idx].fixed === true) continue;
            //                             this.#showHideColumn(idx,true,true,undoNumber)
            //                         }
    
            //                         curSelectArray[i].startRowIndex = 0;
            //                         curSelectArray[i].endRowIndex = this.#data.get("showOrgData").length-1;
            //                     }
    
            //                     this.#utils.get("undoArray").push({
            //                         "type"          : "selectUndo",
            //                         "undoNumber"    : undoNumber,
            //                         "selectArray"   : curSelectArray,
            //                         "curInfo"       : {
            //                             rowIdx : 0,
            //                             colIdx : selectArray?.[0]?.startColIndex
            //                         }
            //                     })
            //                 }
                            
            //                 this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                 CONTEXT_MENU_TARGET.style.opacity = "0"
            //             }
            //         }
            //     })
    
            //     // 숨긴 열 보이기
            //     if(!this.#isUN(sa) && selectArray.length === 1){
            //         let hiddenFlag = false;
            //         for(let idx=sa.endColIndex;idx>=sa.startColIndex;idx--){
            //             if(this.#columns[idx].fixed === true) continue;
            //             if(this.#columns[idx].hidden === true){
            //                 hiddenFlag = true;
            //                 break;
            //             }
            //         }
    
            //         if(hiddenFlag){
            //             colArray.push({
            //                 title : this.#getMessage("rc010"),
            //                 events : {
            //                     mousedown : (e) => {
            //                         e.preventDefault();   
    
            //                         if(this.#isUN(sa)){
            //                             let colNm = this.#getColumnNameAndIndex(colIdx)[0]
            //                             this.showColumn(colNm)
            //                         }else{
            //                             if(selectArray.length > 1) return alert(this.#getMessage("rc010-1"));
                                        
            //                             let undoNumber = this.#utils.get("undoNumber")+1;
            //                             this.#utils.set("undoNumber",undoNumber)
    
            //                             let curSelectArray = this.#deepCopy(selectArray)
    
            //                             let minCol = sa.startColIndex;
            //                             let maxCol = sa.endColIndex;
    
            //                             for(let idx=sa.endColIndex;idx>=sa.startColIndex;idx--){
            //                                 if(this.#columns[idx].fixed === true || idx === sa.endColIndex || idx === sa.startColIndex) continue;
            //                                 minCol = Math.min(minCol,idx);
            //                                 this.#showHideColumn(idx,false,true,undoNumber)
            //                             }
            //                             curSelectArray[0].startRowIndex = 0;
            //                             curSelectArray[0].endRowIndex = this.#data.get("showOrgData").length-1;
    
            //                             this.#utils.get("undoArray").push({
            //                                 "type"          : "selectUndo",
            //                                 "undoNumber"    : undoNumber,
            //                                 "selectArray"   : curSelectArray,
            //                                 "curInfo"       : {
            //                                     rowIdx : 0,
            //                                     colIdx : minCol
            //                                 }
            //                             })
            //                         }
                                    
            //                         this.#removeChildAll(CONTEXT_MENU_TARGET)
            //                         CONTEXT_MENU_TARGET.style.opacity = "0"
            //                     }
            //                 }
            //             })
            //         }
            //     }
    
            //     cmMenuArray.push(colArray);
    
            //     new HjsContextMenu({
            //         el : CONTEXT_MENU_TARGET,
            //         data : cmMenuArray
            //     })                        
    
            //     let tableInfo = this.el.get("leftBodyTable").getBoundingClientRect();
            //     let passedRowCount = ((this.el.get("leftBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1)
    
            //     CONTEXT_MENU_TARGET.style.left = (e.clientX/*-tableInfo.left-(this.#columnsOption.get("columnBeforeSum")[colIdx]-passedX)*/) + "px"
            //     CONTEXT_MENU_TARGET.style.top = (e.clientY/*-tableInfo.top-(rowIdx-passedRowCount)*this.#cell.get("height")*/) + "px"
            // }
            
            this.#calcLeftBodySelect(e.type==="touchstart");
        }
    }

    #gridCellMouseDown = (e) => {
        if(e.target.classList.contains("hjs-grid-selected-handle")) return;
        const RIGHT_FLAG = (e.button === 2)||(e.which === 3);
        let shiftFlag = e.shiftKey;
        let ctrlFlag = e.ctrlKey;
        if(!this.#isUN(this.el.get("leftBodySelectCurrentEditor"))) this.el.get("leftBodySelectCurrentEditor").style.opacity = "0";
        if(!(e.target.classList.contains("hjs-grid-editor") && e.target.style.opacity !== "0")){
            e.preventDefault();
            this.#utils.get("select").set("rowspanSet", new Set())
            this.el.get("middleBody").scrollLeft = this.#utils.get("scroll").get("scrollLeft")
            if(this.#utils.get("current").get("firstClick") === false && !RIGHT_FLAG){
                this.#utils.get("current").set("firstClick",true)
                this.#utils.get("current").set("firstClickTarget",e.target)
                setTimeout(()=>{
                    this.#utils.get("current").set("firstClick",false)
                },200)
            }else if(this.#utils.get("current").get("firstClick") === true && !RIGHT_FLAG){
                if(e.target.classList.contains("hjs-grid-editor")){
                    // double click
                    this.el.get("middleBodySelectCurrentEditor").style.opacity = "1"
                    
                    let top = Number(this.el.get("middleBodySelectCurrentEditor").style.top.replace("px",""));
                    let height = Math.max(this.#cell.get("height"),50)
                    const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
                    
                    this.el.get("middleBodySelectCurrentEditor").style.top = top + Math.min(EL_HEIGHT - (top + height) + this.el.get("middleBody").scrollTop ,0) + "px"
                    this.el.get("middleBodySelectCurrentEditor").style.height = height + "px"

                    let left = Number(this.el.get("middleBodySelectCurrentEditor").style.left.replace("px",""));
                    let width = Math.max(Number(this.el.get("middleBodySelectCurrentEditor").style.width.replace("px","")),100)
                    const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
                
                    this.el.get("middleBodySelectCurrentEditor").style.left = left + Math.min(EL_WIDTH - (left + width) + this.el.get("middleBody").scrollLeft,0) + "px";
                    this.el.get("middleBodySelectCurrentEditor").style.width = width + "px";    

                    this.el.get("middleBodySelectCurrentEditor").removeAttribute("inputmode");
                    this.el.get("middleBodySelectCurrentEditor").focus();
                    return;
                }
            }

            let leftFlag = this.#utils.get("select").get("leftBodySelectArray").length > 0

            if(leftFlag){
                this.#utils.get("select").set("leftBodySelectArray",new Array())
                this.#utils.get("select").set("bodySelectArray",new Array())
                shiftFlag = false;
                ctrlFlag = false;
            }

            this.#utils.get("select").set("target",e.target);
            let bodyEl = this.el.get("middleBody");
            let clientX = Math.round((e.type==="touchstart"?e.touches[0].clientX:e.clientX)-bodyEl.getBoundingClientRect().x+1);
            let clientY = Math.round((e.type==="touchstart"?e.touches[0].clientY:e.clientY)-bodyEl.getBoundingClientRect().y);

            let rowIdx = ((this.el.get("middleBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1) + Math.floor((clientY+this.el.get("middleBody").scrollTop)/this.#cell.get("height"));
            rowIdx=Math.min(rowIdx,this.#data.get("showData").length-1)

            let passedX;
            if(this.el.get("middleBody").scrollLeft === 0) passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"))]
            else passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")-1)]

            let colIdx = this.#columnsOption.get("columnBeforeSum").filter(item=>item<passedX+clientX+this.el.get("middleBody").scrollLeft).length-1;
            
            this.#utils.get("select").set("bodySelectFlag",true)
            this.#utils.get("select").set("bodySelectCtrlFlag",ctrlFlag);

            let deleteYn = (!ctrlFlag)?false:this.#getSelectDeleteYn(rowIdx,colIdx);
            
            if(!RIGHT_FLAG){
                if(e.type==="mousedown" && !ctrlFlag){
                    if(e.type==="mousedown" && shiftFlag){
                        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
                        let sa = this.#getCurrentSelectedArea();
                        let selectArray = this.#utils.get("select").get("bodySelectArray");

                        if(!this.#isUN(sa)){
                            selectArray[sa.index].startRowIndex = Math.min(curInfo.rowIdx,rowIdx)
                            selectArray[sa.index].endRowIndex = Math.max(curInfo.rowIdx,rowIdx)
                            selectArray[sa.index].startColIndex = Math.min(curInfo.colIdx,colIdx)
                            selectArray[sa.index].endColIndex = Math.max(curInfo.colIdx,colIdx)

                            this.#utils.get("select").set("bodySelectArray",selectArray);
                        }                               
                    }else this.#utils.get("select").set("bodySelectArray",new Array());
                }else{
                    if(e.type==="touchstart"){
                        this.#utils.get("select").set("bodySelectArray",[{
                            deleteYn : deleteYn,
                            startRowIndex : rowIdx,
                            endRowIndex : rowIdx,
                            startColIndex : colIdx,
                            endColIndex : colIdx
                        }]);
                        
                        if(!e.target.classList.contains("hjs-grid-editor")) this.#utils.get("select").set("bodySelectFlag",false)
                        else this.#utils.get("select").set("bodySelectArray",new Array());
                    }
                }
            }

            if(deleteYn === false){
                if(!shiftFlag){
                    this.#utils.get("select").set("bodySelectCurrentInfo",{
                        rowIdx : rowIdx,
                        colIdx : colIdx,
                    });
                }
            }

            let rightClear = false;
            let sa = this.#getCurrentSelectedArea();
            let selectArray = this.#utils.get("select").get("bodySelectArray")

            if(RIGHT_FLAG){
                // right click
                if(this.#isUN(sa)){
                    this.#utils.get("select").set("bodySelectArray",new Array());
                }else rightClear = true;
                this.el.get("middleBodyContextMenu").style.opacity = "1"
            }else{
                this.#removeChildAll(this.el.get("middleBodyContextMenu"))
                this.el.get("middleBodyContextMenu").style.opacity = "0"
            }

            if(!shiftFlag){
                if(!rightClear){
                    this.#utils.get("select").set("bodySelectInfo",{
                        deleteYn : deleteYn,
                        startRowIndex : rowIdx,
                        endRowIndex : rowIdx,
                        startColIndex : colIdx,
                        endColIndex : colIdx
                    });
                }else{
                    this.#utils.get("select").set("bodySelectInfo",null);
                }
            }
            

            if(!shiftFlag && !rightClear) this.#utils.get("select").set("bodySelectStartInfo",{
                rowIdx : rowIdx,
                colIdx : colIdx,
            });

            if(RIGHT_FLAG){
                // right click
                e.preventDefault();
                const CONTEXT_MENU_TARGET = this.el.get("middleBodyContextMenu");

                let cmMenuArray = new Array();

                let ccpArray = new Array();
                // cut
                ccpArray.push({
                    title : this.#getMessage("rc001"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            if(this.#ctrlCKeyFunction("002")!==false) this.#deleteKeyFunction(rowIdx,colIdx);
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                // copy
                ccpArray.push({
                    title :this.#getMessage("rc002"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            this.#ctrlCKeyFunction("001")
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                // paste
                ccpArray.push({
                    title : this.#getMessage("rc003"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            console.log(this.#pasteText());
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                cmMenuArray.push(ccpArray);

                let urArray = new Array();
                // undo
                urArray.push({
                    title : this.#getMessage("rc011"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            this.#ctrlZKeyFunction(e);
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                // redo
                urArray.push({
                    title : this.#getMessage("rc012"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            this.#ctrlYKeyFunction(e);
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                cmMenuArray.push(urArray);

                let selArray = new Array();
                // select all
                selArray.push({
                    title : this.#getMessage("rc004"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            this.#ctrlAKeyFunction(e);
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                // delete all
                selArray.push({
                    title : this.#getMessage("rc005"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            this.#deleteKeyFunction(rowIdx,colIdx);
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                cmMenuArray.push(selArray);

                let rowArray = new Array();
                // 행 삽입

                rowArray.push({
                    title :this.#getMessage("rc006"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                        }
                    },
                    childs : [
                        [
                            {
                                title : this.#getMessage("rc006-1"),
                                events : {
                                    mousedown : (e) => {
                                        e.preventDefault();
                                        if(this.#isUN(sa)){
                                            let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
                                            this.#insertRow(showOrgCurRowIdx,true)
                                        }else if(selectArray.length > 1) return alert(this.#getMessage("rc006-3"));
                                        else{
                                            let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(sa.startRowIndex));
                                            
                                            let undoNumber = this.#utils.get("undoNumber")+1;
                                            this.#utils.set("undoNumber",undoNumber)

                                            for(let idx=sa.startRowIndex;idx<=sa.endRowIndex;idx++){
                                                this.#insertRow(showOrgCurRowIdx,true,null,true,undoNumber)
                                            }

                                            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
                                            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

                                            this.#utils.get("undoArray").push({
                                                "type"          : "selectRedo",
                                                "undoNumber"    : undoNumber,
                                                "selectArray"   : [{
                                                    deleteYn : false,
                                                    startRowIndex : sa.startRowIndex,
                                                    endRowIndex : sa.endRowIndex,
                                                    startColIndex : MIN_VISIBLE_COL,
                                                    endColIndex : MAX_VISIBLE_COL
                                                }],
                                                "curInfo"       : {
                                                    rowIdx : selectArray?.[0]?.startRowIndex,
                                                    colIdx : MIN_VISIBLE_COL
                                                }
                                            })
                                        }
                                        
                                        this.#removeChildAll(CONTEXT_MENU_TARGET)
                                        CONTEXT_MENU_TARGET.style.opacity = "0"
                                    }
                                }
                            },
                            {
                                title : this.#getMessage("rc006-2"),
                                events : {
                                    mousedown : (e) => {
                                        e.preventDefault();
                                        if(this.#isUN(sa)){
                                            let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
                                            this.#insertRow(showOrgCurRowIdx,false)
                                        }else if(selectArray.length > 1) return alert(this.#getMessage("rc006-3"));
                                        else{
                                            let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(sa.endRowIndex))

                                            let undoNumber = this.#utils.get("undoNumber")+1;
                                            this.#utils.set("undoNumber",undoNumber)

                                            let insertCnt = 0;

                                            for(let idx=sa.startRowIndex;idx<=sa.endRowIndex;idx++){
                                                this.#insertRow(showOrgCurRowIdx,false,null,true,undoNumber)
                                                insertCnt++;
                                            }

                                            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
                                            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

                                            this.#utils.get("undoArray").push({
                                                "type"          : "selectRedo",
                                                "undoNumber"    : undoNumber,
                                                "selectArray"   : [{
                                                    deleteYn : false,
                                                    startRowIndex : sa.startRowIndex+insertCnt,
                                                    endRowIndex : sa.endRowIndex+insertCnt,
                                                    startColIndex : MIN_VISIBLE_COL,
                                                    endColIndex : MAX_VISIBLE_COL
                                                }],
                                                "curInfo"       : {
                                                    rowIdx : selectArray?.[0]?.startRowIndex,
                                                    colIdx : MIN_VISIBLE_COL
                                                }
                                            })
                                        }
                                        this.#removeChildAll(CONTEXT_MENU_TARGET)
                                        CONTEXT_MENU_TARGET.style.opacity = "0"
                                    }
                                }
                            }
                        ]
                    ]
                })

                // 행 삭제
                rowArray.push({
                    title : this.#getMessage("rc007"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();
                            if(this.#isUN(sa)){
                                let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
                                this.#removeRow(showOrgCurRowIdx)
                            }else{
                                let removeRowArray = {};

                                let undoNumber = this.#utils.get("undoNumber")+1;
                                this.#utils.set("undoNumber",undoNumber)

                                let curSelectArray = this.#deepCopy(selectArray)

                                const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
                                const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

                                for(let i=0;i<selectArray.length;i++){
                                    let sea = selectArray[i];
                                    let endRowIndex = sea.endRowIndex;
                                    let startRowIndex = sea.startRowIndex
                                    for(let idx=endRowIndex;idx>=startRowIndex;idx--){
                                        let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(idx))
                                        this.#removeRow(showOrgCurRowIdx,true,true,undoNumber)
                                    }

                                    curSelectArray[i].startColIndex = MIN_VISIBLE_COL;
                                    curSelectArray[i].endColIndex = MAX_VISIBLE_COL;
                                }

                                this.#utils.get("undoArray").push({
                                    "type"          : "selectUndo",
                                    "undoNumber"    : undoNumber,
                                    "selectArray"   : curSelectArray,
                                    "curInfo"       : {
                                        rowIdx : selectArray?.[0]?.startRowIndex,
                                        colIdx : selectArray?.[0]?.startColIndex
                                    }
                                })
                            }
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                cmMenuArray.push(rowArray);

                let colArray = new Array();
                //열 삽입
                
                if(this.#isUN(sa) || (!this.#isUN(sa) && sa?.startColIndex === sa?.endColIndex && sa?.startColIndex === colIdx && selectArray.length === 1)){
                    colArray.push({
                        title : this.#getMessage("rc013"),
                        childs : [
                            [
                                {
                                    title : this.#getMessage("rc013-1"),
                                    childs : [
                                        [
                                            {
                                                customRenderer : () => { 
                                                    let colNm = this.#getColumnNameAndIndex(colIdx)[0]
                                                    return this.#createInsertColumnOption(colNm,false);
                                                }
                                            }
                                        ]
                                    ]
                                },
                                {
                                    title : this.#getMessage("rc013-2"),
                                    childs : [
                                        [
                                            {
                                                customRenderer : () => { 
                                                    let colNm = this.#getColumnNameAndIndex(colIdx)[0]
                                                    return this.#createInsertColumnOption(colNm,true);
                                                }
                                            }
                                        ]
                                    ]
                                }
                            ]
                        ]
                    })
                }
                

                //열 삭제
                colArray.push({
                    title : this.#getMessage("rc008"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();

                            if(this.#isUN(sa)){
                                let colNm = this.#getColumnNameAndIndex(colIdx)[0]
                                this.removeColumn(colNm)
                            }else{
                                let undoNumber = this.#utils.get("undoNumber")+1;
                                this.#utils.set("undoNumber",undoNumber)

                                let curSelectArray = this.#deepCopy(selectArray)
                                
                                for(let i=0;i<selectArray.length;i++){
                                    let sea = selectArray[i];
                                    for(let idx=sea.endColIndex;idx>=sea.startColIndex;idx--){
                                        if(this.#columns[idx].hidden === true || this.#columns[idx].fixed === true) continue;
                                        this.#removeColumn(idx,true,undoNumber)
                                    }

                                    curSelectArray[i].startRowIndex = 0;
                                    curSelectArray[i].endRowIndex = this.#data.get("showOrgData").length-1;
                                }

                                this.#utils.get("undoArray").push({
                                    "type"          : "selectUndo",
                                    "undoNumber"    : undoNumber,
                                    "selectArray"   : curSelectArray,
                                    "curInfo"       : {
                                        rowIdx : 0,
                                        colIdx : selectArray?.[0]?.startColIndex
                                    }
                                })
                            }
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                // 열 숨기기
                colArray.push({
                    title : this.#getMessage("rc009"),
                    events : {
                        mousedown : (e) => {
                            e.preventDefault();   

                            if(this.#isUN(sa)){
                                let colNm = this.#getColumnNameAndIndex(colIdx)[0]
                                this.hideColumn(colNm)
                            }else{
                                let undoNumber = this.#utils.get("undoNumber")+1;
                                this.#utils.set("undoNumber",undoNumber)

                                let curSelectArray = this.#deepCopy(selectArray)

                                for(let i=0;i<selectArray.length;i++){
                                    let sea = selectArray[i];
                                    for(let idx=sea.endColIndex;idx>=sea.startColIndex;idx--){
                                        if(this.#columns[idx].hidden === true || this.#columns[idx].fixed === true) continue;
                                        this.#showHideColumn(idx,true,true,undoNumber)
                                    }

                                    curSelectArray[i].startRowIndex = 0;
                                    curSelectArray[i].endRowIndex = this.#data.get("showOrgData").length-1;
                                }

                                this.#utils.get("undoArray").push({
                                    "type"          : "selectUndo",
                                    "undoNumber"    : undoNumber,
                                    "selectArray"   : curSelectArray,
                                    "curInfo"       : {
                                        rowIdx : 0,
                                        colIdx : selectArray?.[0]?.startColIndex
                                    }
                                })
                            }
                            
                            this.#removeChildAll(CONTEXT_MENU_TARGET)
                            CONTEXT_MENU_TARGET.style.opacity = "0"
                        }
                    }
                })

                // 숨긴 열 보이기
                if(!this.#isUN(sa) && selectArray.length === 1){
                    let hiddenFlag = false;
                    for(let idx=sa.endColIndex;idx>=sa.startColIndex;idx--){
                        if(this.#columns[idx].fixed === true) continue;
                        if(this.#columns[idx].hidden === true){
                            hiddenFlag = true;
                            break;
                        }
                    }

                    if(hiddenFlag){
                        colArray.push({
                            title : this.#getMessage("rc010"),
                            events : {
                                mousedown : (e) => {
                                    e.preventDefault();   

                                    if(this.#isUN(sa)){
                                        let colNm = this.#getColumnNameAndIndex(colIdx)[0]
                                        this.showColumn(colNm)
                                    }else{
                                        if(selectArray.length > 1) return alert(this.#getMessage("rc010-1"));
                                        
                                        let undoNumber = this.#utils.get("undoNumber")+1;
                                        this.#utils.set("undoNumber",undoNumber)

                                        let curSelectArray = this.#deepCopy(selectArray)

                                        let minCol = sa.startColIndex;
                                        let maxCol = sa.endColIndex;

                                        for(let idx=sa.endColIndex;idx>=sa.startColIndex;idx--){
                                            if(this.#columns[idx].fixed === true || idx === sa.endColIndex || idx === sa.startColIndex) continue;
                                            minCol = Math.min(minCol,idx);
                                            this.#showHideColumn(idx,false,true,undoNumber)
                                        }
                                        curSelectArray[0].startRowIndex = 0;
                                        curSelectArray[0].endRowIndex = this.#data.get("showOrgData").length-1;

                                        this.#utils.get("undoArray").push({
                                            "type"          : "selectUndo",
                                            "undoNumber"    : undoNumber,
                                            "selectArray"   : curSelectArray,
                                            "curInfo"       : {
                                                rowIdx : 0,
                                                colIdx : minCol
                                            }
                                        })
                                    }
                                    
                                    this.#removeChildAll(CONTEXT_MENU_TARGET)
                                    CONTEXT_MENU_TARGET.style.opacity = "0"
                                }
                            }
                        })
                    }
                }

                cmMenuArray.push(colArray);

                new HjsContextMenu({
                    el : CONTEXT_MENU_TARGET,
                    data : cmMenuArray
                })                        

                let tableInfo = this.el.get("middleBodyTable").getBoundingClientRect();
                let passedRowCount = ((this.el.get("middleBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1)

                CONTEXT_MENU_TARGET.style.left = (e.clientX/*-tableInfo.left-(this.#columnsOption.get("columnBeforeSum")[colIdx]-passedX)*/) + "px"
                CONTEXT_MENU_TARGET.style.top = (e.clientY/*-tableInfo.top-(rowIdx-passedRowCount)*this.#cell.get("height")*/) + "px"
            }
            
            if(leftFlag){
                this.#calcLeftBodySelect();
                this.#reRenderGrid();
                this.#utils.get("select").set("leftBodySelectYn",false)
            }
            
            this.#calcBodySelect();
            
        }
    }

    #gridLeftCellMouseMove = (e) => {
        const RIGHT_FLAG = (e.button === 2)||(e.which === 3);
        if(RIGHT_FLAG) return;
        
        if(this.#utils.get("select").get("leftBodySelectFlag") === true){
            if(e.type === "touchmove"){
                e.preventDefault();
                e.stopPropagation();
            }
            let bodyEl = this.el.get("leftBody");
            let clientX = Math.round((e.type==="touchmove"?e.touches[0].clientX:e.clientX)-bodyEl.getBoundingClientRect().x+1);
            let clientY = Math.round((e.type==="touchmove"?e.touches[0].clientY:e.clientY)-bodyEl.getBoundingClientRect().y);
    
            let rowIdx = ((this.el.get("leftBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1) + Math.floor((clientY+this.el.get("leftBody").scrollTop)/this.#cell.get("height"));
            rowIdx=Math.min(rowIdx,this.#data.get("showData").length-1)
    
            let passedX;
            if(this.el.get("leftBody").scrollLeft === 0) passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"))]
            else passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")-1)]
    
            let colIdx;
            let checkboxWidth = (this.#isUN(this.#option.get("left")?.checkbox))?0:this.#option.get("left").checkbox?.width??42;
            let rowNumberWidth = (this.#isUN(this.#option.get("left")?.rowNumber))?0:this.#option.get("left").rowNumber?.width??50;
            let rowStatusWidth = (this.#isUN(this.#option.get("left")?.rowStatus))?0:this.#option.get("left").rowStatus?.width??50;
    
            let checkboxFlag = !this.#isUN(this.#left.get("checkbox"));
            let rowNumberFlag = !this.#isUN(this.#left.get("rowNumber"));
            let rowStatusFlag = !this.#isUN(this.#left.get("rowStatus"));
    
            let orderArray = this.#isUN(this.#left.get("order"))?["checkbox","rowNumber","rowStatus"]:this.#left.get("order");
    
            let leftWidthSum = 0;
            let leftNum = 0;
            
            for(let idx=0;idx<orderArray.length;idx++){
                let order = orderArray[idx];
    
                if(order === "checkbox" && checkboxFlag){
                    leftWidthSum += checkboxWidth
                    leftNum++;
                }else if(order === "rowNumber" && rowNumberFlag){
                    leftWidthSum += rowNumberWidth
                    leftNum++;
                }else if(order === "rowStatus" && rowStatusFlag){
                    leftWidthSum += rowStatusWidth
                    leftNum++;
                }
                
                if(clientX-1<leftWidthSum){
                    colIdx = 0-leftNum;
                    break;
                }
            }
            
            if(this.#isUN(colIdx)){
                colIdx = this.#columnsOption.get("leftColumnBeforeSum").filter(item=>item<clientX-leftWidthSum+this.el.get("middleBody").scrollLeft).length-1;
            }
    
            let selectJson = this.#utils.get("select").get("leftBodySelectInfo");
            let startJson = this.#utils.get("select").get("leftBodySelectStartInfo")

            const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
            const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
    
            selectJson.startRowIndex = Math.min(startJson.rowIdx,rowIdx);
            selectJson.endRowIndex = Math.max(startJson.rowIdx,rowIdx);
            selectJson.startColIndex = MIN_VISIBLE_COL;
            selectJson.endColIndex = MAX_VISIBLE_COL;
    
            this.#utils.get("select").set("leftBodySelectInfo",selectJson);
    
            this.#calcLeftBodySelect();
        }
    }

    #gridCellMouseMove = (e) => {
        const RIGHT_FLAG = (e.button === 2)||(e.which === 3);
        if(RIGHT_FLAG) return;
        if(this.#utils.get("select").get("bodySelectFlag") === true){
            if(e.type === "touchmove"){
                e.preventDefault();
                e.stopPropagation();
            }
            let bodyEl = this.el.get("middleBody");
            let clientX = Math.round((e.type==="touchmove"?e.touches[0].clientX:e.clientX)-bodyEl.getBoundingClientRect().x+1);
            let clientY = Math.round((e.type==="touchmove"?e.touches[0].clientY:e.clientY)-bodyEl.getBoundingClientRect().y);

            let rowIdx = ((this.el.get("middleBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1) + Math.floor((clientY+this.el.get("middleBody").scrollTop)/this.#cell.get("height"));
            rowIdx=Math.min(rowIdx,this.#data.get("showData").length-1)

            let passedX;
            if(this.el.get("middleBody").scrollLeft === 0) passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"))]
            else passedX = this.#columnsOption.get("columnBeforeSum")[this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")-1)]

            let colIdx = this.#columnsOption.get("columnBeforeSum").filter(item=>item<passedX+clientX+this.el.get("middleBody").scrollLeft).length-1;

            let selectJson = this.#utils.get("select").get("bodySelectInfo");
            let startJson = this.#utils.get("select").get("bodySelectStartInfo")

            selectJson.startRowIndex = Math.min(startJson.rowIdx,rowIdx);
            selectJson.endRowIndex = Math.max(startJson.rowIdx,rowIdx);
            selectJson.startColIndex = Math.min(startJson.colIdx,colIdx);
            selectJson.endColIndex = Math.max(startJson.colIdx,colIdx);

            this.#utils.get("select").set("bodySelectInfo",selectJson);

            this.#calcBodySelect();
        }
    }

    #gridLeftCellMouseUp = e => {
        if(this.#utils.get("select").get("leftBodySelectFlag") === true){
            this.#utils.get("select").set("leftBodySelectFlag",false)
            this.#utils.get("select").set("leftBodySelectCtrlFlag",false);
            
            this.#calcLeftBodySelect(true);
        }
    }

    #gridCellMouseUp = e => {
        if(this.#utils.get("select").get("bodySelectFlag") === true){
            this.#utils.get("select").set("bodySelectFlag",false)
            this.#utils.get("select").set("bodySelectCtrlFlag",false);
            
            this.#calcBodySelect(true);
        }
        this.#utils.get("select").set("rowspanSet", new Set())
    }

    #gridElementTouchStart = (e, parent) => {
        if(e.target.type === "checkbox") return;
        if((parent === "left" && e.target.style.opacity !== "0")
            || !(e.target.classList.contains("hjs-grid-editor") && e.target.style.opacity !== "0")){
            if(parent !== "left") e.preventDefault();
            this.#utils.get("scroll").get("touchInfo").set("parent",parent)
            this.#utils.get("scroll").get("touchInfo").set("touchScrollFlag",true)
            this.#utils.get("scroll").get("touchInfo").set("pageX",e.touches[0].pageX)
            this.#utils.get("scroll").get("touchInfo").set("pageY",e.touches[0].pageY)
            this.#utils.get("scroll").get("touchInfo").set("startRowIndex",this.#utils.get("scroll").get("passedRowCount"))
            this.#utils.get("scroll").get("touchInfo").set("startColIndex",this.#utils.get("scroll").get("passedColCount"))
            this.#utils.get("scroll").get("touchInfo").set("startDate",e.timeStamp)
            this.#utils.get("scroll").get("touchInfo").set("target",e.target) //target이 사라지면 touchmove, touchend가 동작하지 않음. renderGrid시, 삭제 시키지 말고, touchend에서 삭제시켜야함.
            document.documentElement.classList.add("hjs-grid-overflowscroll-behavior-contain")
        }
    }
    
    #gridElementTouchMove = e => {    
        if(this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true){ 
            if(this.#utils.get("scroll").get("touchInfo").get("parent") !== "left") e.preventDefault();
            if(this.#utils.get("scroll").get("touchInfo").get("parent") === "left" && this.el.get("leftBodySelectCurrentEditor")?.style?.opacity === "1") this.el.get("leftBodySelectCurrentEditor").style.opacity = "0";
            const touchY = e.touches[0].pageY;
            const deltaY = this.#utils.get("scroll").get("touchInfo").get("pageY") - touchY;

            const touchX = e.touches[0].pageX;
            const deltaX = this.#utils.get("scroll").get("touchInfo").get("pageX") - touchX;

            const currentTime = e.timeStamp;
            const deltaT = currentTime - this.#utils.get("scroll").get("touchInfo").get("startDate")

            /* vertivcal */
            
            const CELL_HEIGHT = this.#cell.get("height")
            
            let rowY = deltaY/CELL_HEIGHT
            let rowAbs = Math.floor(Math.abs(deltaY/CELL_HEIGHT))

            if(rowAbs >= 0) this.#utils.get("scroll").get("touchInfo").set("verticalFlag",true)
    
            let PASSED_ROW_COUNT;
            const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")
            const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")
            const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
            const V_ONE_SCROLL = this.#utils.get("scroll").get("vOneScroll");
            
            if(rowY>0) PASSED_ROW_COUNT = this.#utils.get("scroll").get("touchInfo").get("startRowIndex") + rowAbs
            else PASSED_ROW_COUNT = this.#utils.get("scroll").get("touchInfo").get("startRowIndex") - rowAbs
            PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT,SCROLL_ROW_COUNT),0)
            this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT)
            
            let scrollY = V_SCROLL_BAR_PADDING + PASSED_ROW_COUNT * V_ONE_SCROLL
            
            this.el.get("scroll").get("vertical").get("thumb").style.top = scrollY + "px"

            /* horizontal */
            const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
            const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
            const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");
            
            const CELL_WIDTH = Math.min((this.#columnsOption.get("columnsTotalWidth")/this.#columnsOption.get("visibleColumnCount")),EL_WIDTH)

            let colX = deltaX/CELL_WIDTH
            let colAbs = Math.floor(Math.abs(deltaX/CELL_WIDTH))
    
            let PASSED_COL_COUNT;

            if(colX>0) PASSED_COL_COUNT = this.#utils.get("scroll").get("touchInfo").get("startColIndex") + colAbs
            else PASSED_COL_COUNT = this.#utils.get("scroll").get("touchInfo").get("startColIndex") - colAbs
            
            PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT,SCROLL_COL_COUNT),0)
            this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT)
            
            let scrollX = H_SCROLL_BAR_PADDING + PASSED_COL_COUNT * H_ONE_SCROLL
            
            this.el.get("scroll").get("horizontal").get("thumb").style.left = scrollX + "px"
            
            this.#renderGrid()
        }
    }
    
    #gridElementTouchEnd = e => {        
        if(e.target.type === "checkbox"){
            document.documentElement.classList.remove("hjs-grid-overflowscroll-behavior-contain")
            this.#utils.get("scroll").get("touchInfo").set("touchScrollFlag",false);
            this.#utils.get("scroll").get("touchInfo").set("verticalFlag",false)
            return;
        }
        
        if(this.#utils.get("scroll").get("touchInfo").get("touchScrollFlag") === true){
            if(this.#utils.get("scroll").get("touchInfo").get("parent") !== "left"){
                e.preventDefault();
                e.stopPropagation();
            }
            let deltaT = e.timeStamp - this.#utils.get("scroll").get("touchInfo").get("startDate");
            const TIME_MIN_LIMIT = 30
            const TIME_MAX_LIMIT = 300

            if(deltaT > TIME_MAX_LIMIT || deltaT < TIME_MIN_LIMIT ) {
                document.documentElement.classList.remove("hjs-grid-overflowscroll-behavior-contain")
                this.#utils.get("scroll").get("touchInfo").set("touchScrollFlag",false);
                this.#utils.get("scroll").get("touchInfo").set("verticalFlag",false)
                return;
            }
            else{ 
                
                const touchY = e.changedTouches[0].pageY;
                const deltaY = this.#utils.get("scroll").get("touchInfo").get("pageY") - touchY;

                const touchX = e.changedTouches[0].pageX;
                const deltaX = this.#utils.get("scroll").get("touchInfo").get("pageX") - touchX;
                
                if(Math.abs(deltaY)>50){
                    if(this.#utils.get("scroll").get("touchInfo").get("target")?.closest("tr")?.style?.display === "none") this.#utils.get("scroll").get("touchInfo").get("target").closest("tr").remove();
                    if(this.#utils.get("select").get("target")?.closest("tr")?.style?.display === "none") this.#utils.get("select").get("target")?.closest("tr").remove();
                    let extraRow = Math.ceil(TIME_MAX_LIMIT - deltaT);
                    let cntY = 0;
                    
                    let intY = setInterval(()=>{
                        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
                        const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")
                        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
                        const V_ONE_SCROLL = this.#utils.get("scroll").get("vOneScroll");
                        //alert(PASSED_ROW_COUNT)
                        if(deltaY>0) PASSED_ROW_COUNT += 1
                        else PASSED_ROW_COUNT -= 1
                        
                        PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT,SCROLL_ROW_COUNT),0)
                        this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT)
                        let scrollY = V_SCROLL_BAR_PADDING + PASSED_ROW_COUNT * V_ONE_SCROLL

                        this.el.get("scroll").get("vertical").get("thumb").style.top = scrollY + "px"
                        
                        this.#renderGrid();

                        cntY+=4
                        if(cntY>extraRow){ 
                            clearInterval(intY)
                        }
                    },4)
                }
                
                if(Math.abs(deltaX)>100){
                    if(this.#utils.get("scroll").get("touchInfo").get("target").closest("td")?.style?.display === "none") this.#utils.get("scroll").get("touchInfo").get("target").closest("td").remove();
                    if(this.#utils.get("select").get("target")?.closest("td")?.style?.display === "none") this.#utils.get("select").get("target")?.closest("td").remove();
                    const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");
                    let extraCol = Math.ceil(TIME_MAX_LIMIT / deltaT);
                    let cntX = 0;
                    
                    let intX = setInterval(()=>{
                        let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
                        const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")
                        const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
                        const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");
                        //alert(PASSED_ROW_COUNT)
                        if(deltaX>0) PASSED_COL_COUNT += 2
                        else PASSED_COL_COUNT -= 2
                        
                        PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT,SCROLL_COL_COUNT),0)
                        this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT)
                        let scrollX = H_SCROLL_BAR_PADDING + PASSED_COL_COUNT * H_ONE_SCROLL

                        this.el.get("scroll").get("horizontal").get("thumb").style.left = scrollX + "px"
                        
                        this.#renderGrid();

                        cntX+=4
                        if(cntX>extraCol){
                            clearInterval(intX)
                        }
                    },4)
                }
            }
            
        } 
        
        document.documentElement.classList.remove("hjs-grid-overflowscroll-behavior-contain")
        this.#utils.get("scroll").get("touchInfo").set("touchScrollFlag",false);
        this.#utils.get("scroll").get("touchInfo").set("verticalFlag",false)
    }

    #verticalTopButtonMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
        PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT-1,SCROLL_ROW_COUNT),0);
        
        this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT);

        this.#renderGrid();

        let topButtonInterval = setInterval(()=>{
            const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
            let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
            PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT-1,SCROLL_ROW_COUNT),0);
            
            this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT);

            this.#renderGrid();
        },100)
        this.#utils.get("scroll").set("upButtonInterval",topButtonInterval)
    }

    #verticalTopButtonMouseUp = e => {
        if(this.#utils.get("scroll").has("upButtonInterval")){
            clearInterval(this.#utils.get("scroll").get("upButtonInterval"))
        }
        this.#utils.get("scroll").delete("upButtonInterval")
    }

    #verticalBottomButtonMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
        PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT+1,SCROLL_ROW_COUNT),0);
        
        this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT);

        this.#renderGrid();

        let bottomButtonInterval = setInterval(()=>{
            const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
            let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
            PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT+1,SCROLL_ROW_COUNT),0);
            this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT);

            this.#renderGrid();
        },100)
        this.#utils.get("scroll").set("bottomButtonInterval",bottomButtonInterval)
    }

    #verticalBottomButtonMouseUp = e => {
        if(this.#utils.get("scroll").has("bottomButtonInterval")){
            clearInterval(this.#utils.get("scroll").get("bottomButtonInterval"))
        }
        this.#utils.get("scroll").delete("bottomButtonInterval")
    }
    
    #verticalTrackMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        if(this.#utils.get("scroll").has("verticalTrackInterval")) return;
        const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
        const V_ONE_SCROLL = this.#utils.get("scroll").get("vOneScroll");
        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");

        let clientY = (e.type==="mousedown"?e.clientY:e.touches[0].clientY)
        
        if(clientY - this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y > V_SCROLL_BAR_PADDING + (PASSED_ROW_COUNT+1) * V_ONE_SCROLL){
            PASSED_ROW_COUNT += 1;
        }else if(clientY -this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y < V_SCROLL_BAR_PADDING + PASSED_ROW_COUNT * V_ONE_SCROLL){
            PASSED_ROW_COUNT -= 1;                    
        }
        PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT,SCROLL_ROW_COUNT),0);
        this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT);
        
        this.#renderGrid();

        let verticalTrackInterval = setInterval(()=>{
            const V_SCROLL_BAR_PADDING = this.el.get("scroll").get("vertical").get("scrollBarPadding")
            const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
            const V_ONE_SCROLL = this.#utils.get("scroll").get("vOneScroll");
            let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");

            if(clientY - this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y > V_SCROLL_BAR_PADDING + (PASSED_ROW_COUNT+1) * V_ONE_SCROLL){
                PASSED_ROW_COUNT += 1;
            }else if(clientY -this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y < V_SCROLL_BAR_PADDING + PASSED_ROW_COUNT * V_ONE_SCROLL){
                PASSED_ROW_COUNT -= 1;                    
            }
            PASSED_ROW_COUNT = Math.max(Math.min(PASSED_ROW_COUNT,SCROLL_ROW_COUNT),0);
            this.#utils.get("scroll").set("passedRowCount",PASSED_ROW_COUNT);
            
            this.#renderGrid();
        }, 100);
        this.#utils.get("scroll").set("verticalTrackInterval",verticalTrackInterval)
    }

    #verticalTrackMouseUp = e => {
        if(this.#utils.get("scroll").has("verticalTrackInterval")){
            clearInterval(this.#utils.get("scroll").get("verticalTrackInterval"))
        }
        this.#utils.get("scroll").delete("verticalTrackInterval")
    }

    #horizontalLeftButtonMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
        let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
        PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT-1,SCROLL_COL_COUNT),0);
        
        this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT);

        this.#renderGrid();

        let leftButtonInterval = setInterval(()=>{
            const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
            let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
            PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT-1,SCROLL_COL_COUNT),0);
            
            this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT);

            this.#renderGrid();
        },100)
        this.#utils.get("scroll").set("leftButtonInterval",leftButtonInterval)
    }

    #horizontalLeftButtonMouseUp = e => {
        if(this.#utils.get("scroll").has("leftButtonInterval")){
            clearInterval(this.#utils.get("scroll").get("leftButtonInterval"))
        }
        this.#utils.get("scroll").delete("leftButtonInterval")
    }

    #horizontalRightButtonMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
        let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
        PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT+1,SCROLL_COL_COUNT),0);
        
        this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT);

        this.#renderGrid();

        let rightButtonInterval = setInterval(()=>{
            const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
            let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
            PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT+1,SCROLL_COL_COUNT),0);
            
            this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT);

            this.#renderGrid();
        },100)
        this.#utils.get("scroll").set("rightButtonInterval",rightButtonInterval)
    }

    #horizontalRightButtonMouseUp = e => {
        if(this.#utils.get("scroll").has("rightButtonInterval")){
            clearInterval(this.#utils.get("scroll").get("rightButtonInterval"))
        }
        this.#utils.get("scroll").delete("rightButtonInterval")
    }

    #horizontalTrackMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        if(this.#utils.get("scroll").has("horizontalTrackInterval")) return;
        const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")
        const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
        const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");
        let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");

        let clientX = (e.type==="mousedown"?e.clientX:e.touches[0].clientX)
        
        if(clientX - this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y > H_SCROLL_BAR_PADDING + (PASSED_COL_COUNT+1) * H_ONE_SCROLL){
            PASSED_COL_COUNT += 1;
        }else if(clientX -this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y < H_SCROLL_BAR_PADDING + PASSED_COL_COUNT * H_ONE_SCROLL){
            PASSED_COL_COUNT -= 1;                    
        }
        PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT,SCROLL_COL_COUNT),0);
        this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT);
        
        this.#renderGrid();

        let horizontalTrackInterval = setInterval(()=>{
            const H_SCROLL_BAR_PADDING = this.el.get("scroll").get("horizontal").get("scrollBarPadding")
            const SCROLL_COL_COUNT = this.#utils.get("scroll").get("scrollColCount");
            const H_ONE_SCROLL = this.#utils.get("scroll").get("hOneScroll");
            let PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");

            let clientX = (e.type==="mousedown"?e.clientX:e.touches[0].clientX)
            
            if(clientX - this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y > H_SCROLL_BAR_PADDING + (PASSED_COL_COUNT+1) * H_ONE_SCROLL){
                PASSED_COL_COUNT += 1;
            }else if(clientX -this.el.get("scroll").get("vertical").get("track").getBoundingClientRect().y < H_SCROLL_BAR_PADDING + PASSED_COL_COUNT * H_ONE_SCROLL){
                PASSED_COL_COUNT -= 1;                    
            }
            PASSED_COL_COUNT = Math.max(Math.min(PASSED_COL_COUNT,SCROLL_COL_COUNT),0);
            this.#utils.get("scroll").set("passedColCount",PASSED_COL_COUNT);
            
            this.#renderGrid();
        }, 100);
        this.#utils.get("scroll").set("horizontalTrackInterval",horizontalTrackInterval)
    }

    #horizontalTrackMouseUp = e => {
        if(this.#utils.get("scroll").has("horizontalTrackInterval")){
            clearInterval(this.#utils.get("scroll").get("horizontalTrackInterval"))
        }
        this.#utils.get("scroll").delete("horizontalTrackInterval")
    }

    #leftCheckboxClick = (e,rowIdx) =>{
        if(this.#utils.get("scroll").get("displayedRow").has(rowIdx)){
            if(e.target.checked) this.#utils.get("scroll").get("displayedRow").get(rowIdx).classList.add("hjs-grid-checked-row")
            else this.#utils.get("scroll").get("displayedRow").get(rowIdx).classList.remove("hjs-grid-checked-row")
        }

        if(this.#utils.get("scroll").get("displayedLeftRow").has(rowIdx)){
            if(e.target.checked) this.#utils.get("scroll").get("displayedLeftRow").get(rowIdx).classList.add("hjs-grid-checked-row")
            else this.#utils.get("scroll").get("displayedLeftRow").get(rowIdx).classList.remove("hjs-grid-checked-row")
        }
        
        if(e.target.checked) this.#utils.get("checkedRow").set(this.#getIdByShowDataIndex(rowIdx),true);
        else this.#utils.get("checkedRow").delete(this.#getIdByShowDataIndex(rowIdx));
        
        this.el.get("checkboxAll").checked = (this.#utils.get("checkedRow").keys().toArray().length === this.#data.get("showData").length) 
    }
    
    #leftCheckboxClickAll = (e) =>{
        for(let idx=0;idx<this.#data.get("showData").length;idx++){
            if(this.el.get("checkbox").has(idx)) this.el.get("checkbox").get(idx).checked = this.el.get("checkboxAll").checked
            
            if(e.target.checked) this.#utils.get("checkedRow").set(this.#getIdByShowDataIndex(idx),true);
            else this.#utils.get("checkedRow").delete(this.#getIdByShowDataIndex(idx));
        }
        
        this.#reRenderGrid()
    }

    #sortEvent = (e, colIdx) => {
        e.preventDefault()
        let sortType = this.getSortType(colIdx)
        if(sortType === "NORMAL") sortType = "ASC"
        else if(sortType === "ASC") sortType = "DESC"
        else if(sortType === "DESC") sortType = "NORMAL"

        this.sortData(colIdx,sortType)
    }

    #filterEvent = (e, colIdx) => {
        e.preventDefault()
        e.stopPropagation();

        this.#utils.get("filterInfo").set("filterEventEndMd",this.#setNativeEvent(document.documentElement,"mousedown",this.#filterEventEnd));
        this.#utils.get("filterInfo").set("filterEventEndTs",this.#setNativeEvent(document.documentElement,"touchstart",this.#filterEventEnd));
        this.#openFilterPopup(e,colIdx);
    }

    #filterEventEnd = (e, colIdx) => {
        if(!this.#isUN(e.target.closest(".hjs-grid-filter-popup"))) return
        if(this.el.has("filterPopup")){
            this.el.get("filterPopup").remove();
            this.el.delete("filterPopup");
            this.#utils.get("filterInfo").get("filterEventEndMd")();
            this.#utils.get("filterInfo").delete("filterEventEndMd");
            this.#utils.get("filterInfo").get("filterEventEndTs")();
            this.#utils.get("filterInfo").delete("filterEventEndTs");
        }
    }

    #openFilterPopup = (e, colIdx) => {
        if(this.el.has("filterPopup")){
            this.el.get("filterPopup").remove();
            this.el.delete("filterPopup");
        }
        
        let colInfo = this.#columns[colIdx]

        let filterPopup = document.createElement("div");
        filterPopup.classList.add("hjs-grid-filter-popup");

        let fullArray = new Array();
        let showArray = new Array();
        
        let filteredFullData = this.#sortGrid((this.#utils.get("filterInfo").get("filterOrder")[this.#utils.get("filterInfo").get("filterCurrentIndex")]?.column === colInfo.name)?this.#filterGrid(this.#deepCopyData(this.#data.get("fullData")),this.#utils.get("filterInfo").get("filterCurrentIndex")):this.#filterGrid(this.#deepCopyData(this.#data.get("fullData"))))
        
        for(let idx=0;idx<filteredFullData.length;idx++){
            let tempData = filteredFullData[idx][colInfo.name];
            if(fullArray.filter(value => value.CODE === tempData).length === 0) fullArray.push({
                CODE : tempData,
                NAME : tempData
            })
        }

        for(let idx=0;idx<this.#data.get("showData").length;idx++){
            let tempData = this.#data.get("showData")[idx][colInfo.name];
            if(showArray.indexOf(tempData) === -1) showArray.push(tempData.toString())
        }

        let cmMenuArray = new Array();

        let sortArray = new Array();

        sortArray.push({
            title : this.#getMessage("cm001"),
            events : {
                click : (e) => {
                    this.sortData(colInfo.name,"ASC")
                    this.el.get("filterPopup").remove();
                    this.#removeFilterPopup();
                }
            },
        })

        sortArray.push({
            title : this.#getMessage("cm002"),
            events : {
                click : (e) => {
                    this.sortData(colInfo.name,"DESC");
                    this.el.get("filterPopup").remove();
                    this.#removeFilterPopup();
                }
            },
        })                

        if(this.getSortType(colIdx) === "ASC" || this.getSortType(colIdx) === "DESC"){
            sortArray.push({
                title : this.#getMessage("cm005"),
                events : {
                    click : (e) => {
                        this.sortData(colInfo.name,"NORMAL");
                        this.el.get("filterPopup").remove();
                        this.#removeFilterPopup();
                    }
                },
            })
        }

        cmMenuArray.push(sortArray);

        if(this.#utils.get("filterInfo").get("filterOrder").filter(item=>item.column === this.#columns[colIdx].name).length>0){
            cmMenuArray.push([{
                title : this.#getMessage("cm006"),
                events : {
                    click : (e) => {
                        let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
                        for(let idx=filterOrder.length-1;idx>=0;idx--){
                            if(filterOrder[idx].column === colInfo.name) filterOrder.splice(idx,1)
                        }

                        this.#utils.get("filterInfo").set("filterOrder",filterOrder);
                        this.#utils.get("filterInfo").set("filterCurrentIndex",filterOrder.length-1);

                        this.#calcShowData();
                        this.#utils.get("scroll").set("passedRowCount",0)
                        this.#reRenderGrid();

                        this.#removeFilterPopup();
                    }
                },
            }]);
        }

        let colType = this.getColumnType(colIdx);
        
        let filterType = this.#columns[colIdx]?.filter?.filterType

        if(colType === "number"){
            if(this.#isUN(filterType)) filterType = ["eq","ne","gt","ge","lt","le","ra","tt","ga","la"];
        
            let childArray = new Array();
            
            if(filterType.indexOf("eq") !== -1 || filterType.indexOf("ne") !== -1) {
                let tempArray = new Array();
            
                if(filterType.indexOf("eq") !== -1){
                    tempArray.push({
                        // equal
                        title : this.#getMessage("cm003-1"),
                        childs : [
                            [
                                {
                                    customRenderer : () => { 
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString() !== eqInput.value);
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                if(filterType.indexOf("ne") !== -1){
                    tempArray.push({
                        // not equal
                        title : this.#getMessage("cm003-2"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString() === eqInput.value);
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                childArray.push(tempArray)
            }
            
            if(filterType.indexOf("gt") !== -1 || filterType.indexOf("ge") !== -1
                || filterType.indexOf("lt") !== -1 || filterType.indexOf("le") !== -1
                || filterType.indexOf("ra") !== -1) {
                let tempArray = new Array();
            
                if(filterType.indexOf("gt") !== -1){
                    tempArray.push({
                        // 보다 큼 ( > )
                        title : this.#getMessage("cm004-1"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>Number(item) <= Number(eqInput.value));
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                if(filterType.indexOf("ge") !== -1){
                    tempArray.push({
                        // 크거나 같음 ( >= )
                        title : this.#getMessage("cm004-2"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>Number(item) < Number(eqInput.value));
                                    }
                                }
                            ]
                        ]
                    })
                }

                if(filterType.indexOf("lt") !== -1){
                    tempArray.push({
                        // 보다 작음 ( < )
                        title : this.#getMessage("cm004-3"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>Number(item) >= Number(eqInput.value));
                                    }
                                }
                            ]
                        ]
                    })
                }

                if(filterType.indexOf("le") !== -1){
                    tempArray.push({
                        // 작거나 같음 ( <= )
                        title : this.#getMessage("cm004-4"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>Number(item) > Number(eqInput.value));
                                    }
                                }
                            ]
                        ]
                    })
                }

                if(filterType.indexOf("ra") !== -1){
                    tempArray.push({
                        // 해당 범위
                        title : this.#getMessage("cm004-5"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        let colInfo = this.#columns[colIdx];
                                        let eqDiv = document.createElement("div");
                                        eqDiv.style.padding = "3px"

                                        let eqInputDiv = document.createElement("div");
                                        eqInputDiv.style.display = "flex";
                                        eqInputDiv.style.flexDirection = "column";
                                        eqInputDiv.style.gap = "3px";
                                        eqInputDiv.style.marginBottom = "3px";

                                        let eqInputDiv1 = document.createElement("div");
                                        eqInputDiv1.style.display = "flex";
                                        eqInputDiv1.style.gap = "3px";

                                        let eqSelect1 = document.createElement("select");   // >, >=
                                        eqSelect1.style.width = "100%";

                                        let eqOption1 = document.createElement("option");   // >
                                        eqOption1.setAttribute("value","ma001");
                                        eqOption1.innerText = this.#getMessage("ma001");
                                        eqSelect1.append(eqOption1)

                                        let eqOption2 = document.createElement("option");   // >=
                                        eqOption2.setAttribute("value","ma002");
                                        eqOption2.innerText = this.#getMessage("ma002");
                                        eqSelect1.append(eqOption2)

                                        eqInputDiv1.append(eqSelect1)

                                        let eqInput1 = document.createElement("input");   
                                        eqInput1.type = "number"
                                        eqInput1.style.width = "100%";
                                        eqInputDiv1.append(eqInput1)

                                        eqInputDiv.append(eqInputDiv1)

                                        let eqInputDiv2 = document.createElement("div");
                                        eqInputDiv2.style.display = "flex";
                                        eqInputDiv2.style.gap = "3px";

                                        let eqSelect2 = document.createElement("select");   // <, <=
                                        eqSelect2.style.width = "100%";

                                        let eqOption3 = document.createElement("option");   // <
                                        eqOption3.setAttribute("value","ma003");
                                        eqOption3.innerText = this.#getMessage("ma003");
                                        eqSelect2.append(eqOption3)

                                        let eqOption4 = document.createElement("option");   // <=
                                        eqOption4.setAttribute("value","ma004");
                                        eqOption4.innerText = this.#getMessage("ma004");
                                        eqSelect2.append(eqOption4)

                                        eqInputDiv2.append(eqSelect2)

                                        let eqInput2 = document.createElement("input");   
                                        eqInput2.type = "number"
                                        eqInput2.style.width = "100%";
                                        eqInputDiv2.append(eqInput2)

                                        eqInputDiv.append(eqInputDiv2)

                                        let eqButtonDiv = document.createElement("div");
                                        eqButtonDiv.style.display = "flex"
                                        eqButtonDiv.style.justifyContent = "flex-end"
                                        
                                        let eqButton = document.createElement("input");
                                        eqButton.value = this.#getMessage("yn001");
                                        eqButton.type = "button";
                                        eqButton.style.cursor = "pointer";

                                        eqButton.addEventListener("click",e=>{
                                            let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
                                            for(let idx=filterOrder.length-1;idx>=0;idx--){
                                                if(filterOrder[idx].column === colInfo.name) filterOrder.splice(idx,1)
                                            }
                                            
                                            let filterArr = new Array();

                                            for(let idx=0;idx<this.#data.get("fullData").length;idx++){
                                                if(this.#data.get("fullData")[idx]?.IUDFLAG === "D") continue;
                                                let tempData = this.#data.get("fullData")[idx][colInfo.name];
                                                if(filterArr.indexOf(tempData.toString()) === -1) filterArr.push(tempData.toString())
                                            }

                                            if(eqSelect1.value === "ma001" && eqSelect2.value === "ma003"){
                                                filterArr = filterArr.filter(item => !(Number(item) > Number(eqInput1.value) && Number(item) < Number(eqInput2.value)));
                                            }else if(eqSelect1.value === "ma001" && eqSelect2.value === "ma004"){
                                                filterArr = filterArr.filter(item => !(Number(item) > Number(eqInput1.value) && Number(item) <= Number(eqInput2.value)));
                                            }else if(eqSelect1.value === "ma002" && eqSelect2.value === "ma003"){
                                                filterArr = filterArr.filter(item => !(Number(item) >= Number(eqInput1.value) && Number(item) < Number(eqInput2.value)));
                                            }else if(eqSelect1.value === "ma002" && eqSelect2.value === "ma004"){
                                                filterArr = filterArr.filter(item => !(Number(item) >= Number(eqInput1.value) && Number(item) <= Number(eqInput2.value)));
                                            }
                                            
                                            filterOrder.push({
                                                column : colInfo.name,
                                                filter : filterArr                                              
                                            })

                                            this.#utils.get("filterInfo").set("filterOrder",filterOrder);
                                            this.#utils.get("filterInfo").set("filterCurrentIndex",filterOrder.length-1);

                                            this.#calcShowData();
                                            this.#utils.get("scroll").set("passedRowCount",0)
                                            this.#reRenderGrid();

                                            this.#removeFilterPopup();
                                        })

                                        eqButtonDiv.append(eqButton)

                                        eqDiv.append(eqInputDiv);
                                        eqDiv.append(eqButtonDiv);  

                                        return eqDiv
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                childArray.push(tempArray)
            }
            
            if(filterType.indexOf("tt") !== -1 || filterType.indexOf("ga") !== -1 || filterType.indexOf("la") !== -1) {
                let tempArray = new Array();
            
                if(filterType.indexOf("tt") !== -1){
                    tempArray.push({
                        // 상위 10
                        title : this.#getMessage("cm004-6"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        let colInfo = this.#columns[colIdx];
                                        let eqDiv = document.createElement("div");
                                        eqDiv.style.padding = "3px"

                                        let eqInputDiv = document.createElement("div");
                                        eqInputDiv.style.display = "flex";
                                        eqInputDiv.style.flexDirection = "column";
                                        eqInputDiv.style.gap = "3px";
                                        eqInputDiv.style.marginBottom = "3px";

                                        let eqSelect1 = document.createElement("select");   // 상위, 하위
                                        eqSelect1.style.width = "100%";
                                        eqInputDiv.append(eqSelect1)

                                        let eqOption1 = document.createElement("option");   // 상위
                                        eqOption1.setAttribute("value","ft002");
                                        eqOption1.innerText = this.#getMessage("ft002");
                                        eqSelect1.append(eqOption1)

                                        let eqOption2 = document.createElement("option");   // 하위
                                        eqOption2.setAttribute("value","ft003");
                                        eqOption2.innerText = this.#getMessage("ft003");
                                        eqSelect1.append(eqOption2)

                                        let eqInput = document.createElement("input");
                                        eqInput.value = 10;
                                        eqInput.type = "number"
                                        eqInput.style.width = "100%";
                                        eqInputDiv.append(eqInput)

                                        let eqSelect2 = document.createElement("select");   // 항목, %
                                        eqSelect2.style.width = "100%";
                                        eqInputDiv.append(eqSelect2)

                                        let eqOption3 = document.createElement("option");   // 항목
                                        eqOption3.setAttribute("value","ft004");
                                        eqOption3.innerText = this.#getMessage("ft004");
                                        eqSelect2.append(eqOption3)

                                        let eqOption4 = document.createElement("option");   // %
                                        eqOption4.setAttribute("value","ft005");
                                        eqOption4.innerText = this.#getMessage("ft005");
                                        eqSelect2.append(eqOption4)

                                        let eqButtonDiv = document.createElement("div");
                                        eqButtonDiv.style.display = "flex"
                                        eqButtonDiv.style.justifyContent = "flex-end"
                                        
                                        let eqButton = document.createElement("input");
                                        eqButton.value = this.#getMessage("yn001");
                                        eqButton.type = "button";
                                        eqButton.style.cursor = "pointer";

                                        eqButton.addEventListener("click",e=>{
                                            let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
                                            for(let idx=filterOrder.length-1;idx>=0;idx--){
                                                if(filterOrder[idx].column === colInfo.name) filterOrder.splice(idx,1)
                                            }
                                            
                                            let filterArr = new Array();
                                            let filterFullArr = new Array();

                                            for(let idx=0;idx<this.#data.get("fullData").length;idx++){
                                                if(this.#data.get("fullData")[idx]?.IUDFLAG === "D") continue;
                                                let tempData = this.#data.get("fullData")[idx][colInfo.name];
                                                if(filterArr.indexOf(tempData.toString()) === -1) filterArr.push(tempData.toString())
                                                filterFullArr.push(tempData)
                                            }

                                            if(eqSelect1.value === "ft002"){
                                                filterFullArr = filterFullArr.toSorted((a,b) => {
                                                    let before,after;
                                                    before = Number(a);
                                                    after = Number(b);
                                                    
                                                    if (before > after) return -1;
                                                    if (before < after) return 1;
                                                    return 0;
                                                })
                                            }else if(eqSelect1.value === "ft003"){
                                                filterFullArr = filterFullArr.toSorted((a,b) => {
                                                    let before,after;
                                                    before = Number(a);
                                                    after = Number(b);
                                                    
                                                    if (before < after) return -1;
                                                    if (before > after) return 1;
                                                    return 0;
                                                })
                                            }

                                            let filterNum;
                                            
                                            if(eqSelect2.value === "ft004"){
                                                filterNum = filterFullArr[Number(eqInput.value)];
                                                if(eqSelect1.value === "ft002") filterArr = filterArr.filter(item=>Number(item)<Number(filterNum))
                                                else if(eqSelect1.value === "ft003") filterArr = filterArr.filter(item=>Number(item)>Number(filterNum))
                                            }else if(eqSelect2.value === "ft005"){
                                                filterNum = filterFullArr[Math.round(filterFullArr.length/100*Number(eqInput.value))];
                                                if(eqSelect1.value === "ft002") filterArr = filterArr.filter(item=>Number(item)<Number(filterNum))
                                                else if(eqSelect1.value === "ft003") filterArr = filterArr.filter(item=>Number(item)>Number(filterNum))
                                            }
                                            
                                            filterOrder.push({
                                                column : colInfo.name,
                                                filter : filterArr                                              
                                            })

                                            this.#utils.get("filterInfo").set("filterOrder",filterOrder);
                                            this.#utils.get("filterInfo").set("filterCurrentIndex",filterOrder.length-1);

                                            this.#calcShowData();
                                            this.#utils.get("scroll").set("passedRowCount",0)
                                            this.#reRenderGrid();

                                            this.#removeFilterPopup();
                                        })

                                        eqButtonDiv.append(eqButton)

                                        eqDiv.append(eqInputDiv);
                                        eqDiv.append(eqButtonDiv);  

                                        return eqDiv
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                if(filterType.indexOf("ga") !== -1){
                    tempArray.push({
                        // 평균 초과
                        title : this.#getMessage("cm004-7"),
                        events : {
                            "click" : e => {
                                let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
                                for(let idx=filterOrder.length-1;idx>=0;idx--){
                                    if(filterOrder[idx].column === colInfo.name) filterOrder.splice(idx,1)
                                }
                                
                                let filterArr = new Array();
                                let sum = 0;

                                for(let idx=0;idx<this.#data.get("fullData").length;idx++){
                                    if(this.#data.get("fullData")[idx]?.IUDFLAG === "D") continue;
                                    let tempData = this.#data.get("fullData")[idx][colInfo.name];
                                    sum += Number(tempData);
                                    if(filterArr.indexOf(tempData.toString()) === -1) filterArr.push(tempData.toString())
                                }
                                
                                filterOrder.push({
                                    column : colInfo.name,
                                    filter : filterArr.filter(item => Number(item) <= (sum / this.#data.get("fullData").length))                                                        
                                })

                                this.#utils.get("filterInfo").set("filterOrder",filterOrder);
                                this.#utils.get("filterInfo").set("filterCurrentIndex",filterOrder.length-1);

                                this.#calcShowData();
                                this.#utils.get("scroll").set("passedRowCount",0)
                                this.#reRenderGrid();

                                this.#removeFilterPopup();
                            }
                        }
                    })
                }

                if(filterType.indexOf("la") !== -1){
                    tempArray.push({
                        // 평균 미만
                        title : this.#getMessage("cm004-8"),
                        events : {
                            "click" : e => {
                                let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
                                for(let idx=filterOrder.length-1;idx>=0;idx--){
                                    if(filterOrder[idx].column === colInfo.name) filterOrder.splice(idx,1)
                                }
                                
                                let filterArr = new Array();
                                let sum = 0;

                                for(let idx=0;idx<this.#data.get("fullData").length;idx++){
                                    if(this.#data.get("fullData")[idx]?.IUDFLAG === "D") continue;
                                    let tempData = this.#data.get("fullData")[idx][colInfo.name];
                                    sum += Number(tempData);
                                    if(filterArr.indexOf(tempData.toString()) === -1) filterArr.push(tempData.toString())
                                }
                                
                                filterOrder.push({
                                    column : colInfo.name,
                                    filter : filterArr.filter(item => Number(item) >= (sum / this.#data.get("fullData").length))                                                        
                                })

                                this.#utils.get("filterInfo").set("filterOrder",filterOrder);
                                this.#utils.get("filterInfo").set("filterCurrentIndex",filterOrder.length-1);

                                this.#calcShowData();
                                this.#utils.get("scroll").set("passedRowCount",0)
                                this.#reRenderGrid();

                                this.#removeFilterPopup();
                            }
                        }
                    })
                }
                
                childArray.push(tempArray)
            }
            
            cmMenuArray.push([{
                title : this.#getMessage("cm004"),
                childs : childArray
            }])
        }else{
            // type : text!
            
            if(this.#isUN(filterType)) filterType = ["eq","ne","st","en","ct","nc"];
        
            let childArray = new Array();
            
            if(filterType.indexOf("eq") !== -1 || filterType.indexOf("ne") !== -1) {
                let tempArray = new Array();
            
                if(filterType.indexOf("eq") !== -1){
                    tempArray.push({
                        // equal
                        title : this.#getMessage("cm003-1"),
                        childs : [
                            [
                                {
                                    customRenderer : () => { 
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString() !== eqInput.value);
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                if(filterType.indexOf("ne") !== -1){
                    tempArray.push({
                        // not equal
                        title : this.#getMessage("cm003-2"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString() === eqInput.value);
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                childArray.push(tempArray)
            }
            
            if(filterType.indexOf("st") !== -1 || filterType.indexOf("en") !== -1) {
                let tempArray = new Array();
            
                if(filterType.indexOf("st") !== -1){
                    tempArray.push({
                        // start
                        title : this.#getMessage("cm003-3"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString().substring(0,eqInput.value.toString().length) !== eqInput.value);
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                if(filterType.indexOf("en") !== -1){
                    tempArray.push({
                        // end
                        title : this.#getMessage("cm003-4"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString().substring(item.toString().length-eqInput.value.toString().length,item.toString().length) !== eqInput.value.toString());
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                childArray.push(tempArray)
            }
            
            if(filterType.indexOf("ct") !== -1 || filterType.indexOf("nc") !== -1) {
                let tempArray = new Array();
            
                if(filterType.indexOf("ct") !== -1){
                    tempArray.push({
                        // contain
                        title : this.#getMessage("cm003-5"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>!item.toString().includes(eqInput.value.toString()));
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                if(filterType.indexOf("nc") !== -1){
                    tempArray.push({
                        // not contain
                        title : this.#getMessage("cm003-6"),
                        childs : [
                            [
                                {
                                    customRenderer : () => {
                                        return this.#createFilterTextPopup(colIdx,(item,eqInput)=>item.toString().includes(eqInput.value.toString()));
                                    }
                                }
                            ]
                        ]
                    })
                }
                
                childArray.push(tempArray)
            }
            
            cmMenuArray.push([{
                title : this.#getMessage("cm003"),
                childs : childArray
            }])
        }
       
        cmMenuArray.push([{
            customRenderer : () => {
                let filterCombo = new HjsCombobox({
                    data : fullArray,
                    multiCombo : true,
                    allFlag : true,
                    alwaysDisplay : true,
                    readonly : false,
                    event : {
                        change : e => {
                            let unchekedValue = this.#utils.get("filterInfo").get("combo").getUncheckedValue()
                            let curIndex = this.#utils.get("filterInfo").get("filterCurrentIndex");
                            let curInfo = this.#utils.get("filterInfo").get("filterOrder")[curIndex]

                            if(unchekedValue.length === 0){
                                this.#utils.get("filterInfo").get("filterOrder").splice(curIndex,1);
                                this.#utils.get("filterInfo").set("filterCurrentIndex",--curIndex);
                            }else{
                                if(curInfo?.column !== colInfo.name){
                                    this.#utils.get("filterInfo").get("filterOrder").push({
                                        column : colInfo.name,
                                        filter : new Array(),
                                    })
                                    this.#utils.get("filterInfo").set("filterCurrentIndex",++curIndex);
                                }
                                let curFilter = this.#utils.get("filterInfo").get("filterOrder")[curIndex].filter = unchekedValue;
                            }

                            this.#calcShowData();
                            this.#utils.get("scroll").set("passedRowCount",0)
                            this.#reRenderGrid();
                        },
                    },
                });
                this.#utils.get("filterInfo").set("combo",filterCombo)

                filterCombo.setValue(showArray.join(","))

                return filterCombo.el
            }
        }]);

        this.#utils.get("filterInfo").set("contextMenu",new HjsContextMenu({
            el : filterPopup,
            data : cmMenuArray,
        }))
        
        this.el.set("filterPopup",filterPopup)

        this.el.get("grid").insertAdjacentElement("afterbegin",filterPopup)
        
        let gridInfo = this.el.get("grid").getBoundingClientRect();
        let tdInfo = e.target.closest("td").getBoundingClientRect();
        let deInfo = document.documentElement.getBoundingClientRect();

        filterPopup.style.left = (tdInfo.x + Math.min(deInfo.width-(tdInfo.x+this.el.get("filterPopup").getBoundingClientRect().width),0)) + "px"
        filterPopup.style.top = (gridInfo.y + tdInfo.height + (tdInfo.y - gridInfo.y)) + "px"
    }

    #createFilterTextPopup = (colIdx,con) => {
        let colInfo = this.#columns[colIdx];
        let eqDiv = document.createElement("div");
        eqDiv.style.padding = "3px"

        let eqInputDiv = document.createElement("div");
        
        let eqLabel = document.createElement("label");
        eqLabel.innerText = this.#getMessage("ft001");

        eqInputDiv.append(eqLabel)

        let eqInput = document.createElement("input");
        eqInput.style.width = "100%";
        eqInput.style.margin = "3px 0";
        eqInputDiv.append(eqInput)

        let eqButtonDiv = document.createElement("div");
        eqButtonDiv.style.display = "flex"
        eqButtonDiv.style.justifyContent = "flex-end"
        
        let eqButton = document.createElement("input");
        eqButton.value = this.#getMessage("yn001");
        eqButton.type = "button";
        eqButton.style.cursor = "pointer";

        eqButton.addEventListener("click",e=>{
            let filterOrder = this.#utils.get("filterInfo").get("filterOrder");
            for(let idx=filterOrder.length-1;idx>=0;idx--){
                if(filterOrder[idx].column === colInfo.name) filterOrder.splice(idx,1)
            }
            
            let filterArr = new Array();

            for(let idx=0;idx<this.#data.get("fullData").length;idx++){
                if(this.#data.get("fullData")[idx]?.IUDFLAG === "D") continue;
                let tempData = this.#data.get("fullData")[idx][colInfo.name];
                if(filterArr.indexOf(tempData) === -1) filterArr.push(tempData.toString())
            }
            
            filterOrder.push({
                column : colInfo.name,
                filter : filterArr.filter(item => con(item,eqInput))                                                        
            })

            this.#utils.get("filterInfo").set("filterOrder",filterOrder);
            this.#utils.get("filterInfo").set("filterCurrentIndex",filterOrder.length-1);

            this.#calcShowData();
            this.#utils.get("scroll").set("passedRowCount",0)
            this.#reRenderGrid();

            this.#removeFilterPopup();
        })

        eqButtonDiv.append(eqButton)

        eqDiv.append(eqInputDiv);
        eqDiv.append(eqButtonDiv);  

        return eqDiv
    }

    #createInsertColumnOption = (colNm,beforeYn) => {
        let container = document.createElement("div");

        let colNameWrapper = document.createElement("div");

        let colNameLabel = document.createElement("label");
        colNameLabel.innerText = this.#getMessage("ci001")

        colNameWrapper.append(colNameLabel)

        let colNameInput = document.createElement("input");

        colNameWrapper.append(colNameInput)

        container.append(colNameWrapper);

        let colTitleWrapper = document.createElement("div");

        let colTitleLabel = document.createElement("label");
        colTitleLabel.innerText = this.#getMessage("ci002")

        colTitleWrapper.append(colTitleLabel)

        let colTitleInput = document.createElement("input");

        colTitleWrapper.append(colTitleInput)

        container.append(colTitleWrapper);

        let insertColBtn = document.createElement("input");
        insertColBtn.type = "button";
        insertColBtn.value = this.#getMessage("ci003")
        this.#setNativeEvent(insertColBtn,'click',this.#insertColumnClickFunction,[colNm,beforeYn,colNameInput,colTitleInput])

        container.append(insertColBtn);

        return container
    }

    #insertColumnClickFunction = (e,colNm,beforeYn,newColNmEl,newColTitleEl) => {
        if(this.#isUN(newColNmEl.value ) || newColNmEl.value === ""){
            newColNmEl.focus();
            return alert(this.#getMessage("ci001-1"))
        }
        if(this.#isUN(newColTitleEl.value) || newColTitleEl.value === ""){
            newColTitleEl.focus();
            return alert(this.#getMessage("ci002-1"))
        }

        this.#insertColumn(colNm,{
            name : newColNmEl.value,
            title : newColTitleEl.value
        },beforeYn)

        this.#removeChildAll(this.el.get("middleBodyContextMenu"))
        this.el.get("middleBodyContextMenu").style.opacity = "0"
    }

    #removeFilterPopup = () => {
        this.el.get("filterPopup").remove();
        this.el.delete("filterPopup");
        this.#utils.get("filterInfo").get("filterEventEndMd")();
        this.#utils.get("filterInfo").delete("filterEventEndMd");
        this.#utils.get("filterInfo").get("filterEventEndTs")();
        this.#utils.get("filterInfo").delete("filterEventEndTs");
    }

    #leftEditorFocusOut = (e,rowId,colNm,editorEl)=> {
        this.el.get("leftBodySelectCurrentEditor").style.opacity = "0";

        let rowIdx = this.#getShowOrgDataIndexById(rowId);

        if(this.#utils.get("editor").get("setValueFlag")) this.setCellValue(rowIdx,colNm,editorEl.value)

        if(!this.#isUN(this.el.get("middleBodySelectCurrentEditor"))){
            this.el.get("middleBodySelectCurrentEditor").focus();
        }
    }

    #editorFocusOut = (e,rowId,colNm,editorEl)=> {
        e.preventDefault();
        e.stopPropagation();
        
        let rowIdx = this.#getShowOrgDataIndexById(rowId);
        let colIdx = this.#getColumnNameAndIndex(colNm)?.[1];
        if(this.#isUN(colIdx)) return;

        let setCellFlag = this.#utils.get("editor").get("setValueFlag");

        if(editorEl.tagName === "INPUT"){
            switch(editorEl.type){
                case "date":
                case "time":
                case "datetime-local":
                    if(editorEl.value === "") setCellFlag = false;
                    break;
            }
        }

        
        if(setCellFlag && !this.#isUN(rowIdx)) this.#setCellValue(rowIdx,colIdx,editorEl.value);

        let top = (rowIdx - ((this.el.get("middleBody").scrollTop === 0)?this.#utils.get("scroll").get("passedRowCount"):this.#utils.get("scroll").get("passedRowCount")-1))*this.#cell.get("height");
        let height = this.#cell.get("height")
        const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");

        editorEl.style.top = top + "px"
        editorEl.style.height = height + "px"

        let realColIdx = (this.el.get("middleBody").scrollLeft === 0)?this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")):this.#columnsOption.get("visiblePrevColumnIndex").get(this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount")));
        let left = (this.#columnsOption.get("columnBeforeSum")[colIdx] - this.#columnsOption.get("columnBeforeSum")[realColIdx])
        let width = this.#columns[colIdx].width
        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");

        editorEl.style.left = left + "px";
        editorEl.style.width = width + "px";    

        editorEl.style.opacity = "0"
        editorEl.setAttribute("inputmode","none");
    }

    #leftEditorKeyDown = (e,rowId,colNm,editorEl)=> {
        if(e.ctrlKey && e.keyCode === 17) return;
        if(e.shiftKey && e.keyCode === 16) return;

        let rowIdx = this.#getShowOrgDataIndexById(rowId)
        let colIdx = this.#getColumnNameAndIndex(colNm)?.[1];

        this.#removeChildAll(this.el.get("middleBodyContextMenu"))
        this.el.get("middleBodyContextMenu").style.opacity = "0"
        
        if(e.keyCode === 13){   // enter
            if(e.altKey){
                let tempInput = document.createElement("input")
                this.#utils.get("editor").set("setValueFlag",false);
                editorEl.insertAdjacentElement("afterend",tempInput)
                tempInput.focus();
                tempInput.remove();
                const cursorPos = editorEl.selectionStart;
                const beforeCursor = editorEl.value.substring(0, cursorPos);
                const afterCursor = editorEl.value.substring(cursorPos);
                editorEl.value = beforeCursor + '\n' + afterCursor;
                editorEl.setSelectionRange(cursorPos + 1, cursorPos + 1);
                this.#utils.get("editor").set("setValueFlag",true);
                //this.#f2KeyFunction();
                editorEl.style.opacity = "1"
                editorEl.focus();
                return;
            }else{
                e.preventDefault();
                if(!this.#isUN(this.el.get("middleBodySelectCurrentEditor"))){
                    this.el.get("middleBodySelectCurrentEditor").focus();
                }
            }
            this.#renderGrid();
            //this.#renderBodySelect(this.#utils.get("select").get("bodySelectArray"))
        }
        // else if(e.keyCode === 9){  // tab
        //     e.preventDefault();
            
        //     if(e.shiftKey){
        //         this.#tabShiftKeyFunction();
        //         this.#utils.get("select").set("bodySelectInfo",null)
        //     }else{
        //         this.#tabKeyFunction();
        //     }
            
        //     this.#renderGrid();
        // }else if(e.keyCode === 37){// arrow left
        //     if(editorEl.style.opacity === "0"){
        //         e.preventDefault();
        //         if(e.shiftKey && e.ctrlKey){
        //             this.#arrowLeftShiftCtrlKeyFunction();
        //         }else if(e.shiftKey){
        //             this.#arrowLeftShiftKeyFunction();
        //         }else if(e.ctrlKey){
        //             this.#arrowLeftCtrlKeyFunction();
        //         }else{
        //             let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
        //             this.#utils.get("select").set("leftBodySelectArray",new Array())
        //             this.#utils.get("select").set("bodySelectArray",[{
        //                 deleteYn : false,
        //                 startRowIndex : curInfo.rowIdx,
        //                 endRowIndex : curInfo.rowIdx,
        //                 startColIndex : curInfo.colIdx,
        //                 endColIndex : curInfo.colIdx,
        //             }])
        //             this.#tabShiftKeyFunction();
        //         }
        //         this.#renderGrid();
        //     }
        // }else if(e.keyCode === 38){ // arrow up
        //     if(editorEl.style.opacity === "0"){
        //         e.preventDefault();
        //         if(e.shiftKey && e.ctrlKey){
        //             this.#arrowUpShiftCtrlKeyFunction();
        //         }else if(e.shiftKey){
        //             this.#arrowUpShiftKeyFunction();
        //         }else if(e.ctrlKey){
        //             this.#arrowUpCtrlKeyFunction();
        //         }else{
        //             this.#utils.get("select").set("leftBodySelectArray",new Array())
        //             let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
        //             this.#utils.get("select").set("bodySelectArray",[{
        //                 deleteYn : false,
        //                 startRowIndex : curInfo.rowIdx,
        //                 endRowIndex : curInfo.rowIdx,
        //                 startColIndex : curInfo.colIdx,
        //                 endColIndex : curInfo.colIdx,
        //             }])
        //             this.#enterShiftKeyFunction();
        //         }
        //         this.#renderGrid();
        //     }
        // }else if(e.keyCode === 39){ // arrow right
        //     if(editorEl.style.opacity === "0"){
        //         e.preventDefault();
        //         if(e.shiftKey && e.ctrlKey){
        //             this.#arrowRightShiftCtrlKeyFunction();
        //         }else if(e.shiftKey){
        //             this.#arrowRightShiftKeyFunction();
        //         }else if(e.ctrlKey){
        //             this.#arrowRightCtrlKeyFunction();
        //         }else{
        //             let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
        //             this.#utils.get("select").set("leftBodySelectArray",new Array())
        //             this.#utils.get("select").set("bodySelectArray",[{
        //                 deleteYn : false,
        //                 startRowIndex : curInfo.rowIdx,
        //                 endRowIndex : curInfo.rowIdx,
        //                 startColIndex : curInfo.colIdx,
        //                 endColIndex : curInfo.colIdx,
        //             }])
        //             this.#tabKeyFunction();
        //         }
        //         this.#renderGrid();
        //     }
        // }else if(e.keyCode === 40){ // arrow down
        //     if(editorEl.style.opacity === "0"){
        //         e.preventDefault();
        //         if(e.shiftKey && e.ctrlKey){
        //             this.#arrowDownShiftCtrlKeyFunction();
        //         }else if(e.shiftKey){
        //             this.#arrowDownShiftKeyFunction();
        //         }else if(e.ctrlKey){
        //             this.#arrowDownCtrlKeyFunction();
        //         }else{
        //             let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
        //             this.#utils.get("select").set("leftBodySelectArray",new Array())
        //             this.#utils.get("select").set("bodySelectArray",[{
        //                 deleteYn : false,
        //                 startRowIndex : curInfo.rowIdx,
        //                 endRowIndex : curInfo.rowIdx,
        //                 startColIndex : curInfo.colIdx,
        //                 endColIndex : curInfo.colIdx,
        //             }])
        //             this.#enterKeyFunction();
        //         }
        //         this.#renderGrid();
        //     }
        // }else if(e.keyCode === 113){ // f2
        //     this.#f2KeyFunction();
        // }else if(e.keyCode === 46){ // delete
        //     this.#deleteKeyFunction(rowIdx,colIdx);
        // }else{
        //     if(e.isComposing) return;
        //     let keyType = this.#getKeyType(e.code);
        //     if(e.ctrlKey){
        //         if(editorEl.style.opacity === "0"){
        //             if(e.keyCode === 65){ // ctrl + a
        //                 e.preventDefault();
        //                 this.#ctrlAKeyFunction();
        //             }else if(e.keyCode === 67){ // ctrl + c
        //                 e.preventDefault();
        //                 this.#ctrlCKeyFunction("001");
        //             }else if(e.keyCode === 86){ // ctrl + v
        //                 e.preventDefault();
        //                 this.#pasteText(rowIdx,colIdx);
        //             }else if(e.keyCode === 88){ // ctrl + x
        //                 e.preventDefault();
        //                 if(this.#ctrlCKeyFunction("002")!==false) this.#deleteKeyFunction(rowIdx,colIdx);
        //             }else if(e.keyCode === 89){ // ctrl + y
        //                 this.#ctrlYKeyFunction(e);
        //             }else if(e.keyCode === 90){ // ctrl + z
        //                 this.#ctrlZKeyFunction(e);
        //             }
        //         }
        //     }else{
        //         if(keyType === "string" || keyType === "number"){
        //             if(editorEl.style.opacity === "0"){
        //                 editorEl.value = "";
        //                 editorEl.style.opacity = "1"

        //                 let top = Number(editorEl.style.top.replace("px",""));
        //                 let height = Math.max(this.#cell.get("height"),50)
        //                 const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
                        
        //                 editorEl.style.top = top + Math.min(EL_HEIGHT - (top + height) + this.el.get("middleBody").scrollTop,0) + "px"
        //                 editorEl.style.height = height + "px"

        //                 let left = Number(editorEl.style.left.replace("px",""));
        //                 let width = Math.max(Number(editorEl.style.width.replace("px","")),100)
        //                 const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
                    
        //                 editorEl.style.left = left + Math.min(EL_WIDTH - (left + width) + this.el.get("middleBody").scrollLeft,0) + "px";
        //                 editorEl.style.width = width + "px";  
        //             }
        //         }
        //     }
        // }
    }

    #editorKeyDown = (e,rowId,colNm,editorEl)=> {
        if(e.ctrlKey && e.keyCode === 17) return;
        if(e.shiftKey && e.keyCode === 16) return;
        
        let rowIdx = this.#getShowOrgDataIndexById(rowId)
        let colIdx = this.#getColumnNameAndIndex(colNm)?.[1];

        this.#removeChildAll(this.el.get("middleBodyContextMenu"))
        this.el.get("middleBodyContextMenu").style.opacity = "0"
        
        if(e.keyCode === 13){   // enter
            e.preventDefault();
            
            if(e.shiftKey){
                this.#enterShiftKeyFunction();
                this.#utils.get("select").set("bodySelectInfo",null)
            }else if(e.ctrlKey){
                this.#enterCtrlKeyFunction(rowIdx,colIdx);
            }else if(e.altKey){
                let tempInput = document.createElement("input")
                this.#utils.get("editor").set("setValueFlag",false);
                editorEl.insertAdjacentElement("afterend",tempInput)
                tempInput.focus();
                tempInput.remove();
                const cursorPos = editorEl.selectionStart;
                const beforeCursor = editorEl.value.substring(0, cursorPos);
                const afterCursor = editorEl.value.substring(cursorPos);
                editorEl.value = beforeCursor + '\n' + afterCursor;
                editorEl.setSelectionRange(cursorPos + 1, cursorPos + 1);
                this.#utils.get("editor").set("setValueFlag",true);
                this.#f2KeyFunction();
                editorEl.style.opacity = "1"
                return;
            }else{
                this.#enterKeyFunction();
            }
            this.#renderGrid();
            //this.#renderBodySelect(this.#utils.get("select").get("bodySelectArray"))
        }else if(e.keyCode === 9){  // tab
            e.preventDefault();
            
            if(e.shiftKey){
                this.#tabShiftKeyFunction();
                this.#utils.get("select").set("bodySelectInfo",null)
            }else{
                this.#tabKeyFunction();
            }
            
            this.#renderGrid();
        }else if(e.keyCode === 27){  // esc
            e.preventDefault();
            
            editorEl.value = this.getCellValue(rowIdx,colNm)
            editorEl.style.opacity = "0"
        }else if(e.keyCode === 37){// arrow left
            if(editorEl.style.opacity === "0"){
                e.preventDefault();
                if(e.shiftKey && e.ctrlKey){
                    this.#arrowLeftShiftCtrlKeyFunction();
                }else if(e.shiftKey){
                    this.#arrowLeftShiftKeyFunction();
                }else if(e.ctrlKey){
                    this.#arrowLeftCtrlKeyFunction();
                }else{
                    let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
                    this.#utils.get("select").set("leftBodySelectArray",new Array())
                    this.#utils.get("select").set("bodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : curInfo.rowIdx,
                        endRowIndex : curInfo.rowIdx,
                        startColIndex : curInfo.colIdx,
                        endColIndex : curInfo.colIdx,
                    }])
                    this.#tabShiftKeyFunction();
                }
                this.#renderGrid();
            }
        }else if(e.keyCode === 38){ // arrow up
            if(editorEl.style.opacity === "0"){
                e.preventDefault();
                if(e.shiftKey && e.ctrlKey){
                    this.#arrowUpShiftCtrlKeyFunction();
                }else if(e.shiftKey){
                    this.#arrowUpShiftKeyFunction();
                }else if(e.ctrlKey){
                    this.#arrowUpCtrlKeyFunction();
                }else{
                    this.#utils.get("select").set("leftBodySelectArray",new Array())
                    let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
                    this.#utils.get("select").set("bodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : curInfo.rowIdx,
                        endRowIndex : curInfo.rowIdx,
                        startColIndex : curInfo.colIdx,
                        endColIndex : curInfo.colIdx,
                    }])
                    this.#enterShiftKeyFunction();
                }
                this.#renderGrid();
            }
        }else if(e.keyCode === 39){ // arrow right
            if(editorEl.style.opacity === "0"){
                e.preventDefault();
                if(e.shiftKey && e.ctrlKey){
                    this.#arrowRightShiftCtrlKeyFunction();
                }else if(e.shiftKey){
                    this.#arrowRightShiftKeyFunction();
                }else if(e.ctrlKey){
                    this.#arrowRightCtrlKeyFunction();
                }else{
                    let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
                    this.#utils.get("select").set("leftBodySelectArray",new Array())
                    this.#utils.get("select").set("bodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : curInfo.rowIdx,
                        endRowIndex : curInfo.rowIdx,
                        startColIndex : curInfo.colIdx,
                        endColIndex : curInfo.colIdx,
                    }])
                    this.#tabKeyFunction();
                }
                this.#renderGrid();
            }
        }else if(e.keyCode === 40){ // arrow down
            if(editorEl.style.opacity === "0"){
                e.preventDefault();
                if(e.shiftKey && e.ctrlKey){
                    this.#arrowDownShiftCtrlKeyFunction();
                }else if(e.shiftKey){
                    this.#arrowDownShiftKeyFunction();
                }else if(e.ctrlKey){
                    this.#arrowDownCtrlKeyFunction();
                }else{
                    let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")
                    this.#utils.get("select").set("leftBodySelectArray",new Array())
                    this.#utils.get("select").set("bodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : curInfo.rowIdx,
                        endRowIndex : curInfo.rowIdx,
                        startColIndex : curInfo.colIdx,
                        endColIndex : curInfo.colIdx,
                    }])
                    this.#enterKeyFunction();
                }
                this.#renderGrid();
            }
        }else if(e.keyCode === 113){ // f2
            this.#f2KeyFunction();
        }else if(e.keyCode === 46){ // delete
            this.#deleteKeyFunction(rowIdx,colIdx);
        }else{
            if(e.isComposing) return;
            let keyType = this.#getKeyType(e.code);
            if(e.ctrlKey){
                if(editorEl.style.opacity === "0"){
                    if(e.keyCode === 65){ // ctrl + a
                        e.preventDefault();
                        this.#ctrlAKeyFunction();
                    }else if(e.keyCode === 67){ // ctrl + c
                        e.preventDefault();
                        this.#ctrlCKeyFunction("001");
                    }else if(e.keyCode === 86){ // ctrl + v
                        e.preventDefault();
                        this.#pasteText(rowIdx,colIdx);
                    }else if(e.keyCode === 88){ // ctrl + x
                        e.preventDefault();
                        if(this.#ctrlCKeyFunction("002")!==false) this.#deleteKeyFunction(rowIdx,colIdx);
                    }else if(e.keyCode === 89){ // ctrl + y
                        this.#ctrlYKeyFunction(e);
                    }else if(e.keyCode === 90){ // ctrl + z
                        this.#ctrlZKeyFunction(e);
                    }
                }
            }else{
                if(keyType === "string" || keyType === "number"){
                    if(editorEl.style.opacity === "0"){
                        editorEl.value = "";
                        editorEl.style.opacity = "1"

                        let top = Number(editorEl.style.top.replace("px",""));
                        let height = Math.max(this.#cell.get("height"),50)
                        const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
                        
                        editorEl.style.top = top + Math.min(EL_HEIGHT - (top + height) + this.el.get("middleBody").scrollTop,0) + "px"
                        editorEl.style.height = height + "px"

                        let left = Number(editorEl.style.left.replace("px",""));
                        let width = Math.max(Number(editorEl.style.width.replace("px","")),100)
                        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
                    
                        editorEl.style.left = left + Math.min(EL_WIDTH - (left + width) + this.el.get("middleBody").scrollLeft,0) + "px";
                        editorEl.style.width = width + "px";  
                    }
                }
            }
        }
    }

    #editorKeyUp = (e,rowId,colNm,editorEl)=> {
        let rowIdx = this.#getShowOrgDataIndexById(rowId);
        let colIdx = this.#getColumnNameAndIndex(colNm)?.[1];
        
        this.el.get("middleHeader").scrollLeft = this.#utils.get("scroll").get("scrollLeftHeader") + this.el.get("middleBody").scrollLeft
        
        if(e.keyCode === 16 
            && this.el.get("middleBodySelectCurrentEditor").style.opacity !== "1"
            && this.#utils.get("select").get("leftBodySelectYn") !== true){
            this.#calcBodySelect(true);
        }
    }

    /*
     * Key function
     */

    #enterKeyFunction = e => {
        // select 계산 처리
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")

        let moveFlag = false

        let nextRowIdx,nextColIdx;

        for(let idx=0;idx<sa.length;idx++){
            // 현재 cell이 포함될때
            if(curInfo.rowIdx>=sa[idx].startRowIndex && curInfo.rowIdx<=sa[idx].endRowIndex
            && curInfo.colIdx>=sa[idx].startColIndex && curInfo.colIdx<=sa[idx].endColIndex){
                if(sa[idx].startRowIndex === sa[idx].endRowIndex){  // 하나의 행
                    if(sa[idx].startColIndex === sa[idx].endColIndex){  // 하나의 셀
                        if(sa.length === 1){
                            nextRowIdx = Math.min(curInfo.rowIdx+1,this.#data.get("showData").length);
                            nextColIdx = curInfo.colIdx;
                            moveFlag = true;
                        }else if(idx === sa.length - 1){
                            nextRowIdx = sa[0].startRowIndex;
                            nextColIdx = sa[0].startColIndex;
                        }else{
                            nextRowIdx = sa[idx+1].startRowIndex;
                            nextColIdx = sa[idx+1].startColIndex;
                        }
                    }else{  //하나의 행, 여러 열
                        if(curInfo.colIdx === sa[idx].endColIndex){ // 현재 선택된 열이 마지막 열일때
                            if(sa.length === 1){
                                nextRowIdx = curInfo.rowIdx;
                                nextColIdx = sa[idx].startColIndex;
                            }else if(idx === sa.length - 1){
                                nextRowIdx = sa[0].startRowIndex;
                                nextColIdx = sa[0].startColIndex;
                            }else{
                                nextRowIdx = sa[idx+1].startRowIndex;
                                nextColIdx = sa[idx+1].startColIndex;
                            }
                        }else{
                            nextRowIdx = curInfo.rowIdx;
                            nextColIdx = this.#columnsOption.get("visibleNextColumnIndex").get(curInfo.colIdx);
                        }
                    }
                }else{  // 여러 행
                    if(curInfo.rowIdx === sa[idx].endRowIndex){ //현재 선택된 행이 마지막 행일때
                        if(sa[idx].startColIndex === sa[idx].endColIndex){ // 여러 행, 하나의 열
                            if(sa.length === 1){
                                nextRowIdx = sa[idx].startRowIndex;
                                nextColIdx = curInfo.colIdx;
                            }else if(idx === sa.length - 1){
                                nextRowIdx = sa[0].startRowIndex;
                                nextColIdx = sa[0].startColIndex;
                            }else{
                                nextRowIdx = sa[idx+1].startRowIndex;
                                nextColIdx = sa[idx+1].startColIndex;
                            }
                        }else{ // 여러 행, 여러 열
                            if(curInfo.colIdx === sa[idx].endColIndex){ // 현재 선택된 열이 마지막 열일때
                                if(sa.length === 1){
                                    nextRowIdx = sa[idx].startRowIndex;
                                    nextColIdx = sa[idx].startColIndex;
                                }else if(idx === sa.length - 1){
                                    nextRowIdx = sa[0].startRowIndex;
                                    nextColIdx = sa[0].startColIndex;
                                }else{
                                    nextRowIdx = sa[idx+1].startRowIndex;
                                    nextColIdx = sa[idx+1].startColIndex;
                                }
                            }else{  // 현재 선택된 열이 마지막 열이 아닐때
                                nextRowIdx = sa[idx].startRowIndex;
                                nextColIdx = this.#columnsOption.get("visibleNextColumnIndex").get(curInfo.colIdx);
                            }
                        }
                    }else{ //현재 선택된 행이 마지막 행이 아닐 때
                        nextRowIdx = curInfo.rowIdx + 1;
                        nextColIdx = curInfo.colIdx;
                    }
                }
                break;
            }
        }

        nextRowIdx = Math.max(Math.min(nextRowIdx,this.#data.get("showData").length-1),0)
        nextColIdx = Math.max(Math.min(nextColIdx,this.#columns.length-1),0)

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : nextRowIdx,
            colIdx : nextColIdx
        });

        if(moveFlag) sa = [{
            deleteYn : false,
            startRowIndex : nextRowIdx,
            endRowIndex : nextRowIdx,
            startColIndex : nextColIdx,
            endColIndex : nextColIdx
        }]                
        
        // scroll 계산 처리
        const PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
        const VISIBLE_ROW_COUNT = this.#utils.get("scroll").get("visibleRowCount");
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");
        
        if(nextRowIdx === PASSED_ROW_COUNT + VISIBLE_ROW_COUNT - 1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(PASSED_ROW_COUNT+1,SCROLL_ROW_COUNT),0))
        else if(nextRowIdx < PASSED_ROW_COUNT || nextRowIdx > PASSED_ROW_COUNT + VISIBLE_ROW_COUNT - 1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(nextRowIdx,SCROLL_ROW_COUNT),0))

        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_INDEX, END_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  
        const PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
        const SCROLL_COL_COUNT= this.#utils.get("scroll").get("scrollColCount");

        START_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0)??0;
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);

        if(this.#columnsOption.get("visiblePrevColumnIndex").get(nextColIdx) === END_INDEX - 1 || nextColIdx === END_INDEX - 1) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(PASSED_COL_COUNT+1,SCROLL_COL_COUNT),0))
        else if(nextColIdx < START_INDEX || nextColIdx >= END_INDEX) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(this.#columnsOption.get("visibleColIndex").get(nextColIdx),SCROLL_COL_COUNT),0))

        this.#utils.get("select").set("bodySelectArray",sa)
    }   

    #enterShiftKeyFunction = e => {
        // select 계산 처리
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")

        let moveFlag = false

        let nextRowIdx,nextColIdx;

        for(let idx=0;idx<sa.length;idx++){
            // 현재 cell이 포함될때
            if(curInfo.rowIdx>=sa[idx].startRowIndex && curInfo.rowIdx<=sa[idx].endRowIndex
            && curInfo.colIdx>=sa[idx].startColIndex && curInfo.colIdx<=sa[idx].endColIndex){
                if(sa[idx].startRowIndex === sa[idx].endRowIndex){  // 하나의 행
                    if(sa[idx].startColIndex === sa[idx].endColIndex){  // 하나의 셀
                        if(sa.length === 1){
                            nextRowIdx = Math.max(curInfo.rowIdx-1,0);
                            nextColIdx = curInfo.colIdx;
                            moveFlag = true;
                        }else if(idx === 0){
                            nextRowIdx = sa[sa.length-1].endRowIndex;
                            nextColIdx = sa[sa.length-1].endColIndex;
                        }else{
                            nextRowIdx = sa[idx-1].endRowIndex;
                            nextColIdx = sa[idx-1].endColIndex;
                        }
                    }else{  //하나의 행, 여러 열
                        if(curInfo.colIdx === sa[idx].startColIndex){ // 현재 선택된 열이 첫번째 열일때
                            if(sa.length === 1){
                                nextRowIdx = curInfo.rowIdx;
                                nextColIdx = sa[idx].endColIndex;
                            }else if(idx === 0){
                                nextRowIdx = sa[sa.length-1].endRowIndex;
                                nextColIdx = sa[sa.length-1].endColIndex;
                            }else{
                                nextRowIdx = sa[idx-1].endRowIndex;
                                nextColIdx = sa[idx-1].endColIndex;
                            }
                        }else{
                            nextRowIdx = curInfo.rowIdx;
                            nextColIdx = this.#columnsOption.get("visiblePrevColumnIndex").get(curInfo.colIdx);
                        }
                    }
                }else{  // 여러 행
                    if(curInfo.rowIdx === sa[idx].startRowIndex){ //현재 선택된 행이 첫번째 행일때
                        if(sa[idx].startColIndex === sa[idx].endColIndex){ // 여러 행, 하나의 열
                            if(sa.length === 1){
                                nextRowIdx = sa[idx].endRowIndex;
                                nextColIdx = sa[idx].endColIndex;
                            }else if(idx === 0){
                                nextRowIdx = sa[sa.length-1].endRowIndex;
                                nextColIdx = sa[sa.length-1].endColIndex;
                            }else{
                                nextRowIdx = sa[idx-1].endRowIndex;
                                nextColIdx = sa[idx-1].endColIndex;
                            }
                        }else{ // 여러 행, 여러 열
                            if(curInfo.colIdx === sa[idx].startColIndex){ // 현재 선택된 열이 첫번째 열일때
                                if(sa.length === 1){
                                    nextRowIdx = sa[idx].endRowIndex;
                                    nextColIdx = sa[idx].endColIndex;
                                }else if(idx === 0){
                                    nextRowIdx = sa[sa.length-1].endRowIndex;
                                    nextColIdx = sa[sa.length-1].endColIndex;
                                }else{
                                    nextRowIdx = sa[idx-1].endRowIndex;
                                    nextColIdx = sa[idx-1].endColIndex;
                                }
                            }else{  // 현재 선택된 열이 마지막 열이 아닐때
                                nextRowIdx = sa[idx].endRowIndex;
                                nextColIdx = this.#columnsOption.get("visiblePrevColumnIndex").get(curInfo.colIdx);
                            }
                        }
                    }else{ //현재 선택된 행이 마지막 행이 아닐 때
                        nextRowIdx = curInfo.rowIdx - 1;
                        nextColIdx = curInfo.colIdx;
                    }
                }
                break;
            }
        }

        nextRowIdx = Math.max(Math.min(nextRowIdx,this.#data.get("showData").length-1),0)
        nextColIdx = Math.max(Math.min(nextColIdx,this.#columns.length-1),0)

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : nextRowIdx,
            colIdx : nextColIdx
        });

        if(moveFlag) sa = [{
            deleteYn : false,
            startRowIndex : nextRowIdx,
            endRowIndex : nextRowIdx,
            startColIndex : nextColIdx,
            endColIndex : nextColIdx
        }]
        
        // scroll 계산 처리
        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
        const VISIBLE_ROW_COUNT = this.#utils.get("scroll").get("visibleRowCount");
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");

        if(nextRowIdx === PASSED_ROW_COUNT -1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(PASSED_ROW_COUNT-1,SCROLL_ROW_COUNT),0))
        else if(nextRowIdx < PASSED_ROW_COUNT || nextRowIdx > PASSED_ROW_COUNT + VISIBLE_ROW_COUNT - 1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(nextRowIdx - VISIBLE_ROW_COUNT + 2,SCROLL_ROW_COUNT),0))

        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_INDEX, END_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  
        const PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
        const SCROLL_COL_COUNT= this.#utils.get("scroll").get("scrollColCount");

        START_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0)??0;
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);

        if(this.#columnsOption.get("visiblePrevColumnIndex").get(nextColIdx) === END_INDEX - 1 || nextColIdx === END_INDEX - 1) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(PASSED_COL_COUNT+1,SCROLL_COL_COUNT),0))
        else if(nextColIdx < START_INDEX || nextColIdx >= END_INDEX) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(this.#columnsOption.get("visibleColIndex").get(nextColIdx),SCROLL_COL_COUNT),0))
        
        this.#utils.get("select").set("bodySelectArray",sa)
    }

    #enterCtrlKeyFunction = (rowIdx,colIdx) => {
        const CHANGE_VALUE = this.getCellValue(rowIdx,colIdx);
        
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")
        let curSa = this.#getCurrentSelectedArea();
        let beforeArr = {};
        let afterArr = {};

        for(let idx=0;idx<sa.length;idx++){
            for(let rowIdx=sa[idx].startRowIndex;rowIdx<=sa[idx].endRowIndex;rowIdx++){
                for(let colIdx=sa[idx].startColIndex;colIdx<=sa[idx].endColIndex;colIdx++){
                    if(this.#columns[colIdx].hidden === true || this.#columns[colIdx].fixed === true) continue;
                    let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
                    
                    let bValue = this.getCellValue(showOrgRowIdx,colIdx);
                    let colName = this.getColumnNameByIndex(colIdx)
                    if(this.#isUN(beforeArr[showOrgRowIdx])) beforeArr[showOrgRowIdx] = {};
                    beforeArr[showOrgRowIdx][colName] = bValue;
                    if(this.#isUN(afterArr[showOrgRowIdx])) afterArr[showOrgRowIdx] = {};
                    afterArr[showOrgRowIdx][colName] = CHANGE_VALUE;

                    this.#setCellValue(showOrgRowIdx,colIdx,CHANGE_VALUE,false,false);
                }
            }
        }

        let undoNumber = this.#utils.get("undoNumber")+1;
        this.#utils.set("undoNumber",undoNumber)

        this.#utils.get("undoArray").push({
            "type"          : "dataMulti",
            "bValue"        : beforeArr,
            "aValue"        : afterArr,
            "undoNumber"    : undoNumber,
            "selectArray"   : sa,
            "curInfo"       : {
                rowIdx : curSa.startRowIndex,
                colIdx : curSa.startColIndex
            }
        })

        this.#utils.set("redoArray",new Array())

        this.#reRenderGrid();
    }

    #tabKeyFunction = e => {
        // select 계산 처리
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")

        let moveFlag = false

        let nextRowIdx,nextColIdx;

        for(let idx=0;idx<sa.length;idx++){
            // 현재 cell이 포함될때
            if(curInfo.rowIdx>=sa[idx].startRowIndex && curInfo.rowIdx<=sa[idx].endRowIndex
            && curInfo.colIdx>=sa[idx].startColIndex && curInfo.colIdx<=sa[idx].endColIndex){
                if(sa[idx].startColIndex === sa[idx].endColIndex){  // 하나의 열
                    if(sa[idx].startRowIndex === sa[idx].endRowIndex){  // 하나의 셀
                        if(sa.length === 1){
                            nextRowIdx = curInfo.rowIdx;
                            nextColIdx = this.#columnsOption.get("visibleNextColumnIndex").get(curInfo.colIdx)??curInfo.colIdx;
                            moveFlag = true;
                        }else if(idx === sa.length - 1){
                            nextRowIdx = sa[0].startRowIndex;
                            nextColIdx = sa[0].startColIndex;
                        }else{
                            nextRowIdx = sa[idx+1].startRowIndex;
                            nextColIdx = sa[idx+1].startColIndex;
                        }
                    }else{  // 여러 행, 하나의 열
                        if(curInfo.rowIdx === sa[idx].endRowIndex){ // 현재 선택된 열이 마지막 열일때
                            if(sa.length === 1){
                                nextRowIdx = sa[idx].startRowIndex;
                                nextColIdx = curInfo.colIdx;
                            }else if(idx === sa.length - 1){
                                nextRowIdx = sa[0].startRowIndex;
                                nextColIdx = sa[0].startColIndex;
                            }else{
                                nextRowIdx = sa[idx+1].startRowIndex;
                                nextColIdx = sa[idx+1].startColIndex;
                            }
                        }else{
                            nextRowIdx = curInfo.rowIdx+1;
                            nextColIdx = curInfo.colIdx;
                        }
                    }
                }else{  // 여러 열
                    if(curInfo.colIdx === sa[idx].endColIndex){ //현재 선택된 열이 마지막 열일때
                        if(sa[idx].startRowIndex === sa[idx].endRowIndex){ // 하나의 행, 여러 열
                            if(sa.length === 1){
                                nextRowIdx = curInfo.rowIdx;
                                nextColIdx = sa[0].startColIndex;
                            }else if(idx === sa.length - 1){
                                nextRowIdx = sa[0].startRowIndex;
                                nextColIdx = sa[0].startColIndex;
                            }else{
                                nextRowIdx = sa[idx+1].startRowIndex;
                                nextColIdx = sa[idx+1].startColIndex;
                            }
                        }else{ // 여러 행, 여러 열
                            if(curInfo.rowIdx === sa[idx].endRowIndex){ // 현재 선택된 행이 마지막 행일때
                                if(sa.length === 1){
                                    nextRowIdx = sa[idx].startRowIndex;
                                    nextColIdx = sa[idx].startColIndex;
                                }else if(idx === sa.length - 1){
                                    nextRowIdx = sa[0].startRowIndex;
                                    nextColIdx = sa[0].startColIndex;
                                }else{
                                    nextRowIdx = sa[idx+1].startRowIndex;
                                    nextColIdx = sa[idx+1].startColIndex;
                                }
                            }else{  // 현재 선택된 행이 마지막 행이 아닐때
                                nextRowIdx = curInfo.rowIdx+1;
                                nextColIdx = sa[idx].startColIndex;
                            }
                        }
                    }else{ //현재 선택된 행이 마지막 행이 아닐 때
                        nextRowIdx = curInfo.rowIdx;
                        nextColIdx = this.#columnsOption.get("visibleNextColumnIndex").get(curInfo.colIdx)??curInfo.colIdx;
                    }
                }
                break;
            }
        }

        nextRowIdx = Math.max(Math.min(nextRowIdx,this.#data.get("showData").length-1),0)
        nextColIdx = Math.max(Math.min(nextColIdx,this.#columns.length-1),0)
        
        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : nextRowIdx,
            colIdx : nextColIdx
        });

        if(moveFlag) sa = [{
            deleteYn : false,
            startRowIndex : nextRowIdx,
            endRowIndex : nextRowIdx,
            startColIndex : nextColIdx,
            endColIndex : nextColIdx
        }]                
        
        // scroll 계산 처리
        const PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
        const VISIBLE_ROW_COUNT = this.#utils.get("scroll").get("visibleRowCount");
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");

        if(nextRowIdx === PASSED_ROW_COUNT + VISIBLE_ROW_COUNT) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(PASSED_ROW_COUNT+1,SCROLL_ROW_COUNT),0))
        else if(nextRowIdx < PASSED_ROW_COUNT || nextRowIdx > PASSED_ROW_COUNT + VISIBLE_ROW_COUNT - 1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(nextRowIdx,SCROLL_ROW_COUNT),0))

        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_INDEX, END_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  
        const PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
        const SCROLL_COL_COUNT= this.#utils.get("scroll").get("scrollColCount");

        START_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0)??0;
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);
        
        if(this.#columnsOption.get("visiblePrevColumnIndex").get(nextColIdx) === END_INDEX - 1 || nextColIdx === END_INDEX - 1) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(PASSED_COL_COUNT+1,SCROLL_COL_COUNT),0))
        else if(nextColIdx < START_INDEX || nextColIdx > END_INDEX) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(this.#columnsOption.get("visibleColIndex").get(nextColIdx),SCROLL_COL_COUNT),0))
        
        this.#utils.get("select").set("bodySelectArray",sa)
    }

    #tabShiftKeyFunction = e => {
        // select 계산 처리
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")

        let moveFlag = false

        let nextRowIdx,nextColIdx;

        for(let idx=0;idx<sa.length;idx++){
            // 현재 cell이 포함될때
            if(curInfo.rowIdx>=sa[idx].startRowIndex && curInfo.rowIdx<=sa[idx].endRowIndex
            && curInfo.colIdx>=sa[idx].startColIndex && curInfo.colIdx<=sa[idx].endColIndex){
                if(sa[idx].startColIndex === sa[idx].endColIndex){  // 하나의 열
                    if(sa[idx].startRowIndex === sa[idx].endRowIndex){  // 하나의 셀
                        if(sa.length === 1){
                            nextRowIdx = curInfo.rowIdx;
                            nextColIdx = this.#columnsOption.get("visiblePrevColumnIndex").get(curInfo.colIdx)??curInfo.colIdx;
                            moveFlag = true;
                        }else if(idx === sa.length - 1){
                            nextRowIdx = sa[0].endRowIndex;
                            nextColIdx = sa[0].endColIndex;
                        }else{
                            nextRowIdx = sa[idx+1].endRowIndex;
                            nextColIdx = sa[idx+1].endColIndex;
                        }
                    }else{  // 여러 행, 하나의 열
                        if(curInfo.rowIdx === sa[idx].startRowIndex){ // 현재 선택된 열이 마지막 열일때
                            if(sa.length === 1){
                                nextRowIdx = sa[idx].endRowIndex;
                                nextColIdx = curInfo.colIdx;
                            }else if(idx === sa.length - 1){
                                nextRowIdx = sa[0].endRowIndex;
                                nextColIdx = sa[0].endColIndex;
                            }else{
                                nextRowIdx = sa[idx+1].endRowIndex;
                                nextColIdx = sa[idx+1].endColIndex;
                            }
                        }else{
                            nextRowIdx = curInfo.rowIdx-1;
                            nextColIdx = curInfo.colIdx;
                        }
                    }
                }else{  // 여러 열
                    if(curInfo.colIdx === sa[idx].startColIndex){ //현재 선택된 열이 마지막 열일때
                        if(sa[idx].startRowIndex === sa[idx].endRowIndex){ // 하나의 행, 여러 열
                            if(sa.length === 1){
                                nextRowIdx = curInfo.rowIdx;
                                nextColIdx = sa[0].endColIndex;
                            }else if(idx === sa.length - 1){
                                nextRowIdx = sa[0].endRowIndex;
                                nextColIdx = sa[0].endColIndex;
                            }else{
                                nextRowIdx = sa[idx+1].endRowIndex;
                                nextColIdx = sa[idx+1].endColIndex;
                            }
                        }else{ // 여러 행, 여러 열
                            if(curInfo.rowIdx === sa[idx].startRowIndex){ // 현재 선택된 행이 마지막 행일때
                                if(sa.length === 1){
                                    nextRowIdx = sa[idx].endRowIndex;
                                    nextColIdx = sa[idx].endColIndex;
                                }else if(idx === sa.length - 1){
                                    nextRowIdx = sa[0].endRowIndex;
                                    nextColIdx = sa[0].endColIndex;
                                }else{
                                    nextRowIdx = sa[idx+1].endRowIndex;
                                    nextColIdx = sa[idx+1].endColIndex;
                                }
                            }else{  // 현재 선택된 행이 마지막 행이 아닐때
                                nextRowIdx = curInfo.rowIdx-1;
                                nextColIdx = sa[idx].endColIndex;
                            }
                        }
                    }else{ //현재 선택된 행이 마지막 행이 아닐 때
                        nextRowIdx = curInfo.rowIdx;
                        nextColIdx = this.#columnsOption.get("visiblePrevColumnIndex").get(curInfo.colIdx)??curInfo.colIdx;
                    }
                }
                break;
            }
        }

        nextRowIdx = Math.max(Math.min(nextRowIdx,this.#data.get("showData").length-1),0)
        nextColIdx = Math.max(Math.min(nextColIdx,this.#columns.length-1),0)

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : nextRowIdx,
            colIdx : nextColIdx
        });

        if(moveFlag) sa = [{
            deleteYn : false,
            startRowIndex : nextRowIdx,
            endRowIndex : nextRowIdx,
            startColIndex : nextColIdx,
            endColIndex : nextColIdx
        }]
        
        // scroll 계산 처리
        let PASSED_ROW_COUNT = this.#utils.get("scroll").get("passedRowCount");
        const VISIBLE_ROW_COUNT = this.#utils.get("scroll").get("visibleRowCount");
        const SCROLL_ROW_COUNT = this.#utils.get("scroll").get("scrollRowCount");

        if(nextRowIdx === PASSED_ROW_COUNT -1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(PASSED_ROW_COUNT-1,SCROLL_ROW_COUNT),0))
        else if(nextRowIdx < PASSED_ROW_COUNT || nextRowIdx > PASSED_ROW_COUNT + VISIBLE_ROW_COUNT - 1) this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(nextRowIdx - VISIBLE_ROW_COUNT + 2,SCROLL_ROW_COUNT),0))

        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
        
        let START_INDEX, END_INDEX, END_WIDTH, TOTAL_INDEX;
        let START_WIDTH = 0;
        let TOTAL_WIDTH = 0;
        let SHOW_WIDTH = 0;

        const COL_TOTAL_COUNT = this.#columns.length;

        let beforeSum = this.#columnsOption.get("columnBeforeSum")
        let columnWidth = this.#columnsOption.get("columnWidth")  
        const PASSED_COL_COUNT = this.#utils.get("scroll").get("passedColCount");
        const SCROLL_COL_COUNT= this.#utils.get("scroll").get("scrollColCount");

        START_INDEX = this.#columnsOption.get("visibleRealColIndex").get(this.#utils.get("scroll").get("passedColCount"));
        END_INDEX = this.#columnsOption.get("columnBeforeSum").filter(value=>{return value < this.#columnsOption.get("columnBeforeSum")[START_INDEX] + EL_WIDTH}).length;
        START_WIDTH = beforeSum[START_INDEX];
        TOTAL_WIDTH = beforeSum[beforeSum.length-1]+columnWidth[columnWidth.length-1];
        SHOW_WIDTH = beforeSum[END_INDEX]+columnWidth[END_INDEX]-beforeSum[START_INDEX];

        START_INDEX = Math.max(Math.min(START_INDEX,COL_TOTAL_COUNT),0)??0;
        END_INDEX = Math.max(Math.min(END_INDEX,COL_TOTAL_COUNT),0);

        if(this.#columnsOption.get("visiblePrevColumnIndex").get(nextColIdx) === END_INDEX - 1 || nextColIdx === END_INDEX - 1) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(PASSED_COL_COUNT+1,SCROLL_COL_COUNT),0))
        else if(nextColIdx < START_INDEX || nextColIdx >= END_INDEX) this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(this.#columnsOption.get("visibleColIndex").get(nextColIdx),SCROLL_COL_COUNT),0))
        
        this.#utils.get("select").set("bodySelectArray",sa)
    }

    #arrowLeftShiftCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        const MIN_COLUMN_INDEX = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
        
        this.#utils.get("select").get("bodySelectArray")[sa.index].startColIndex = MIN_COLUMN_INDEX
        this.#utils.get("select").get("bodySelectArray")[sa.index].endColIndex = curInfo.colIdx

        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowLeftCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        const MIN_COLUMN_INDEX = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());

        this.#utils.get("select").set("bodySelectArray",[{
            deleteYn : false,
            startRowIndex : curInfo.rowIdx,
            endRowIndex : curInfo.rowIdx,
            startColIndex : MIN_COLUMN_INDEX,
            endColIndex : MIN_COLUMN_INDEX,
        }])

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : curInfo.rowIdx,
            colIdx : MIN_COLUMN_INDEX
        })
        
        this.goToColumn(MIN_COLUMN_INDEX)
    }


    #arrowLeftShiftKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        let prevSaStartCol = this.#columnsOption.get("visiblePrevColumnIndex").get(sa.startColIndex);
        let prevSaEndCol = this.#columnsOption.get("visiblePrevColumnIndex").get(sa.endColIndex);
        let prevCurCol = this.#columnsOption.get("visiblePrevColumnIndex").get(curInfo.colIdx);
        
        if(prevSaStartCol === prevCurCol && curInfo.colIdx !== sa.endColIndex && !this.#isUN(prevSaStartCol) & !this.#isUN(prevCurCol)){
            this.#utils.get("select").get("bodySelectArray")[sa.index].endColIndex = (prevSaEndCol??sa.endColIndex)
        }else{
            this.#utils.get("select").get("bodySelectArray")[sa.index].startColIndex = (prevSaStartCol??sa.startColIndex)
        }

        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowUpShiftCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        this.#utils.get("select").get("bodySelectArray")[sa.index].startRowIndex = 0
        this.#utils.get("select").get("bodySelectArray")[sa.index].endRowIndex = curInfo.rowIdx;

        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowUpCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;
        
        this.#utils.get("select").set("bodySelectArray",[{
            deleteYn : false,
            startRowIndex : 0,
            endRowIndex : 0,
            startColIndex : curInfo.colIdx,
            endColIndex : curInfo.colIdx,
        }])

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : 0,
            colIdx : curInfo.colIdx
        })

        this.goToRow(0)
    }
    
    #arrowUpShiftKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;
        
        if(sa.startRowIndex === curInfo.rowIdx && curInfo.rowIdx !== sa.endRowIndex && !this.#isUN(sa.startRowIndex) & !this.#isUN(curInfo.rowIdx)){
            this.#utils.get("select").get("bodySelectArray")[sa.index].endRowIndex = Math.max(Math.min(this.#utils.get("select").get("bodySelectArray")[sa.index].endRowIndex-1,this.#data.get("showData").length-1),0)
        }else{
            this.#utils.get("select").get("bodySelectArray")[sa.index].startRowIndex = Math.max(Math.min(this.#utils.get("select").get("bodySelectArray")[sa.index].startRowIndex-1,this.#data.get("showData").length-1),0)
        }

        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowRightShiftCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        const MAX_COLUMN_INDEX = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());
        
        this.#utils.get("select").get("bodySelectArray")[sa.index].startColIndex = curInfo.colIdx
        this.#utils.get("select").get("bodySelectArray")[sa.index].endColIndex = MAX_COLUMN_INDEX
        
        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowRightCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        const MAX_COLUMN_INDEX = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

        this.#utils.get("select").set("bodySelectArray",[{
            deleteYn : false,
            startRowIndex : curInfo.rowIdx,
            endRowIndex : curInfo.rowIdx,
            startColIndex : MAX_COLUMN_INDEX,
            endColIndex : MAX_COLUMN_INDEX,
        }])

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : curInfo.rowIdx,
            colIdx : MAX_COLUMN_INDEX
        })

        this.goToColumn(MAX_COLUMN_INDEX)
    }

    #arrowRightShiftKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        let nextSaStartCol = this.#columnsOption.get("visibleNextColumnIndex").get(sa.startColIndex);
        let nextSaEndCol = this.#columnsOption.get("visibleNextColumnIndex").get(sa.endColIndex);
        let nextCurCol = this.#columnsOption.get("visibleNextColumnIndex").get(curInfo.colIdx);
        
        if(nextSaEndCol === nextCurCol && curInfo.colIdx !== sa.startColIndex && !this.#isUN(nextSaEndCol) & !this.#isUN(nextCurCol)){
            this.#utils.get("select").get("bodySelectArray")[sa.index].startColIndex = (nextSaStartCol??sa.startColIndex)
        }else{
            this.#utils.get("select").get("bodySelectArray")[sa.index].endColIndex = (nextSaEndCol??sa.endColIndex)
        }
        
        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowDownShiftCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;

        this.#utils.get("select").get("bodySelectArray")[sa.index].startRowIndex = curInfo.rowIdx
        this.#utils.get("select").get("bodySelectArray")[sa.index].endRowIndex = this.#data.get("showData").length-1;

        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #arrowDownCtrlKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;
        
        this.#utils.get("select").set("bodySelectArray",[{
            deleteYn : false,
            startRowIndex : this.#data.get("showData").length-1,
            endRowIndex : this.#data.get("showData").length-1,
            startColIndex : curInfo.colIdx,
            endColIndex : curInfo.colIdx,
        }])

        this.#utils.get("select").set("bodySelectCurrentInfo",{
            rowIdx : this.#data.get("showData").length-1,
            colIdx : curInfo.colIdx
        })

        this.goToRow(this.#data.get("showData").length-1)
    }

    #arrowDownShiftKeyFunction = e => {
        let sa = this.#getCurrentSelectedArea();
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(sa) || this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)) return;
        
        if(sa.endRowIndex === curInfo.rowIdx && curInfo.rowIdx !== sa.startRowIndex && !this.#isUN(sa.endRowIndex) & !this.#isUN(curInfo.rowIdx)){
            this.#utils.get("select").get("bodySelectArray")[sa.index].startRowIndex = Math.max(Math.min(this.#utils.get("select").get("bodySelectArray")[sa.index].startRowIndex+1,this.#data.get("showData").length-1),0)
        }else{
            this.#utils.get("select").get("bodySelectArray")[sa.index].endRowIndex = Math.max(Math.min(this.#utils.get("select").get("bodySelectArray")[sa.index].endRowIndex+1,this.#data.get("showData").length-1),0)
        }
        
        let selectInfo = this.#utils.get("select").get("bodySelectArray")[sa.index];
        selectInfo["deleteYn"] = false

        this.#utils.get("select").set("bodySelectInfo",selectInfo)
    }

    #f2KeyFunction = e => {
        this.el.get("middleBodySelectCurrentEditor").style.opacity = "1"
                    
        let top = Number(this.el.get("middleBodySelectCurrentEditor").style.top.replace("px",""));
        let height = Math.max(this.#cell.get("height"),50)
        const EL_HEIGHT = this.#utils.get("scroll").get("elHeight");
        
        this.el.get("middleBodySelectCurrentEditor").style.top = top + Math.min(EL_HEIGHT - (top + height) + this.el.get("middleBody").scrollTop ,0) + "px"
        this.el.get("middleBodySelectCurrentEditor").style.height = height + "px"

        let left = Number(this.el.get("middleBodySelectCurrentEditor").style.left.replace("px",""));
        let width = Math.max(Number(this.el.get("middleBodySelectCurrentEditor").style.width.replace("px","")),100)
        const EL_WIDTH = this.#utils.get("scroll").get("elWidth");
    
        this.el.get("middleBodySelectCurrentEditor").style.left = left + Math.min(EL_WIDTH - (left + width) + this.el.get("middleBody").scrollLeft,0) + "px";
        this.el.get("middleBodySelectCurrentEditor").style.width = width + "px";    

        this.el.get("middleBodySelectCurrentEditor").removeAttribute("inputmode");
        this.el.get("middleBodySelectCurrentEditor").focus();
    }

    #deleteKeyFunction = (curRowIdx,curColIdx) => {                
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")
        let curSa = this.#getCurrentSelectedArea();
        let beforeArr = {};
        let afterArr = {};

        let lsa = this.#utils.get("select").get("leftBodySelectArray")

        for(let idx=0;idx<sa.length;idx++){
            for(let rowIdx=sa[idx].startRowIndex;rowIdx<=sa[idx].endRowIndex;rowIdx++){
                for(let colIdx=sa[idx].startColIndex;colIdx<=sa[idx].endColIndex;colIdx++){
                    if(this.#columns[colIdx].hidden === true || this.#columns[colIdx].fixed === true) continue;
                    let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx));

                    let bValue = this.getCellValue(showOrgRowIdx,colIdx);
                    let colName = this.getColumnNameByIndex(colIdx)
                    if(this.#isUN(beforeArr[showOrgRowIdx])) beforeArr[showOrgRowIdx] = {};
                    beforeArr[showOrgRowIdx][colName] = bValue;

                    if(this.#isUN(afterArr[showOrgRowIdx])) afterArr[showOrgRowIdx] = {};
                    afterArr[showOrgRowIdx][colName] = "";
                    
                    this.#setCellValue(showOrgRowIdx,colIdx,"",false,false);
                }
            }
        }

        if(lsa.length>0){
            for(let idx=0;idx<lsa.length;idx++){
                let fixedCols = this.#columnsOption.get("fixedColumnRealIndex");
                for(let rowIdx=lsa[idx].startRowIndex;rowIdx<=lsa[idx].endRowIndex;rowIdx++){
                    for(let colKey of fixedCols.keys().toArray()){
                        let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx));
                        let colIdx = fixedCols.get(colKey);

                        let bValue = this.getCellValue(showOrgRowIdx,colIdx);
                        let colName = this.getColumnNameByIndex(colIdx)
                        if(this.#isUN(beforeArr[showOrgRowIdx])) beforeArr[showOrgRowIdx] = {};
                        beforeArr[showOrgRowIdx][colName] = bValue;

                        if(this.#isUN(afterArr[showOrgRowIdx])) afterArr[showOrgRowIdx] = {};
                        afterArr[showOrgRowIdx][colName] = "";

                        this.#setCellValue(showOrgRowIdx,colIdx,"",false,false);
                    }
                }
            }
        }

        let undoNumber = this.#utils.get("undoNumber")+1;
        this.#utils.set("undoNumber",undoNumber)

        this.#utils.get("undoArray").push({
            "type"          : "dataMulti",
            "bValue"        : beforeArr,
            "aValue"        : afterArr,
            "undoNumber"    : undoNumber,
            "selectArray"   : sa,
            "leftSelectArray": lsa,
            "curInfo"       : {
                rowIdx : curRowIdx,
                colIdx : curColIdx
            }
        })

        this.#utils.set("redoArray",new Array())

        this.#reRenderGrid();
    }

    #ctrlAKeyFunction = e => {
        const MIN_COLUMN_INDEX = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
        const MAX_COLUMN_INDEX = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

        this.#utils.get("select").set("bodySelectArray",[{
            deleteYn : false,
            startRowIndex : 0,
            endRowIndex : this.#data.get("showData").length-1,
            startColIndex : MIN_COLUMN_INDEX,
            endColIndex : MAX_COLUMN_INDEX,
        }])

        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo")

        if(this.#isUN(curInfo.rowIdx) || this.#isUN(curInfo.colIdx)){
            this.#utils.get("select").set("bodySelectCurrentInfo",{
                rowIdx : 0,
                colIdx : MIN_COLUMN_INDEX
            })
        }                

        this.#reRenderGrid();
    }

    #ctrlCKeyFunction = msg => {
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")
        let lsa = this.#utils.get("select").get("leftBodySelectArray")
        
        if(sa.length===1){
            let copyStr = "";
            let [minRow,maxRow,minCol,maxCol] = [sa[0].startRowIndex,sa[0].endRowIndex,sa[0].startColIndex,sa[0].endColIndex]
            for(let rowIdx=minRow;rowIdx<=maxRow;rowIdx++){
                if(this.getStatus(this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))) === "D") continue;
                if(copyStr!=="") copyStr += "\n"
                let rowStr="";
                let rowCnt = 0;
                
                if(lsa.length > 0){
                    let fixedCols = this.#columnsOption.get("fixedColumnRealIndex");
                    for(let colKey of fixedCols.keys().toArray()){
                        let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx));
                        let colIdx = fixedCols.get(colKey);
                        
                        let cellValue = this.getCellValue(showOrgRowIdx,colIdx)??"";
                        
                        if(rowCnt!==0) rowStr += "\t"
                        rowCnt++;
                        rowStr += cellValue;
                    }
                }

                for(let colIdx=minCol;colIdx<=maxCol;colIdx++){
                    if(this.#columns[colIdx].hidden === true || this.#columns[colIdx].fixed === true) continue;
                    let cellValue;

                    let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
                    cellValue = this.getCellValue(showOrgRowIdx,colIdx)??"";

                    if(rowCnt!==0) rowStr += "\t"
                    rowCnt++;
                    rowStr += cellValue;
                }
                copyStr += rowStr
            }
            
            this.#copyText(copyStr)
        }else if(sa.length>1){
            alert(this.#getMessage("ct"+msg));
            return false;
        }
    }
    
    #ctrlVKeyFunction = (text,rowIdx,colIdx) => {
        let curInfo = this.#utils.get("select").get("bodySelectCurrentInfo");
        let sa = this.#utils.get("select").get("bodySelectArray")
        
        if(sa.length===1){
            let copyStr = "";
            let [minRow,minCol] = [sa[0].startRowIndex,sa[0].startColIndex];

            let tempEl = document.createElement("textarea");
            tempEl.style.opacity = "0";
            tempEl.style.position = "absolute"

            this.el.get("middleBodySelectCurrentEditor").insertAdjacentElement("afterend",tempEl);
            tempEl.focus()
            
            let pasteText = text.replaceAll("\r","");

            let pasteTempArray = pasteText.split("\n");

            let pasteArray = new Array();

            pasteTempArray.forEach(value => {
                if(value !== "") pasteArray.push(value.split("\t"))
            })

            let lastRowFlag = false;
            let rowIdx = minRow;
            let colIdx;
            
            let maxRow = 0;
            let maxCol = 0;

            let curSa = this.#getCurrentSelectedArea();

            let beforeArr = {};
            let afterArr = {};

            for(let idx=0;idx<pasteArray.length;idx++){
                colIdx = minCol;
                let lastColFlag = false;
                if(lastRowFlag) break;

                maxRow = Math.max(rowIdx,maxRow);

                for(let idx2=0;idx2<pasteArray[idx].length;idx2++){
                    if(lastColFlag) continue;

                    maxCol = Math.max(colIdx,maxCol);

                    let showOrgRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(rowIdx))
                    
                    let bValue = this.getCellValue(showOrgRowIdx,colIdx);
                    let colName = this.getColumnNameByIndex(colIdx)

                    if(this.#isUN(beforeArr[showOrgRowIdx])) beforeArr[showOrgRowIdx] = {};
                    beforeArr[showOrgRowIdx][colName] = bValue;
                    if(this.#isUN(afterArr[showOrgRowIdx])) afterArr[showOrgRowIdx] = {};
                    afterArr[showOrgRowIdx][colName] = pasteArray[idx][idx2];
                
                    this.#setCellValue(showOrgRowIdx,colIdx,pasteArray[idx][idx2],false, false);

                    if(colIdx!==this.#columnsOption.get("lastVisibleColumn")) colIdx = this.#columnsOption.get("visibleNextColumnIndex").get(colIdx)
                    else lastColFlag = true;
                }

                if(rowIdx!==this.#data.get("showData").length-1) rowIdx++;
                else lastColFlag = true;
            }
            
            this.#utils.get("select").set("bodySelectArray",[{
                deleteYn : false,
                startRowIndex : minRow,
                endRowIndex : maxRow,
                startColIndex : minCol,
                endColIndex : maxCol,
            }])

            let curRow,curCol;

            if(
                curInfo.rowIdx >= minRow 
                && curInfo.rowIdx <= maxRow
                && curInfo.colIdx >= minCol
                && curInfo.colIdx <= maxCol
                ){
                curRow = curInfo.rowIdx;
                curCol = curInfo.colIdx;
            }else{
                curRow = minRow;
                curCol = minCol;
            }

            this.#utils.get("select").set("bodySelectCurrentInfo",{
                rowIdx : curRow,
                colIdx : curCol
            })

            let undoNumber = this.#utils.get("undoNumber")+1;
            this.#utils.set("undoNumber",undoNumber)

            this.#utils.get("undoArray").push({
                "type"          : "dataMulti",
                "bValue"        : beforeArr,
                "aValue"        : afterArr,
                "undoNumber"    : undoNumber,
                "selectArray"   : [{
                    deleteYn : false,
                    startRowIndex : minRow,
                    endRowIndex : maxRow,
                    startColIndex : minCol,
                    endColIndex : maxCol
                }],
                "curInfo"       : {
                    rowIdx : curRow,
                    colIdx : curCol
                }
            })

            this.#utils.set("redoArray",new Array())
            

            //let showOrgCurRowIdx = this.#getShowOrgDataIndexById(this.#getIdByShowDataIndex(curRow))
            //let curValue = this.getCellValue(showOrgCurRowIdx,curCol);
            //this.el.get("middleBodySelectCurrentEditor").value = curValue;

            tempEl.remove();

            this.el.get("middleBodySelectCurrentEditor").focus();
            
            this.#reRenderGrid();
        }else if(sa.length>1){
            alert(this.#getMessage("ct003"));
            return false;
        }
    }

    #ctrlYKeyFunction = () => {
        let redoCnt = 0;
        let undoNumber = this.#utils.get("undoNumber");
        let curInfo, selectArray;

        for(let idx=this.#utils.get("redoArray").length-1;idx>=0;idx--){
            let redoTarget = this.#utils.get("redoArray")[idx];
            
            if(redoTarget.undoNumber !== undoNumber+1){
                break;
            }
            
            if(redoTarget.type === "data"){ 
                let colIdx = this.#getColumnNameAndIndex(redoTarget.colNm)[1]
                if(this.#columns[colIdx].fixed !== true){
                    this.#utils.get("select").set("leftBodySelectArray",new Array());
                    this.#utils.get("select").set("bodySelectCurrentInfo",redoTarget.curInfo);
                    this.#utils.get("select").set("bodySelectArray",redoTarget.selectArray);
                }else{
                    const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
                    const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

                    this.#utils.get("select").set("leftBodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : redoTarget.rowIdx,
                        endRowIndex : redoTarget.rowIdx,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MIN_VISIBLE_COL
                    }]);
                    this.#utils.get("select").set("bodySelectCurrentInfo",{
                        rowIdx : redoTarget.rowIdx,
                        colIdx : MIN_VISIBLE_COL
                    });
                    this.#utils.get("select").set("bodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : redoTarget.rowIdx,
                        endRowIndex : redoTarget.rowIdx,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    }]);
                }

                this.#setCellValue(redoTarget.rowIdx,redoTarget.colNm,redoTarget.aValue, false, false, null, false);

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "dataMulti"){ 
                if(redoCnt === 0 && this.#utils.get("sortInfo").get("sortOrder").length === 0 && this.#utils.get("filterInfo").get("filterOrder").length === 0){
                    this.#utils.get("select").set("bodySelectCurrentInfo",redoTarget.curInfo);
                    this.#utils.get("select").set("bodySelectArray",redoTarget.selectArray);
                }

                for(let [rowIdx,rowData] of Object.entries(redoTarget.aValue)){
                    for(let [colName,value] of Object.entries(rowData)){
                        this.#setCellValue(rowIdx,colName,value,false,false)
                    }
                }

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "removeRow"){ 
                if(redoCnt === 0 && this.#utils.get("sortInfo").get("sortOrder").length === 0 && this.#utils.get("filterInfo").get("filterOrder").length === 0){
                    this.#utils.get("select").set("bodySelectCurrentInfo",redoTarget.curInfo);
                    this.#utils.get("select").set("bodySelectArray",redoTarget.selectArray);
                }

                this.#removeRow(redoTarget.rowIdx,redoTarget.renderYn,false)

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "insertRow"){                         
                this.#insertRow(redoTarget.rowIdx,redoTarget.beforeYn,null,false)

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "removeColumn"){
                this.#removeColumn(redoTarget.colName,false)

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "insertColumn"){
                this.#insertColumn(redoTarget.colName,redoTarget.option,redoTarget.beforeYn,redoTarget.data,false)

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "hideColumn"){  
                this.#utils.get("select").set("bodySelectCurrentInfo",{
                    rowIdx : 0,
                    colIdx : redoTarget.colIdx
                });
                this.#utils.get("select").set("bodySelectArray",{
                    deleteYn : false,
                    startRowIndex : 0,
                    endRowIndex : this.#data.get("showData").length-1,
                    startColIndex : redoTarget.colIdx,
                    endColIndex : redoTarget.colIdx,
                });      
                
                this.#showHideColumn(redoTarget.colName,redoTarget.hidden,false)

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);
                
                redoCnt++;
            }else if(redoTarget.type === "showColumn"){  
                this.#utils.get("select").set("bodySelectCurrentInfo",redoTarget.curInfo);
                this.#utils.get("select").set("bodySelectArray",redoTarget.selectArray);  
                this.#showHideColumn(redoTarget.colName,redoTarget.hidden,false)

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);
                
                redoCnt++;
            }else if(redoTarget.type === "selectUndo"){
                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }else if(redoTarget.type === "selectRedo"){
                curInfo = this.#deepCopy(redoTarget.curInfo)
                selectArray = this.#deepCopy(redoTarget.selectArray);

                this.#utils.get("undoArray").push(this.#utils.get("redoArray").splice(idx,1)[0]);

                redoCnt++;
            }
        }

        if(redoCnt>0) this.#utils.set("undoNumber",Math.max(0,undoNumber+1));

        if(!this.#isUN(curInfo) && !this.#isUN(selectArray)){
            this.#utils.get("select").set("bodySelectCurrentInfo",curInfo);
            this.#utils.get("select").set("bodySelectArray",selectArray);
        } 

        this.#utils.get("editor").set("setValueFlag",false)
        this.#reRenderGrid();
        this.#utils.get("editor").set("setValueFlag",true)
    }

    #ctrlZKeyFunction = (e) => {
        e.preventDefault()
        let undoCnt = 0;
        let undoNumber = this.#utils.get("undoNumber");
        let curInfo, selectArray;
        
        for(let idx=this.#utils.get("undoArray").length-1;idx>=0;idx--){
            let undoTarget = this.#utils.get("undoArray")[idx];

            if(undoTarget.undoNumber !== undoNumber){
                break;
            }
            
            if(undoTarget.type === "data"){
                if(undoCnt === 0){
                    let colIdx = this.#getColumnNameAndIndex(undoTarget.colNm)[1]
                    if(this.#columns[colIdx].fixed !== true){
                        this.#utils.get("select").set("leftBodySelectArray",new Array());
                        this.#utils.get("select").set("bodySelectCurrentInfo",undoTarget.curInfo);
                        this.#utils.get("select").set("bodySelectArray",undoTarget.selectArray);
                    }else{
                        const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
                        const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

                        this.#utils.get("select").set("leftBodySelectArray",[{
                            deleteYn : false,
                            startRowIndex : undoTarget.rowIdx,
                            endRowIndex : undoTarget.rowIdx,
                            startColIndex : MIN_VISIBLE_COL,
                            endColIndex : MIN_VISIBLE_COL
                        }]);
                        this.#utils.get("select").set("bodySelectCurrentInfo",{
                            rowIdx : undoTarget.rowIdx,
                            colIdx : MIN_VISIBLE_COL
                        });
                        this.#utils.get("select").set("bodySelectArray",[{
                            deleteYn : false,
                            startRowIndex : undoTarget.rowIdx,
                            endRowIndex : undoTarget.rowIdx,
                            startColIndex : MIN_VISIBLE_COL,
                            endColIndex : MAX_VISIBLE_COL
                        }]);
                    }
                }

                this.#setCellValue(undoTarget.rowIdx,undoTarget.colNm,undoTarget.bValue, false, false);

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);

                undoCnt++;
            }else if(undoTarget.type === "dataMulti"){
                if(!this.#isUN(undoTarget.leftSelectArray)){
                    this.#utils.get("select").set("leftBodySelectArray",undoTarget.leftSelectArray);
                }
                if(undoCnt === 0 && this.#utils.get("sortInfo").get("sortOrder").length === 0 && this.#utils.get("filterInfo").get("filterOrder").length === 0){
                    this.#utils.get("select").set("bodySelectCurrentInfo",undoTarget.curInfo);
                    this.#utils.get("select").set("bodySelectArray",undoTarget.selectArray);
                }

                for(let [rowIdx,rowData] of Object.entries(undoTarget.bValue)){
                    for(let [colName,value] of Object.entries(rowData)){
                        this.#setCellValue(rowIdx,colName,value,false,false)
                    }
                }

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "removeRow"){
                let rowIdx = (undoTarget.rowIdx!==0?undoTarget.rowIdx-1:undoTarget.rowIdx)
                let beforeYn = (undoTarget.rowIdx!==0?false:true)

                let data = this.#deepCopy(undoTarget.data);
                data["IUDFLAG"] = undoTarget.IUDFLAG
                
                if(undoTarget.renderYn){
                    this.#insertRow(rowIdx,beforeYn,data,false)
                }else this.#setCellValue((beforeYn?rowIdx:rowIdx+1),"IUDFLAG",undoTarget.IUDFLAG,true,false)

                const MIN_VISIBLE_COL = Math.min(...this.#columnsOption.get("visibleColIndex").keys().toArray());
                const MAX_VISIBLE_COL = Math.max(...this.#columnsOption.get("visibleColIndex").keys().toArray());

                if(undoCnt === 0 && this.#utils.get("sortInfo").get("sortOrder").length === 0 && this.#utils.get("filterInfo").get("filterOrder").length === 0){
                    this.#utils.get("select").set("bodySelectCurrentInfo",{
                        rowIdx : beforeYn?rowIdx:rowIdx+1,
                        colIdx : MIN_VISIBLE_COL
                    });
                    this.#utils.get("select").set("bodySelectArray",[{
                        deleteYn : false,
                        startRowIndex : beforeYn?rowIdx:rowIdx+1,
                        endRowIndex : beforeYn?rowIdx:rowIdx+1,
                        startColIndex : MIN_VISIBLE_COL,
                        endColIndex : MAX_VISIBLE_COL
                    }]);
                }

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "insertRow"){
                let rowIdx = (undoTarget.beforeYn?undoTarget.rowIdx:undoTarget.rowIdx+1)
                
                this.#removeRow(rowIdx,true,false)

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "removeColumn"){     
                let colNI = this.#getColumnNameAndIndex(undoTarget.colIdx);

                let colName = (this.#isUN(colNI)?this.#columns[this.#columns.length-1].name:colNI[0]);
                let beforeYn = (this.#isUN(colNI)?false:true);
                
                this.#insertColumn(colName,undoTarget.option,beforeYn,undoTarget.data,false);

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "insertColumn"){                        
                this.#removeColumn(undoTarget.newColName,false)

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "hideColumn"){  
                this.#utils.get("select").set("bodySelectCurrentInfo",undoTarget.curInfo);
                this.#utils.get("select").set("bodySelectArray",undoTarget.selectArray);      
                this.#showHideColumn(undoTarget.colName,!undoTarget.hidden,false)

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "showColumn"){  
                
                this.#utils.get("select").set("bodySelectCurrentInfo",{
                    rowIdx : 0,
                    colIdx : undoTarget.colIdx
                });
                this.#utils.get("select").set("bodySelectArray",{
                    deleteYn : false,
                    startRowIndex : 0,
                    endRowIndex : this.#data.get("showData").length-1,
                    startColIndex : undoTarget.colIdx,
                    endColIndex : undoTarget.colIdx,
                });      
                    
                this.#showHideColumn(undoTarget.colName,!undoTarget.hidden,false)

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "selectUndo"){      
                curInfo = this.#deepCopy(undoTarget.curInfo)
                selectArray = this.#deepCopy(undoTarget.selectArray);

                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }else if(undoTarget.type === "selectRedo"){      
                this.#utils.get("redoArray").push(this.#utils.get("undoArray").splice(idx,1)[0]);
                
                undoCnt++;
            }
        }

        if(!this.#isUN(curInfo) && !this.#isUN(selectArray)){
            this.#utils.get("select").set("bodySelectCurrentInfo",curInfo);
            this.#utils.get("select").set("bodySelectArray",selectArray);
        }

        this.#utils.set("undoNumber",Math.max(0,undoNumber-1));
        this.#utils.get("editor").set("setValueFlag",false)
        this.#reRenderGrid();
        this.#utils.get("editor").set("setValueFlag",true)

        /*setTimeout(()=>{
            this.el.get("middleBodySelectCurrentEditor").focus();
        },4)*/
        //this.#renderBodySelect(this.#utils.get("select").get("bodySelectArray"));  
    }

    /**
     * 외부 함수
     */

    setData = (data,appendYn=false,renderYn=true) =>{
        if(this.#isUN(data)){
            console.error("No data input!");
            return;
        }
        
        let [fullData, showData,showOrgData, orgData] = this.#deepCopyAllData(data,appendYn)

        if(appendYn === true){
            this.#data.set("fullData",this.#data.get("fullData").concat(fullData))
            this.#data.set("showData",this.#data.get("showData").concat(showData))
            this.#data.set("showOrgData",this.#data.get("showOrgData").concat(showOrgData))
            this.#data.set("orgData",this.#data.get("orgData").concat(orgData))
        }else if(appendYn === false){                            
            this.#data.set("fullData",fullData)
            this.#data.set("showData",showData)
            this.#data.set("showOrgData",showOrgData)
            this.#data.set("orgData",orgData)
            this.#utils.set("checkedRow",new Map())
        }else{
            console.error("Second parameter is wrong. (true or false)");
            return;
        }    
        
        if(renderYn === true){
            // select 초기화
            this.#utils.get("select").set("bodySelectArray",new Array());
            this.#reRenderGrid();
        }
    }

    getData = () =>{
        return this.#data.get("showOrgData").filter(value=>{return value.IUDFLAG !== "D"});
    }

    getFullData = () =>{
        return this.#data.get("fullData");
    }

    getVisibleColumnIndexByName = colName => {
        return this.#columnsOption.get("visibleColumnName").get(colName)
    }

    getColumnIndexByName = colName => {
        return this.#columnsOption.get("columnName").get(colName)
    }
    
    getCellValue = (rowIdx,colName) => {
        if(typeof colName === "number") colName = this.getColumnNameByIndex(colName)
        return this.#data.get("showOrgData")?.[rowIdx]?.[colName]
    }

    setCellValue = (rowIdx,colName,value) => {
        this.#setCellValue(rowIdx,colName,value)
    }

    getStatus = rowIdx => {
        if(typeof colName === "number") colName = this.getColumnNameByIndex(colName)
        return this.#data.get("showOrgData")?.[rowIdx]?.["IUDFLAG"];
    }
    
    removeRow = (rowIdx,renderYn=true) => {
        this.#removeRow(rowIdx,renderYn)
    }

    insertRow = (rowIdx,beforeYn = true, data) => {
        this.#insertRow(rowIdx,beforeYn = true, data)
    }

    removeColumn = (colName) => {
        this.#removeColumn(colName)
    }

    insertColumn = (colName,colInfo,beforeYn=true) => {
        this.#insertColumn(colName,colInfo,beforeYn);
    }

    hideColumn = colName => {
        this.#showHideColumn(colName,true)
    }

    showColumn = colName => {
        this.#showHideColumn(colName,false)
    }

    goToRow = rowIdx => {
        this.#utils.get("scroll").set("passedRowCount",Math.max(Math.min(Number(rowIdx),this.#utils.get("scroll").get("scrollRowCount")),0)??0);
        this.#renderGrid();
    }
    
    goToColumn = colName => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }

        this.#utils.get("scroll").set("passedColCount",Math.max(Math.min(Number(this.#columnsOption.get("visibleColIndex").get(colIdx)),this.#utils.get("scroll").get("scrollColCount")),0));
        this.#renderGrid();
    }
    
    goToCell = (rowIdx,colName) => {
        this.goToRow(rowIdx);
        this.goToColumn(colName);
    }

    getColumnNameByIndex = colIdx => {
        return this.#columns[colIdx]?.name
    }

    getColumnType = colIdx => {
        return (this.#columns[colIdx]?.type)??"text";
    }

    getSortType = colName => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }
        
        if(!this.#utils.get("sortInfo").get("sortType").has(colName)) return "NORMAL";
        else return this.#utils.get("sortInfo").get("sortType").get(colName);
    }

    sortData = (colName,sortType) => {
        let colIdx;
        if(typeof colName === "number"){
            colIdx = colName
            colName = this.getColumnNameByIndex(colIdx)
        }else{
            colIdx = this.getColumnIndexByName(colName)
        }

        this.#utils.get("sortInfo").get("sortType").set(colName,sortType);

        let sortOrder = this.#utils.get("sortInfo").get("sortOrder")
        let indexOf = sortOrder.indexOf(colName)

        if(sortType === "NORMAL" && indexOf !== -1) sortOrder.splice(indexOf,1)
        else if(indexOf === -1) sortOrder.push(colName);

        this.#utils.get("sortInfo").set("sortOrder",sortOrder);
        
        this.#calcShowData();

        this.#reRenderGrid();
    }

    getElWidth = () => this.#utils.get("scroll").get("elWidth");
    setElWidth = (elWidth) => this.#utils.get("scroll").set("elWidth",elWidth);
    deleteElWidth = () => this.#utils.get("scroll").get("elWidth");

    getElHeight = () => this.#utils.get("scroll").get("elHeight");
    setElHeight = (elHeight) => this.#utils.get("scroll").set("elHeight",elHeight);
    deleteElHeight = () => this.#utils.get("scroll").delete("elHeight");

    reRenderGrid = (option) => this.#reRenderGrid(option);


    /**
     * util 내부 함수
     */
    #isUN = value => {
        return value === undefined || value === null
    }

    #pasteText = (rowIdx,colIdx) => {
        const textArea = document.createElement('textarea');
        document.body.appendChild(textArea);
        textArea.focus();
        if (navigator.clipboard !== undefined) {
            navigator.clipboard.readText()
            .then((text)=>{
                this.#ctrlVKeyFunction(text,rowIdx,colIdx);
            })
            .catch(err=>{
                // execCommand 사용
                try {
                    document.execCommand('paste')

                    this.#ctrlVKeyFunction(textArea.value,rowIdx,colIdx);
                } catch (err) {
                    console.error(err);
                }
            })
        } else {
            // execCommand 사용
            try {
                document.execCommand('paste')

                this.#ctrlVKeyFunction(textArea.value,rowIdx,colIdx);
            } catch (err) {
                console.error(err);
            }
        }
        textArea.remove();
    }

    #copyText = text => {
        if (navigator.clipboard !== undefined) {
            navigator.clipboard.writeText(text)
            .then(()=>{
                //alert(this.#getMessage("ct004"))
            })
            .catch(err=>{
                // execCommand 사용
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, 99999);
                try {
                    document.execCommand('copy');
                    //alert(this.#getMessage("ct004"))
                } catch (err) {
                    console.error(err);
                }
                textArea.setSelectionRange(0, 0);
                document.body.removeChild(textArea);
            })
        } else {
            // execCommand 사용
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            try {
                document.execCommand('copy');
               // alert(this.#getMessage("ct004"))
            } catch (err) {
                console.error(err);
            }
            textArea.setSelectionRange(0, 0);
            document.body.removeChild(textArea);
        }
    }

    #deepCopyAllData = (data,appendYn=false) => {
        let fullData = new Array();
        let showData = new Array();
        let showOrgData = new Array();
        let orgData = new Array();

        if(appendYn === false) this.#utils.set("maxId",0)

        for(let idx=0;idx<data.length;idx++){
            let maxId = this.#utils.get("maxId");
            data[idx]["_id"] = maxId
            this.#utils.set("maxId",++maxId)

            let fullJson = {};
            let showJson = {};
            let showOrgJson = {};
            let orgJson = {};

            for(let [key,value] of Object.entries(data[idx])){
                fullJson[key] = value;
                showJson[key] = value;
                showOrgJson[key] = value;
                orgJson[key] = value;
            }

            fullData.push(fullJson);
            showData.push(showJson);
            showOrgData.push(showOrgJson);
            orgData.push(orgJson);
        }

        return [fullData,showData,showOrgData,orgData]
    }

    #deepCopyData = data => {
        let array = new Array();

        for(let idx=0;idx<data.length;idx++){
            let json = {};

            for(let [key,value] of Object.entries(data[idx])){
                json[key] = value;
            }

            array.push(json);
        }

        return array;
    }

    #deepCopy = obj => {
        if (obj === null || typeof obj !== 'object') {
            return obj; // 원시 값은 그대로 반환
        }
    
        // Date 객체 처리
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
    
        // Map 객체 처리
        if (obj instanceof Map) {
            const mapCopy = new Map();
            obj.forEach((value, key) => {
                mapCopy.set(this.#deepCopy(key), this.#deepCopy(value));
            });
            return mapCopy;
        }
    
        // Set 객체 처리
        if (obj instanceof Set) {
            const setCopy = new Set();
            obj.forEach(value => {
                setCopy.add(this.#deepCopy(value));
            });
            return setCopy;
        }
    
        // 배열 처리
        if (Array.isArray(obj)) {
            return obj.map(item => this.#deepCopy(item));
        }
    
        // 일반 객체 처리
        const copy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 함수 복사 처리
                if (typeof obj[key] === 'function') {
                    copy[key] = obj[key].bind(copy); // 함수의 참조를 복사
                } else {
                    copy[key] = this.#deepCopy(obj[key]); // 재귀적으로 복사
                }
            }
        }
    
        return copy;
    };

    #removeChildAll = element=>{
        while(element?.firstChild){
            element.removeChild(element?.lastChild);
        }
    }            

    #getKeyType = keyCode => {
        // 숫자 키 코드: Digit0 ~ Digit9
        if (/Digit[0-9]/.test(keyCode)) {
            return "number";
        }
        // 알파벳 키 코드: KeyA ~ KeyZ
        else if (/Key[A-Z]/.test(keyCode)) {
            return "string";
        }
        // Numpad Enter 키 코드: NumpadEnter
        else if (keyCode === "NumpadEnter") {
            return "enter";
        }
        // 공백 키 코드: Space
        else if (keyCode === "Space") {
            return "space";
        }
        // 그 외의 키 코드
        else {
            return "others";
        }
    } 

    #lang = {
        ko : {
            "ci001"     : "컬럼명",                     //filter - context menu - 컬럼명
            "ci001-1"   : "컬럼명을 입력해주세요.",      //filter - context menu - 컬럼명
            "ci002"     : "헤더명",                     //filter - context menu - 헤더명
            "ci002-1"   : "헤더명을 입력해주세요.",      //filter - context menu - 헤더명
            "ci003"     : "삽입",                       //filter - context menu - 삽입
            "cm001"     : "필드값 오름차순 정렬",        //filter - context menu - 텍스트 오름차순 정렬
            "cm002"     : "필드값 내림차순 정렬",        //filter - context menu - 텍스트 내림차순 정렬
            "cm003"     : "텍스트 필터",                //filter - context menu - 텍스트 필터
            "cm003-1"   : "같음",                       //filter - context menu - 텍스트 필터 - 같음
            "cm003-2"   : "같지 않음",                  //filter - context menu - 텍스트 필터 - 같지 않음
            "cm003-3"   : "시작 문자",                  //filter - context menu - 텍스트 필터 - 시작 문자
            "cm003-4"   : "끝 문자",                    //filter - context menu - 텍스트 필터 - 끝 문자
            "cm003-5"   : "포함",                       //filter - context menu - 텍스트 필터 - 포함
            "cm003-6"   : "포함하지 않음",              //filter - context menu - 텍스트 필터 - 포함하지 않음
            "cm004"     : "텍스트 필터",                //filter - context menu - 텍스트 필터
            "cm004-1"   : "보다 큼",                    //filter - context menu - 텍스트 필터 - 보다 큼
            "cm004-2"   : "크거나 같음",                //filter - context menu - 텍스트 필터 - 크거나 같음
            "cm004-3"   : "보다 작음",                  //filter - context menu - 텍스트 필터 - 보다 작음
            "cm004-4"   : "작거나 같음",                //filter - context menu - 텍스트 필터 - 작거나 같음
            "cm004-5"   : "해당 범위",                  //filter - context menu - 텍스트 필터 - 해당 범위
            "cm004-6"   : "상위 10",                    //filter - context menu - 텍스트 필터 - 상위 10
            "cm004-7"   : "평균 초과",                  //filter - context menu - 텍스트 필터 - 평균 초과
            "cm004-8"   : "평균 미만",                  //filter - context menu - 텍스트 필터 - 평균 미만
            "cm004"     : "숫자 필터",                  //filter - context menu - 숫자 필터
            "cm005"     : "정렬 해제",                  //filter - context menu - 정렬 해제
            "cm006"     : "필터 해제",                  //filter - context menu - 필터 해제
            "hd001"     : "순번",                       //left header - rowNumber 기본 헤더값
            "hd002"     : "상태",                       //left header - rowStatus 기본 헤더값
            "yn001"     : "확인",
            "yn002"     : "취소",
            "ft001"     : "필드값",
            "ft002"     : "상위",
            "ft003"     : "하위",
            "ft004"     : "항목",
            "ft005"     : "%",
            "ma001"     : ">",
            "ma002"     : ">=",
            "ma003"     : "<",
            "ma004"     : "<=",
            "ct001"     : "다중 선택일 경우 복사할 수 없습니다.",
            "ct002"     : "다중 선택일 경우 잘라낼 수 없습니다.",
            "ct003"     : "다중 선택일 경우 붙여넣을 수 없습니다.",
            //"ct004"     : "텍스트가 복사되었습니다.",   // 복사 후 알림
            "rc001"     : "잘라내기",                    //right click - context menu - 잘라내기
            "rc002"     : "복사",                        //right click - context menu - 복사
            "rc003"     : "붙여넣기",                    //right click - context menu - 붙여넣기
            "rc004"     : "전체 선택",                   //right click - context menu - 전체 선택
            "rc005"     : "내용 지우기",                 //right click - context menu - 내용 지우기
            "rc006"     : "행 삽입",                     //right click - context menu - 행 삽입
            "rc006-1"   : "위쪽에 행 삽입",              //right click - context menu - 행 삽입 - 위쪽에 행 삽입
            "rc006-2"   : "아래쪽에 행 삽입",            //right click - context menu - 행 삽입 - 아래쪽에 행 삽입
            "rc006-3"   : "다중 선택일 경우 행 삽입을 할 수 없습니다.",  //right click - context menu - 행 삽입
            "rc007"     : "행 삭제",                     //right click - context menu - 행 삭제
            "rc013"     : "열 삽입",                     //right click - context menu - 열 삽입
            "rc013-1"   : "오른쪽에 열 삽입",             //right click - context menu - 오른쪽에 열 삽입
            "rc013-2"   : "왼쪽에 열 삽입",               //right click - context menu - 왼쪽에 열 삽입
            "rc013-3"   : "다중 선택일 경우 열 삽입을 할 수 없습니다.", //right click - context menu - 열 삽입
            "rc008"     : "열 삭제",                     //right click - context menu - 열 삭제
            "rc009"     : "열 숨기기",                   //right click - context menu - 열 숨기기
            "rc010"     : "숨긴 열 보이기",              //right click - context menu - 숨긴 열 보이기
            "rc010-1"   : "다중 선택일 경우 숨긴 열 보이기를 할 수 없습니다.", //right click - context menu - 숨긴 열 보이기
            "rc011"     : "실행 취소",                   //right click - context menu - 실행 취소
            "rc012"     : "다시 실행",                   //right click - context menu - 다시 실행
            /*
            "rc001"     : "잘라내기 (Ctrl + X)",         //right click - context menu - 잘라내기
            "rc002"     : "복사 (Ctrl + C)",             //right click - context menu - 복사
            "rc003"     : "붙여넣기 (Ctrl + V)",         //right click - context menu - 붙여넣기
            "rc004"     : "전체 선택 (Ctrl + A)",        //right click - context menu - 전체 선택
            "rc005"     : "내용 지우기 (delete)",        //right click - context menu - 내용 지우기
            "rc006"     : "행 삽입",                     //right click - context menu - 행 삽입
            "rc006-1"   : "위쪽에 행 삽입",              //right click - context menu - 삽입 - 위쪽에 행 삽입
            "rc006-2"   : "아래쪽에 행 삽입",            //right click - context menu - 삽입 - 아래쪽에 행 삽입
            "rc007"     : "행 삭제",                     //right click - context menu - 행 삭제
            "rc008"     : "열 삭제",                     //right click - context menu - 열 삭제
            "rc009"     : "열 숨기기",                   //right click - context menu - 열 숨기기
            "rc010"     : "숨긴 열 보이기",               //right click - context menu - 숨긴 열 보이기
            "rc011"     : "실행 취소 (Ctrl + Z)",         //right click - context menu - 실행 취소
            "rc012"     : "다시 실행 (Ctrl + Y)",         //right click - context menu - 다시 실행
            */
        }
    }
}
