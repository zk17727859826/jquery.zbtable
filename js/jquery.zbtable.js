; //开始写上";"是为了避免代码压缩出错
! function($) {
	$.fn.extend({
		zbtable: function(options) {
			if(typeof(window.zbtablelist) == "undefined") {
				window.zbtablelist = new Object();
			}
			var me = this;
			var tableid = "";
			if(!me.attr("zbtable")) {
				tableid = "zb" + Math.random();
				me.attr("zbtable", tableid);
			} else {
				tableid = me.attr("zbtable");
			}

			if(window.zbtablelist[tableid]) {

			} else {
				window.zbtablelist[tableid] = new Object();
				var opts = $.extend({}, defaults, options); //覆盖默认参数
				opts["tableid"] = tableid;

				//如果url有值，则以url获得的值为优先
				if(opts.url) {
					opts.data = undefined;
					$.get(opts.url, {
						rnd: opts.cache ? "" : Math.random()
					}, function(rsp) {
						if(rsp && rsp.success === true) {
							opts.data = rsp.data;
							createWrapper(me, opts, tableid);
						} else {
							if(rsp) {
								alert(rsp.message);
							} else {
								alert("获得数据失败");
							}
						}
					}, "json").error(function() {});
				} else {
					createWrapper(me, opts, tableid);
				}

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
	 * showpagin:是否显示分页
	 * showlinenum://是否显示行号
	 * wrapperborder: 外框border是否显示，默认false
	 * class: 样式类,
	 * cache: 是否缓存 默认false
	 * showpagin: 是否显示分页栏
	 * urlpagin: 是否通过url进行分页操作
	 * url:获得数据的连接
	 */
	var defaults = {
		cache: false,
		columns: [], //字段
		data: undefined,
		page: 1,
		pagesize: 30,
		showpagin: false,
		urlpagin: false,
		showlinenum: false,
		wrapperborder: false,
		align: "left"
	};

	function createWrapper(me, opts, tableid) {
		//先把表的属性加上
		if(!me.hasClass("zbtable")) {
			me.addClass("zbtable");
		}

		var html = "";
		var theader = "";

		//初始化标题
		if(opts.columns && opts.columns.length > 0) {
			theader = "<tr>";
			if(opts.shownum) {
				theader += "<th style='width:30px; text-align:center; text-overflow: ellipsis; overflow: hidden;'><div style='width:30px; text-align:center; text-overflow: ellipsis; overflow: hidden;'>序号</div></th>";
			}
			for(var colindex = 0; colindex < opts.columns.length; colindex++) {
				theader += "<th " + createThAttr(opts.columns[colindex], true) + ">";
				theader += "<div style='text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width:" + getSize(opts.columns[colindex].width) + "'>";
				theader += opts.columns[colindex].title || "";
				theader == "</div>;"
				theader += "</th>";
			}
			theader += "</tr>";
			html += theader;
		}

		//创建包含表格的元素div
		var zbwrapper = document.createElement("div");
		var $zbwrapper = $(zbwrapper);
		$zbwrapper.css({
			"height": getSize(opts.height),
			"width": opts.fit ? "100%" : (opts.width || "auto")
		});
		$zbwrapper.addClass("zbtable-wrapper");
		if(opts.wrapperborder) {
			$zbwrapper.addClass("zbtable-wrapper-border");
		}
		me.before(zbwrapper);
		window.zbtablelist[tableid]["wrapper"] = $zbwrapper;

		//显示分页信息
		if(opts.showpagin) {
			var pagindiv = document.createElement("div");
			var $pagindiv = $(pagindiv);
			$pagindiv.addClass("zbtable-pagin");
			window.zbtablelist[tableid]["pagin"] = $pagindiv;
			window.zbtablelist[tableid]["wrapper"].append($pagindiv);
			$pagindiv.html("<a class='zbtable-button-first'><<</a><a class='zbtable-button-prev'><</a><a class='zbtable-page-current'>0</a>/<a class='zbtable-page-total'>0</a><a class='zbtable-button-next'>></a><a class='zbtable-button-last'>>></a>");
			$pagindiv.find(".zbtable-button-first").click(function() {
				if(opts.page == 1) return;
				opts.page = 1;
				changePage(opts, tableid, $pagindiv);
			});
			$pagindiv.find(".zbtable-button-prev").click(function() {
				if(opts.page == 1) return;
				opts["tableid"] = tableid;
				opts.page -= 1;
				if(opts.page < 1) opts.page = 1;
				changePage(opts, tableid, $pagindiv);
			});
			$pagindiv.find(".zbtable-button-next").click(function() {
				if(opts.page == opts.totalpage) return;
				opts["tableid"] = tableid;
				opts.page += 1;
				if(opts.page > opts.totalpage) opts.page = opts.totalpage;
				changePage(opts, tableid, $pagindiv);
			});
			$pagindiv.find(".zbtable-button-last").click(function() {
				if(opts.page == opts.totalpage) return;
				opts["tableid"] = tableid;
				opts.page = opts.totalpage;
				changePage(opts, tableid, $pagindiv);
			});
		}

		//初始化表格行数据
		if(opts.data && opts.data.length > 0) {
			window.zbtablelist[tableid]["opts"] = opts;
			html += createData(opts, window.zbtablelist[tableid]["pagin"]);
		}
		me.append(html);

		var zbcontent = document.createElement("div");
		var $zbcontent = $(zbcontent);
		$zbcontent.css({
			"height": getSize(opts.height, opts.showpagin ? -26 : 0),
			"width": opts.fit ? "100%" : (opts.width || "auto")
		});
		$zbcontent.addClass("zbtable-content-wrapper");
		$zbcontent.append(me);
		window.zbtablelist[tableid]["contentwrapper"] = $zbcontent;
		window.zbtablelist[tableid]["wrapper"].append($zbcontent);

		//如果固定標題，則生成標題副本
		if(opts.fixedrow) {
			var zbheader = document.createElement("div");
			var $zbheader = $(zbheader);
			$zbheader.addClass("zbtable-header-wrapper");
			window.zbtablelist[tableid]["headerwrapper"] = $zbheader;
			window.zbtablelist[tableid]["wrapper"].append($zbheader);
			$zbcontent.scroll(function() {
				$zbheader.scrollLeft($(this).scrollLeft());
			});
		}

		if(opts.fixedcolumn) {
			var zbleft = document.createElement("div");
			var $zbleft = $(zbleft);
			$zbleft.addClass("zbtable-left-wrapper");
			window.zbtablelist[tableid]["leftwrapper"] = $zbleft;
			window.zbtablelist[tableid]["wrapper"].append($zbleft);

			$zbcontent.scroll(function() {
				$zbleft.scrollTop($(this).scrollTop());
			});
		}

		if(opts.fixedrow && opts.fixedcolumn) {
			var zbfixedboth = document.createElement("div");
			var $zbfixedboth = $(zbfixedboth);
			$zbfixedboth.addClass("zbtable-fixed-wrapper");
			window.zbtablelist[tableid]["fixedwrapper"] = $zbfixedboth;
			window.zbtablelist[tableid]["wrapper"].append($zbfixedboth);
		}

		syncTableWidth(opts);
	}

	/*
	 * 创建数据行
	 */
	function createData(opts, paginobj) {
		var html = "";
		var datalength = opts.pagesize;
		var startindex = 0;
		var endindex = 0;
		var urlstartindex=0;
		opts.totalpage = Math.ceil(opts.data.length / opts.pagesize);
		if(opts.showpagin && !opts.urlpagin) {			
			startindex = (opts.page - 1) * opts.pagesize;
			endindex = startindex + opts.pagesize - 1;
			endindex = Math.min(endindex, opts.data.length - 1);
		} else {
			if(opts.urlpagin){
				urlstartindex=(opts.page-1)*opts.pagesize;
			}
			endindex = opts.data.length - 1;
		}

		console.log(endindex);

		if(startindex == endindex && endindex == 0) {
			return "";
		}
		console.log(opts.page);
		for(var rowindex = startindex; rowindex <= endindex; rowindex++) {
			var rowdata = opts.data[rowindex];
			html += "<tr class='zbtable-row'>";
			if(opts.columns && opts.columns.length > 0) {
				var indexnum = opts.urlpagin ? (urlstartindex + rowindex + 1) : (rowindex + 1)
				html += "<td style='width:30px; text-align:center; text-overflow: ellipsis; overflow: hidden;'><div style='width:30px; text-align:center; text-overflow: ellipsis; overflow: hidden;'>" + indexnum + "</div></td>";
				for(var colindex = 0; colindex < opts.columns.length; colindex++) {
					var columndata = opts.columns[colindex];
					var td = "<td " + createThAttr(columndata) + ">";
					td += "<div style='text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width:" + getSize(columndata.width) + "'>";
					td += rowdata[columndata.field] || '';
					td += "</div>";
					td += "</td>";
					html += td;
				}
			}
			html += "</tr>";
		}

		if(opts.showpagin) {
			paginobj.find(".zbtable-page-current").text(opts.page);
			paginobj.find(".zbtable-page-total").text(Math.ceil(opts.data.length / opts.pagesize));
		}
		return html;
	}

	/*
	 * 转化长、高、宽
	 */
	function getSize(obj, scrollwh) {
		scrollwh = scrollwh || 0;
		var _width = parseInt(obj);
		if(!isNaN(_width)) {
			var unit = obj.toString().replace(/[0-9]/ig, "");
			if(!unit) {
				unit = "px";
			}
			return _width + scrollwh + unit;
		} else {
			return "auto";
		}
	}

	/*
	 * 换页
	 */
	function changePage(opts, tableid, pagindiv) {
		opts["tableid"] = tableid;
		var html = "";
		if(opts.urlpagin) {
			$.get(opts.url, {
				page: opts.page,
				pagesize: opts.pagesize,
				rnd: opts.cancle ? "" : Math.random()
			}, function(rsp) {
				console.log(JSON.stringify(rsp));
				if(rsp && rsp.success === true) {
					opts.totalpage = rsp.totalpage;
					opts.data = rsp.data;

					html = createData(opts, pagindiv);

					window.zbtablelist[tableid]["contentwrapper"].find(".zbtable-row").remove();
					window.zbtablelist[tableid]["contentwrapper"].find("table").append(html);
					syncTableWidth(opts);
				} else {
					if(rsp) {
						alert(rsp.message);
					} else {
						alert("数据抓取失败");
					}
				}
			}, "json");
		} else {
			html = createData(opts, pagindiv);
			window.zbtablelist[tableid]["contentwrapper"].find(".zbtable-row").remove();
			window.zbtablelist[tableid]["contentwrapper"].find("table").append(html);
			syncTableWidth(opts);
		}

		window.zbtablelist[tableid]["contentwrapper"].find(".zbtable-row").remove();
		window.zbtablelist[tableid]["contentwrapper"].find("table").append(html);
		syncTableWidth(opts);
	}

	/*
	 * 同步所有表格的宽度
	 */
	function syncTableWidth(opts) {
		var tableid = opts.tableid;
		var me = window.zbtablelist[tableid].contentwrapper.find("table");
		//如果固定標題，則生成標題副本
		if(opts.fixedrow) {
			var $zbheader = window.zbtablelist[tableid]["headerwrapper"];
			$zbheader.html("");
			var headertable = me.clone();
			headertable.find(".zbtable-row").remove();
			$zbheader.append(headertable);
		}

		if(opts.fixedcolumn) {
			var $zbleft = window.zbtablelist[tableid]["leftwrapper"];
			$zbleft.html("");
			var lefttable = me.clone();
			lefttable.width(me.width());
			$zbleft.append(lefttable);
			var $tr = me.find("tr").eq(0);
			var thwidth = 0;
			var ths = $tr.find("th");
			var thsize = Math.min(ths.size(), opts.fixedcolumn);
			if(opts.shownum) {
				thsize++;
			}
			for(var i = 0; i < thsize; i++) {
				thwidth += $(ths[i]).outerWidth();
			}
			thwidth += 1;
			$zbleft.width(thwidth);
			window.zbtablelist[tableid]["fixedwidth"] = thwidth;
		}

		if(opts.fixedrow && opts.fixedcolumn) {
			var $zbfixedboth = window.zbtablelist[tableid]["fixedwrapper"];
			$zbfixedboth.html("");
			var bothtable = me.clone();
			bothtable.find(".zbtable-row").remove();
			$zbfixedboth.addClass("zbtable-fixed-wrapper");
			$zbfixedboth.html(bothtable);
			$zbfixedboth.width(window.zbtablelist[tableid]["fixedwidth"]);
		}

		var obj = window.zbtablelist[tableid];

		if(obj && obj.contentwrapper) {
			var tbwidth = obj.contentwrapper.find("table").width();
			if(obj.fixedwrapper) {
				obj.fixedwrapper.find("table").width(tbwidth);
			}
			if(obj.leftwrapper) {
				obj.leftwrapper.find("table").width(tbwidth)
				obj.leftwrapper.height(obj.contentwrapper.height() - 17);
			}
			if(obj.headerwrapper) {
				obj.headerwrapper.find("table").width(tbwidth);
				obj.headerwrapper.width(obj.contentwrapper.width() - 17);
			}
		}
		if(!opts.height) {
			obj.wrapper.height(me.height());
		}
	}

	/*
	 * 创建标题属性
	 */
	function createThAttr(columnoptions, isth) {
		var _thattr = "";
		if(columnoptions) {
			if(isth) {
				if(columnoptions && columnoptions.thclass) {
					_thattr += " class=\"" + columnoptions.thclass + "\" ";
				}
			} else {
				if(columnoptions && columnoptions.class) {
					_thattr += " class=\"" + columnoptions.class + "\" ";
				}
			}
			_thattr += " style=\"";
			if(columnoptions.align) {
				_thattr += ";text-align:" + columnoptions.align;
			}
			if(columnoptions.width) {
				_thattr += ";width:" + getSize(columnoptions.width);
			}
			_thattr += "\"";
		}
		return _thattr;
	}
}(jQuery)