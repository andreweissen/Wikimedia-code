/**
 * AutoPurge
 * @file Automatically purges pages in <tt>window.autoPurgePages</tt> array
 * @author Eizzen <en.wikipedia.org/wiki/User_talk:Eizzen>
 * @license Apache-2.0
 * @external "jQuery"
 * @external "mediawiki.api"
 */

/*jslint browser, this:true */
/*global mw, jQuery, window */

mw.loader.using("mediawiki.api", function () {
    "use strict";

    /**
     * @class AutoPurge
     * @classdesc The central AutoPurge class
     */
    var AutoPurge = {
        /**
         * @method purgePage
         * @param {string} $page
         * @returns {void}
         */
        purgePage: function ($page) {
            var $api = new mw.Api();

            $api.post({
                action: "purge",
                titles: $page
            }).done(function ($data) {
                if (!$data.error) {
                    window.location.reload(true);
                }
            });
        },
        /**
         * @method checkPage
         * @param {string} $page
         * @returns {void}
         */
        checkPage: function ($page) {
            var $site = mw.config.get("wgSiteName").toLowerCase();
            var $storageId = $page + "-" + $site + "-" + "AP";

            if (window.localStorage) {
                if (!localStorage.getItem($storageId)) {
                    localStorage[$storageId] = true;
                    this.purgePage($page);
                } else {
                    localStorage.removeItem($storageId);
                }
            }
        },
        /**
         * @method init
         * @returns {void}
         */
        init: function () {
            var $pageName = mw.config.get("wgPageName");

            if (
                window.AutoPurgePages !== undefined &&
                jQuery.inArray($pageName, window.AutoPurgePages) !== -1
            ) {
                this.checkPage($pageName);
            }
        }
    };

    jQuery(document).ready(function () {
        AutoPurge.init();
    });
});