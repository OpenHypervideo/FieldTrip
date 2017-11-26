/**
 * @module Shared
 */


/**
 * I am the type definition of a ResourceImage. I represent a resource file of an image.
 *
 * @class ResourceImage
 * @category TypeDefinition
 * @extends Resource
 */



FrameTrail.defineType(

    'ResourceImage',
    'Resource',

    function(resourceData){

        this.resourceData = resourceData;


    },

    {
        /**
         * I hold the data object of a ResourceImage, which is stored in the {{#crossLink "Database"}}Database{{/crossLink}} and saved in the resource's _index.json.
         * @attribute resourceData
         * @type {}
         */
        resourceData:   {},


        /**
         * I render the content of myself, which is a &lt;img&gt; wrapped in a &lt;div class="resourceDetail" ...&gt;
         *
         * @method renderContent
         * @return HTMLElement
         */
        renderContent: function() {

            var resourceElement = $(
                    '<div class="resourceDetail" data-type="'+ this.resourceData.type +'">'  
                +       '<img src="'+ FrameTrail.module('RouteNavigation').getResourceURL(this.resourceData.src) +'" title="'
                +       this.resourceData.name
                +       '">'
                +    '</div>'
            ).perfectScrollbar({
                wheelSpeed: 4,
                suppressScrollX: true
            });

            return resourceElement;

        }, 

        /**
         * Several modules need me to render a thumb of myself.
         *
         * These thumbs have a special structure of HTMLElements, where several data-attributes carry the information needed by e.g. the {{#crossLink "ResourceManager"}}ResourceManager{{/crossLink}}.
         *
         * The id parameter is optional. If it is not passed, the Database tries to find the resource object in its storage.
         *
         * @method renderThumb
         * @param {} id
         * @return thumbElement
         */
        renderThumb: function(id) {

            var trueID,
                self = this;

            if (!id) {
                trueID = FrameTrail.module('Database').getIdOfResource(self.resourceData);
            } else {
                trueID = id;
            }
                        
            var thumbUrl = (this.resourceData.thumb ? FrameTrail.module('RouteNavigation').getResourceURL(this.resourceData.thumb) 
                            : FrameTrail.module('RouteNavigation').getResourceURL(this.resourceData.src) );

            var thumbElement = $('<div class="resourceThumb" data-resourceID="'+ trueID +'" data-type="'+ this.resourceData.type +'" style="background-image:url('+ thumbUrl +');">'
                + '                  <div class="resourceOverlay">'
                + '                      <div class="resourceIcon"><span class="icon-picture"></span></div>'
                + '                  </div>'
                + '                  <div class="resourceTitle">'+ this.resourceData.name +'</div>'
                + '              </div>');

            var previewButton = $('<div class="resourcePreviewButton"><span class="icon-eye"></span></div>').click(function(evt) {
                // call the openPreview method (defined in abstract type: Resource)
                self.openPreview( $(this).parent() );
                evt.stopPropagation();
                evt.preventDefault();
            });
            thumbElement.append(previewButton);

            return thumbElement;


        },


        /**
         * See {{#crossLink "Resource/renderBasicPropertiesControls:method"}}Resource/renderBasicPropertiesControls(){{/crossLink}}
         * @method renderPropertiesControls
         * @param {Overlay} overlay
         * @return &#123; controlsContainer: HTMLElement, changeStart: Function, changeEnd: Function, changeDimensions: Function &#125;
         */
        renderPropertiesControls: function(overlay) {

            return this.renderBasicPropertiesControls(overlay);

        },


        /**
         * See {{#crossLink "Resource/renderBasicTimeControls:method"}}Resource/renderBasicTimeControls(){{/crossLink}}
         * @method renderTimeControls
         * @param {Annotation} annotation
         * @return &#123; controlsContainer: HTMLElement, changeStart: Function, changeEnd: Function &#125;
         */
        renderTimeControls: function(annotation) {

            return this.renderBasicTimeControls(annotation);

        }

        



    }

);
