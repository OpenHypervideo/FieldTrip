/**
 * @module Player
 */


/**
 * I am the type definition of a single Subtitle.
 *
 * Subtitles display in a separate layer on top of the video.
 *
 * Subtitles are managed by the {{#crossLink "SubtitlesController"}}SubtitlesController{{/crossLink}}.
 *
 * @class Subtitle
 * @category TypeDefinition
 */



FrameTrail.defineType(

    'Subtitle',

    function(data){

        this.data = data;

        this.subtitleElement = $('<div class="subtitleElement"></div>');

    },

    {
        /**
         * I hold the data object of a single Subtitle, which is stored in the {{#crossLink "Database"}}Database{{/crossLink}}.
         * @attribute data
         * @type {}
         */
        data:                   {},

        /**
         * I store my state, wether I am "active" (visible) or not active (invisible).
         * @attribute activeState
         * @type Boolean
         */
        activeState:            false,

        /**
         * I hold the subtitleElement (a jquery-enabled HTMLElement), which indicates my start and end time.
         * @attribute subtitleElement
         * @type HTMLElement
         */
        subtitleElement:        null,

        /**
         * I render my DOM elements ({{#crossLink "Overlay/timelineElement:attribute"}}Overlay/timelineElement{{/crossLink}}
         * and {{#crossLink "Overlay/overlayElement:attribute"}}Overlay/overlayElement{{/crossLink}}) into the DOM.
         *
         * I am called, when the Overlay is initialized. My counterpart ist {{#crossLink "Overlay/removeFromDOM:method"}}Overlay/removeFromDOM{{/crossLink}}.
         *
         * @method renderInDOM
         */
        renderInDOM: function () {

            
            var ViewVideo = FrameTrail.module('ViewVideo');

            ViewVideo.CaptionContainer.append(this.subtitleElement);

            this.subtitleElement.empty().append( this.data.text );

        },

        /**
         * I remove my DOM element ({{#crossLink "Subtitle/subtitleElement:attribute"}}Subtitle/subtitleElement{{/crossLink}} from the DOM.
         *
         * I am called when the single Subtitle is to be deleted.
         *
         * @method removeFromDOM
         */
        removeFromDOM: function () {

            this.subtitleElement.remove();

        },


        /**
         * When I am scheduled to be displayed, this is the method to be called.
         * @method setActive
         */
        setActive: function () {

            this.subtitleElement.addClass('active');
            this.activeState = true;

        },

        /**
         * When I am scheduled to disappear, this is the method to be called.
         * @method setInactive
         */
        setInactive: function () {

            this.subtitleElement.removeClass('active');
            this.activeState = false;

        }



    }

);
