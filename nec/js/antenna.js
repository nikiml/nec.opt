// copyright 2010 Nikolay Mladenov
/*global window, Raphael, alert, $V, $M, Vector, Matrix, $ */

//some pieces of code I collected from the internet
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length, from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) { from += len; }

        for (; from < len; from++) {
            if (from in this && this[from] === elt) { return from; }
        }
        return -1;
    };
}


if (!Array.prototype.maxIndex) {
    Array.prototype.maxIndex = function() {
        if (!this.length) { return -1; }
        var maxi = 0, len = this.length, i = 1;
        for (; i < len; ++i){
            if (this[maxi] < this[i]) {maxi = i; }
      }
        return maxi;
    };
}

if (!Array.prototype.minIndex) {
    Array.prototype.minIndex = function() {
        if (!this.length) {return -1; }
        var mini = 0, len = this.length, i = 1;
        for (; i < len; ++i){
            if (this[mini] > this[i]) {mini = i; }
      }
        return mini;
    };
}

if (!Array.prototype.maxValue) {
    Array.prototype.maxValue = function() {
        if (!this.length) { return undefined; }
        return this[this.maxIndex()];
    };
}

if (!Array.prototype.minValue) {
    Array.prototype.minValue = function() {
        if (!this.length) { return undefined; }
        return this[this.minIndex()];
    };
}


function getClientWidth() {
    return document.compatMode === 'CSS1Compat' && !window.opera ? document.documentElement.clientWidth : document.body.clientWidth;
}

function getClientHeight() {
    return document.compatMode === 'CSS1Compat' && !window.opera ? document.documentElement.clientHeight : document.body.clientHeight;
}
function getInternetExplorerVersion() {
    if (navigator.appName === 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent,
       re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
        if (re.exec(ua) !== null) {
            return parseFloat(RegExp.$1);
        }
    }
    return -1;
}


//antenna.js

function r_line(r, x1, y1, x2, y2) {
    return r.path("M" + x1 + " " + y1 + "L" + x2 + " " + y2);
}

function radians(deg) {
    return Math.PI * deg / 180;
}

function degrees(rad) {
    return rad / Math.PI * 180;
}
function fontSize(a) {
    return { "font-size": a };
}

function fontWeight(a) {
    return { "font-weight": a };
}

var antennaGeometry = function(holder, w, h, scale, coords, ini_x_off_, ini_y_off_, confs_, confs_title) {
    var raphael = Raphael(holder, w, h), 
   undef = undefined, 
   min = Math.min, 
   max = Math.max, 
   model_view_mtr = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0, 1, 0], [0, 0, 1], [1, 0, 0]]))), 
//   ini_scale = scale, 
   ini_x_off = ini_x_off_ ? ini_x_off_ : 0, 
   ini_y_off = ini_y_off_ ? ini_y_off_ : 0, 
   rot_mode = undef, 
   top = confs_ ? 14 : 0, 
   rotate_mode = 0, 
   in_inch = 0, 
   ie = (getInternetExplorerVersion() !== -1), 
   bgcolor = "#fff", 
   framecolor = "#f8f8f8", 
   line_width = 1, 
   point_size = 2, 
   lenToMM = function(len) { return Math.round(len * 1000) + "mm"; }, 
   coordToMM = function(c) { return Math.round(c * 10000) / 10; }, 
   lenToMM1 = function(c) { return Math.round(c * 10000) / 10 + "mm"; }, 
   simplify16th = function(s) {
        if (s % 2) { return [s, 16]; }
        s /= 2;
        if (s % 2) { return [s, 8]; }
        s /= 2;
        if (s % 2) { return [s, 4]; }
        s /= 2;
        return [s, 2];
    }, 
   lenToIN = function(len) {
        var s = len < 0 ? -Math.round(len / 0.0015875) : Math.round(len / 0.0015875), n, d;
        if (s % 16 !== 0) {
            n = Math.abs(s % 16);
            d = simplify16th(n);
            return (len < 0 ? "-" : "") + Math.round(s / 16 - 0.5) + " " + d[0] + "/" + d[1] + " in";
        }
        else {
            return (len < 0 ? "-" : "") + Math.round(s / 16 - 0.5) + "in";
        }
    }, 
   coordToIN = function(c) {
        var s = c < 0 ? -Math.round(c / 0.0015875) : Math.round(c / 0.0015875), n, d;

        if (s % 16 !== 0) {
            n = Math.abs(s % 16);
            d = simplify16th(n);
            return (c < 0 ? "-" : "") + Math.round(s / 16 - 0.5) + " " + d[0] + "/" + d[1];
        }
        else {
            return (c < 0 ? "-" : "") + Math.round(s / 16 - 0.5);
        }
    }, 
   coordsToSegments = function(coords) {
        var i = 0, segments = [], color, pts, j, s, e, dif, len;
        for (i = 0; i !== coords.length; i++) {
            color = coords[i][0];
            pts = coords[i].slice(1);
            
            if (pts.length % 6 !== 0) {
                alert("Invalid geometry array - length=" + pts.length);
            }
            for (j = 0; j !== pts.length; j += 6) {
                s = $V(pts.slice(j, j + 3));
                e = $V(pts.slice(j + 3, j + 6));
                dif = s.subtract(e);
                len = dif.modulus();

                segments.push(
                  { "color": color,
                      "pts": [s, e],
                      "selected": 0,
                      "sselected": 0,
                      "eselected": 0,
                      "len": len,
                      "names": [[lenToMM(len),
                     coordToMM(s.e(1)) + "," + coordToMM(s.e(2)) + "," + coordToMM(s.e(3)),
                     coordToMM(e.e(1)) + "," + coordToMM(e.e(2)) + "," + coordToMM(e.e(3))
                     ], [lenToIN(len),
                     coordToIN(s.e(1)) + "," + coordToIN(s.e(2)) + "," + coordToIN(s.e(3)),
                     coordToIN(e.e(1)) + "," + coordToIN(e.e(2)) + "," + coordToIN(e.e(3))]
                     ]
                  });
            }
        }
        return segments;
    }, 
   rescaleSegments = function(segments, scale) {
        var res = [], i, seg, s, e, len;
        for (i = 0; i != segments.length; ++i) {
            seg = segments[i];
            s = seg.pts[0].x(scale);
            e = seg.pts[1].x(scale);
            len = seg.len * scale;
            res.push({ "color": seg.color, "pts": [s, e], "selected": 0, "sselected": 0, "eselected": 0, "len": len, 
                  "names": [[lenToMM(len),
                  coordToMM(s.e(1)) + "," + coordToMM(s.e(2)) + "," + coordToMM(s.e(3)),
                  coordToMM(e.e(1)) + "," + coordToMM(e.e(2)) + "," + coordToMM(e.e(3))
                  ], [lenToIN(len),
                  coordToIN(s.e(1)) + "," + coordToIN(s.e(2)) + "," + coordToIN(s.e(3)),
                  coordToIN(e.e(1)) + "," + coordToIN(e.e(2)) + "," + coordToIN(e.e(3))]
                  ]
            });
        }
        return res;
    }, 
   segments = coordsToSegments(coords), 
   confs = [], 
   curr_conf = -1, 
   all_segments = [], 
   i, 
   _off = $V([w / 2 + ini_x_off, (h + top) / 2 + ini_y_off, 0]), 
   _org = $V([0, 0, 0]), 
   that = this, 
   proj_mtr = $M([[1, 0, 0], [0, -1, 0], [0, 0, 1]]), 
   proj_model_view_mtr = proj_mtr.x(model_view_mtr), 
