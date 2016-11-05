import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';
import {getOptions} from '/client/imports/views/query_templates_options/findone_modify_options/findone_modify_options';

import './findone_and_delete.html';

var toastr = require('toastr');
/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndDelete.onRendered(function () {
    initializeOptions();
});

const initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(Helper.sortObjectByKey(Enums.FINDONE_MODIFY_OPTIONS), function (key, value) {
        // upsert and returnOriginal is not for delete
        if (value != Enums.FINDONE_MODIFY_OPTIONS.UPSERT && value != Enums.FINDONE_MODIFY_OPTIONS.RETURN_ORIGINAL) {
            cmb.append($("<option></option>")
                .attr("value", key)
                .text(value));
        }
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndDelete.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        options: options
    };

    Meteor.call("findOneAndDelete", selectedCollection, selector, options, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "findOneAndDelete", params, (historyParams ? false : true));
        }
    );
};


Template.findOneAndDelete.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.selector) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
            }, 100);
        }

        if (query.queryParams.options) {
            let optionsArray = [];
            for (let property in query.queryParams.options) {
                if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.FINDONE_MODIFY_OPTIONS))[property]) {
                    optionsArray.push((_.invert(Enums.FINDONE_MODIFY_OPTIONS))[property]);
                }
            }

            Meteor.setTimeout(function () {
                $('#cmbFindOneModifyOptions').val(optionsArray).trigger('chosen:updated');
                Session.set(Helper.strSessionSelectedOptions, optionsArray);
            }, 100);

            // options load
            Meteor.setTimeout(function () {
                for (let i = 0; i < optionsArray.length; i++) {
                    let option = optionsArray[i];
                    let inverted = (_.invert(Enums.FINDONE_MODIFY_OPTIONS));
                    if (option === inverted.projection) {
                        Helper.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.options.projection, null, 1));
                    }
                    if (option === inverted.sort) {
                        Helper.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.options.sort, null, 1));
                    }
                }
            }, 200);
        }
    }
};