/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'mage/smart-keyboard-handler',
    'picturefill',
    'scrolllock',
    'globalVars',
    'objectfit',
    'lazysizes',
    'mage/mage',
    'jquery/hover-intent',
    'mage/ie-class-fixer',
    'domReady!',
    'Magento_Ui/js/lib/view/utils/async'
], function ($, keyboardHandler, picturefill, bodyScrollLock, globalVars) {
    'use strict';
    // Set user-agent for iOS Safari
    var ua,
        iOS,
        webkit,
        iOSSafari,
        positionStickySupport,
        targetNodes,
        MutationObserver,
        $breadcrumbs,
        breadcrumbsObserver,
        interSectionObserver,
        myObserver,
        obsConfig;

    picturefill();
    window.objectFitImages(null, {watchMQ: true});

    ua = window.navigator.userAgent;
    iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    webkit = !!ua.match(/WebKit/i);
    iOSSafari = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/OPiOS/i) && !ua.match(/EdgiOS/i);
    if (iOSSafari) {
        $('html').addClass('ios-safari');
    }

    if ($('body').hasClass('checkout-cart-index')) {
        if ($('#co-shipping-method-form .fieldset.rates').length > 0 &&
            $('#co-shipping-method-form .fieldset.rates :checked').length === 0
        ) {
            $('#block-shipping').on('collapsiblecreate', function () {
                $('#block-shipping').collapsible('forceActivate');
            });
        }
    }

    positionStickySupport = (function () {
        var el = document.createElement('a'),
            mStyle = el.style;

        mStyle.cssText = 'position:sticky;position:-webkit-sticky;position:-ms-sticky;';
        return mStyle.position.indexOf('sticky') !== -1;
    }());

    if (!positionStickySupport) {
        $('.cart-summary').mage('sticky', {
            container: '#maincontent'
        });
    }
    var $headerLinks = $('.panel.header > .header.links').clone();

    $headerLinks.find('[id]').each(function () {
       var attrId =  $(this).attr('id');

        $(this).attr('id', attrId + '_store_links');
    });

    $headerLinks.appendTo('#store\\.links');

    $('[data-js-toggle]').on('click', function (e) {
        var $this = $(this),
            _dataTarget;

        _dataTarget = $this.find($this.data('js-toggle-target'));

        if ($this.parent().hasClass('footer') &&
            ($(e.target).parent().parent().hasClass('item') || $(e.target).parent().hasClass('item'))) {
            return;
        }

        if ($this.hasClass('nav') && $this.hasClass('heading') && $(window).width() >= globalVars.tweakpointNavToggle) {
            return;
        }

        e.preventDefault();

        if (_dataTarget.length > 0) {
            _dataTarget.toggleClass($this.data('js-toggle'));
            return;
        }

        $this.toggleClass($this.data('js-toggle'));
    });

    $('.minisearch-toggle').click(function () {
        var $miniform = $('#search_mini_form');

        if ($miniform.hasClass('minisearch--show')) {
            $('.header.content').attr('style', '');
        } else {
            $('.header.content').css({ 'overflow': 'visible'});
        }
        $miniform.toggleClass('minisearch--show');
        $(this).find('.nhsuk-header__search-toggle').toggleClass('is-active');
    });
    $('.nhsuk-search__close').click(function () {
        var $miniform = $('#search_mini_form');

        if ($miniform.hasClass('minisearch--show')) {
            $('.header.content').attr('style', '');
        }
        $miniform.removeClass('minisearch--show');
        $('.minisearch-toggle .nhsuk-header__search-toggle').removeClass('is-active');
    });

    $('.product-item-details').each(function () {
        var $reviewSummary = $(this).find('.product-reviews-summary'),
            $productItemsName = $(this).find('.product-item-name');

        if ($reviewSummary.length > 0 && $productItemsName.length > 0) {
            $reviewSummary.appendTo($productItemsName);
        }
    });

    $('.product-item .action.tocart').on('click', function (e) {
       var $productItemDetails = $(this).closest('.product-item-details'),
           $swatches = $productItemDetails.find('[class^="swatch-opt-"]');

       if ($swatches.length > 0 && !$productItemDetails.hasClass('show-swatches')) {
           $productItemDetails.addClass('show-swatches');
           e.preventDefault();
       }
    });

    $('.products-grid .product-item').hoverIntent(function () {
        $(this).addClass('is-active');
    }, function () {
        if ($(this).find('.requisition-list-action.active').length <= 0) {
            $(this).removeClass('is-active');
        }
        $('.product-item-details').removeClass('show-swatches');
    });

    function mutationHandler(mutationRecords) {
        var $photo;

        mutationRecords.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.target) {
                $photo = $(mutation.target);

                if ($photo.hasClass('swatch-option-loading')) {
                    $photo.parent().parent().parent().addClass('is-loading');
                } else {
                    $photo.parent().parent().parent().removeClass('is-loading');
                }
            }
        });
    }

     targetNodes         = $('.product-image-photo');
     MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
     myObserver          = new MutationObserver(mutationHandler);
     obsConfig           = { childList: false, characterData: true, attributes: true, subtree: false };

    // --- Add a target node to the observer. Can only add one node at a time.
    targetNodes.each( function () {
        myObserver.observe(this, obsConfig);
    } );

    function addAriaForBreadcrumbs() {
        $('.breadcrumbs')
            .attr('role', 'navigation')
            .attr('aria-label', 'Breadcrumb')
            .find('.item > strong:only-child')
            .wrap('<a href="' + window.location.pathname + window.location.search + '" aria-current="page"></a>');
    }
    // Wait for the breadcrumbs to be rendered in case of product page
    $breadcrumbs = $('.breadcrumbs');
    breadcrumbsObserver = new MutationObserver(function () {
        if ($('.breadcrumbs li').length > 0) {
            addAriaForBreadcrumbs();
            breadcrumbsObserver.disconnect();
        }
    });
    if ($breadcrumbs.length > 0) {
        breadcrumbsObserver.observe($breadcrumbs[0], {attributes: false, childList: true, subtree: true});
        addAriaForBreadcrumbs();
    }


    /*
Add scroll lock class to html when toggling navigation menu or minicart
 */

    function scrollLockMutationObservers() {
        var mConfig = { attributes: true },
            mObserver,
            mCallback,
            mObserver2,
            mObserver3,
            mObserver4,
            mCallback2,
            mCallback3,
            mCallback4,
            $body = $('body'),
            $html = $('html'),
            $navigation = $('.navigation'),
            $searchLabel = $('.minisearch .search > .label'),
            $miniCartBlock = $('[data-block="minicart"]');
        // Callback function to execute when mutations are observed

        mCallback3 = function () {
            if ($searchLabel.hasClass('active') && $(window).width() < 1024) {
                $body.addClass('is-search-open');
                $html.addClass('scroll-locked');
            } else {
                $body.removeClass('is-search-open');
                $html.removeClass('scroll-locked');
            }
        };

        // Callback function to execute when mutations are observed
        mCallback4 = function () {
            var $modalContent = $('.modals-wrapper .modal-popup:not(.popup-authentication) .modal-content');

            if ($body.hasClass('_has-modal') && $(window).width() < 1024) {
                if ($modalContent.length > 0) {
                    bodyScrollLock.disableBodyScroll($modalContent[0]);
                    $('body').css('overflow', 'hidden');
                }
            } else {
                if ($modalContent.length > 0) {
                    bodyScrollLock.enableBodyScroll($modalContent[0]);
                    $('body').css('overflow', 'initial');
                }
            }
        };

        mCallback2 = function () {
            $navigation.scrollTop(0);
        };

        mCallback = function () {
            if ($miniCartBlock.hasClass('active')) {
                $body.addClass('is-minicart-open');
                $html.addClass('scroll-locked');
            } else {
                $body.removeClass('is-minicart-open');
                $html.removeClass('scroll-locked');
            }
        };

        if ($miniCartBlock.length > 0) {
            mObserver = new MutationObserver(mCallback);
            mObserver.observe($miniCartBlock[0], mConfig);
        }

        if ($navigation.length > 0) {
            mObserver2 = new MutationObserver(mCallback2);
            mObserver2.observe($navigation[0], mConfig);
        }

        if ($searchLabel.length > 0) {
            mObserver3 = new MutationObserver(mCallback3);
            mObserver3.observe($searchLabel[0], mConfig);
        }

        if ($body.length > 0) {
            mObserver4 = new MutationObserver(mCallback4);
            mObserver4.observe($body[0], mConfig);
        }
    }

    /* lazy load newsletter footer bg-image */

    if (!!window.IntersectionObserver) {
        interSectionObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('lazybg');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -200px 0px'
        });

        document.querySelectorAll('footer .footer.content').forEach(function (elem) {
            interSectionObserver.observe(elem);
        });
    }


    function addBreadcrumbBackButton() {
        var $breadcrumbs = $('.breadcrumbs'),
            $lastLink,
            $backAnchorLink,
            $backLink = $('<p class="nhsuk-breadcrumb__back"><a class="nhsuk-breadcrumb__backlink" href="#">Back</a></p>');

        if ($breadcrumbs.length > 0) {
            $lastLink = $breadcrumbs.find('.items > .item:nth-last-child(2)');
            $backAnchorLink =  $backLink.find('.nhsuk-breadcrumb__backlink');

            if ($lastLink.length > 0 && $backAnchorLink.length > 0) {
                $backAnchorLink.attr('href', $lastLink.find('a').attr('href'));
                $backAnchorLink.text('Back to ' + $lastLink.find('a').text());
            } else {
                $backAnchorLink.on('click', function (e) {
                    e.preventDefault();
                    history.back();
                });
            }


            $breadcrumbs.append($backLink);
        }
    }

    /*
        end add scroll lock class to html
    */
    scrollLockMutationObservers();
    keyboardHandler.apply();

    addBreadcrumbBackButton();

    $('.nhsuk-card--clickable').on('click', function () {
        var $thisAnchor = $(this).find('a');

       window.location.href = $thisAnchor.attr('href');
    });

    // Remove phone links with my account pages
    $('.account address a[href^="tel:"]').replaceWith(function () {
        return '<span>' + this.innerHTML + '</span>';
    });

    // Reorder-signout to last in the list as xml sortorder doesn't work
    function moveAuthLink() {
        var $authLink = $('.customer-welcome ul.header.links > li.link.authorization-link'),
            $authLinkClone;

        if (!$authLink.is(':last-child')) {
            $authLinkClone = $authLink.first().clone(true);
            $authLink.remove();
            $authLinkClone.appendTo('.customer-welcome ul.header.links');
        }
    }
    moveAuthLink();
    $('body style').appendTo('head');
    $('.page-layout-1column-cat-lander').each(function () {
        var $nhsCard = $('.column.main .nhsuk-card--help-and-support');

        if ($nhsCard.length > 0) {
            $nhsCard.remove();
        }
    });
  });