/*   home = function() {
        model_view_mtr = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0, 1, 0], [0, 0, 1], [1, 0, 0]])));
        _off = $V([w / 2 + ini_x_off, (h + top) / 2 + ini_y_off, 0]);
        _org = $V([0, 0, 0]);
        scale = ini_scale;
        that.redraw();
    }, */
   rotateXY = function(x, y, mbtn) {
        if (x === 0 && y === 0) {
            return;
        }
        if ((rotate_mode === 0) == !mbtn) {
            _off = _off.add($V([x, -y, 0]));
        } else {
            var z = 0, degs,rot;
            if (rot_mode == "z") {
                z = -y; x = 0; y = 0;
            }
            else if (rot_mode == "y") {
                x = 0;
            } else if (rot_mode == "x") {
                y = 0;
            }
            if (x === 0 && y === 0 && z === 0) {
                return;
            }
            degs = Math.sqrt(x * x + y * y + z * z) * Math.PI / min(w, h);
          rot = Matrix.Rotation(degs, $V([-y, x, z]).toUnitVector());

            degs = model_view_mtr.x(_org).x(scale);
            _off = _off.add(proj_mtr.x(degs).subtract(proj_mtr.x(rot.x(degs))));
            model_view_mtr = rot.x(model_view_mtr);
        }
        that.redraw();
    }, 
   rescale = function(factor) {
        var org = proj_model_view_mtr.x(_org);
        _off = _off.add(org.x(scale).subtract(org.x(scale * factor)));
        scale *= factor;
        that.redraw();
    }, 
   tags = raphael.set(), 
   geometry_set = raphael.set(), 
   configuration_set = null, 
   info_set = null, 
   help_set = null, 
