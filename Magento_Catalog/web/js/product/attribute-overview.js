/**
 * Add Readmore link using JS to attribute overview text
 */
define([
    'jquery',
    'mage/template',
    'domReady!'
], function ($, mageTemplate) {
    'use strict';

    var addReadMoreLink,
        readMoreLinkTemplate;

    readMoreLinkTemplate = '<a href="<%- data.href %>" class="overview-readmore-link" ' +
        'title="<%- data.label %>"><%- data.label %></a>';

    addReadMoreLink = function (params, el) {
        var $el = $(el),
            $lastP,
            $readMoreLink;

        if ($el.length > 0) {
            if ($el.text().trim().length > 3 &&
                typeof params.href !== 'undefined' &&
                typeof params.label !== 'undefined' &&
                typeof params.clickTarget !== 'undefined') {
                $readMoreLink = $(mageTemplate(readMoreLinkTemplate, {
                    data: params
                }));

                $readMoreLink.on('click', function () {
                    $(params.clickTarget).trigger('click');
                });

                $lastP = $el.find('> *').last();
                if ($lastP.length > 0) {
                    $lastP.append($readMoreLink);
                } else {
                    $el.append($readMoreLink);
                }
            }
        }
    };

    return addReadMoreLink;
});
