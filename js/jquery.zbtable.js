; //开始写上";"是为了避免代码压缩出错
! function($) {
	$.fn.extend({
		zbtable: function(options) {
			var me = this;
			var opts = $.extend({}, defaults, options); //覆盖默认参数
			var html = "";
			if(opts.columns && opts.columns.length > 0) {
				var tr = "<tr>";
				for(var colindex = 0; colindex < opts.columns.length; colindex++) {
					tr += "<th>";
					tr += opts.columns[colindex].title || "";
					tr += "</th>";
				}
				tr += "</tr>";
				html += tr;
			}

			if(opts.data && opts.data.length > 0) {
				for(var rowindex = 0; rowindex < opts.data.length; rowindex++) {
					var rowdata = opts.data[rowindex];
					var tr = "<tr>";
					if(opts.columns && opts.columns.length > 0) {
						for(var colindex = 0; colindex < opts.columns.length; colindex++) {
							var columndata = opts.columns[colindex];
							var td = "<td";
							if(columndata.class) {
								td += " class=" + columndata.class;
							}
							td += ">";
							td += "<div>";
							td += rowdata[columndata.field]
							td += "</div>";
							td += "</td>";
							tr += td;
						}
					}
					tr += "</tr>";
					html += tr;
				}
			}
			me.append(html);
			if(!me.hasClass("zbtable")) {
				me.addClass("zbtable");
			}
			return me;
		}
	});

	/*
	 * columns的参数
	 * field:字段名
	 * title:栏位的名称
	 * width:宽度
	 * align:内容的排列方式 'left','center','right' 默认为left,
	 * colspan:合并列的数量
	 * rowspan:合并行的数量
	 * class: 样式类
	 */
	var defaults = {
		columns: [] //字段
	};
}(jQuery)