//   button_set = null, 
//   stroke_width = "stroke-width", 
   redb = "#b00", 
   greenb = "#0b0", 
   blueb = "#00b", 
   grayc = "#ccc", 
   gray = "#888", 
   fd0 = "#fd0", 
   none = "none", 
   black = "#000", 
   light_cyan = "#8ff", 
   cyan = "#0ff", 
   drawAxis = function() {
        var 
         s = proj_model_view_mtr.x(Vector.Zero(3)).x(30).add(_off),
         e = proj_model_view_mtr.x(Vector.i).x(30).add(_off),
         x1 = s.e(1),
         y1 = s.e(2),
         x2 = e.e(1),
         y2 = e.e(2);

        geometry_set.push(r_line(raphael, x1, y1, x2, y2).attr({ stroke: redb, "stroke-width": 1 }));
        x2 = x1 + (x2 - x1) * 1.25;
        y2 = y1 + (y2 - y1) * 1.25;
        geometry_set.push(raphael.text(x2, y2, "X").attr({ stroke: redb, "stroke-width": 1 }));
        e = proj_model_view_mtr.x(Vector.j).x(30).add(_off);
        x2 = e.e(1);
        y2 = e.e(2);
        geometry_set.push(r_line(raphael, x1, y1, x2, y2).attr({ stroke: greenb, "stroke-width": 1 }));
        x2 = x1 + (x2 - x1) * 1.25;
        y2 = y1 + (y2 - y1) * 1.25;
        geometry_set.push(raphael.text(x2, y2, "Y").attr({ stroke: greenb, "stroke-width": 1 }));
        e = proj_model_view_mtr.x(Vector.k).x(30).add(_off);
        x2 = e.e(1);
        y2 = e.e(2);
        geometry_set.push(r_line(raphael, x1, y1, x2, y2).attr({ stroke: blueb, "stroke-width": 1 }));
        x2 = x1 + (x2 - x1) * 1.25;
        y2 = y1 + (y2 - y1) * 1.25;
        geometry_set.push(raphael.text(x2, y2, "Z").attr({ stroke: blueb, "stroke-width": 1 }));
    }, 
   onConfiguration = function() {
        curr_conf = this.i;
        deselectAll();
        if (configuration_set !== null){
            configuration_set.remove();
      }
        that.redraw();
        drawConfigurations();
        drawInformation();
    }, 
   makeLabel = function(text, width, font_size, callback, state, bgcolor) {
        var set = raphael.set(), 
         rct = raphael.rect(1, 1, width, font_size + 2, 2), 
         txt = raphael.text(width / 2, font_size / 2 + 1, text).attr(fontSize(font_size));

        rct.attr({ fill: (state && state() ? light_cyan : bgcolor), stroke: none });
        rct.click(function() { callback(); rct.attr({ fill: (state && state() ? light_cyan : bgcolor) }); });
        rct.mouseover(function() { this.attr({ fill: grayc }); });
        rct.mouseout(function() { this.attr({ fill: (state && state() ? light_cyan : bgcolor) }); });
        txt.click(function() { callback(); rct.attr({ fill: (state && state() ? light_cyan : bgcolor) }); });
        txt.mouseover(function() { rct.attr({ fill: grayc }); this.attr(fontWeight("bold")); });
        txt.mouseout(function() { rct.attr({ fill: (state && state() ? light_cyan : bgcolor) }); this.attr(fontWeight("normal")); });
        set.push(rct);
        set.push(txt);
        set.rect = rct;
        return set;
    }, 
   drawHelpLink = function() {
        //        alert("drawHelpLink");
        //help_set = raphael.set();
        //        var url = "http://mladenov.ca/~nickm/help.html";
        //        rct = raphael.rect(w - 30, 1, 30, 12, 2);
        //        rct.attr({ fill: framecolor, stroke: none });
        //        rct.click(function() { window.open(url) })
        //        rct.mouseover(function() { ; this.attr({ fill: grayc }); });
        //        rct.mouseout(function() { this.attr({ fill: framecolor }); });
        //        txt = raphael.text(w - 15, 6, "Help").attr(fontSize(11));
        //        txt.click(function() { window.open(url) })
        //        txt.mouseover(function() { rct.attr({ fill: grayc }); this.attr(fontWeight("bold")); });
        //        txt.mouseout(function() { rct.attr({ fill: framecolor }); this.attr(fontWeight("normal")); });
        //        help_set.push(rct);
        //        help_set.push(txt);
        help_set = makeLabel("Help", 30, 11, function() { window.open("http://mladenov.ca/~nickm/help.html"); }, 0, framecolor);
        help_set.translate(w - 30, 0);
    }, 
   drawConfigurations = function() {
        //        alert("drawConfigurations");
        if (!confs.length) {
            return;
        }
        var l = confs_title.length,
          i, txt, rct, charsize,start;
        for (i = 0; i !== confs.length; ++i) {
            l += confs[i][0].length;
        }
        if (configuration_set === null){
            configuration_set = raphael.set();
      }
        charsize = min((w - 20.0) / (l + confs.length + 1), 8); 
      start = (w - charsize * l) / 2 - 30;
        configuration_set.push(raphael.text(start + confs_title.length * charsize / 2, top / 2, confs_title).attr(fontSize(11)));
        start += (1 + confs_title.length) * charsize;
        for (i = 0; i !== confs.length; ++i) {
            if (i === curr_conf) {
                configuration_set.push(raphael.rect(start, 1, confs[i][0].length * charsize, top - 2).attr({ fill: light_cyan, stroke: none }));
            } else {
                rct = raphael.rect(start, 1, confs[i][0].length * charsize, top - 2);
                rct.attr({ fill: framecolor, stroke: none });
                rct.mouseover(function() { this.attr({ fill: grayc }); });
                rct.mouseout(function() { this.attr({ fill: gbcolor }); });
                rct.click(onConfiguration);
                rct.i = i;
                configuration_set.push(rct);
            }
            txt = raphael.text(start + confs[i][0].length * charsize / 2, top / 2, confs[i][0]).attr(fontSize(11));
            configuration_set.push(txt);
            if (i !== curr_conf) {
                txt.i = i;
                txt.click(onConfiguration);
                txt.rect = rct;
                txt.mouseover(function() { this.rect.attr({ fill: grayc }); this.attr(fontWeight("bold")); });
                txt.mouseout(function() { this.rect.attr({ fill: bgcolor }); this.attr(fontWeight("normal")); });
            }
            start += (1 + confs[i][0].length) * charsize;
        }
    }, 
   angleFrom = function(vec1, vec2) {
        return Math.atan2(vec1.cross(vec2).modulus(), vec1.dot(vec2));
    }, 
   angleBetween = function(seg1, seg2) {
        var dists = [seg1.pts[0].subtract(seg2.pts[0]).modulus(), seg1.pts[0].subtract(seg2.pts[1]).modulus(), seg1.pts[1].subtract(seg2.pts[0]).modulus(), seg1.pts[1].subtract(seg2.pts[1]).modulus()],
         mini = dists.minIndex(),
         ang = 0;
        if (mini === 0){
            ang = angleFrom(seg1.pts[1].subtract(seg1.pts[0]), seg2.pts[1].subtract(seg2.pts[0]));
      }else if (mini == 1){
            ang = angleFrom(seg1.pts[1].subtract(seg1.pts[0]), seg2.pts[0].subtract(seg2.pts[1]));
      }else if (mini == 2){
            ang = angleFrom(seg1.pts[0].subtract(seg1.pts[1]), seg2.pts[1].subtract(seg2.pts[0]));
        }else if (mini == 3){
            ang = angleFrom(seg1.pts[0].subtract(seg1.pts[1]), seg2.pts[0].subtract(seg2.pts[1]));
      }
        return Math.round(10 * degrees(ang)) / 10 + "\u00B0";
    }, 
   selected = [], 
   total_len = 0, 
   bounding_box = [$V([100000000, 100000000, 100000000]), $V([-100000000, -100000000, -100000000])], 
   fit = function() {
       var 
            sizes = bounding_box[1].subtract(bounding_box[0]), 
         s = min((w - 40) / max(1, sizes.e(1)), (h - 80) / max(1, sizes.e(2))), 
         org = (bounding_box[1].add(bounding_box[0])).x(0.5);

       _org = proj_model_view_mtr.inv().x(org.subtract(_off).x(1 / scale));
       scale = scale * s;
       _off = $V([w / 2, h / 2, 0]).subtract(org.subtract(_off).x(s));
   }, 
   drawInformation = function() {
        //        alert("drawInformation");
        var lenToUnit = in_inch ? lenToIN : lenToMM1, 
         accumulated_len = 0, 
         pts = [], 
         segs = [], 
         i, 
         xs = [], ys = [], zs = [], str = "", 
         count = 0, 
         s, s_i, s_j, s_e, seg;
        if (!selected.length) {
            info_set = raphael.text(w / 2 - 20, top + 7, "Select elements for info. Double click to clear. Total len: " + lenToUnit(total_len)).attr(fontSize(11));
            return;
        }
        for (i = 0; i !== selected.length; ++i) {
            s = selected[i];
            s_i = s[0];
            s_j = s[1];
            s_e = s[2];
            seg = all_segments[s_i][s_j];
            if (s_e === 0) {
                segs.push(seg);
                pts.push(seg.pts[0]);
                pts.push(seg.pts[1]);
                accumulated_len += seg.len;
            } else {
                pts.push(seg.pts[s_e - 1]);
            }
        }
        for (i = 0; i !== pts.length; ++i) {
            if (xs.indexOf(pts[i].e(1)) === -1) {
                xs.push(pts[i].e(1));
            }
            if (ys.indexOf(pts[i].e(2)) === -1) {
                ys.push(pts[i].e(2));
            }
            if (zs.indexOf(pts[i].e(3)) === -1) {
                zs.push(pts[i].e(3));
            }
        }
        if (xs.length === 1) {
            str += " x: " + lenToUnit(xs[0]);
            ++count;
        }
        else if (xs.length === 2) {
            str += " \u0394x: " + lenToUnit(Math.abs(xs[0] - xs[1]));
            ++count;
        }
        if (ys.length === 1) {
            str += " y: " + lenToUnit(ys[0]);
            ++count;
        } else if (ys.length === 2) {
            str += " \u0394y: " + lenToUnit(Math.abs(ys[0] - ys[1]));
            ++count;
        }
        if (zs.length === 1) {
            str += " z: " + lenToUnit(zs[0]);
            ++count;
        } else if (zs.length === 2) {
            str += " \u0394z: " + lenToUnit(Math.abs(zs[0] - zs[1]));
            ++count;
        }
        if (segs.length == 2 && count < 3) {
            str += " \u2221" + angleBetween(segs[0], segs[1]);
            ++count;
        }

        if (accumulated_len > 0) {
            str += " Total len: " + lenToUnit(accumulated_len);
            ++count;
        }

        info_set = raphael.text(w / 2 - 20, top + 7, "Selection info (" + selected.length + "): " + str).attr(fontSize(11));
    }, 
   deselectAll = function() {
        var i, j, s;
        selected = [];
        info_set.remove();
        //        info_set = null;
        for (i = 0; i !== all_segments.length; ++i) {
            s = all_segments[i];
            for (j = 0; j !== s.length; ++j) {
                s[j].selected = 0;
                s[j].sselected = 0;
                s[j].eselected = 0;
            }
        }
    }, 
   popup = function() {
        tags.remove();
        tags.push(raphael.g.popup(this.x, this.y, this.value, null, 3)); //.insertAfter(this));
    }, 
   popdown = function() {
        tags.remove();
    }, 
   segclick = function() {
        var s = this.si;
        all_segments[s[0]][s[1]].selected = !all_segments[s[0]][s[1]].selected;
        info_set.remove();
        that.redraw();
        drawInformation();
    }, 
   startclick = function() {
        var s = this.si;
        all_segments[s[0]][s[1]].sselected = !all_segments[s[0]][s[1]].sselected;
        info_set.remove();
        that.redraw();
        drawInformation();
    }, 
   endclick = function() {
        var s = this.si;
        all_segments[s[0]][s[1]].eselected = !all_segments[s[0]][s[1]].eselected;
        info_set.remove();
        that.redraw();
        drawInformation();
    }, 
   applyHover = function(btn, obj, fillin, fillout, strokein, strokeout) {
        var makeattr = function(fil, strok) {
            var attr = {}, v = {};
            (fil == undef ? v : attr).fill = fil;
            (strok == undef ? v : attr).stroke = strok;
            return attr;
        };
        obj = obj || btn;
        if (obj == btn) {
            obj.attr({ fill: fillout, stroke: strokeout });
            obj.fillin = fillin;
            obj.fillout = fillout;
            obj.strokein = strokein;
            obj.strokeout = strokeout;
        }
        btn.hover(
             function() {
                 obj.attr(makeattr(obj.fillin, obj.strokein));
             },
             function() {
                 obj.attr(makeattr(obj.fillout, obj.strokeout));
             }
            );
        return btn;
    }, 
   switchRotateMode = function(event) {
        rotate_mode = rotate_mode ? 0 : 1;
        var btn = this.btn || this;
        btn.fillout = rotate_mode ? light_cyan : framecolor;
        btn.attr({ fill: btn.fillout });
        that.redraw();
    }, 
   drawButtons = function() {
        //        alert("drawButtons");
        var gray1 = "#888", gray2 = "#ccc", black = "#000", none = "none", 
      //common_attr = { stroke: "#000", "stroke-linejoin": "round" }, 
      rear_empty = { fill: bgcolor, "stroke-dasharray": "-", "stroke-width": 1 }, 
      front_full = { fill: bgcolor, "stroke-width": 2, "fill-opacity": 0.75 }, 
      rear_full = { fill: bgcolor, "stroke-width": 0.5, "stroke-dasharray": "-" }, 
      front_empty = { fill: "none", "stroke-width": 2, "fill-opacity": 0.5 }, 
      c, p, btn_set,rotate_btn, fit_btn, inch_btn, mm_btn;


        /*        raphael.g.label(86, h - 15, "Reset").click(function(event) {
        deselectAll();
        home();
        drawInformation();
        });*/
        //raphael.g.label(150, h - 15, in_inch ? "Switch to MM" : "Switch to IN").click(function(event) { in_inch = !in_inch; info_set.remove(); drawInformation(); });

        mm_btn = makeLabel("mm", 20, 13, function() { inch_btn.rect.attr({ fill: framecolor }); in_inch = 0; info_set.remove(); drawInformation(); }, function() { return !in_inch; }, framecolor);
        mm_btn.translate(0, h - 40);
        inch_btn = makeLabel("in", 20, 13, function() { mm_btn.rect.attr({ fill: framecolor }); in_inch = 1; info_set.remove(); drawInformation(); }, function() { return in_inch; }, framecolor);
        inch_btn.translate(0, h - 20);

        btn_set = raphael.set();
        btn_set.push( raphael.path("M0,3l15,-3l9,5l-15,3z").attr(front_full));
        btn_set.push(raphael.path("M0,3l9,5v16l-9,-5z").attr(front_full));
        btn_set.push(raphael.path("M9,8v16l15,-3v-16z").attr(front_full));
        applyHover(btn_set, undef, gray1, bgcolor).
         click(function(event) 
         { 
            model_view_mtr = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0, 1, 0], [0, 0, 1], [1, 0, 0]]))); 
            that.redraw(); 
         });
        btn_set.translate(w - 206, h - 28).attr({ stroke: "#000", "stroke-linejoin": "round" });


        btn_set = raphael.set();
        btn_set.push(raphael.path("M0,24l8,-8v-16m0,16h16").attr(rear_empty));
        btn_set.push(applyHover(
         raphael.path("M0,8v16h16v-16z").
         attr(front_full), undef, gray1, bgcolor).
         click(function(event) 
         { 
            model_view_mtr = $M([[0, 1, 0], [0, 0, 1], [1, 0, 0]]); 
            that.redraw(); 
         }));
        btn_set.push(applyHover(
         raphael.path("M0,8h16l8,-8h-16z").
         attr(front_full), undef, gray1, bgcolor).
         click(function(event) 
         { 
         model_view_mtr = $M([[0, 1, 0], [-1, 0, 0], [0, 0, 1]]); 
         that.redraw(); 
         }));
        btn_set.push(applyHover(
         raphael.path("M16,8v16l8,-8v-16z").
         attr(front_full), undef, gray1, bgcolor).
         click(function(event) 
         {
            model_view_mtr = $M([[-1, 0, 0], [0, 0, 1], [0, 1, 0]]); 
            that.redraw(); 
         }));
        btn_set.translate(w - 178, h - 28).attr({ stroke: "#000", "stroke-linejoin": "round" });

        btn_set = raphael.set();
        btn_set.push(applyHover(
         raphael.path("M0,8v16l8,-8v-16z").
         attr(rear_full), undef, gray2, bgcolor).
         click(function(event) 
         {
            model_view_mtr = $M([[1, 0, 0], [0, 0, 1], [0, -1, 0]]); 
            that.redraw(); 
         }));
        btn_set.push(applyHover(
         raphael.path("M0,24h16l8,-8h-16z").
         attr(rear_full), undef, gray2, bgcolor).
         click(function(event) 
         { 
            model_view_mtr = $M([[0, 1, 0], [1, 0, 0], [0, 0, -1]]); 
            that.redraw(); 
         }));
        btn_set.push(applyHover(
         raphael.path("M8,0h16v16h-16z").
         attr(rear_full), undef, gray2, bgcolor).
         click(function(event) 
         { 
            model_view_mtr = $M([[0, -1, 0], [0, 0, 1], [-1, 0, 0]]); 
            that.redraw(); 
         }));
        btn_set.push(raphael.path("M0,8v16h16v-16z").attr(front_empty));
        btn_set.push(raphael.path("M0,8h16l8,-8h-16z").attr(front_empty));
        btn_set.push(raphael.path("M16,8v16l8,-8v-16z").attr(front_empty));
        btn_set.translate(w - 150, h - 28).attr({ stroke: "#000", "stroke-linejoin": "round" });


        c = raphael.circle(w - 122 + 16, h - 15, 14).click(function(event) { rescale(1.1); });
        applyHover(c, c, grayc, framecolor, none, none);
        p = raphael.path("M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM15.687,9.051h-4v2.833H8.854v4.001h2.833v2.833h4v-2.834h2.832v-3.999h-2.833V9.051z").
         attr({ fill: black, stroke: none }).translate(w - 122, h - 30).click(function(event) { rescale(1.1); });
        applyHover(p, c);
        c = raphael.circle(w - 93 + 16, h - 15, 14).click(function(event) { rescale(1 / 1.1); });
        p = raphael.path("M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM8.854,11.884v4.001l9.665-0.001v-3.999L8.854,11.884z").
         attr({ fill: black, stroke: none }).translate(w - 93, h - 30).click(function(event) { rescale(1 / 1.1); });
        applyHover(c, c, grayc, framecolor, none, none);
        applyHover(p, c);

        rotate_btn = raphael.set();
        c = raphael.circle(16, 16, 14);
        applyHover(c, c, grayc, framecolor, black, black);
        rotate_btn.push(c);
        c.click(switchRotateMode);
        p = raphael.path("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z").
         attr({ fill: "#000" }).scale(3 / 4);
        rotate_btn.push(p);
        p.btn = c;
        p.click(switchRotateMode);
        applyHover(p, c);
        rotate_btn.translate(w - 32, h - 32);

        fit_btn = raphael.set();
        c = raphael.circle(15.5, 15.5, 14);
        applyHover(c, c, grayc, framecolor, black, black);
        fit_btn.push(c);
        //c.click(function() { fit(); that.redraw(); });
        fit_btn.push(p = raphael.path("M25.545,23.328,17.918,15.623,25.534,8.007,27.391,9.864,29.649,1.436,21.222,3.694,23.058,5.53,15.455,13.134,7.942,5.543,9.809,3.696,1.393,1.394,3.608,9.833,5.456,8.005,12.98,15.608,5.465,23.123,3.609,21.268,1.351,29.695,9.779,27.438,7.941,25.6,15.443,18.098,23.057,25.791,21.19,27.638,29.606,29.939,27.393,21.5z").
         attr({ fill: "#000", stroke: "#000" }).scale(5 / 8));

        applyHover(p, c);
        fit_btn.translate(w - 64, h - 32).click(function() { fit(); that.redraw(); });

        btn_set = raphael.set();
        c = raphael.rect(1, 1, 30, 11).attr({ stroke: none}).click(function() { line_width = 5; that.redraw(); });
        applyHover(c, c, grayc, framecolor);
        p = r_line(raphael, 3, 6, 29, 6).attr({ stroke: black, "stroke-width": 5 }).click(function() { line_width = 5; that.redraw(); });
        applyHover(p, c, grayc, framecolor);
        btn_set.push(p);
        btn_set.push(c);
        c = raphael.rect(1, 12, 30, 11).attr({ stroke: none}).click(function() { line_width = 3; that.redraw(); });
        applyHover(c, c, grayc, framecolor);
        p = r_line(raphael, 3, 18, 29, 18).attr({ stroke: black, "stroke-width": 3 }).click(function() { line_width = 3; that.redraw(); });
        applyHover(p, c, grayc, framecolor);
        btn_set.push(p);
        btn_set.push(c);
        c = raphael.rect(1, 23, 30, 11).attr({ stroke: none}).click(function() { line_width = 1; that.redraw(); });
        applyHover(c, c, grayc, framecolor);
        p = r_line(raphael, 3, 29, 29, 29).attr({ stroke: black, "stroke-width": 1 }).click(function() { line_width = 1; that.redraw(); });
        applyHover(p, c, grayc, framecolor);
        btn_set.push(p);
        btn_set.push(c);

        c = raphael.circle(40, 7, 6).attr({ stroke: none}).click(function() { point_size = 4; that.redraw(); });
        applyHover(c, c, grayc, framecolor);
        p = raphael.circle(40, 7, 4).attr({ fill: black }).click(function() { point_size = 4; that.redraw(); });
        applyHover(p, c, grayc, framecolor);
        btn_set.push(p);
        btn_set.push(c);

        c = raphael.circle(40, 18, 6).attr({ stroke: none}).click(function() { point_size = 3; that.redraw(); });
        applyHover(c, c, grayc, framecolor);
        p = raphael.circle(40, 18, 3).attr({ fill: black }).click(function() { point_size = 3; that.redraw(); });
        applyHover(p, c, grayc, framecolor);
        btn_set.push(p);
        btn_set.push(c);
        c = raphael.circle(40, 29, 6).attr({ stroke: none}).click(function() { point_size = 2; that.redraw(); });
        applyHover(c, c, grayc, framecolor);
        p = raphael.circle(40, 29, 2).attr({ fill: black }).click(function() { point_size = 2; that.redraw(); });
        applyHover(p, c, grayc, framecolor);
        btn_set.push(p);
        btn_set.push(c);

        btn_set.translate(30, h - 40);
    }, 
   vmin = function(v1, v2) {
        return $V([min(v1.e(1), v2.e(1)), min(v1.e(2), v2.e(2)), min(v1.e(3), v2.e(3))]);
    }, 
   vmax = function(v1, v2) {
        return $V([max(v1.e(1), v2.e(1)), max(v1.e(2), v2.e(2)), max(v1.e(3), v2.e(3))]);
    }, 
   moving = 0, 
