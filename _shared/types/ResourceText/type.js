/**
 * @module Shared
 */


/**
 * I am the type definition of a ResourceText.
 * 
 * * Text Resources only appear in the 'Add Custom Overlay' tab
 *   and are not listed in the ResourceManager.
 * 
 * * Text Resources can not be used as Annotation
 *
 * @class ResourceText
 * @category TypeDefinition
 * @extends Resource
 */



FrameTrail.defineType(

    'ResourceText',
    'Resource',

    function(resourceData){

        this.resourceData = resourceData;



    },

    {
        /**
         * I hold the data object of a custom ResourceText, which is not stored in the Database and doesn't appear in the resource's _index.json.
         * @attribute resourceData
         * @type {}
         */
        resourceData:   {},


        /**
         * I render the content of myself, which is a &lt;div&gt; containing a custom text wrapped in a &lt;div class="resourceDetail" ...&gt;
         *
         * @method renderContent
         * @return HTMLElement
         */
        renderContent: function() {

            var self = this;

            var resourceDetail = $('<div class="resourceDetail" data-type="'+ this.resourceData.type +'" style="width: 100%; height: 100%;"></div>'),
                unescapeHelper = document.createElement('div'),
                child,
                unescapedString;
            
            // unescape string from json 
            unescapeHelper.innerHTML = self.resourceData.attributes.text;
            child = unescapeHelper.childNodes[0];
            unescapedString = child ? child.nodeValue : '';

            resourceDetail.html(unescapedString);

        	return resourceDetail;

        }, 

        /**
         * Several modules need me to render a thumb of myself.
         *
         * These thumbs have a special structure of HTMLElements, where several data-attributes carry the information needed.
         * 
         * @method renderThumb
         * @return thumbElement
         */
        renderThumb: function() {

            var self = this;

            var thumbElement = $('<div class="resourceThumb" data-type="'+ this.resourceData.type +'">'
                + '                  <div class="resourceOverlay">'
                + '                      <div class="resourceIcon"><span class="icon-doc-text"></span></div>'
                + '                  </div>'
                + '                  <div class="resourceTitle">Custom Text</div>'
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

            var basicControls = this.renderBasicPropertiesControls(overlay);

            /* Add Video Type  Controls */

            var textLabel = $('<div>Custom HTML:</div>'),
                textarea = $('<textarea>' + overlay.data.attributes.text + '</textarea>');

            basicControls.controlsContainer.find('#OverlayOptions').append(textLabel, textarea);

            // Init CodeMirror for Custom HTML

            var htmlCodeEditor = CodeMirror.fromTextArea(textarea[0], {
                    value: textarea[0].value,
                    lineNumbers: true,
                    mode:  'text/html',
                    htmlMode: true,
                    lint: true,
                    lineWrapping: true,
                    tabSize: 2,
                    theme: 'hopscotch'
                });
            htmlCodeEditor.on('change', function(instance, changeObj) {
                
                var thisTextarea = $(instance.getTextArea());
                
                thisTextarea.val(instance.getValue());

                var escapeHelper = document.createElement('div'),
                    escapedHtml;

                // save escaped html string
                escapeHelper.appendChild(document.createTextNode(instance.getValue()));
                escapedHtml = escapeHelper.innerHTML;
                overlay.data.attributes.text = escapedHtml;

                overlay.overlayElement.children('.resourceDetail').html(instance.getValue());

                FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');
                

            });
            htmlCodeEditor.setSize(null, 140);

            return basicControls;

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
