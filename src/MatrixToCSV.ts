
module powerbi.extensibility.visual {
    import ISelectionId = powerbi.visuals.ISelectionId;

    /**
     * Interface for BarChart settings.
     *
     * @interface
     * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
     * @property {{generalView.opacity:number}} Bars Opacity - Controls opacity of plotted bars, values range between 10 (almost transparent) to 100 (fully opaque, default)
     * @property {{generalView.showHelpLink:boolean}} Show Help Button - When TRUE, the plot displays a button which launch a link to documentation.
     */
    interface MatrixToCSVSettings {
        enableAxis: {
            show: boolean;
        };

        generalView: {
            opacity: number;
            showHelpLink: boolean;
            title: string;
            exportUrl: string;
            isTableVisibility: boolean;
        };

    }

    export class KeyValue {
        private _key: string;
        private _value: string;

        constructor(_key: string, _value: string) {
            this._key = _key;
            this._value = _value;
        }
        public get_key(): string {
            return this._key;
        }
        public set_key(_key: string) {
            this._key = _key;
        }
        public get_value(): string {
            return this._value;
        }
        public set_value(_value: string) {
            this._value = _value;
        }
    }
    interface MatrixToCSVSettings {
        enableAxis: {
            show: boolean;
        };

        generalView: {
            opacity: number;
            showHelpLink: boolean;
            title: string;
            exportUrl: string;
            isTableVisibility: boolean;
        };
    }
    export class MatrixToCSV implements IVisual {
        private svg: d3.Selection<SVGElement>;
        public host: IVisualHost;
        private selectionManager: ISelectionManager;
        private barChartContainer: d3.Selection<SVGElement>;
        private barContainer: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private barChartSettings: MatrixToCSVSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private helpLinkElement: Element;

        private target: HTMLElement;
        private updateCount: number;
        private textNode: Text;
        public csvstr = "";
        public new_p: HTMLElement;
        public new_p1: HTMLElement;
        public rowsList: string[] = [];
        public str1 = "";
        public size1 = 0;
        public valueCount = 0;
        public new_em: HTMLElement;
        public matx: HTMLElement;
        public dataView: DataView;
        public clCount = 0;
        public title: string;
        public exportUrl: string;
        public isTableVisibility: boolean;
        public matrixTable: HTMLTableElement;

        static Config = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.5,
            margins: {
                top: 0,
                right: 0,
                bottom: 25,
                left: 30,
            },
            xAxisFontMultiplier: 0.04,
        };
        hostServices: any;
        loadMoreData: (arg: any) => void;

        /**
         * Creates instance of BarChart. This method is only called once.
         *
         * @constructor
         * @param {VisualConstructorOptions} options - Contains references to the element that will
         *                                             contain the visual and a reference to the host
         *                                             which contains services.
         */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.updateCount = 0;

            // var oMeta = document.createElement('meta');
            // oMeta.httpEquiv = 'Content-Security-Policy';
            // oMeta.content = 'upgrade-insecure-requests';
            // document.getElementsByTagName('head')[0].appendChild(oMeta);