//   rect, 
   sortFunc = function(a, b) {
       return a.z - b.z;
   }, 
   dragRect = function(x, y, w, h, round, rot_mod, clr) {
       var lastx, lasty, 
         rect = raphael.rect(x, y, w, h, round).attr({ fill: clr, stroke: "none" });
         
       rect.drag(
          function(dx, dy) {
              var x = dx - lastx,
             y = -dy + lasty;
              lastx = dx;
              lasty = dy;
              rotateXY(x, y, rect.mb);
          },
          function(x, y, ev) {
              rot_mode = rot_mod;
              lastx = 0; lasty = 0;
              if (ev.which == undefined){
                  rect.mb = (ev.button == 4);
              }else{
                  rect.mb = (ev.which == 2);
              }
            moving = 1;
          }, function() {
              moving = 0;
              that.redraw();
          }
       );
       rect.dblclick(function() { deselectAll(); that.redraw(); drawInformation(); });
   }, 
   isArray = function(o) {
       return Object.prototype.toString.call(o) === '[object Array]';
   }; //endof var

    raphael.g = raphael.g || raphael;
    if (confs_) {
        curr_conf = 0;
        for (i = 0; i !== confs_.length; ++i) {
            if (isArray(confs_[i][1])){
                confs.push([confs_[i][0], coordsToSegments(confs_[i][1])]);
            }else{
                confs.push([confs_[i][0], rescaleSegments(segments, confs_[i][1])]);
         }
        }
    }

    dragRect(1, 1, w - 2, h - 2, 10, "3", bgcolor);
    dragRect(1, 1, w - 2, 40, 10, "x", framecolor);
    dragRect(1, 1, 40, h - 2, 10, "z", framecolor);
    dragRect(w - 41, 1, w - 2, h - 2, 10, "y", framecolor);
    dragRect(1, h - 42, w - 2, h - 2, 10, "x", framecolor);

    drawButtons();
    drawHelpLink();
    drawConfigurations();

    this.redraw = function() {
        tags.remove();
        geometry_set.remove();
        //raphael.clear();
        var unit_names = in_inch ? 1 : 0,
          seg_scr_coords = [],
          i = 0,
          j,
          segs,
//          s,
//          e,
          seg,
          str, si, p, color, clr, c, 
         bg_lines = raphael.set(), 
         bg_points = raphael.set(), 
         fg_lines = {}, 
         fg_points = {}
          ;
        total_len = 0;
        if (!moving) {
            selected = [];
        }


        all_segments = [segments];
        if (curr_conf !== -1) {
            if (isArray(confs_[curr_conf][1])){
                all_segments.push(confs[curr_conf][1]);
            }else{
                all_segments = [confs[curr_conf][1]];
         }
        }
        bounding_box = [$V([100000000, 100000000, 100000000]), $V([-100000000, -100000000, -100000000])];
        proj_model_view_mtr = proj_mtr.x(model_view_mtr);
        for (i = 0; i !== all_segments.length; ++i) {
            segs = all_segments[i];
            for (j = 0; j !== segs.length; j++) {
                seg = segs[j];
                total_len += seg.len;
                c = { "z": 0,
                    "s": proj_model_view_mtr.x(seg.pts[0]).x(scale).add(_off),
                    "e": proj_model_view_mtr.x(seg.pts[1]).x(scale).add(_off),
                    "sindex": [i, j]
                };
                c.z = min(c.s.e(3), c.e.e(3));
                seg_scr_coords.push(c);
                bounding_box[0] = vmin(vmin(bounding_box[0], c.s), c.e);
                bounding_box[1] = vmax(vmax(bounding_box[1], c.s), c.e);
            }
        }
        if (!moving){
            seg_scr_coords.sort(sortFunc);
      }
        if (!moving && !ie && line_width < 11) {
            geometry_set.push(bg_lines);
            geometry_set.push(bg_points);
            for (i = 0; i !== seg_scr_coords.length; ++i) {
                seg = seg_scr_coords[i];
                str = "M" + seg.s.e(1) + " " + seg.s.e(2) + "L" + seg.e.e(1) + " " + seg.e.e(2);
                si = seg.sindex;
                p = raphael.path(str);
                bg_lines.push(p);
                segs = all_segments[si[0]];
                j = si[1];

                p.value = segs[j].names[unit_names][0];
                p.x = (seg.s.e(1) + seg.e.e(1)) / 2;
                p.y = (seg.s.e(2) + seg.e.e(2)) / 2;
                p.si = si;
                p.hover(popup, popdown);
                p.click(segclick);
                c = raphael.circle(seg.s.e(1), seg.s.e(2), 7);
                bg_points.push(c);
                c.value = segs[j].names[unit_names][1];
                c.x = seg.s.e(1);
                c.y = seg.s.e(2);
                c.si = si;
                c.hover(popup, popdown);
                c.click(startclick);
                c = raphael.circle(seg.e.e(1), seg.e.e(2), 7);
                bg_points.push(c);
                c.value = segs[j].names[unit_names][2];
                c.x = seg.e.e(1);
                c.y = seg.e.e(2);
                c.si = si;
                c.hover(popup, popdown);
                c.click(endclick);
            }
            bg_lines.attr({ stroke: bgcolor, "stroke-width": 11, "fill-opacity": 0.0, "stroke-opacity": 0.0 });
            bg_points.attr({ stroke: bgcolor, fill: bgcolor, "fill-opacity": 0.0, "stroke-opacity": 0.0 });
        }
        drawAxis();
        if (moving) {
            seg = proj_model_view_mtr.x(_org).x(scale).add(_off);
            geometry_set.push(raphael.circle(seg.e(1), seg.e(2), 6).attr({ stroke: "#f0f", fill: "#f0f" }));
        }
        for (i = 0; i !== seg_scr_coords.length; ++i) {
            seg = seg_scr_coords[i];
            str = "M" + seg.s.e(1) + " " + seg.s.e(2) + "L" + seg.e.e(1) + " " + seg.e.e(2);
            si = seg.sindex;
            j = si[1];
            segs = all_segments[si[0]];
            color = segs[j].color;
            clr = (segs[j].selected ? "#f0f" : color);
            p = raphael.path(str);
            if (!(clr in fg_lines)) {
                fg_lines[clr] = raphael.set();
                geometry_set.push(fg_lines[clr]);
            }
            fg_lines[clr].push(p);

            if (!moving) {
                p.value = segs[j].names[unit_names][0];
                p.x = (seg.s.e(1) + seg.e.e(1)) / 2;
                p.y = (seg.s.e(2) + seg.e.e(2)) / 2;
                p.si = si;
                if (segs[j].selected) {
                    selected.push([si[0], j, 0]);
                }
                p.hover(popup, popdown);
                p.click(segclick);
                clr = (segs[j].sselected ? "#f0f" : color);
                c = raphael.circle(seg.s.e(1), seg.s.e(2), point_size);
                if (!(clr in fg_points)) {
                    fg_points[clr] = raphael.set();
                    geometry_set.push(fg_points[clr]);
                }
                fg_points[clr].push(c);
                c.value = segs[j].names[unit_names][1];
                c.x = seg.s.e(1);
                c.y = seg.s.e(2);
                c.si = si;
                if (segs[j].sselected) {
                    selected.push([si[0], j, 1]);
                }
                c.hover(popup, popdown);
                c.click(startclick);
                clr = (segs[j].eselected ? "#f0f" : color);
                c = raphael.circle(seg.e.e(1), seg.e.e(2), point_size);
                if (!(clr in fg_points)) {
                    fg_points[clr] = raphael.set();
                    geometry_set.push(fg_points[clr]);
                }
                fg_points[clr].push(c);
                c.value = segs[j].names[unit_names][2];
                c.x = seg.e.e(1);
                c.y = seg.e.e(2);
                c.si = si;
                if (segs[j].eselected) {
                    selected.push([si[0], j, 2]);
                }
                c.hover(popup, popdown);
                c.click(endclick);
            }
        }
        for (j in fg_lines){
            fg_lines[j].attr({ stroke: j, "stroke-width": line_width });
      }
        for (j in fg_points){
            fg_points[j].attr({ stroke: j, fill: j });
      }

        //        drawInformation(selected, total_len);
        //        drawHelpLink();
        //        drawConfigurations();
    };

    this.redraw();
    this.fit = function() { fit(); };
    drawInformation();
}, 
gainChart = function(holder, w, h, channels, gain, swr, gainmin, gainmax, swrmax, title) {
    var r = Raphael(holder, w + 40, h + 40 + 10 * Math.max(gain.length, swr.length)),
       tags = r.set(),
       i, //j,
       legend, color, altcolor, data, chartopts, gain_chart, swr_chart,
       color_rect, 
      grayc = "#ccc", 
      black = "#000", 
      hoverIn = function() {
           if (tags) { tags.remove(); }
           tags.push(r.g.popup(this.x, this.y, this.value, null, 3));
       }, 
      hoverOut = function() {
            if (tags) { tags.remove(); }
        }, 
      chartOnOff = function() {
            if (this.hidden) {
                this.hidden = 0;
                this.text.attr({ fill: black });
                this.chart.lines.show();
                this.chart.symbols.show();
                this.chart.dots.show();
            } else {
                this.hidden = 1;
                this.text.attr({ fill: grayc });
                this.chart.lines.hide();
                this.chart.symbols.hide();
                this.chart.dots.hide();
            }
        };

    if (title) { r.text(w / 2, 10, title).attr(fontSize(14)); }
    r.g.txtattr.font = "10px 'Fontin Sans', Fontin-Sans, sans-serif";


    for (i = gain.length; i !== 0; ) {
        --i;
        legend = gain[i][0];
        color = gain[i][1];
        altcolor = i<swr.length?swr[i][1]:grayc;
        data = gain[i].slice(2);
        if (!data.length) { continue; }
        if (i) {
            chartopts = { gutter: 10, nostroke: false, axis: "0 0 0 0", symbol: "o", smooth: true, axisystep: (gainmax - gainmin), axisxstep: channels.length - 1, axisymin: gainmin, axisymax: gainmax, dash: "" };
        } else {
            chartopts = { gutter: 10, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true, axisystep: (gainmax - gainmin), axisxstep: channels.length - 1, axisymin: gainmin, axisymax: gainmax, grid: "5 2", dash: "" };
        }
        if (data.length > channels.length) { data = data.slice(0, channels.length); }
        gain_chart = r.g.linechart(20, 20, w, h, [channels], [data], chartopts).hover(hoverIn, hoverOut);
        gain_chart.symbols.attr({ r: 2 });
        gain_chart.lines.attr({ stroke: color });
        gain_chart.symbols.attr({ stroke: color });
        gain_chart.symbols.attr({ fill: color });
        gain_chart.grid.attr({ "stroke-width": 0.25 });
        color_rect = r.rect(20, h + 31 + 10 * i, 20, 8).attr({ stroke: "none", fill: color });
        color_rect.chart = gain_chart;
        color_rect.hidden = 0;
        color_rect.color = color;
        color_rect.altcolor = altcolor;
        color_rect.mouseover(function() { this.attr({ fill: this.altcolor }); this.text.attr(fontWeight("bold")); });
        color_rect.mouseout(function() { this.attr({ fill: this.color }); this.text.attr(fontWeight("normal")); });
        color_rect.text = r.text(44, h + 35 + 10 * i, legend).attr({ "text-anchor": "start" });
        color_rect.text.rect = color_rect;
        color_rect.text.mouseover(function() { this.rect.attr({ fill: this.rect.altcolor }); this.attr(fontWeight("bold")); });
        color_rect.text.mouseout(function() { this.rect.attr({ fill: this.rect.color }); this.attr(fontWeight("normal")); });
        color_rect.text.text = color_rect.text;
        color_rect.text.chart = color_rect.chart;
        color_rect.click(chartOnOff);
        color_rect.text.click(chartOnOff);
    }
    for (i = swr.length; i !== 0; ) {
        --i;
        legend = swr[i][0];
        color = swr[i][1];
        altcolor = i<gain.length?gain[i][1]:black;
        data = swr[i].slice(2);
        if (!data.length) { continue; }
        if (i) {
            chartopts = { gutter: 10, nostroke: false, axis: "0 0 0 0", symbol: "o", smooth: true, axisystep: (swrmax - 1) * 2, axisxstep: channels.length - 1, axisymin: 1, axisymax: swrmax, dash: "" };
        } else {
            chartopts = { gutter: 10, nostroke: false, axis: "0 1 0 0", symbol: "o", smooth: true, axisystep: (swrmax - 1) * 2, axisxstep: channels.length - 1, axisymin: 1, axisymax: swrmax, grid: "0 1", dash: "" };
        }
        if (data.length > channels.length) { data = data.slice(0, channels.length); }
        swr_chart = r.g.linechart(20, 20, w, h, [channels], [data], chartopts).hover(hoverIn, hoverOut);
        swr_chart.symbols.attr({ r: 2 });
        swr_chart.lines.attr({ stroke: color });
        swr_chart.symbols.attr({ stroke: color });
        swr_chart.symbols.attr({ fill: color });
        swr_chart.axis.attr({ stroke: "#f00" });
        swr_chart.grid.attr({ stroke: "#f00" });
        swr_chart.grid.attr({ "stroke-width": 0.25 });
        color_rect = r.rect(w, h + 31 + 10 * i, 20, 8).attr({ stroke: "none", fill: color });
        color_rect.chart = swr_chart;
        color_rect.hidden = 0;
        color_rect.color = color;
        color_rect.altcolor = altcolor;
        color_rect.mouseover(function() { this.attr({ fill: this.altcolor }); this.text.attr(fontWeight("bold")); });
        color_rect.mouseout(function() { this.attr({ fill: this.color }); this.text.attr(fontWeight("normal")); });
        color_rect.text = r.text(w - 4, h + 35 + 10 * i, legend).attr({ "text-anchor": "end", fill: "#000" });
        color_rect.text.rect = color_rect;
        color_rect.text.mouseover(function() { this.rect.attr({ fill: this.rect.altcolor }); this.attr(fontWeight("bold")); });
        color_rect.text.mouseout(function() { this.rect.attr({ fill: this.rect.color }); this.attr(fontWeight("normal")); });
        color_rect.click(chartOnOff);
        color_rect.text.text = color_rect.text;
        color_rect.text.chart = color_rect.chart;
        color_rect.text.click(chartOnOff);
    }
}, 
uhf_channels = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52], 
uhf_hi_channels = uhf_channels.concat([53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]), 
vhf_hi_channels = [7, 8, 9, 10, 11, 12, 13, 14], 
uhfChart = function(holder, w, h, gain, swr, gainmin, gainmax, swrmax, title) {
    return gainChart(holder, w, h, uhf_channels, gain, swr, gainmin, gainmax, swrmax, title);
},
uhfHiChart = function(holder, w, h, gain, swr, gainmin, gainmax, swrmax, title) {
    return gainChart(holder, w, h, uhf_hi_channels, gain, swr, gainmin, gainmax, swrmax, title);
},
vhfHiChart = function(holder, w, h, gain, swr, gainmin, gainmax, swrmax, title) {
    return gainChart(holder, w, h, vhf_hi_channels, gain, swr, gainmin, gainmax, swrmax, title);
},
gainSwrChart = function(holder, w, h, channels, gain, swr, gainmin, gainmax, swrmax, title) {
    gainChart(holder, w - 40, h - 40 - 10 * Math.max(gain.length, swr.length), channels, gain, swr, gainmin, gainmax, swrmax, title);
}, 

