;(function($){$.fn.tablesMergeCell=function(options){var defaultsettings={automatic:true,cols:null,rows:null};var opts=$.extend(defaultsettings,options);return this.each(function(){var cols=opts.cols,rows=opts.rows;if(rows==null){for(var i=cols.length-1;cols[i]!=undefined;i--){tablesMergeCell($(this),cols[i]);}}else{for(var i=cols.length-1,k=opts.rows.length-1;cols[i]!=undefined;i--,k--){tablesMergeCell($(this),cols[i],k);}}
dispose($(this));});function tablesMergeCell($table,colIndex,rowIndex){$table.data('col-content','');$table.data('col-rowspan',1);$table.data('col-td',$());$table.data('trNum',$('tbody tr',$table).length);$('tbody tr',$table).each(function(index){var $tr=$(this);var $td=$('td:eq('+colIndex+')',$tr);var currentContent=$td.html();if(opts.automatic){if($table.data('col-content')==''){$table.data('col-content',currentContent);$table.data('col-td',$td);}else{if($table.data('col-content')==currentContent){addRowspan();}else{newRowspan();}}}else{if(opts.rows.length>0){if(opts.rows[0].length==undefined){for(var i=0;i<opts.rows.length;i++){customRowspan(opts.rows[i],opts.rows.length);}}else{for(var i=0;i<opts.rows[rowIndex].length;i++){customRowspan(opts.rows[rowIndex][i],opts.rows[rowIndex].length);}}}}
function customRowspan(val,len){if(index==val){if($table.data('col-content')==''){if(currentContent==''){currentContent=true;}
$table.data('col-content',currentContent);$td.attr('rowspan',len);}else{$td.hide();}}}
function addRowspan(){var rowspan=$table.data('col-rowspan')+1;$table.data('col-rowspan',rowspan);$td.hide();if(++index==$table.data('trNum')){$table.data('col-td').attr('rowspan',$table.data('col-rowspan'));}}
function newRowspan(){if($table.data('col-rowspan')!=1){$table.data('col-td').attr('rowspan',$table.data('col-rowspan'));}
$table.data('col-td',$td);$table.data('col-content',$td.html());$table.data('col-rowspan',1);}});}
function dispose($table){$table.removeData();}};})(jQuery);