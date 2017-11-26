/* FrameTrail Specific DrawConnections Methods
*  @TODO Move to own module
*/

var ra = false;

function initRaphael() {
    ra = Raphael( $('#SlideArea').get(0), 0,0, $(document).width(), $(document).height());
    $("#SlideArea > svg").css({
        position: "absolute",
        top: 0 + "px",
        left: 0 + "px",
        width: $(document).width() + "px",
        height: $("#SlideArea").height() + "px",
        "zIndex": "0"
    });
}

function drawConnections(from, to, curviness, attr) {
        if ($(to).length>1) {
            $(to).each(function(){
                drawConnections(from,this,curviness,attr);
            })
            return;
        } else if ($(to).length<1) {
            return;
        } else if ($(from).length<1) {
            return;
        }
        
        var obj1 = $(from).get();
        var obj2 = $(to).get();
        
        
        
        obj1["box"] = getRaphaelObject(obj1);
        obj2["box"] = getRaphaelObject(obj2);
        
        if (!ra || $("#SlideArea > svg").length == 0) {
            initRaphael();
        }
        ra.connection(obj1, obj2, curviness, attr);
}
        
        
function getRaphaelObject(selector) {
    var obj = new Object();

    var titleOffset;

    if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {
        titleOffset = 0;
    } else {
    	titleOffset = $('#Titlebar').height();
    }
    
    var leftOffset = $(selector).offset().left - parseInt($('#MainContainer').css('margin-left'));
    var topOffset = $(selector).offset().top - titleOffset - parseInt($('#SlideArea').css('margin-top'));

    obj["x"] = leftOffset;
    obj["y"] = topOffset;
    obj["width"] = $(selector).outerWidth();
    obj["height"] = $(selector).outerHeight();
    
    return obj;
}

function clearRaphael() {
    if (!ra) {
            initRaphael();
    }
    ra.clear();
}

/* Raphael Connection Plugin
*  -> Stays in this file
*/

Raphael.fn.connection = function (obj1, obj2, curviness, attr, line, bg) {
	
	if (obj1.line && obj1.from && obj1.to) {
	    line = obj1;
	    obj1 = line.from;
	    obj2 = line.to;
	}

	if (!curviness) {
		curviness = 10;
	}
	
	var bb1 = obj1["box"],
	    bb2 = obj2["box"],
	    p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
	    {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
	    {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
	    {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
	    {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
	    {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
	    {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
	    {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
	    d = {}, dis = [];

	for (var i = 0; i < 4; i++) {
	    for (var j = 4; j < 8; j++) {
	        var dx = Math.abs(p[i].x - p[j].x),
	            dy = Math.abs(p[i].y - p[j].y);
	        if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
	            dis.push(/*dx + */dy);
	            d[dis[dis.length - 1]] = [i, j];
	        }
	    }
	}

	if (dis.length == 0) {
	    var res = [0, 4];
	} else {
	    res = d[Math.min.apply(Math, dis)];
	}

	var x1 = p[res[0]].x,
	    y1 = p[res[0]].y,
	    x4 = p[res[1]].x,
	    y4 = p[res[1]].y;
	
	dx = Math.max(Math.abs(x1 - x4) / 2, curviness);
	dy = Math.max(Math.abs(y1 - y4) / 2, 10);
	
	var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
	    y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
	    x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
	    y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
	var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

	if (line && line.line) {
	    line.bg && line.bg.attr({path: path});
	    line.line.attr({path: path});
	} else {
	    return {
	        bg: bg && bg.split && this.path(path).attr(attr),
	        line: this.path(path).attr(attr),
	        from: obj1,
	        to: obj2
	    };
	}
}