AntennaHPattern = function(holder, size, channels, models, sym, model_names, colors, font_size) {
   font_size = font_size || Math.max(9,Math.round(size/50));
    size = Math.max(100, size - (models.length>1?2*font_size+4:0));
    this.x = size / 2;
    this.y = this.x + (models.length>1?2*font_size+4:0) ;
    sym = sym?1:0;

    var that = this, 
      raphael = Raphael(holder, size, size), 
      maxarr = [], 
      i = 0, j, 
      maxmax, minmax, 
      chartrad = Math.round(size / 2 - 4*font_size ), 
      negative_portion, 
      circles = [], radii = [chartrad], 
      positive_portion, 
      model_paths = [], 
      shown = [], 
      current = 0, 
      astep = 360 / ((models[0][0].length - sym) * (sym + 1)), 
      tags = raphael.set(), 
      ratio, 
//      min = Math.min, 
      max = Math.max;

    for (; i != models.length; ++i) {
        shown.push(1);
        for (j = 0; j != models[i].length; ++j) {
            maxarr.push(models[i][j].maxValue());
      }
    }
    minmax = max(Math.round(maxarr.minValue() - 3.5), 0);
    maxmax = Math.round(maxarr.maxValue() + 0.5);
    while (maxmax >= minmax) {
        circles.push(maxmax);
        maxmax -= 3;
    }
    if (maxmax > 0 && maxmax <= 2) {
        circles.push(0);
    } else if (maxmax > 0 && maxmax <= 5) {
        circles.push(maxmax);
        circles.push(0);
    } else if (maxmax > 0) {
        ratio = Math.round(maxmax / 5.0);
        ratio = Math.round(maxmax / ratio - 0.5);
        while (maxmax >= ratio) {
            circles.push(maxmax);
            maxmax -= ratio;
        }
        circles.push(0);
    } else { //maxmax <=0
        if (circles.length > 2) {
            circles.pop();
        }
        circles.push(0);
    }
    circles.push(-5);
    circles.push(-10);
    circles.push(-20);
    circles.push(-50);
    circles.push(-1000);

    if (circles[0] <= 12){
        negative_portion = 0.5;
   }else{
        negative_portion = 0.5 * 12.0 / circles[0];
   }
    positive_portion = 1 - negative_portion;
    for (i = 1; circles[i] > 0; ++i){
        radii.push(Math.round((negative_portion + positive_portion * circles[i] / circles[0]) * radii[0]));
   }
    radii.push(Math.round(negative_portion * radii[0]));
    radii.push(Math.round(negative_portion * 0.75 * radii[0]));
    radii.push(Math.round(negative_portion * 0.5 * radii[0]));
    radii.push(Math.round(negative_portion * 0.25 * radii[0]));
    radii.push(Math.round(negative_portion * 0.125 * radii[0]));
    radii.push(0);

    var 
   radiusOf = function(gain) {
       var i = 1;
       if (gain < -1000){
           return 0;
      }
       for (; i < circles.length; ++i)
       { 
         if (gain > circles[i]){ break; }
      }
       return (radii[i - 1] - radii[i]) * (gain - circles[i]) / (circles[i - 1] - circles[i]) + radii[i];
   },
   popup = function() {
       tags.remove();
       tags.push(raphael.g.popup(this.x, this.y, this.value, null, 3));
   },
   popdown = function() {
       tags.remove();
   },
   drawChart = function(mno) {
       var p = models[mno][current],
          i = 0,
          path = "",
          a = 0,
          r = 0,
          res,//g = p[0],
          rad,
          circle,
          x, y,
          pattern = raphael.set(),
          first_circle,
          clr = colors[mno][0],
         addSegment = function(start) {
            rad = radiusOf(p[i]);
            r = radians(a);
            x = that.x + Math.cos(r) * rad;
            y = that.y - Math.sin(r) * rad;
            path += start + Math.round(x * 100) / 100 + " " + Math.round(y * 100) / 100;
            circle = raphael.circle(x, y, 2).attr({ stroke: clr, fill: clr });
            circle.value = a + " dg\n" + p[i];
            circle.x = x;
            circle.y = y;
            circle.hover(popup, popdown);
            a += astep;
            pattern.push(circle);
         };

       addSegment("M");
       first_circle = circle;
       for (i = 1; i < p.length; ++i) {
           addSegment("L");
       }
       if (sym){
           for (i = p.length - 2; i > 0; --i) {
            addSegment("L");
         }
       }
       path += "Z";
       res = raphael.path(path);
       res.attr({ stroke: clr }).insertBefore(first_circle);
       pattern.push(res);
       return pattern;

   },
   nextPattern = function() {
       current += this.step;
       if (current >= channels.length - 1){
           current = channels.length - 1;
      }
       that.draw();
   },
   prevPattern = function() {
       current -= this.step;
       if (current < 0){
           current = 0;
      }
       that.draw();
   },
   showHideModel = function() {
       var mno = this.mno;
       if (shown[mno]) {
           model_paths[mno].hide();
           shown[mno] = 0;
       } else {
           model_paths[mno].show();
           shown[mno] = 1;
       }
       that.draw();
   },
   drawChartBG = function() {
       var i = 0, r = radii, f = r.length - 5, cos, sin, a, p = models[0][current], 
      fg = "#000", bg = "#888", hfg = "#888", hbg = "#ccc", btn, white = "#fff", 
      normal = "normal", bold = "bolder",x,y, text_offset = font_size/2+2,
      onBtnOver = function() {
         var m = this.mno, _t = this;
         _t.text.attr(fontWeight(bold));
         if (shown[m]) {
            _t.attr({ fill: hfg });
         }
         else {
            _t.attr({ fill: hbg });
         }
      }, 
      onBtnOut = function() {
         var m = this.mno, _t = this;
         _t.text.attr(fontWeight(normal));
         if (shown[m]) {
            _t.attr({ fill: colors[m][1] });
         }
         else {
            _t.attr({ fill: white });
         }
      };
      
       if (models.length > 1) {
           for (i = 0; i != models.length; ++i) {
               p = models[i][current];
               btn = raphael.rect(i * size / models.length, 2, size / models.length, font_size+2).attr({ stroke: "none" });
               btn.click(showHideModel);
               btn.mno = i;
               if (shown[i]) { btn.attr({ fill: colors[i][1] }); }
               else { btn.attr({ fill: white }); }
               btn.text = raphael.text((i + 0.5) * size / models.length, text_offset, model_names[i]).attr(fontSize(font_size));
               btn.text.mno = i;
               btn.text.click(showHideModel);
               btn.text.btn = btn;
               btn.text.mouseover(function() { this.btn.onBtnOver(); });
               btn.text.mouseout(function() { this.btn.onBtnOut(); });
               btn.mouseover(onBtnOver);
               btn.mouseout(onBtnOut);
               btn.onBtnOver = onBtnOver;
               btn.onBtnOut = onBtnOut;
               raphael.text((i + 0.5) * size / models.length, text_offset+font_size+2, sym ? ("F: " + p[0] + "dBi, B: " + p[p.length - 1] + "dBi") : ("F: " + p[0] + "dBi, B: " + p[Math.round(p.length / 2 - 0.5)] + "dBi")).attr(fontSize(font_size));
               raphael.text((i + 0.5) * size / models.length, text_offset+2*font_size+4, p.minValue() + " < dBi < " + p.maxValue()).attr(fontSize(font_size));
           }
           raphael.text(8, text_offset+3*font_size+6, channels[current]).attr({ "text-anchor": "start" }).attr(fontSize(font_size));
       } else {
         raphael.text(size/2, text_offset, model_names[0]).attr(fontSize(font_size)).attr(fontSize(font_size));
           raphael.text(10, size - text_offset - font_size, p.minValue() + " < dBi < " + p.maxValue()).attr({ "text-anchor": "start" }).attr(fontSize(font_size));
           raphael.text(0, size - text_offset, sym ? ("F: " + p[0] + "dBi, B: " + p[p.length - 1] + "dBi") : ("F: " + p[0] + "dBi, B: " + p[Math.round(p.length / 2 - 0.5)] + "dBi")).attr({ "text-anchor": "start", "font-size": 9 }).attr(fontSize(font_size));
           raphael.text(8, text_offset, channels[current]).attr({ "text-anchor": "start" }).attr(fontSize(font_size));
       }
       for (i = 0; i != r.length - 1; ++i) {
           raphael.circle(that.x, that.y, r[i]).attr({ stroke: "#000", fill: "none" });
           raphael.text(that.x - 10, that.y - r[i] + font_size/2, circles[i]).attr(fontSize(font_size));
       }
       for (i = 0; i != 360; i += 5) {
           a = radians(i);
           cos = Math.cos(a);
           sin = Math.sin(a);
           if (i % 15) {
               r_line(raphael, that.x + cos * r[f], that.y + sin * r[f], that.x + cos * r[0], that.y + sin * r[0]).attr({ stroke: hfg });
           } else {
               if (i % 90) {
                   r_line(raphael, that.x + cos * r[f + 1], that.y + sin * r[f + 1], that.x + cos * r[0], that.y + sin * r[0]).attr({ stroke: fg });
               }
               else {
                   r_line(raphael, that.x, that.y, that.x + cos * r[0], that.y + sin * r[0]).attr({ stroke: fg });
               }

               raphael.text(that.x + cos * (r[0] + font_size), that.y - sin * (r[0] + font_size), i).attr(fontSize(font_size));
           }
       }
       x = size - 5*font_size-5;
       y = size - 1.5*font_size;

       var putButton = function(x, size, text, callback, step) {
           var 
            r = raphael.rect(x, y, size, font_size+5), 
            t = raphael.text(x + size / 2, y + font_size/2+2, text).attr(fontSize(font_size));

           r.attr({ fill: bg, stroke: "none" });
           r.click(callback);
           r.step = step;
           r.mouseover(function() { this.attr({ fill: hbg }); this.txt.attr(fontWeight("bold")); });
           r.mouseout(function() { this.attr({ fill: bg }); this.txt.attr(fontWeight("normal")); });
           r.txt = t;

           t.attr({ fill: fg, stroke: fg });
           t.click(callback);
           t.step = step;
           t.mouseover(function() { this.rect.attr({ fill: hbg }); this.attr(fontWeight("bold")); });
           t.mouseout(function() { this.rect.attr({ fill: bg }); this.attr(fontWeight("normal")); });
           t.rect = r;
       };
       putButton(x - 1.5*font_size-2, 1.5*font_size, "<", prevPattern, 1, bg);
       putButton(x, 1.5*font_size, ">", nextPattern, 1);
       putButton(x - 3.5*font_size-4, 2*font_size, "<<", prevPattern, 5);
       putButton(x + 1.5*font_size+2, 2*font_size, ">>", nextPattern, 5);
       putButton(x - 5*font_size-6, 1.5*font_size, "|<", prevPattern, channels.length);
       putButton(x + 3.5*font_size+4, 1.5*font_size, ">|", nextPattern, channels.length);
   },
   drawPaths = function() {
       var i = 0;
       for (; i != models.length; ++i) {
           model_paths[i] = drawChart(i);
           if (!shown[i]){
               model_paths[i].hide();
         }
       }

   };
    that.draw = function() {
        raphael.clear();
        drawChartBG();
        drawPaths();
    };
}, 

