/**
 * @module Player
 */


/**
 * I am the type definition of an Hypervideo (as an item in the overview mode).
 * __Do not confuse me__ with the data model of the current hypervideo stored
 * in {{#crossLink "HypervideoModel"}}HypervideoModel{{/crossLink}}!
 *
 * @class Hypervideo
 * @category TypeDefinition
 */


FrameTrail.defineType(

    'Hypervideo',

    function (FrameTrail) {
        return {
            constructor: function(data){

                this.data = data;

            },
            prototype: {

                /**
                 * I render a thumb for the hypervideo data in my this.data attribute.
                 *
                 * The jquery-enabled HTMLElement which I return contains all necessary meta information needed by
                 * e.g. the {{#crossLink "ViewOverview"}}ViewOverview{{/crossLink}}.
                 *
                 * @method renderThumb
                 * @return HTMLElement
                 */
                renderThumb: function() {

                    var hypervideoID    = FrameTrail.module('Database').getIdOfHypervideo(this.data),

                        href            =     '?hypervideo='
                                            + hypervideoID,

                        thumbBackground = (this.data.thumb ?
                            'background-image: url('+ FrameTrail.module('RouteNavigation').getResourceURL(this.data.thumb) +');' : '' );

                        thumbElement    =   $('<div class="hypervideoThumb" data-hypervideoID="'+ hypervideoID +'" data-name="'+ this.data.name +'" style="'+ thumbBackground +'">'
                                            + '    <div class="hypervideoThumbContent">'
                                            + '        <a href="'+ href +'" class="hypervideoIcon"><span class="icon-play-circled"></span></a>'
                                            + '    </div>'
                                            + '    <div class="hypervideoTitle">'+ this.data.name +'</div>'
                                            + '</div>');

                    return thumbElement;

                }


            }



        }
    }


);
