/*!
 * jQuery Collision Detection - v1.0 - 1/7/2014
 * http://www.hnldesign.nl/work/code/collision-prev…n-using-jquery/
 *
 * Copyright (c) 2014 HN Leussink
 * Dual licensed under the MIT and GPL licenses.
 *
 * Example: http://code.hnldesign.nl/demo/hnl.collision.detection.html
 * 
 * FrameTrail: Added option includeVerticalMargins
 */
(function ($, document, window) {
    "use strict";
    function CollisionDetection(el, opts) {
        this.container =    $(el);
        this.colliders =    this.container.children().removeData('level');
        this.defaults = {
            levelMemory : { level: [], levelObjects : [] },
            spacing : 1,
            includeVerticalMargins: false
        };
        this.opts       =   $.extend(this.defaults, opts);
        this.init();
    }
    CollisionDetection.prototype.init = function () {
        var o = this.opts, t = this;
        t.process(t.colliders);
    };
    CollisionDetection.prototype.sort = function (els) {
        var o = this.opts, t = this, x = els.sort(function (a, b) {
            //sort elements by left positioning
            var a_left = $(a).position().left, b_left = $(b).position().left, ret;
            if (a_left < b_left) {
                ret = -1;
            } else if (a_left > b_left) {
                ret = 1;
            } else {
                ret = 0;
            }
            return ret;
        }).detach();
        //reattach elements
        t.container.append(x);
    };
    CollisionDetection.prototype.leveler = function (els) {
        var o = this.opts, t = this;
        els.each(function (i) {
            var this_ele = $(this),
                next_ele = this_ele.next();
            var this_props = {
                'height'    : this_ele.outerHeight( (t.opts.includeVerticalMargins ? true : false) ),
                'left'      : this_ele.position().left,
                'width'     : this_ele.outerWidth(false)
            };
            var next_props = (next_ele.length > 0) ? {
                'height'    : next_ele.outerHeight( (t.opts.includeVerticalMargins ? true : false) ),
                'left'      : next_ele.position().left,
                'width'     : next_ele.outerWidth(false)
            } : null;
            var thisLevel = parseInt(this_ele.data('level'), 10),  newLevel;
            if (isNaN(thisLevel)) {
                thisLevel = 0;
                this_ele.data('level', thisLevel);
            }
            //store amount of pixels 'filled' in level
            o.levelMemory.level[thisLevel] = (this_props.left + this_props.width);
            //level the next element
            if (next_ele.length > 0) {
                if ((this_props.left + this_props.width) > next_props.left) {
                    $.each(o.levelMemory.level, function (level, filled) {
                        if (filled < next_props.left) {
                            newLevel = level;
                            return false; //break out of loop
                        }
                    });
                    if (newLevel === undefined) {
                        newLevel = o.levelMemory.level.length;
                    }
                }
                next_ele.data('level', newLevel);
            }
            //push element into the right level object
            if (!o.levelMemory.levelObjects[thisLevel]) { o.levelMemory.levelObjects[thisLevel] = []; }
            o.levelMemory.levelObjects[thisLevel].push(this_ele);
        });
    };
    CollisionDetection.prototype.setDimensions = function () {
        var o = this.opts, t = this, prevHeight = 0;
        //set each level to the correct css bottom value
        $(o.levelMemory.levelObjects).each(function (i) {
            prevHeight += o.spacing;
            var level = $(this).map(function () {return this.toArray(); }),
                thisHeight = Math.max.apply(null, $(this).map(function () { return $(this).outerHeight( (t.opts.includeVerticalMargins ? true : false) ); }));
            level.css('bottom', i === 0 ? 0 : prevHeight);
            prevHeight += thisHeight;
        });
        //set container to match height of elements inside
        t.container.css({
            height: prevHeight,
            'flex-basis': prevHeight
        });
    };
    CollisionDetection.prototype.process = function (els) {
        var o = this.opts, t = this;
        //sort elements based on their appearance (left css property)
        t.sort(els);
        //arrange elements into levels
        t.leveler(els);
        //set dimensions
        t.setDimensions();
    };
    $.fn.CollisionDetection = function (opts) {
        return this.each(function () {
            new CollisionDetection(this, opts);
        });
    };
})(jQuery, document, window);