vhfHiFreqTitles = function() {
    var i = 0, res = [];
    for (; i != 8; ++i) {
        res.push((174 + i * 6) + " Mhz");
   }
    return res;
}, 

uhfFreqTitles = function() {
    var i = 0, res = [];
    for (; i != 39; ++i) {
        res.push((470 + i * 6) + " Mhz");
   }
    return res;
}, 

uhfHiFreqTitles = function() {
    var i = 0, res = [];
    for (; i != 57; ++i) {
        res.push((470 + i * 6) + " Mhz");
   }
    return res;
}, 

configureModelPatternTabs = function() {
    var _show_pattern = $("#show_pattern"),
   _show_model = $("#show_model"),
   _pattern = $("#pattern"),
   _model = $("#model"),
   selected = "selected",
   ph,

   onTabClick = function() {
       if ($(this).hasClass(selected)) { return; }
       _show_pattern.toggleClass(selected);
       _show_model.toggleClass(selected);
       if (_show_pattern.hasClass(selected)) {
           _pattern.show();
           _model.hide();
           if (_pattern.html() == "Loading...") {
               ph = _model.html();
               ph = ph.replace("_r.html", "_h.html");
               _pattern.html(ph);
           }
       } else {
           _model.show();
           _pattern.hide();
       }
   };

    _show_pattern.click(onTabClick);
    _show_model.click(onTabClick);
    _pattern.hide();
}, 

