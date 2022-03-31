/**
 * Blah Blah,
 *
 * Tabs to accordion
 */
define([
    'jquery',
    'Magento_PageBuilder/js/events',
    'jquery/ui'
], function ($, events) {
    'use strict';

    return function (config, element) {
        var $element = $(element),
            TAB_TO_ACCORDION_BREAKPOINT = 992;

        /* jshint ignore:start */
        /* eslint-disable */
        $.fn.tabsOrAccordion = function(mediaQueryEvent, tabSettings, accordionSettings) {
            return this.each(function() {
                function switchTabsToAccordion(_mediaQueryEvent) {
                    var $tabsContent;
                    if (_mediaQueryEvent.matches) {
                        $tabsContent =  $targetElement.find('.tabs-content');
                        if ($tabsContent.is('.ui-accordion')) {
                            _tabSettings.active = $tabsContent.data('ui-accordion').options.active;
                            $tabsContent.data('ui-accordion').destroy();
                            $tabsContent
                                .children('.tab-title')
                                .remove();
                            $ul.clone().prependTo($targetElement);

                            $.ui.tabs(_tabSettings, $targetElement);
                        }
                    } else {
                        $tabsContent =  $targetElement.find('.tabs-content');
                        if ($targetElement.is('.ui-tabs')) {
                            _accordionSettings.active = $targetElement.data('ui-tabs').options.active;
                            $targetElement.data('ui-tabs').destroy();
                            $targetElement
                                .children('ul')
                                .remove();
                            $tabsContent.children().each(function(idx) {
                                $('<div />', {
                                    class: 'tab-title',
                                    text : $ul.children().eq(idx).text()
                                }).insertBefore(this);
                            });

                            $.ui.accordion(_accordionSettings, $tabsContent);
                        }
                    }
                }

                var _accordionSettings = $.extend({}, accordionSettings),
                    _tabSettings = $.extend({}, tabSettings),
                    $ul = $(this).children('ul').clone(),
                    $targetElement = $(this);

                $.ui.tabs(_tabSettings, this);

                if ('matchMedia' in window) {
                    var mQuery = matchMedia(mediaQueryEvent);
                    mQuery.addListener(switchTabsToAccordion),
                        switchTabsToAccordion(mQuery);
                }
            })
        };
        /* eslint-enable */
        /* jshint ignore:end */

        /**
         * Add jQuery UI Tabs to element
         */
        function addTabsToAccordion() {
            $element.tabsOrAccordion(
                '(min-width: ' + TAB_TO_ACCORDION_BREAKPOINT + 'px)',
                {
                    active: $element.data('activeTab') || 0,
                    create:

                        /**
                         * Adjust the margin bottom of the navigation to correctly display the active tab
                         */
                        function () {
                            var borderWidth = parseInt($element.find('.tabs-content').css('borderWidth').toString(), 10);

                            $element.find('.tabs-navigation').css('marginBottom', -borderWidth);
                            $element.find('.tabs-navigation li:not(:first-child)').css('marginLeft', -borderWidth);
                        },
                    activate:

                        /**
                         * Trigger redraw event since new content is being displayed
                         */
                        function () {
                            events.trigger('contentType:redrawAfter', {
                                element: element
                            });
                        }
                },  // Tab Options
                {  // Accordion Options
                    heightStyle: 'content',
                    collapsible: true
                });
        }

        // If its Admin view, Donot add Tabs
        // Ignore stage builder preview tabs
        if ($element.is('.pagebuilder-tabs')) {
            return;
        }

        addTabsToAccordion();
    };
});
