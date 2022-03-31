/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'matchMedia',
    'globalVars',
    'mage/gallery/gallery',
    'mage/tabs',
    'domReady!'
], function ($, mediaCheck, globalVars) {
    'use strict';

    mediaCheck({
        media: '(min-width: 768px)',

        /**
         * Switch to Desktop Version.
         */
        entry: function () {
            var galleryElement;

            (function () {
                var productInfoMain = $('.product-info-main'),
                    productInfoAdditional = $('#product-info-additional');

                if (productInfoAdditional.length) {
                    productInfoAdditional.addClass('hidden');
                    productInfoMain.removeClass('responsive');
                }
            })();

            galleryElement = $('[data-role=media-gallery]');

            if (galleryElement.length && galleryElement.data('mageZoom')) {
                galleryElement.zoom('enable');
            }

            if (galleryElement.length && galleryElement.data('mageGallery')) {
                galleryElement.gallery('option', 'disableLinks', true);
                galleryElement.gallery('option', 'showNav', false);
                galleryElement.gallery('option', 'showThumbs', true);
            }
        },

        /**
         * Switch to Mobile Version.
         */
        exit: function () {
            var galleryElement;

            $('.action.toggle.checkout.progress').on('click.gotoCheckoutProgress', function () {
                var myWrapper = '#checkout-progress-wrapper';

                scrollTo(myWrapper + ' .title');
                $(myWrapper + ' .title').addClass('active');
                $(myWrapper + ' .content').show();
            });

            $('body').on('click.checkoutProgress', '#checkout-progress-wrapper .title', function () {
                $(this).toggleClass('active');
                $('#checkout-progress-wrapper .content').toggle();
            });

            galleryElement = $('[data-role=media-gallery]');

            setTimeout(function () {
                if (galleryElement.length && galleryElement.data('mageZoom')) {
                    galleryElement.zoom('disable');
                }

                if (galleryElement.length && galleryElement.data('mageGallery')) {
                    galleryElement.gallery('option', 'disableLinks', false);
                    galleryElement.gallery('option', 'showNav', true);
                    galleryElement.gallery('option', 'showThumbs', false);
                }
            }, 2000);
        }
    });

    mediaCheck({
        media: '(max-width:' + (globalVars.tweakpointNavToggle - 0.02) + ')',

        /**
         * Switch to Mobile Version of Navigation.
         */
        entry: function () {
            (function () {
                var $pageHeader,
                    $compareProductsLink;

                if ($('.page-header > [data-role="compare-products-link"]').length <= 0) {
                    $pageHeader = $('.page-header');
                    $compareProductsLink = $('.header.links > [data-role="compare-products-link"]');
                    $compareProductsLink.first().wrap('<ul class="compare-products-wrapper"></ul>').parent().appendTo($pageHeader);
                }
            })();
        },

        /**
         * Switch to Desktop Version of Navigation..
         */
        exit: function () {
            var $headerLinks,
                $compareProductsLink;

            $compareProductsLink = $('.page-header > .compare-products-wrapper [data-role="compare-products-link"]');
            if ($compareProductsLink.length > 0) {
                $headerLinks = $('.header.links');
                $compareProductsLink.prependTo($headerLinks);
                $('.page-header > .compare-products-wrapper').remove();
            }
        }
    });

    $('[data-gallery-role=gallery-placeholder]').on('gallery:loaded', function () {
        setTimeout(function () {
            $('.fotorama__stage img[src*="/product/placeholder/"]')
                .attr('alt', $('.page-title [itemprop="name"]').text() + ' Awaiting Image');
        }, 1000);
    });
});
