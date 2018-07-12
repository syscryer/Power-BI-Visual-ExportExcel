
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
        public rowsList: string[] = [];
        public str1 = "";
        public size1 = 0;
        public valueCount = 0;
        public new_em: HTMLElement;
        public dataView: DataView;
        public clCount = 0;

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
            debugger;

            if (typeof document !== "undefined") {
                this.textNode = document.createTextNode(this.updateCount.toString());

                this.new_p = document.createElement("button");
                this.new_p.appendChild(document.createTextNode("导出"));
                this.new_p.style.border = "none";
                this.new_p.style.height = "22px";
                this.new_p.style.width = "50px";
                this.new_p.style.fontFamily = "微软雅黑";
                this.new_p.style.textAlign = "center";
                this.new_p.style.backgroundColor = "#01B8AA";
                this.new_p.style.color = "#FFFFFF";

                this.new_p.onclick = (e: Event) => {
                    let blob = new Blob([this.csvstr], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, new Date().toLocaleDateString() + "_数据导出" + ".csv");
                };

                this.target.appendChild(this.new_p);


                // let new_p1 = document.createElement("button");
                // new_p1.appendChild(document.createTextNode("刷新数据"));
                // new_p1.onclick = (e: Event) => {
                //     this.btn_click();
                // };
                // this.target.appendChild(new_p1);

                // const new_br = document.createElement("br");
                // this.target.appendChild(new_br);

                // this.new_em = document.createElement("textarea");
                // this.new_em.appendChild(this.textNode);
                // this.new_em.style.height = "100%";
                // this.new_em.style.width = "100%";
                // this.target.appendChild(this.new_em);

            }
        }

        //测试按钮
        public btn_click() {

            debugger;
            const findApi = (methodName) => {
                return this.host[methodName] ? (arg) => {
                    this.host[methodName](arg);
                } : this.hostServices && this.hostServices[methodName] ? (arg) => {
                    this.hostServices[methodName](arg);
                } : null;
            };
            this.loadMoreData = findApi('loadMoreData') || function () { };



            $.each(['a', 'b', 'c'], function (index, value) {
                console.log(index + " " + value);
            })

            $.get("http://localhost:8012/api/values/QueryByDax", { id: "1" }, function (data) {
                console.log(data);

            });
            // check if more data is expected for the current dataview
            // if (this.dataView.metadata.segment) {
            //     //request for more data if available

            //     // let request_accepted: boolean = this.host.fetchMoreData();
            //     this.host.applyJsonFilter.apply(function () { });

            //     // handle rejection
            //     // if (request_accepted) {
            //     console.log(this.dataView.matrix.rows.root.children.length);

            //     this.textNode.textContent = "";
            //     this.csvstr = "";
            //     this.rowsList = [];
            //     this.str1 = "";
            //     this.size1 = 0;


            //     let rows = this.dataView.matrix.rows;
            //     let rowslevl = rows.levels.length;

            //     let cols = this.dataView.matrix.columns;
            //     let valueSources = this.dataView.matrix.valueSources;


            //     this.csvstr = this.clCount + "--" + this.handleCols(cols.root, rowslevl - 1) + this.handleRows(rows.root, valueSources);


            //     this.textNode.textContent = this.csvstr;
            //     this.clCount++;
            //     //this.new_em.appendChild(this.textNode);
            //     //}
            // }

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
            // options.viewMode = ViewMode.Edit;
            // options.editMode = EditMode.Advanced;
            let m = options.dataViews[0].scriptResult;
            debugger;

            this.csvstr = "";
            this.rowsList = [];
            this.str1 = "";
            this.size1 = 0;

            let dataViews = options.dataViews;
            this.dataView = options.dataViews[0];


            //API v1.12
            // if (options.operationKind === VisualDataChangeOperationKind.Create) {
            //     debugger;

            // }
            // // on second or subesquent segments:
            // if (options.operationKind === VisualDataChangeOperationKind.Append) {
            //     debugger;
            // }

            let rows = dataViews[0].matrix.rows;
            let rowslevl = rows.levels.length;
            let cols = dataViews[0].matrix.columns;
            let valueSources = dataViews[0].matrix.valueSources;
            this.valueCount = options.dataViews[0].matrix.valueSources.length;
            this.csvstr = this.handleCols(cols.root, rowslevl - 1) + this.handleRows(rows.root, valueSources);
            this.textNode.textContent = this.csvstr;
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
                            valueStr = valueStr + value + dharr;
                            dataMap[fieldsRef] = valueStr;
                        } else {
                            dataMap[fieldsRef] = value + dharr;
                        }

                    }
                });
            }
        }

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
                dataStr = dataStr + "," + entry.displayName;
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
                    let label = "";
                    if (i === 0) {
                        label = value + "," + childrenBean.value;
                    } else {
                        let level = childrenBean.level;
                        let levelToStr = this.getLevelToStr(level);
                        label = levelToStr + childrenBean.value;
                    }

                    let values = childrenBean.values;
                    if (values != null) {
                        let valueStr = this.getValues(values);
                        if (i === 0) {
                            datalist.push(label + valueStr);
                            this.rowsList.push(label + valueStr);
                        } else {
                            let level = childrenBean.level;
                            let levelToStr = this.getLevelToStr(level) + childrenBean.value;
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