configureModelPatternTabsNoJQ = function() {

    var d = document, _show_pattern = d.getElementById("show_pattern"),
   _show_model = d.getElementById("show_model"),
   _pattern = d.getElementById("pattern"),
   _model = d.getElementById("model"),
   selected = "selected",
   ph,

   onTabClick = function() {
       if (this.className == selected) { return; }
       if (_show_pattern.className == selected) {
         _show_pattern.className="";
      }else{
         _show_pattern.className=selected;
      }
       if (_show_model.className == selected) {
         _show_model.className="";
      }else{
         _show_model.className=selected;
      }
       if (_show_pattern.className == selected){
           _pattern.style.display="block";
           _model.style.display="none";
           if (_pattern.innerHTML == "Loading...") {
               ph = _model.innerHTML;
               ph = ph.replace("_r.html", "_h.html");
               _pattern.innerHTML = ph;
           }
       } else {
           _pattern.style.display="none";
           _model.style.display="block";
       }
   };

    _show_pattern.onclick = onTabClick;
    _show_model.onclick = onTabClick;
    _pattern.style.display="none";
}, 

configureTabs = function(list_id) {
    var links = $(list_id + " a"),
       tab_divs = [],
       tab_urls = [],
       tab_btns = [],
       current = -1,
   selected = "selected",

   onTabClick = function() {
       var i = 0;
       if ($(this).hasClass(selected)) {return; }
       $(this).toggleClass(selected);
       if (current !== -1) {
           tab_divs[current].hide();
           tab_btns[current].toggleClass(selected);
       }
       for (; i != tab_btns.length; ++i) {
           if (tab_btns[i].hasClass(selected)) {
               current = i;
               tab_divs[current].show();
               if (tab_divs[i].html() == "Loading...") {
                   tab_divs[i].html(tab_urls[i]);
            }
           }
       }
   };

    links.each(function() {
        var link = $(this),
         href = link.attr("href");
        link.removeAttr("href");
        if (href.charAt(0) == "#") {
            if (tab_btns.length) { $(href).hide(); }
            tab_divs.push($(href));
        } else {
            link.attr("title", "");
            tab_divs.push($(title));
            tab_urls.push("<object data='" + href + "' style='width:100%; height:100%'></object>");
            $(title).html("Loading...");
            if (tab_btns.length) { $(title).hide(); }
        }
        tab_btns.push(link);
        link.click(onTabClick);
        link.removeClass(selected);
    });
    if (tab_btns.length) { 
        tab_btns[0].click();
   }
};