            if (typeof document !== "undefined") {
                this.textNode = document.createTextNode(this.updateCount.toString());
                this.new_p = document.createElement("button");
                this.new_p.appendChild(document.createTextNode("导出CSV"));
                this.new_p.style.width = "80px";
                this.new_p.style.fontSize = "11px";
                this.new_p.style.marginLeft = "8px";
                this.new_p.style.marginTop = "5px";
                this.new_p.className = "btn btn-success btn-sm";

                this.new_p.onclick = (e: Event) => {
                    this.new_p.className = "btn  btn-success btn-sm disabled"; //下载数据中，禁止按钮
                    this.new_p.textContent = "下载中...";
                    let blob = new Blob([this.csvstr], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, new Date().toLocaleDateString() + "_数据导出" + ".csv");
                    this.new_p.className = "btn  btn-success btn-sm"; //下载数据中，禁止按钮
                    this.new_p.textContent = "导出CSV";
                };
                this.target.appendChild(this.new_p);

                this.new_p1 = document.createElement("button");
                this.new_p1.appendChild(document.createTextNode("导出Excel"));
                this.new_p1.style.width = "80px";
                this.new_p1.style.fontSize = "11px";
                this.new_p1.style.marginLeft = "8px";
                this.new_p1.style.marginTop = "5px";
                this.new_p1.className = "btn btn-primary btn-sm";
                this.new_p1.onclick = (e: Event) => {
                    this.btn_click();
                };
                this.target.appendChild(this.new_p1);

                const new_br = document.createElement("br");
                this.target.appendChild(new_br);

                this.new_em = document.createElement("textarea");
                this.new_em.appendChild(this.textNode);
                this.new_em.style.height = "100%";
                this.new_em.style.width = "100%";
                //  this.target.appendChild(this.new_em);
                this.svg = this.svg = d3.select(options.element).append('div')
                    .classed('DataDiv', true)
                    .attr('id', 'matx');
            }
        }

        public dataToTable(): string {
            //Make variables

            //Get old text
            var oldText = this.csvstr;
            //Split into lines
            var oldTextArr = oldText.split("\r\n");
            var newText = "";
            var rowLevel = this.dataView.matrix.rows.levels.length;
            var colLevel = this.dataView.matrix.columns.levels.length;
            var valCount = this.dataView.matrix.valueSources.length;
            //Get rid of quotes at beginning and end
            for (var i = 0; i < oldTextArr.length; i++) {
                oldTextArr[i] = oldTextArr[i].replace(/\r/, "");
                oldTextArr[i] = oldTextArr[i].replace(/^\'/, "");
                oldTextArr[i] = oldTextArr[i].replace(/^\"/, "");
                oldTextArr[i] = oldTextArr[i].replace(/"$/, "");
                oldTextArr[i] = oldTextArr[i].replace(/'$/, "");
                if (i >= colLevel - 1) {
                    oldTextArr[i] = "<tr><td>" + oldTextArr[i] + "</td></tr>";
                }
            }
            debugger;
            //make table
            //var trs = "";
            for (var i = 0; i < oldTextArr.length; i++) {
                if (i < colLevel - 1) {
                    var tr = "<tr><td colspan='" + (rowLevel - 1) + "'></td>";
                    var tds = oldTextArr[i].split(/,(?=(?:[^']*(?:'[^']*')?[^']*)*$)/);
                    var start = 0; var cnt = 1; var m = 0; var secVal = ""; var b = false;
                    var tdsArr = [];
                    for (let j = rowLevel - 1; j <= tds.length; j++) {
                        var val = tds[j];
                        if (j === rowLevel - 1)//&& string.IsNullOrEmpty(val)
                        {
                            tr += "<td >" + val + "</td>";
                            cnt = 1;
                        }
                        if (j === rowLevel && val === "")//&& string.IsNullOrEmpty(val)
                        {
                            cnt = 1;
                            b = true;
                        }
                        if (j > rowLevel) {
                            cnt++;
                        }
                        if (j > rowLevel && val !== "") {
                            tdsArr.push(val);
                            m++;
                            if (m === 1) {
                                if (b) {
                                    tr += "<td colspan='" + (cnt - 1) + "'></td>";
                                    secVal = val;
                                }
                                else {
                                    tr += "<td colspan='" + (cnt - 1) + "'>" + val + "</td>";
                                    secVal = val;
                                }
                            }
                            else if (m === 2 && b) {
                                tr += "<td colspan='" + (cnt) + "'>" + secVal + "</td>";
                                b = false;
                            }
                            else {
                                tr += "<td colspan='" + cnt + "'>" + tdsArr[m - 2] + "</td>";
                            }
                            cnt = 0;
                        }
                    }
                    tr += "</tr>";
                    newText += tr;
                }
                else {
                    oldTextArr[i] = oldTextArr[i].replace(new RegExp(',', "gi"), "</td><td>");
                    newText += oldTextArr[i];
                }
            }
            newText = "<table class='table table-striped table-sm' cellspacing='0px' id='matxtable' align='center'>\n" + newText + "</table>\n";
            return newText;
        }

        public tableMc() {
            var rowLevel = 3;
            var colLevel = 3;
            var valCount = 2;
            var oldText = this.csvstr;
            var oldTextArr = oldText.split("\n");
            debugger;
            let tb: HTMLTableElement = document.querySelector("table");
            let cc = 0;
            for (cc = 0; cc < rowLevel - 1; cc++)//
            {
                debugger;
                let start = 0, cnt = 0, m = 0, j = 0;
                for (j = colLevel; j < oldTextArr.length; j++) {
                    let val = "";
                    if (j === oldTextArr.length - 1) {
                        let ssss = 1;
                    }
                    if (tb.rows[j].cells[cc] != null)
                        val = tb.rows[j].cells[cc].textContent;

                    if (j === colLevel + 1)//&& string.IsNullOrEmpty(val)
                    {
                        start = colLevel + 1;
                    }
                    if (j > colLevel + 1 && val === "") {
                        cnt++;
                    }
                    if (j >= colLevel && val !== "") {
                        m++;
                        // if (m === 1) {
                        this.Merge(tb, j - cnt - 1, j - 1, cc);
                        // }
                        // else {
                        //     this.Merge(tb, j - cnt - 2, j - 1, cc);
                        // }
                        cnt = 0;
                    }

                    // if (j == dimension.Rows) {
                    //     ws.Cells[dimension.Rows - cnt, i, dimension.Rows - 1, i].Merge = true;
                    // }
                }
            }
        }

        public Merge(tb: HTMLTableElement, startRow, endRow, col) {
            // if (col >= tb.rows[0].cells.length) {
            //     return;
            // }
            // if (col == 0) { endRow = tb.rows.length - 1; }
            // for (var i = startRow; i < endRow; i++) {
            //     if (tb.rows[startRow].cells[col].innerHTML == tb.rows[i + 1].cells[col].innerHTML) {
            //         tb.rows[i + 1].removeChild(tb.rows[i + 1].cells[0]);
            //         tb.rows[startRow].cells[col].rowSpan = (tb.rows[startRow].cells[col].rowSpan | 0) + 1;
            //         if (i == endRow - 1 && startRow != endRow) {
            //             this.Merge(tb, startRow, endRow, col + 1);
            //         }
            //     } else {
            //         this.Merge(tb, startRow, i + 0, col + 1);
            //         startRow = i + 1;
            //     }
            // }
        }


        //下载数据中，禁止按钮
        public btn_click() {
            debugger;
            let matrix = this.dataView.matrix;
            let str: string = "";

            let paramData = {
                title: this.title,
                dataView: JSON.stringify(this.dataView),
                //rowsroot: JSON.stringify(matrix.rows.root),
                //colsroot: JSON.stringify(matrix.columns.root),
                csvstr: this.csvstr
            }
            this.download(this.exportUrl, paramData)
        }

        public download(url, data) {
            debugger;
            this.new_p1.className = "btn  btn-primary btn-sm disabled";//下载数据中，禁止按钮
            this.new_p1.textContent = "下载中...";

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);    // 也可以使用POST方式，根据接口
            xhr.responseType = "blob";  // 返回类型blob
            // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
            var content = JSON.stringify(data);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.timeout = 10000; //超时时间：30秒

            xhr.onload = (e: Event) => {
                if (xhr.status === 200) {
                    // 返回200
                    var blob = xhr.response;
                    saveAs(blob, new Date().toLocaleDateString() + this.title + ".xlsx");
                    this.new_p1.textContent = "导出Excel";
                    this.new_p1.className = "btn btn-primary btn-sm"; //导出完成，启用按钮
                }
            };
            try {
                // 发送ajax请求
                xhr.send(content)
            }
            catch (ex) {
                this.new_p1.textContent = "导出失败";
                this.new_p1.className = "btn btn-danger btn-sm"; //导出出错，启用按钮
            }
        }


        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        public update(options: VisualUpdateOptions) {
            options.type = VisualUpdateType.All;
            let m = options.dataViews[0].scriptResult;
            debugger;
            if (this.new_p1.textContent === "导出失败" || this.new_p1.textContent === "下载中...") {
                this.new_p1.textContent = "导出Excel";
                this.new_p1.className = "btn btn-primary btn-sm"; //刷新时，启用按钮，不在导出
            }
            this.csvstr = "";
            this.rowsList = [];
            this.str1 = "";
            this.size1 = 0;

            let dataViews = options.dataViews;
            this.dataView = options.dataViews[0];

            let objects = dataViews[0].metadata.objects;
            let defaultSettings: MatrixToCSVSettings = {
                enableAxis: {
                    show: false,
                },
                generalView: {
                    opacity: 100,
                    showHelpLink: false,
                    title: "标题",
                    exportUrl: "http://10.104.20.97:8095/api/CreateExcel/DownloadExcel",
                    isTableVisibility: false
                }
            };
            let matrixToCSVSettings: MatrixToCSVSettings = {
                enableAxis: {
                    show: getValue<boolean>(objects, 'enableAxis', 'show', defaultSettings.enableAxis.show),
                },
                generalView: {
                    opacity: getValue<number>(objects, 'generalView', 'opacity', defaultSettings.generalView.opacity),
                    showHelpLink: getValue<boolean>(objects, 'generalView', 'showHelpLink', defaultSettings.generalView.showHelpLink),
                    title: getValue<string>(objects, 'generalView', 'title', defaultSettings.generalView.title),
                    exportUrl: getValue<string>(objects, 'generalView', 'exportUrl', defaultSettings.generalView.exportUrl),
                    isTableVisibility: getValue<boolean>(objects, 'generalView', 'isTableVisibility', defaultSettings.generalView.isTableVisibility),
                }
            };
            this.barChartSettings = matrixToCSVSettings;
            this.title = matrixToCSVSettings.generalView.title;
            this.exportUrl = matrixToCSVSettings.generalView.exportUrl;
            this.isTableVisibility = matrixToCSVSettings.generalView.isTableVisibility;

            let rows = dataViews[0].matrix.rows;
            let rowslevl = rows.levels.length;
            let cols = dataViews[0].matrix.columns;
            let valueSources = dataViews[0].matrix.valueSources;
            this.valueCount = options.dataViews[0].matrix.valueSources.length;
            this.csvstr = this.handleCols(cols.root, rowslevl - 1) + this.handleRows(rows.root, valueSources);
            this.textNode.textContent = this.csvstr;
            // this.matx.innerHTML = this.dataToTable();
            if (this.isTableVisibility) {//是否显示表格预览
                d3.select('.DataDiv').style('overflow', 'auto')
                    .html(this.dataToTable())
                    .style("height", "calc(100% - 35px)")
                    .style("width", `${options.viewport.width}px`);
                // this.tableMc();
            }

            console.log(options.viewport.height);
        }

        //处理列
        public handleCols(data: DataViewMatrixNode, colslev: number): string {
            let dataMap: { [key: string]: string; } = {};
            if (data != null) {
                let childIdentityFieldsBeans: data.ISQExpr[] = data.childIdentityFields;
                let childrenBeans = data.children;
                if (childrenBeans != null) {
                    this.handleChildren(childrenBeans, childIdentityFieldsBeans, dataMap);
                }
            }
            let i = 0;
            for (let k in dataMap) {
                i++;
            }
            let dataStrs = "";
            if (i > 0) {
                let levelToStr = this.getLevelToStr(colslev);
                for (let k in dataMap) {
                    let dataStr = levelToStr + k + "," + dataMap[k] + "\r\n";
                    dataStrs += dataStr;
                }
            }
            return dataStrs;
        }

        public handleChildren(children: DataViewMatrixNode[], childIdentityFields: data.ISQExpr[], dataMap: { [key: string]: string; }) {
            let fieldsRef: string = "";
            if (childIdentityFields != null) {
                childIdentityFields.forEach(childIdentityFieldsBean => {
                    fieldsRef = childIdentityFieldsBean["ref"];
                    if (!(fieldsRef === "")) {
                        let b = false;
                        for (let k in dataMap) {
                            if (k === fieldsRef) {
                                b = true;
                            }
                        }
                        if (b) {
                            return;
                        }
                        else {
                            dataMap[fieldsRef] = "";
                        }

                    }
                });
                children.forEach(childrenBean => {
                    let value: PrimitiveValue = childrenBean.value;
                    if (value != null) {
                        let beans: DataViewMatrixNode[] = childrenBean.children;
                        if (beans != null) {
                            let childIdentityFieldsBeans: data.ISQExpr[] = childrenBean.childIdentityFields;
                            if (childIdentityFieldsBeans != null) {
                                this.handleChildren(beans, childIdentityFieldsBeans, dataMap);
                            }
                        }
                        let dh = "";
                        for (let index = 0; index < this.valueCount; index++) {
                            dh += ",";
                        }

                        let b = false;
                        for (let k in dataMap) {
                            if (k === fieldsRef) {
                                b = true;
                            }
                        }
                        let dharr = "";
                        if (beans != null && beans.length > 0 && beans[0].children != null) {
                            for (let index = 0; index < beans.length; index++) {
                                dharr += dh;
                            }
                        }
                        else {
                            dharr = dh;
                        }

                        if (b) {

                            let valueStr: string = dataMap[fieldsRef];
                            valueStr = valueStr + this.toCsvVal(value == null ? "" : value.toString()) + dharr;
                            dataMap[fieldsRef] = valueStr;
                        } else {
                            dataMap[fieldsRef] = value + dharr;
                        }

                    }
                    else {
                        let beans: DataViewMatrixNode[] = childrenBean.children;
                        if (beans != null) {
                            let childIdentityFieldsBeans: data.ISQExpr[] = childrenBean.childIdentityFields;
                            if (childIdentityFieldsBeans != null) {
                                this.handleChildren(beans, childIdentityFieldsBeans, dataMap);
                            }
                        }
                        let dh = "";
                        for (let index = 0; index < this.valueCount; index++) {
                            dh += ",";
                        }

                        let b = false;
                        for (let k in dataMap) {
                            if (k === fieldsRef) {
                                b = true;
                            }
                        }
                        let dharr = "";
                        if (beans != null && beans.length > 0 && beans[0].children != null) {
                            for (let index = 0; index < beans.length; index++) {
                                dharr += dh;
                            }
                        }
                        else {
                            dharr = dh;
                        }
                        if (b) {
                            let valueStr: string = dataMap[fieldsRef];
                            valueStr = valueStr + "," + dharr;
                            if (valueStr.substr(valueStr.length - 1, 1) === ',')
                                valueStr = valueStr.substr(1);
                            dataMap[fieldsRef] = valueStr;
                        } else {
                            dataMap[fieldsRef] = "," + dharr;
                        }
                    }
                });
            }
        }

        public toCsvVal(value: String): String {
            if (value === null || value === "") { return value; }
            value = value.trim();
            value = this.trim(value, ',', '');
            let b = false;
            //20161214 若发现有逗号  需前后加引号 否则会出现串列的情况
            if (value.indexOf("\"") !== -1) { //若发现有双引号  需要将字符串中的一个双引号替换为两个 并且需前后加双引号
                value = value.replace(/"/g, "\"\"");
                value = "\"" + value + "\"";
                b = true;
            }
            if (value.indexOf(",") !== -1 && !b) { //若发现有逗号  需前后加引号
                value = "\"" + value.replace(/,/g, "，") + "\"";
                b = false;
            }
            return value;
        }

        public trim(str, char, type) {
            if (char) {
                if (type === 'l') {
                    return str.replace(new RegExp('^\\' + char + '+', 'g'), '');
                } else if (type === 'r') {
                    return str.replace(new RegExp('\\' + char + '+$', 'g'), '');
                }
                return str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
            }
            return str.replace(/^\s+|\s+$/g, '');
        };

        public handleRows(rowsData: DataViewMatrixNode, valuesData: DataViewMetadataColumn[]): string {
            let datalist: string[] = new Array();
            let str = "";
            let size = 0;
            let valuesStr = "";
            if (rowsData != null) {
                let children: DataViewMatrixNode[] = rowsData.children;
                let childIdentityFields: data.ISQExpr[] = rowsData.childIdentityFields;
                let strsize = this.handle(children, childIdentityFields, str, size);
                str = this.str1;
                size = this.size1;
                valuesStr = this.handleValueJson(str.substr(0, str.length - 1), size, valuesData);
                let ishaveCh: boolean = false;
                rowsData.children.forEach(childrenBean => {
                    if (childrenBean !== undefined) {
                        let value = childrenBean.value == null ? "" : childrenBean.value.toString();
                        if (childrenBean.children != null) {
                            this.getChildren(childrenBean.children, value, datalist);
                        }
                        else {
                            ishaveCh = true;
                        }
                    }
                });
                if (ishaveCh) {
                    this.getChildren(rowsData.children, "", datalist);
                }
            }
            datalist = this.rowsList;
            let dataStrs = "";
            if (datalist.length > 0) {
                datalist.forEach(dataStr => {
                    dataStr = dataStr + "\r\n";
                    dataStrs += dataStr;
                });
            }
            if (dataStrs.substr(0, 1) === ',')
                dataStrs = dataStrs.substr(1);
            return valuesStr + dataStrs;
        }

        public handleValueJson(str: string, size: number, values: DataViewMetadataColumn[]): string {
            let list = new Array();
            let dataStr = "";
            values.forEach(entry => {
                list.push(entry.index);
                dataStr = dataStr + "," + this.toCsvVal(entry.displayName);
            });
            let listSize = list.length;
            if (listSize > 0) {
                let buffer = "";

                let dataSize = size / listSize;

                for (let i = 0; i < dataSize; i++) {
                    buffer += dataStr;
                }
                dataStr = str + buffer.toString() + "\r\n";
            }
            return dataStr;
        }

        public handle(children: DataViewMatrixNode[], childIdentityFieldsBeans: data.ISQExpr[], str: string, size: number) {
            let childIdentityFieldsBean: data.ISQExpr = childIdentityFieldsBeans[0];
            if (childIdentityFieldsBean != null) {
                this.str1 += childIdentityFieldsBean["ref"] + ",";
            }
            let childrenBean: DataViewMatrixNode = children[0];
            let values: DataViewMatrixNodeValue = childrenBean.values;
            if (values !== undefined) {
                let k = 0;
                for (let value in values) {
                    k++;
                };
                this.size1 += k;
            }
            if (childrenBean !== undefined) {
                let childIdentityFields: data.ISQExpr[] = childrenBean.childIdentityFields;
                if (childIdentityFields !== undefined) {
                    this.handle(childrenBean.children, childIdentityFields, str, size);
                }
            }
        }

        public getChildren(children: DataViewMatrixNode[], value: string, datalist: string[]) {
            if (children != null) {
                for (let i = 0; i < children.length; i++) {
                    let childrenBean = children[i];
                    let chValue = this.toCsvVal(childrenBean.value == null ? "" : childrenBean.value.toString());
                    let label = "";
                    if (i === 0) {
                        label = value + "," + chValue;
                    } else {
                        let level = childrenBean.level;
                        let levelToStr = this.getLevelToStr(level);
                        label = levelToStr + chValue;
                    }

                    let values = childrenBean.values;
                    if (values != null) {
                        let valueStr = this.getValues(values);
                        if (i === 0) {
                            datalist.push(label + valueStr);
                            this.rowsList.push(label + valueStr);
                        } else {
                            let level = childrenBean.level;
                            let levelToStr = this.getLevelToStr(level) + chValue;
                            datalist.push(levelToStr + valueStr);
                            this.rowsList.push(levelToStr + valueStr);
                        }
                    }
                    let newChildren = childrenBean.children;
                    if (newChildren !== undefined) {
                        this.getChildren(newChildren, label, datalist);
                    }
                }
            }
        }

        public getLevelToStr(level): string {
            let str: string = "";
            if (level > 0) {
                for (let i = 0; i < level; i++) {
                    str = str + ",";
                }
            }
            return str;
        }

        public getValues(values: DataViewMatrixNodeValue): string {
            let buffer: string = "";

            for (let value in values) {
                let object: string = values[value]["value"];
                if (object == null) {
                    object = "";
                }

                buffer += "," + object;
            };
            let valueStr = buffer.toString();
            return valueStr;
        }

        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'enableAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.barChartSettings.enableAxis.show,
                        },
                        selector: null
                    });
                    break;
                case 'generalView':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            opacity: this.barChartSettings.generalView.opacity,
                            showHelpLink: this.barChartSettings.generalView.showHelpLink,
                            title: this.barChartSettings.generalView.title,
                            exportUrl: this.barChartSettings.generalView.exportUrl,
                            isTableVisibility: this.barChartSettings.generalView.isTableVisibility
                        },
                        validValues: {
                            opacity: {
                                numberRange: {
                                    min: 10,
                                    max: 100
                                }
                            }
                        },
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }

        /**
         * Destroy runs when the visual is removed. Any cleanup that the visual needs to
         * do should be done here.
         *
         * @function
         */
        public destroy(): void {
            // Perform any cleanup tasks here
        }
    }
}
